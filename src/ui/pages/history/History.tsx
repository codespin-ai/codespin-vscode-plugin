import * as React from "react";
import { HistoryPageArgs } from "./HistoryPageArgs";
import { HistoryEntry } from "../../../viewProviders/history/types";
import { getVsCodeApi } from "../../../vscode/getVsCodeApi.js";

type GroupedEntries = { [date: string]: HistoryEntry[] };

const truncatePrompt = (prompt: string): string => {
  if (prompt.length <= 100) {
    return prompt;
  }

  let truncated = prompt.slice(0, 101); // Include one extra character to ensure we're over 100
  const lastSpaceIndex = truncated.lastIndexOf(" "); // Find the last space in the truncated string

  if (lastSpaceIndex > -1) {
    truncated = truncated.slice(0, lastSpaceIndex) + "...";
  } else {
    // In case there's a very long word without spaces, we'll just truncate at 100
    truncated = prompt.slice(0, 100) + "...";
  }

  return truncated;
};

export function History() {
  const args: HistoryPageArgs = history.state;

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

  const sortedEntries = args.entries.sort((a, b) => b.timestamp - a.timestamp);
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

  const [hoveredItemId, setHoveredItemId] = React.useState<string | null>(null);

  // Function to handle click events
  const handleItemClick = (timestamp: number) => {
    const vsCodeApi = getVsCodeApi();
    vsCodeApi.postMessage({
      type: "history:selectItem",
      id: timestamp,
    });
  };

  return (
    <div>
      {Object.keys(groupedEntries).length > 0 ? (
        Object.entries(groupedEntries).map(([date, entries], dateIndex) => (
          <React.Fragment key={dateIndex}>
            <h3>{toHumanReadableDate(date)}</h3>
            <ul style={{ listStyle: "none", padding: 0 }}>
              {entries.map((entry, entryIndex) => {
                // Generate a unique identifier for each list item
                const itemId = `${dateIndex}-${entryIndex}`;
                return (
                  <li
                    key={entryIndex}
                    onMouseEnter={() => setHoveredItemId(itemId)}
                    onMouseLeave={() => setHoveredItemId(null)}
                    onClick={() => handleItemClick(entry.timestamp)}
                    style={{
                      marginBottom: "1em",
                      cursor: "pointer",
                      filter:
                        hoveredItemId === itemId ? "brightness(2)" : undefined,
                    }}
                  >
                    <div>{truncatePrompt(entry.prompt)}</div>
                    <div
                      style={{
                        fontStyle: "italic",
                        fontSize: "smaller",
                        marginTop: "4px",
                      }}
                    >
                      {formatRelativeTime(entry.timestamp)}
                    </div>
                  </li>
                );
              })}
            </ul>
          </React.Fragment>
        ))
      ) : (
        <div>No history entries found.</div>
      )}
    </div>
  );
}
