// ./src/ui/chat/html/pages/chat/Chat.tsx
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
import { Resizer } from "./components/Resizer.js";
import { buildFileReferenceMap, FileReferenceMap } from "./fileReferences.js";
import { handleStreamingResult } from "./fileStreamProcessor.js";
import { getMessageBroker } from "./getMessageBroker.js";

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
  const [inputHeight, setInputHeight] = React.useState(120);
  const headerRef = React.useRef<HTMLDivElement>(null);

  const calculateMaxHeight = React.useCallback(() => {
    const headerHeight = headerRef.current?.offsetHeight || 0;
    const minMessageListHeight = 100; // Minimum space to keep for messages
    return window.innerHeight - headerHeight - minMessageListHeight;
  }, []);

  const handleResize = React.useCallback(
    (delta: number) => {
      setInputHeight((prevHeight) => {
        const newHeight = prevHeight - delta;
        const minHeight = 80;
        const maxHeight = calculateMaxHeight();
        return Math.min(Math.max(newHeight, minHeight), maxHeight);
      });
    },
    [calculateMaxHeight]
  );

  React.useEffect(() => {
    const handleWindowResize = () => {
      setInputHeight((prevHeight) => {
        const maxHeight = calculateMaxHeight();
        return Math.min(prevHeight, maxHeight);
      });
    };

    window.addEventListener("resize", handleWindowResize);
    return () => window.removeEventListener("resize", handleWindowResize);
  }, [calculateMaxHeight]);

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
              size: 0,
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

  const provider = conversation.model.split(":")[0];

  return (
    <div className="chat-layout">
      <div ref={headerRef}>
        <ChatHeader provider={provider} model={conversation.model} />
      </div>

      <div
        className="message-list-container"
        style={{
          minHeight: "100px",
        }}
      >
        <MessageList
          messages={conversation.messages}
          currentBlock={currentBlock}
          chatEndRef={chatEndRef}
        />
      </div>

      <Resizer onResize={handleResize} />

      <div
        className="message-input-container"
        style={{ height: `${inputHeight}px` }}
      >
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
