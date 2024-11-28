import {
  VSCodeButton,
  VSCodeTextArea,
} from "@vscode/webview-ui-toolkit/react/index.js";
import * as React from "react";
import { createMessageClient } from "../../../../../messaging/messageClient.js";
import { getVSCodeApi } from "../../../../../vscode/getVSCodeApi.js";
import { GeneratePanelBrokerType } from "../../../../panels/generate/getMessageBroker.js";
import { BrowserEvent } from "../../../../types.js";
import { getMessageBroker } from "./getMessageBroker.js";
import { GenerateEvent } from "../../../../panels/generate/types.js";

type GenerateStreamArgs = {
  provider: string;
  model: string;
};

type Message = {
  role: "user" | "assistant";
  content: string;
};

export function Chat() {
  const args: GenerateStreamArgs = history.state;

  const [messages, setMessages] = React.useState<Message[]>([]);
  const [currentMessage, setCurrentMessage] = React.useState("");
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [newMessage, setNewMessage] = React.useState("");
  const [bytesReceived, setBytesReceived] = React.useState(0);
  const chatEndRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const pageMessageBroker = getMessageBroker({
      setCurrentMessage: (fullResponse: string) => {
        setCurrentMessage(fullResponse);
      },
      setBytesReceived,
      setIsGenerating,
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
  }, []);

  // When streaming stops, add the complete message to chat history
  React.useEffect(() => {
    if (!isGenerating && currentMessage) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: currentMessage },
      ]);
      setCurrentMessage("");
    }
  }, [isGenerating]);

  // Auto-scroll to bottom when messages change
  React.useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, currentMessage]);

  function sendMessage() {
    if (!newMessage.trim() || isGenerating) return;

    // Add user message to chat
    setMessages((prev) => [...prev, { role: "user", content: newMessage }]);

    const generatePanelMessageClient =
      createMessageClient<GeneratePanelBrokerType>((message: unknown) => {
        getVSCodeApi().postMessage(message);
      });

    const generateEvent: GenerateEvent = {
      type: "generate",
      model: args.model,
      prompt: newMessage,
      codingConvention: undefined,
      includedFiles: [],
    };

    generatePanelMessageClient.send("generate", generateEvent);
    setNewMessage("");
  }

  function cancel() {
    const generatePanelMessageClient =
      createMessageClient<GeneratePanelBrokerType>((message: unknown) => {
        getVSCodeApi().postMessage(message);
      });
    generatePanelMessageClient.send("cancel", undefined);
  }

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "1em" }}>
        <h2>
          Chat ({args.provider}:{args.model})
        </h2>
        {isGenerating && (
          <div style={{ marginBottom: "1em" }}>
            <VSCodeButton onClick={cancel}>Cancel</VSCodeButton>
          </div>
        )}
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
              backgroundColor:
                message.role === "assistant"
                  ? "var(--vscode-editor-background)"
                  : "var(--vscode-button-background)",
              padding: "1em",
              borderRadius: "8px",
              maxWidth: "80%",
              alignSelf:
                message.role === "assistant" ? "flex-start" : "flex-end",
              border: "1px solid var(--vscode-panel-border)",
            }}
          >
            <pre
              style={{
                whiteSpace: "pre-wrap",
                margin: 0,
                fontFamily: "var(--vscode-editor-font-family)",
                color:
                  message.role === "user"
                    ? "var(--vscode-button-foreground)"
                    : "var(--vscode-editor-foreground)",
              }}
            >
              {message.content}
            </pre>
          </div>
        ))}

        {isGenerating && currentMessage && (
          <div
            style={{
              backgroundColor: "var(--vscode-editor-background)",
              padding: "1em",
              borderRadius: "8px",
              maxWidth: "80%",
              alignSelf: "flex-start",
              border: "1px solid var(--vscode-panel-border)",
            }}
          >
            <pre
              style={{
                whiteSpace: "pre-wrap",
                margin: 0,
                fontFamily: "var(--vscode-editor-font-family)",
                color: "var(--vscode-editor-foreground)",
              }}
            >
              {currentMessage}
            </pre>
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
