import * as React from "react";

interface ChatHeaderProps {
  provider: string;
  model: string;
}

export function ChatHeader({ provider, model }: ChatHeaderProps) {
  return (
    <div className="p-4 border-b border-vscode-panel-border">
      <h2 className="text-xl font-semibold text-vscode-editor-foreground">
        Chat ({provider}:{model})
      </h2>
    </div>
  );
}
