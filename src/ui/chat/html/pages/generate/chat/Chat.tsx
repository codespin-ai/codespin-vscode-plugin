import * as React from "react";
import { getMessageBroker } from "./getMessageBroker.js";
import { ContentBlock } from "./ContentBlock.js";
import {
  Message,
  UserMessage,
  UserTextContent,
  TextContent,
  CodeContent,
  MarkdownContent,
  FileHeadingContent,
} from "../../../../../../conversations/types.js";
import { handleStreamingResult } from "./fileStreamProcessor.js";
import { BrowserEvent } from "../../../../../types.js";
import { getVSCodeApi } from "../../../../../../vscode/getVSCodeApi.js";
import { createMessageClient } from "../../../../../../messaging/messageClient.js";
import { ChatPanelBrokerType } from "../../../../getMessageBroker.js";

type GenerateStreamArgs = {
  provider: string;
  model: string;
};

export function Chat() {
  const args: GenerateStreamArgs = history.state;

  const [messages, setMessages] = React.useState<Message[]>([]);
  const [currentBlock, setCurrentBlock] = React.useState<
    FileHeadingContent | TextContent | CodeContent | MarkdownContent | null
  >(null);
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
        }),
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

    const userContent: UserTextContent = {
      text: newMessage,
    };

    const userMessage: UserMessage = {
      role: "user",
      content: [userContent],
    };

    setMessages((prev) => [...prev, userMessage]);

    const chatPanelMessageClient =
      createMessageClient<ChatPanelBrokerType>((message: unknown) => {
        getVSCodeApi().postMessage(message);
      });

    const generateEvent = {
      type: "generate",
      model: args.model,
      prompt: newMessage,
      codingConvention: undefined,
      includedFiles: [],
      messages,
    };

    chatPanelMessageClient.send("generate", generateEvent);
    setNewMessage("");
  }

  const renderMessage = (message: Message) => {
    if (message.role === "user") {
      return message.content.map((content, idx) => {
        if ("text" in content) {
          return (
            <div key={idx} className={`${baseBlockStyles}`}>
              <pre className="whitespace-pre-wrap m-0 font-vscode-editor">
                {content.text}
              </pre>
            </div>
          );
        }
        return null;
      });
    } else {
      return message.content.map((block) => (
        <ContentBlock key={block.id} block={block} />
      ));
    }
  };

  const baseBlockStyles =
    "rounded p-4 mb-4 border bg-vscode-input-background border-vscode-input-border text-vscode-input-foreground";

  return (
    <div className="h-screen flex flex-col bg-vscode-editor-background">
      <div className="p-4 border-b border-vscode-panel-border">
        <h2 className="text-xl font-semibold text-vscode-editor-foreground">
          Chat ({args.provider}:{args.model})
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`max-w-6xl flex flex-col ${
              message.role === "assistant" ? "self-start" : "self-end"
            }`}
          >
            {renderMessage(message)}
          </div>
        ))}

        {currentBlock && (
          <div className="flex flex-col self-start">
            <ContentBlock key={currentBlock.id} block={currentBlock} />
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <div className="p-4 border-t border-vscode-panel-border bg-vscode-editor-background">
        <div className="flex gap-4">
          <textarea
            className="flex-1 min-h-[44px] max-h-[200px] resize-none rounded 
                       bg-vscode-input-background text-vscode-input-foreground 
                       p-3 border border-vscode-input-border focus:outline-none 
                       focus:ring-2 focus:ring-vscode-focusBorder focus:border-transparent"
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
            className="px-6 py-2 bg-vscode-button-background text-vscode-button-foreground 
                     rounded font-medium hover:bg-vscode-button-hover-background 
                     focus:outline-none focus:ring-2 focus:ring-vscode-focusBorder
                     disabled:opacity-50 disabled:cursor-not-allowed
                     transition-colors duration-200"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
