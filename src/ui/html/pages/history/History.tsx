import * as React from "react";
import { SelectHistoryEntryCommandEvent } from "../../../../commands/history/command.js";
import { getVSCodeApi } from "../../../../vscode/getVSCodeApi.js";
import { HistoryEntry } from "../../../viewProviders/history/types.js";
import { getMessageBroker } from "./getMessageBroker.js";
import { BrowserEvent } from "../../../types.js";

type GroupedEntries = { [date: string]: HistoryEntry[] };

export type HistoryPageArgs = {
  entries: HistoryEntry[];
};

const truncatePrompt = (prompt: string): string => {
  if (prompt.length <= 100) {
    return prompt;
  }

  let truncated = prompt.slice(0, 101);
  const lastSpaceIndex = truncated.lastIndexOf(" ");

  if (lastSpaceIndex > -1) {
    truncated = truncated.slice(0, lastSpaceIndex) + "...";
  } else {
    truncated = prompt.slice(0, 100) + "...";
  }

  return truncated;
};

export function History() {
  const args: HistoryPageArgs = history.state;
  const [entries, setEntries] = React.useState(args.entries);
  const [hoveredItemId, setHoveredItemId] = React.useState<string | null>(null);

  const formatRelativeTime = (timestamp: number): string => {
    const now = Date.now();
    const diffInSeconds = Math.round((now - timestamp) / 1000);

    if (diffInSeconds < 60) {
      return `${diffInSeconds} secs back`;
    } else if (diffInSeconds < 3600) {
      return `${Math.floor(diffInSeconds / 60)} mins back`;
    } else {
      return new Date(timestamp).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    }
  };

  const sortedEntries = entries.sort((a, b) => b.timestamp - a.timestamp);

  const groupedEntries = sortedEntries.reduce(
    (groups: GroupedEntries, entry) => {
      const date = new Date(entry.timestamp).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(entry);
      return groups;
    },
    {}
  );

  const toHumanReadableDate = (date: string): string => {
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 864e5).toDateString();
    return date === today ? "Today" : date === yesterday ? "Yesterday" : date;
  };

  const onItemClick = (timestamp: number) => {
    const vsCodeApi = getVSCodeApi();
    const message: SelectHistoryEntryCommandEvent = {
      type: "command:codespin-ai.selectHistoryEntry",
      args: [{ itemId: timestamp.toString() }],
    };
    vsCodeApi.postMessage(message);
  };

  function getFilePaths(
    includedFiles: {
      path: string;
    }[]
  ) {
    return includedFiles.map((x) => x.path.split("/").slice(-1)[0]);
  }

  React.useEffect(() => {
    const historyPageMessageBroker = getMessageBroker(setEntries);

    function listener(event: BrowserEvent) {
      const message = event.data;
      if (historyPageMessageBroker.canHandle(message.type)) {
        historyPageMessageBroker.handleRequest(message as any);
      }
    }

    window.addEventListener("message", listener);
    return () => window.removeEventListener("message", listener);
  }, []);

  return (
    <div className="p-6 bg-vscode-editor-background text-vscode-editor-foreground min-h-screen">
      {Object.keys(groupedEntries).length > 0 ? (
        Object.entries(groupedEntries).map(([date, entries], dateIndex) => (
          <React.Fragment key={dateIndex}>
            <h3 className="text-xl font-semibold mb-4 text-vscode-editor-foreground">
              {toHumanReadableDate(date)}
            </h3>
            <ul className="space-y-4 mb-8">
              {entries.map((entry, entryIndex) => {
                const itemId = `${dateIndex}-${entryIndex}`;
                return (
                  <li
                    key={entryIndex}
                    onMouseEnter={() => setHoveredItemId(itemId)}
                    onMouseLeave={() => setHoveredItemId(null)}
                    onClick={() => onItemClick(entry.timestamp)}
                    className={`p-4 rounded border border-vscode-panel-border 
                              bg-vscode-input-background cursor-pointer
                              ${
                                hoveredItemId === itemId
                                  ? "ring-2 ring-vscode-focusBorder"
                                  : ""
                              }`}
                  >
                    <div className="text-vscode-input-foreground">
                      {truncatePrompt(entry.prompt)}
                    </div>

                    <div className="mt-2 text-sm text-vscode-editor-foreground opacity-60">
                      <span>{formatRelativeTime(entry.timestamp)}</span>
                      <span>
                        {(() => {
                          const filePaths = getFilePaths(
                            entry.userInput.includedFiles
                          );

                          return filePaths.length > 0 ? (
                            <span className="ml-4">
                              {filePaths.length <= 3
                                ? filePaths.join(", ")
                                : filePaths.slice(0, 2).join(", ") + " etc"}
                            </span>
                          ) : null;
                        })()}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          </React.Fragment>
        ))
      ) : (
        <div className="text-vscode-editor-foreground">
          No history entries found.
        </div>
      )}
    </div>
  );
}
