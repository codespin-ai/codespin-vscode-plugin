import { component, Component } from "magic-loop";import { Router } from "magic-loop-router";
import { formatFileSize } from "../../../../../../fs/formatFileSize.js";
import { ChatPanelBrokerType } from "../../../../getMessageBroker.js";
import { MessageClient } from "../../../../../../ipc/messageClient.js";

interface FileInfo {
  path: string;
  size: number;
}

type FileListProps = {
  files: FileInfo[];
  messageClient: MessageClient<ChatPanelBrokerType>;
  onDeleteFile: (path: string) => void;
  model: string;
};

export async function* FileList(
  component: HTMLElement & Component & FileListProps
) {
  const handleFileClick = (filePath: string) => {
    component.messageClient.send("openFile", {
      type: "openFile",
      file: filePath,
    });
  };

  const handleAddDeps = (filePath: string) => {
    component.messageClient.send("addDeps", {
      type: "addDeps",
      file: filePath,
      model: component.model,
    });
  };

  while (true) {
    const totalSize = component.files.reduce((acc, file) => acc + file.size, 0);

    yield (
      <div class="mb-4">
        <label class="block text-sm font-medium text-vscode-editor-foreground mb-1">
          Included Files ({formatFileSize(totalSize)}):
        </label>
        <div>
          {component.files.map((file) => (
            <div
              key={file.path}
              class="flex items-center gap-4 text-vscode-editor-foreground"
            >
              <button
                type="button"
                onclick={() => handleFileClick(file.path)}
                class="text-vscode-textLink-foreground hover:text-vscode-textLink-activeForeground"
              >
                {file.path}
              </button>
              <span class="text-vscode-editor-foreground opacity-60">
                {file.size ? `(${formatFileSize(file.size)})` : ""}
              </span>
              <button
                type="button"
                onclick={() => handleAddDeps(file.path)}
                class="text-vscode-textLink-foreground hover:text-vscode-textLink-activeForeground"
              >
                Add deps
              </button>
              <button
                type="button"
                onclick={() => component.onDeleteFile(file.path)}
                class="text-vscode-textLink-foreground hover:text-vscode-textLink-activeForeground"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }
}

component("file-list", FileList, {
  files: [],
  messageClient: null,
  onDeleteFile: () => {},
  model: "",
});
