import * as React from "react";
import { useState } from "react";
import { ChatIcon } from "../../../components/icons/ChatIcon.js";
import { CopyIcon } from "../../../components/icons/CopyIcon.js";
import { ChatPanelBrokerType } from "../../../../getMessageBroker.js";
import { MessageClient } from "../../../../../../ipc/messageClient.js";

interface ActionButtonsProps {
  messageClient: MessageClient<ChatPanelBrokerType>;
  onGenerate: () => void;
  prompt: string;
  codingConvention: string | undefined;
  includedFiles: Array<{ path: string; size: number }>;
}

export function ActionButtons({
  messageClient,
  onGenerate,
  prompt,
  codingConvention,
  includedFiles,
}: ActionButtonsProps) {
  const [showCopied, setShowCopied] = useState(false);

  const handleCopyToClipboard = async () => {
    messageClient.send("copyToClipboard", {
      type: "copyToClipboard" as const,
      includedFiles,
      prompt,
      codingConvention,
    });

    setShowCopied(true);
    setTimeout(() => setShowCopied(false), 3000);
  };

  return (
    <div className="flex gap-4 mb-4">
      <button
        style={{ width: "180px" }}
        type="button"
        onClick={onGenerate}
        className="flex justify-center items-center py-2 bg-vscode-button-background text-vscode-button-foreground rounded font-medium hover:bg-vscode-button-hover-background focus:outline-none focus:ring-2 focus:ring-vscode-focusBorder transition-colors duration-200"
      >
        <ChatIcon height="24px" width="24px" />
        <span className="ml-2">Start Chatting</span>
      </button>

      <button
        style={{ width: "180px" }}
        type="button"
        onClick={handleCopyToClipboard}
        className="flex justify-center items-center py-2 bg-vscode-button-background text-vscode-button-foreground rounded font-medium hover:bg-vscode-button-hover-background focus:outline-none focus:ring-2 focus:ring-vscode-focusBorder transition-colors duration-200"
      >
        {!showCopied && <CopyIcon height="24px" width="24px" />}
        <span className="ml-2">
          {showCopied ? "Copied" : "Copy To Clipboard"}
        </span>
      </button>
    </div>
  );
}
