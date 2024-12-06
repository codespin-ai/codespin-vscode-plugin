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

export function MessageInput({
  newMessage,
  setNewMessage,
  sendMessage,
  isGenerating,
  fileMap,
}: MessageInputProps) {
  const [showFilePopup, setShowFilePopup] = React.useState(false);
  const fileCount = getFileCount(fileMap);

  return (
    <div className="p-4 border-t border-vscode-panel-border bg-vscode-editor-background">
      <div className="max-w-6xl flex flex-col gap-2">
        <div className="flex gap-4">
          <textarea
            className="flex-1 min-h-[44px] rounded 
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
          <button
            onClick={sendMessage}
            disabled={isGenerating || !newMessage.trim()}
            className="h-fit px-6 py-2 bg-vscode-button-background text-vscode-button-foreground 
             rounded font-medium hover:bg-vscode-button-hover-background 
             focus:outline-none focus:ring-2 focus:ring-vscode-focusBorder
             disabled:opacity-50 disabled:cursor-not-allowed
             transition-colors duration-200"
          >
            Send
          </button>
        </div>

        {fileCount > 0 && (
          <div>
            <button
              onClick={() => setShowFilePopup(true)}
              className="text-vscode-textLink-foreground hover:text-vscode-textLink-activeForeground"
            >
              {fileCount} files included
            </button>
          </div>
        )}
      </div>

      {showFilePopup && (
        <FileReferencePopup
          fileMap={fileMap}
          onClose={() => setShowFilePopup(false)}
        />
      )}
    </div>
  );
}
