import * as React from "react";
import { FileReferencePopup } from "./FileReferencePopup.js";
import { FileReferenceMap, getFileCount } from "../fileReferences.js";

interface MessageInputProps {
  newMessage: string;
  setNewMessage: (message: string) => void;
  sendMessage: () => void;
  isGenerating: boolean;
  fileMap: FileReferenceMap;
}

interface FileSelectionState {
  mode: "latest" | "inline";
  selectedFiles: Set<string>;
}

export function MessageInput({
  newMessage,
  setNewMessage,
  sendMessage,
  isGenerating,
  fileMap,
}: MessageInputProps) {
  const [showFilePopup, setShowFilePopup] = React.useState(false);
  const [selectionState, setSelectionState] =
    React.useState<FileSelectionState>(() => {
      // Try to load saved state from localStorage
      const saved = localStorage.getItem("fileSelectionState");
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          mode: parsed.mode,
          selectedFiles: new Set(parsed.selectedFiles),
        };
      }
      // Default state - all files selected, latest mode
      return {
        mode: "latest" as const,
        selectedFiles: new Set(Array.from(fileMap.keys())),
      };
    });

  const fileCount = getFileCount(fileMap);

  // Save selection state whenever it changes
  React.useEffect(() => {
    localStorage.setItem(
      "fileSelectionState",
      JSON.stringify({
        mode: selectionState.mode,
        selectedFiles: Array.from(selectionState.selectedFiles),
      })
    );
  }, [selectionState]);

  return (
    <div className="p-4 border-t border-vscode-panel-border bg-vscode-editor-background">
      <div className="max-w-6xl grid grid-cols-[1fr,auto] gap-4">
        <textarea
          className="min-h-[44px] rounded 
             bg-vscode-input-background text-vscode-input-foreground 
             p-3 border border-vscode-input-border focus:outline-none 
             focus:ring-2 focus:ring-vscode-focusBorder focus:border-transparent"
          style={{ maxHeight: "70vh" }}
          value={newMessage}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
            setNewMessage(e.target.value)
          }
          onKeyDown={(e: React.KeyboardEvent) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
          placeholder="Type a message... (Enter to send, Shift+Enter for new line)"
        />

        <div className="flex flex-col gap-2">
          <button
            onClick={sendMessage}
            disabled={isGenerating || !newMessage.trim()}
            className="px-6 py-2 bg-vscode-button-background text-vscode-button-foreground 
               rounded font-medium hover:bg-vscode-button-hover-background 
               focus:outline-none focus:ring-2 focus:ring-vscode-focusBorder
               disabled:opacity-50 disabled:cursor-not-allowed
               transition-colors duration-200"
          >
            Send
          </button>

          {fileCount > 0 && (
            <button
              onClick={() => setShowFilePopup(true)}
              className="text-vscode-textLink-foreground hover:text-vscode-textLink-activeForeground text-sm"
            >
              {selectionState.selectedFiles.size} of {fileCount} files selected
            </button>
          )}
        </div>
      </div>

      {showFilePopup && (
        <FileReferencePopup
          fileMap={fileMap}
          selectionState={selectionState}
          setSelectionState={setSelectionState}
          onClose={() => setShowFilePopup(false)}
        />
      )}
    </div>
  );
}
