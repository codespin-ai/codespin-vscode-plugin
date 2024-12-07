import * as React from "react";
import {
  CodeContent,
  FileHeadingContent,
  MarkdownContent,
  Message,
  TextContent,
  UserMessage,
  UserTextContent,
  Conversation,
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
import { buildFileReferenceMap, FileReferenceMap } from "./fileReferences.js";
import { GenerateEvent } from "../../../types.js";
import { useLocation } from "react-router-dom";

// Updated type for page state to include conversation
export type ChatPageState = {
  conversation: Conversation;
  isNew: boolean;
};

export function Chat() {
  const location = useLocation();
  const state = location.state as ChatPageState;
  
  const conversation = state.conversation;

  const [messages, setMessages] = React.useState<Message[]>(
    conversation.messages
  );
  const [currentBlock, setCurrentBlock] = React.useState<
    FileHeadingContent | TextContent | CodeContent | MarkdownContent | null
  >(null);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [newMessage, setNewMessage] = React.useState("");
  const chatEndRef = React.useRef<HTMLDivElement>(null!);
  const [fileMap, setFileMap] = React.useState<FileReferenceMap>(new Map());

  // Check if we need to trigger generation automatically
  React.useEffect(() => {
    const shouldGenerate = messages.length === 1 && messages[0].role === "user";

    if (shouldGenerate && !isGenerating) {
      const userMessage = messages[0] as UserMessage;
      const prompt = (userMessage.content[0] as UserTextContent).text;
      const includedFiles =
        userMessage.content[1]?.type === "files"
          ? userMessage.content[1].includedFiles.map((file) => ({
              path: file.path,
              size: 0, // Size isn't needed for generation
            }))
          : [];

      const chatPanelMessageClient = createMessageClient<ChatPanelBrokerType>(
        (message: unknown) => {
          getVSCodeApi().postMessage(message);
        }
      );

      const generateEvent: GenerateEvent = {
        type: "generate",
        conversationId: conversation.id,
        model: conversation.model,
        prompt,
        codingConvention: conversation.codingConvention || undefined,
        includedFiles,
      };

      chatPanelMessageClient.send("generate", generateEvent);
    }
  }, []);

  React.useEffect(() => {
    // Update fileMap whenever messages change
    setFileMap(buildFileReferenceMap(messages));
  }, [messages]);

  React.useEffect(() => {
    const pageMessageBroker = getMessageBroker({
      setIsGenerating,
      setMessages,
      onFileResult: (result) =>
        handleStreamingResult(result, {
          currentBlock,
          setCurrentBlock,
          setMessages,
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

    const generateEvent: GenerateEvent = {
      type: "generate",
      conversationId: conversation.id,
      model: conversation.model,
      prompt: newMessage,
      codingConvention: conversation.codingConvention || undefined,
      includedFiles: [], // No files for subsequent messages
    };

    chatPanelMessageClient.send("generate", generateEvent);
    setNewMessage("");
  }, [
    newMessage,
    isGenerating,
    messages,
    conversation.model,
    conversation.codingConvention,
  ]);

  // Extract provider from model string (format is "provider:model")
  const provider = conversation.model.split(":")[0];

  return (
    <div className="h-screen flex flex-col bg-vscode-editor-background">
      <ChatHeader provider={provider} model={conversation.model} />

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
        fileMap={fileMap}
      />
    </div>
  );
}
