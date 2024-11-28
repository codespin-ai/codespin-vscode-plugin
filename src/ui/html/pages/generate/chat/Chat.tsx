import {
  VSCodeButton,
  VSCodeTextArea,
} from "@vscode/webview-ui-toolkit/react/index.js";
import * as React from "react";
import { createMessageClient } from "../../../../../messaging/messageClient.js";
import { getVSCodeApi } from "../../../../../vscode/getVSCodeApi.js";
import { GeneratePanelBrokerType } from "../../../../panels/generate/getMessageBroker.js";
import { BrowserEvent } from "../../../../types.js";
import { handleStreamingResult } from "./fileStreamProcessor.js"; // Import processing functions
import { getMessageBroker } from "./getMessageBroker.js";
import { ContentItem, Message } from "./types.js";
import { ContentBlock } from "./ContentBlock.js";

type GenerateStreamArgs = {
  provider: string;
  model: string;
};

export function Chat() {
  const args: GenerateStreamArgs = history.state;

  const [messages, setMessages] = React.useState<Message[]>([]);
  const [currentBlock, setCurrentBlock] = React.useState<ContentItem | null>(
    null
  );
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [newMessage, setNewMessage] = React.useState("");
  const chatEndRef = React.useRef<HTMLDivElement>(null);

  const generateBlockId = () => Math.random().toString(36).substr(2, 9);

  React.useEffect(() => {
    const pageMessageBroker = getMessageBroker({
      setIsGenerating,
      onFileResult: (result) =>
        handleStreamingResult(result, {
          currentBlock,
          setCurrentBlock,
          setMessages,
          generateBlockId,
        }), // Delegate handling to the utility function
    });

    function listeners(event: BrowserEvent) {
      const message = event.data;
      if (pageMessageBroker.canHandle(message.type)) {
        pageMessageBroker.handleRequest(message as any);
      }
    }

    window.addEventListener("message", listeners);
    getVSCodeApi().postMessage({ type: "webviewReady" });

    return () => window.removeEventListener("message", listeners);
  }, [currentBlock]);

  React.useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function sendMessage() {
    if (!newMessage.trim() || isGenerating) return;

    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: [
          {
            id: generateBlockId(),
            type: "text",
            content: newMessage,
          },
        ],
      },
    ]);

    const generatePanelMessageClient =
      createMessageClient<GeneratePanelBrokerType>((message: unknown) => {
        getVSCodeApi().postMessage(message);
      });

    const generateEvent = {
      type: "generate",
      model: args.model,
      prompt: newMessage,
      codingConvention: undefined,
      includedFiles: [],
    };

    generatePanelMessageClient.send("generate", generateEvent);
    setNewMessage("");
  }

  const renderBlock = (block: ContentItem) => {
    return <ContentBlock key={block.id} block={block} />;
  };

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "1em" }}>
        <h2>
          Chat ({args.provider}:{args.model})
        </h2>
      </div>

      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "1em",
          display: "flex",
          flexDirection: "column",
          gap: "1em",
        }}
      >
        {messages.map((message, index) => (
          <div
            key={index}
            style={{
              display: "flex",
              flexDirection: "column",
              alignSelf:
                message.role === "assistant" ? "flex-start" : "flex-end",
              maxWidth: "80%",
            }}
          >
            {message.content.map(renderBlock)}
          </div>
        ))}

        {currentBlock && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignSelf: "flex-start",
              maxWidth: "80%",
            }}
          >
            {renderBlock(currentBlock)}
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <div
        style={{
          padding: "1em",
          borderTop: "1px solid var(--vscode-panel-border)",
          backgroundColor: "var(--vscode-editor-background)",
          display: "flex",
          gap: "1em",
        }}
      >
        <VSCodeTextArea
          style={{
            flex: 1,
            fontFamily: "var(--vscode-editor-font-family)",
            resize: "none",
            minHeight: "44px",
            maxHeight: "200px",
          }}
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
        <VSCodeButton
          onClick={sendMessage}
          disabled={isGenerating || !newMessage.trim()}
        >
          Send
        </VSCodeButton>
      </div>
    </div>
  );
}
