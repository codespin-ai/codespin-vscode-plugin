import * as React from "react";
import { formatFileSize } from "../../../../../../fs/formatFileSize.js";
import { ChatPanelBrokerType } from "../../../../getMessageBroker.js";
import { MessageClient } from "../../../../../../messaging/messageClient.js";

interface FileInfo {
  path: string;
  size: number;
}

interface FileListProps {
  files: FileInfo[];
  messageClient: MessageClient<ChatPanelBrokerType>;
  onDeleteFile: (path: string) => void;
  model: string;
}

export function FileList({
  files,
  messageClient,
  onDeleteFile,
  model,
}: FileListProps) {
  const handleFileClick = (filePath: string) => {
    messageClient.send("openFile", {
      type: "openFile",
      file: filePath,
    });
  };

  const handleAddDeps = (filePath: string) => {
    messageClient.send("addDeps", {
      type: "addDeps",
      file: filePath,
      model,
    });
  };

  const totalSize = files.reduce((acc, file) => acc + file.size, 0);

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-vscode-editor-foreground mb-1">
        Included Files ({formatFileSize(totalSize)}):
      </label>
      <div>
        {files.map((file) => (
          <div
            key={file.path}
            className="flex items-center gap-4 text-vscode-editor-foreground"
          >
            <button
              type="button"
              onClick={() => handleFileClick(file.path)}
              className="text-vscode-textLink-foreground hover:text-vscode-textLink-activeForeground"
            >
              {file.path}
            </button>
            <span className="text-vscode-editor-foreground opacity-60">
              {file.size ? `(${formatFileSize(file.size)})` : ""}
            </span>
            <button
              type="button"
              onClick={() => handleAddDeps(file.path)}
              className="text-vscode-textLink-foreground hover:text-vscode-textLink-activeForeground"
            >
              Add deps
            </button>
            <button
              type="button"
              onClick={() => onDeleteFile(file.path)}
              className="text-vscode-textLink-foreground hover:text-vscode-textLink-activeForeground"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
