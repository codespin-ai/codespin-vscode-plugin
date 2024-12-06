import * as React from "react";
import {
  CodeContent,
  FileHeadingContent,
  MarkdownContent,
  Message,
  TextContent,
  UserMessage,
  UserTextContent,
} from "../../../../../conversations/types.js";
import { createMessageClient } from "../../../../../messaging/messageClient.js";
import { getVSCodeApi } from "../../../../../vscode/getVSCodeApi.js";
import { BrowserEvent } from "../../../../types.js";
import { ChatPanelBrokerType } from "../../../getMessageBroker.js";
import { ChatHeader } from "./components/ChatHeader.js";
import { MessageInput } from "./components/MessageInput.js";
import { MessageList } from "./components/MessageList.js";
import { handleStreamingResult } from "./fileStreamProcessor.js";
import { getMessageBroker } from "./getMessageBroker.js";

interface GenerateStreamArgs {
  provider: string;
  model: string;
}

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
      setMessages,
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

  const sendMessage = React.useCallback(() => {
    if (!newMessage.trim() || isGenerating) return;

    const userContent: UserTextContent = {
      type: "text",
      text: newMessage,
    };

    const userMessage: UserMessage = {
      role: "user",
      content: [userContent],
    };

    setMessages((prev) => [...prev, userMessage]);

    const chatPanelMessageClient = createMessageClient<ChatPanelBrokerType>(
      (message: unknown) => {
        getVSCodeApi().postMessage(message);
      }
    );

    const startChatEvent = {
      type: "startChat",
      model: args.model,
      prompt: newMessage,
      codingConvention: undefined,
      includedFiles: [],
      messages,
    };

    chatPanelMessageClient.send("startChat", startChatEvent);
    setNewMessage("");
  }, [newMessage, isGenerating, messages, args.model]);

  return (
    <div className="h-screen flex flex-col bg-vscode-editor-background">
      <ChatHeader provider={args.provider} model={args.model} />

      <MessageList
        messages={messages}
        currentBlock={currentBlock}
        chatEndRef={chatEndRef}
      />

      <MessageInput
        newMessage={newMessage}
        setNewMessage={setNewMessage}
        sendMessage={sendMessage}
        isGenerating={isGenerating}
      />
    </div>
  );
}
