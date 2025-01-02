import { BloomComponent, component } from "bloom-router";
import { ConversationSummary } from "../../../../../conversations/types.js";
import { getVSCodeApi } from "../../../../../vscode/getVSCodeApi.js";
import { BrowserEvent } from "../../../../types.js";
import { getMessageBroker } from "./getMessageBroker.js";

type GroupedEntries = { [date: string]: ConversationSummary[] };

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

export async function* ConversationsPage(
  component: HTMLElement & BloomComponent & { entries?: ConversationSummary[] }
) {
  let entries = component.entries || [];
  let hoveredItemId: string | null = null;

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

  const conversationsPageMessageBroker = getMessageBroker((newEntries) => {
    entries = newEntries;
    component.render();
  });

  function listener(event: BrowserEvent) {
    const message = event.data;
    if (conversationsPageMessageBroker.canHandle(message.type)) {
      conversationsPageMessageBroker.handleRequest(message as any);
    }
  }

  window.addEventListener("message", listener);
  component.addEventListener("disconnected", () => {
    window.removeEventListener("message", listener);
  });

  while (true) {
    yield (
      <div class="p-4 bg-vscode-editor-background text-vscode-editor-foreground min-h-screen">
        {Object.keys(groupedEntries).length > 0 ? (
          Object.entries(groupedEntries).map(([date, entries], dateIndex) => (
            <>
              <h3 class="text-sm font-medium mb-3 text-vscode-editor-foreground opacity-60 ml-1">
                {toHumanReadableDate(date)}
              </h3>
              <div class="space-y-2 mb-6">
                {entries.map((entry, entryIndex) => {
                  const itemId = `${dateIndex}-${entryIndex}`;

                  return (
                    <div
                      onmouseenter={() => {
                        hoveredItemId = itemId;
                        component.render();
                      }}
                      onmouseleave={() => {
                        hoveredItemId = null;
                        component.render();
                      }}
                      onclick={() => onItemClick(entry.id)}
                      class={`px-3 py-2.5 rounded-lg transition-all duration-150 cursor-pointer
                            bg-opacity-40 hover:bg-opacity-100
                            ${
                              hoveredItemId === itemId
                                ? "bg-vscode-input-background translate-x-1"
                                : "bg-vscode-input-background/40"
                            }`}
                    >
                      <div class="text-sm text-vscode-input-foreground">
                        {truncatePrompt(entry.title)}
                      </div>

                      <div class="mt-1 text-xs flex items-center space-x-2 text-vscode-editor-foreground/50">
                        <span>{formatRelativeTime(entry.timestamp)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ))
        ) : (
          <div class="text-vscode-editor-foreground/60 text-sm">
            No conversations found.
          </div>
        )}
      </div>
    );
  }
}

component("conversations-page", ConversationsPage, { entries: [] });
