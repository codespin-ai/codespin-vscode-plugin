import { BloomComponent, component } from "bloom-router";
import { ChatPanelBrokerType } from "../../../../getMessageBroker.js";
import { MessageClient } from "../../../../../../ipc/messageClient.js";

type ActionButtonsProps = {
  messageClient: MessageClient<ChatPanelBrokerType>;
  onGenerate: () => void;
  prompt: string;
  codingConvention: string | undefined;
  includedFiles: Array<{ path: string; size: number }>;
};

export async function* ActionButtons(
  component: HTMLElement & BloomComponent & ActionButtonsProps
) {
  let showCopied = false;

  const handleCopyToClipboard = async () => {
    component.messageClient.send("copyToClipboard", {
      type: "copyToClipboard" as const,
      includedFiles: component.includedFiles,
      prompt: component.prompt,
      codingConvention: component.codingConvention,
    });

    showCopied = true;
    component.render();
    setTimeout(() => {
      showCopied = false;
      component.render();
    }, 3000);
  };

  while (true) {
    yield (
      <div class="flex gap-4 mb-4">
        <button
          style={{ width: "180px" }}
          type="button"
          onclick={component.onGenerate}
          class="flex justify-center items-center py-2 bg-vscode-button-background text-vscode-button-foreground rounded font-medium hover:bg-vscode-button-hover-background focus:outline-none focus:ring-2 focus:ring-vscode-focusBorder transition-colors duration-200"
        >
          <chat-icon height="24px" width="24px" />
          <span class="ml-2">Start Chatting</span>
        </button>

        <button
          style={{ width: "180px" }}
          type="button"
          onclick={handleCopyToClipboard}
          class="flex justify-center items-center py-2 bg-vscode-button-background text-vscode-button-foreground rounded font-medium hover:bg-vscode-button-hover-background focus:outline-none focus:ring-2 focus:ring-vscode-focusBorder transition-colors duration-200"
        >
          {!showCopied && <copy-icon height="24px" width="24px" />}
          <span class="ml-2">
            {showCopied ? "Copied" : "Copy To Clipboard"}
          </span>
        </button>
      </div>
    );
  }
}

component("action-buttons", ActionButtons, {
  messageClient: null,
  onGenerate: () => {},
  prompt: "",
  codingConvention: undefined,
  includedFiles: [],
});
