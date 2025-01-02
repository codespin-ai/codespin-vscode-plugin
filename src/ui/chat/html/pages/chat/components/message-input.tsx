import { BloomComponent, component } from "bloom-router";
import { FileReferenceMap, getFileCount } from "../fileReferences.js";

export type FileSelectionState = {
  mode: "latest" | "inline";
  selectedFiles: Set<string>;
};

export type MessageInputProps = {
  newMessage: string;
  setNewMessage: (message: string) => void;
  sendMessage: () => void;
  isGenerating: boolean;
  fileMap: FileReferenceMap;
};

export async function* MessageInput(
  component: HTMLElement & BloomComponent & MessageInputProps
) {
  let showFilePopup = false;
  let selectionState: FileSelectionState = {
    mode: "latest" as const,
    selectedFiles: new Set(Array.from(component.fileMap.keys())),
  };

  // Try to load saved selection state
  const savedState = localStorage.getItem("fileSelectionState");
  if (savedState) {
    const parsed = JSON.parse(savedState);
    selectionState = {
      mode: parsed.mode,
      selectedFiles: new Set(parsed.selectedFiles),
    };
  }

  const updateSelectionState = (newState: FileSelectionState) => {
    selectionState = newState;
    localStorage.setItem(
      "fileSelectionState",
      JSON.stringify({
        mode: selectionState.mode,
        selectedFiles: Array.from(selectionState.selectedFiles),
      })
    );
    component.render();
  };

  const fileCount = getFileCount(component.fileMap);

  while (true) {
    yield (
      <div class="p-4 border-t border-vscode-panel-border bg-vscode-editor-background h-full">
        <div class="max-w-6xl grid grid-cols-[1fr,auto] gap-4 h-full">
          <textarea
            class="w-full h-full min-h-[44px] rounded 
               bg-vscode-input-background text-vscode-input-foreground 
               p-3 border border-vscode-input-border focus:outline-none 
               focus:ring-2 focus:ring-vscode-focusBorder focus:border-transparent
               resize-none overflow-y-auto"
            value={component.newMessage}
            onchange={(e: Event) =>
              component.setNewMessage((e.target as HTMLTextAreaElement).value)
            }
            onkeydown={(e: KeyboardEvent) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                component.sendMessage();
              }
            }}
            placeholder="Type a message... (Enter to send, Shift+Enter for new line)"
          />

          <div class="flex flex-col gap-2">
            <button
              onclick={() => component.sendMessage()}
              disabled={component.isGenerating || !component.newMessage.trim()}
              class="px-6 py-2 bg-vscode-button-background text-vscode-button-foreground 
                 rounded font-medium hover:bg-vscode-button-hover-background 
                 focus:outline-none focus:ring-2 focus:ring-vscode-focusBorder
                 disabled:opacity-50 disabled:cursor-not-allowed
                 transition-colors duration-200"
            >
              Send
            </button>

            {fileCount > 0 && (
              <button
                onclick={() => {
                  showFilePopup = true;
                  component.render();
                }}
                class="text-vscode-textLink-foreground hover:text-vscode-textLink-activeForeground text-sm"
              >
                {selectionState.selectedFiles.size} of {fileCount} files
                selected
              </button>
            )}
          </div>
        </div>

        {showFilePopup && (
          <file-reference-popup
            fileMap={component.fileMap}
            selectionState={selectionState}
            setSelectionState={updateSelectionState}
            onClose={() => {
              showFilePopup = false;
              component.render();
            }}
          />
        )}
      </div>
    );
  }
}

component("message-input", MessageInput, {
  newMessage: "",
  setNewMessage: () => {},
  sendMessage: () => {},
  isGenerating: false,
  fileMap: new Map(),
});
