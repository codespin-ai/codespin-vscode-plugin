import * as React from "react";
import {
  CodeContent,
  Conversation,
  FileHeadingContent,
  MarkdownContent,
  TextContent,
  UserMessage,
  UserTextContent,
} from "../../../../../conversations/types.js";
import { createMessageClient } from "../../../../../ipc/messageClient.js";
import { getVSCodeApi } from "../../../../../vscode/getVSCodeApi.js";
import { BrowserEvent } from "../../../../types.js";
import { ChatPanelBrokerType } from "../../../getMessageBroker.js";
import { GenerateEvent } from "../../../types.js";
import { ChatHeader } from "./components/ChatHeader.js";
import { MessageInput } from "./components/MessageInput.js";
import { MessageList } from "./components/MessageList.js";
import { buildFileReferenceMap, FileReferenceMap } from "./fileReferences.js";
import { handleStreamingResult } from "./fileStreamProcessor.js";
import { getMessageBroker } from "./getMessageBroker.js";
import { Resizer } from "./components/Resizer.js";

export type ChatPageProps = {
  conversation: Conversation;
  isNew: boolean;
};

export function Chat(props: ChatPageProps) {
  const conversationInState = props.conversation;

  const [conversation, setConversation] =
    React.useState<Conversation>(conversationInState);

  const [currentBlock, setCurrentBlock] = React.useState<
    FileHeadingContent | TextContent | CodeContent | MarkdownContent | undefined
  >(undefined);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [newMessage, setNewMessage] = React.useState("");
  const chatEndRef = React.useRef<HTMLDivElement>(null!);
  const [fileMap, setFileMap] = React.useState<FileReferenceMap>(new Map());
  const [messageListHeight, setMessageListHeight] = React.useState(
    window.innerHeight - 300
  ); // Default height accounting for header and input

  const handleResize = React.useCallback((delta: number) => {
    setMessageListHeight((prevHeight) => {
      const newHeight = prevHeight + delta;
      // Limit the height between a minimum and maximum
      const minHeight = 100; // Minimum height in pixels
      const maxHeight = window.innerHeight - 200; // Maximum height (leaving space for input)
      return Math.min(Math.max(newHeight, minHeight), maxHeight);
    });
  }, []);

  // Check if we need to trigger generation automatically
  React.useEffect(() => {
    const shouldGenerate =
      conversation.messages.length === 1 &&
      conversation.messages[0].role === "user";

    if (shouldGenerate && !isGenerating) {
      const userMessage = conversation.messages[0] as UserMessage;
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
        conversation,
      };

      chatPanelMessageClient.send("generate", generateEvent);
    }
  }, []);

  React.useEffect(() => {
    setFileMap(buildFileReferenceMap(conversation.messages));
  }, [conversation.messages]);

  React.useEffect(() => {
    const pageMessageBroker = getMessageBroker({
      setIsGenerating,
      setCurrentConversation: setConversation,
      onFileResult: (result) =>
        handleStreamingResult(result, {
          currentBlock,
          setCurrentBlock,
          setCurrentConversation: setConversation,
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
  }, [conversation.messages]);

  const sendMessage = React.useCallback(async () => {
    if (!newMessage.trim() || isGenerating) return;

    const chatPanelMessageClient = createMessageClient<ChatPanelBrokerType>(
      (message: unknown) => {
        getVSCodeApi().postMessage(message);
      }
    );

    function listeners(event: BrowserEvent) {
      chatPanelMessageClient.onResponse(event.data as any);
    }

    window.addEventListener("message", listeners);

    const userContent: UserTextContent = {
      type: "text",
      text: newMessage,
      html: await chatPanelMessageClient.wait("getMarkdown", {
        type: "getMarkdown",
        text: newMessage,
      }),
    };

    const userMessage: UserMessage = {
      role: "user",
      content: [userContent],
    };

    setConversation((prev) => ({
      ...prev,
      messages: [...prev.messages, userMessage],
    }));

    const generateEvent: GenerateEvent = {
      type: "generate",
      conversation,
    };

    chatPanelMessageClient.send("generate", generateEvent);
    setNewMessage("");

    return () => window.removeEventListener("message", listeners);
  }, [
    newMessage,
    isGenerating,
    conversation.messages,
    conversation.model,
    conversation.codingConvention,
  ]);

  // Extract provider from model string (format is "provider:model")
  const provider = conversation.model.split(":")[0];

  // Handle window resize
  React.useEffect(() => {
    const handleWindowResize = () => {
      setMessageListHeight((prevHeight) => {
        const maxHeight = window.innerHeight - 200;
        return Math.min(prevHeight, maxHeight);
      });
    };

    window.addEventListener("resize", handleWindowResize);
    return () => window.removeEventListener("resize", handleWindowResize);
  }, []);

  return (
    <div className="h-screen flex flex-col bg-vscode-editor-background">
      <ChatHeader provider={provider} model={conversation.model} />

      <div
        style={{ height: `${messageListHeight}px` }}
        className="message-list-container overflow-y-auto relative"
      >
        <MessageList
          messages={conversation.messages}
          currentBlock={currentBlock}
          chatEndRef={chatEndRef}
        />
      </div>

      <Resizer onResize={handleResize} />

      <div className="flex-shrink-0">
        <MessageInput
          newMessage={newMessage}
          setNewMessage={setNewMessage}
          sendMessage={sendMessage}
          isGenerating={isGenerating}
          fileMap={fileMap}
        />
      </div>
    </div>
  );
}
