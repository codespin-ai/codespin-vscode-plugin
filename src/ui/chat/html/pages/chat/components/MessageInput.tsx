import * as React from "react";

interface MessageInputProps {
  newMessage: string;
  setNewMessage: (message: string) => void;
  sendMessage: () => void;
  isGenerating: boolean;
}

export function MessageInput({
  newMessage,
  setNewMessage,
  sendMessage,
  isGenerating,
}: MessageInputProps) {
  return (
    <div className="p-4 border-t border-vscode-panel-border bg-vscode-editor-background">
      <div
        className="max-w-6xl flex gap-4"
        style={{ minHeight: "fit-content" }}
      >
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
    </div>
  );
}
