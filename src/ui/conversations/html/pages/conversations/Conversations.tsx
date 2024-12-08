import * as React from "react";
import { ConversationSummary } from "../../../../../conversations/types.js";
import { getVSCodeApi } from "../../../../../vscode/getVSCodeApi.js";
import { BrowserEvent } from "../../../../types.js";
import { getMessageBroker } from "./getMessageBroker.js";

type GroupedEntries = { [date: string]: ConversationSummary[] };

export type ConversationsPageProps = {
  entries: ConversationSummary[];
};

const truncatePrompt = (text: string): string => {
  if (text.length <= 100) {
    return text;
  }

  let truncated = text.slice(0, 101);
  const lastSpaceIndex = truncated.lastIndexOf(" ");
  return lastSpaceIndex > -1
    ? truncated.slice(0, lastSpaceIndex) + "..."
    : text.slice(0, 100) + "...";
};

export function Conversations(props: ConversationsPageProps) {
  const [entries, setEntries] = React.useState(props.entries);
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

  const onItemClick = (conversationId: string) => {
    const vscode = getVSCodeApi();
    vscode.postMessage({
      type: "command:codespin-ai.openConversation",
      args: [conversationId],
    });
  };

  React.useEffect(() => {
    const conversationsPageMessageBroker = getMessageBroker(setEntries);

    function listener(event: BrowserEvent) {
      const message = event.data;
      if (conversationsPageMessageBroker.canHandle(message.type)) {
        conversationsPageMessageBroker.handleRequest(message as any);
      }
    }

    window.addEventListener("message", listener);
    return () => window.removeEventListener("message", listener);
  }, []);

  return (
    <div className="p-4 bg-vscode-editor-background text-vscode-editor-foreground min-h-screen">
      {Object.keys(groupedEntries).length > 0 ? (
        Object.entries(groupedEntries).map(([date, entries], dateIndex) => (
          <React.Fragment key={dateIndex}>
            <h3 className="text-sm font-medium mb-3 text-vscode-editor-foreground opacity-60 ml-1">
              {toHumanReadableDate(date)}
            </h3>
            <div className="space-y-2 mb-6">
              {entries.map((entry, entryIndex) => {
                const itemId = `${dateIndex}-${entryIndex}`;

                return (
                  <div
                    key={entryIndex}
                    onMouseEnter={() => setHoveredItemId(itemId)}
                    onMouseLeave={() => setHoveredItemId(null)}
                    onClick={() => onItemClick(entry.id)}
                    className={`px-3 py-2.5 rounded-lg transition-all duration-150 cursor-pointer
                              bg-opacity-40 hover:bg-opacity-100
                              ${
                                hoveredItemId === itemId
                                  ? "bg-vscode-input-background translate-x-1"
                                  : "bg-vscode-input-background/40"
                              }`}
                  >
                    <div className="text-sm text-vscode-input-foreground">
                      {truncatePrompt(entry.title)}
                    </div>

                    <div className="mt-1 text-xs flex items-center space-x-2 text-vscode-editor-foreground/50">
                      <span>{formatRelativeTime(entry.timestamp)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </React.Fragment>
        ))
      ) : (
        <div className="text-vscode-editor-foreground/60 text-sm">
          No conversations found.
        </div>
      )}
    </div>
  );
}
