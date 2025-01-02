import { BloomComponent, component } from "bloom-router";
import {
  CodeContent,
  ContentItem,
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
import { buildFileReferenceMap, FileReferenceMap } from "./fileReferences.js";
import { handleStreamingResult } from "./fileStreamProcessor.js";
import { getMessageBroker } from "./getMessageBroker.js";

const DEFAULT_INPUT_HEIGHT = 120;

type ChatProps = {
  conversation: Conversation;
  isNew: boolean;
  handleMessage?: (event: BrowserEvent) => void;
  handleWindowResize?: () => void;
};

export async function* Chat(
  component: HTMLElement & BloomComponent & ChatProps
) {
  const conversationInState = component.conversation;

  let conversation = conversationInState;

  let currentBlock:
    | FileHeadingContent
    | TextContent
    | CodeContent
    | MarkdownContent
    | undefined = undefined;

  let isGenerating = false;
  let newMessage = "";
  const chatEndRef = { current: null as HTMLDivElement | null };
  let fileMap: FileReferenceMap = new Map();

  // Initialize input height from localStorage
  let inputHeight = (() => {
    const savedHeight = localStorage.getItem("chatInputHeight");
    const initialHeight = savedHeight
      ? parseInt(savedHeight, 10)
      : DEFAULT_INPUT_HEIGHT;
    const maxHeight = window.innerHeight - 300; // rough initial estimate
    return Math.min(Math.max(initialHeight, 80), maxHeight);
  })();

  const headerRef = { current: null as HTMLDivElement | null };

  const calculateMaxHeight = () => {
    const headerHeight = headerRef.current?.offsetHeight || 0;
    const minMessageListHeight = 100;
    return window.innerHeight - headerHeight - minMessageListHeight;
  };

  const handleResize = (delta: number) => {
    const newHeight = inputHeight - delta;
    const minHeight = 80;
    const maxHeight = calculateMaxHeight();
    inputHeight = Math.min(Math.max(newHeight, minHeight), maxHeight);
    localStorage.setItem("chatInputHeight", inputHeight.toString());
    component.render();
  };

  // Handle window resize
  component.handleWindowResize = () => {
    const maxHeight = calculateMaxHeight();
    inputHeight = Math.min(inputHeight, maxHeight);
    localStorage.setItem("chatInputHeight", inputHeight.toString());
    component.render();
  };

  // Set up initial message broker and event handling
  const pageMessageBroker = getMessageBroker({
    setIsGenerating: (value: boolean) => {
      isGenerating = value;
      component.render();
    },
    setCurrentConversation: (updater: (prev: Conversation) => Conversation) => {
      conversation = updater(conversation);
      component.render();
    },
    onFileResult: (result) =>
      handleStreamingResult(result, {
        currentBlock,
        getCurrentBlock: () => currentBlock,
        setCurrentBlock: (value: ContentItem | undefined) => {
          currentBlock = value;
          component.render();
        },
        getCurrentConversation: () => conversation,
        setCurrentConversation: (value: Conversation) => {
          conversation = value;
          component.render();
        },
      }),
  });

  component.handleMessage = (event: BrowserEvent) => {
    const message = event.data;
    if (pageMessageBroker.canHandle(message.type)) {
      pageMessageBroker.handleRequest(message as any);
    }
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || isGenerating) return;

    const chatPanelMessageClient = createMessageClient<ChatPanelBrokerType>(
      (message: unknown) => {
        getVSCodeApi().postMessage(message);
      }
    );

    const userContent: UserTextContent = {
      type: "text",
      text,
      html: await chatPanelMessageClient.wait("getMarkdown", {
        type: "getMarkdown",
        text,
      }),
    };

    const userMessage: UserMessage = {
      role: "user",
      content: [userContent],
    };

    conversation = {
      ...conversation,
      messages: [...conversation.messages, userMessage],
    };

    const generateEvent: GenerateEvent = {
      type: "generate",
      conversation,
    };

    chatPanelMessageClient.send("generate", generateEvent);
    newMessage = "";
    component.render();
  };

  // Handle initial generation if needed
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

  // Update fileMap whenever messages change
  fileMap = buildFileReferenceMap(conversation.messages);

  while (true) {
    const provider = conversation.model.split(":")[0];

    yield (
      <div class="chat-layout">
        <div ref={headerRef}>
          <chat-header provider={provider} model={conversation.model} />
        </div>

        <div
          class="message-list-container"
          style={{
            minHeight: "100px",
          }}
        >
          <message-list
            messages={conversation.messages}
            currentBlock={currentBlock}
            chatEndRef={chatEndRef}
          />
        </div>

        <resizer onResize={handleResize} />

        <div
          class="message-input-container"
          style={{ height: `${inputHeight}px` }}
        >
          <message-input
            newMessage={newMessage}
            setNewMessage={(msg: string) => {
              newMessage = msg;
              component.render();
            }}
            sendMessage={() => sendMessage(newMessage)}
            isGenerating={isGenerating}
            fileMap={fileMap}
          />
        </div>
      </div>
    );
  }
}

component(
  "chat",
  Chat,
  {
    conversation: undefined as unknown as Conversation,
    isNew: false,
    handleMessage: undefined,
    handleWindowResize: undefined,
  },
  {
    onConnected: (component) => {
      window.addEventListener("resize", component.handleWindowResize!);
      window.addEventListener("message", component.handleMessage!);
    },
    onDisconnected: (component) => {
      window.removeEventListener("resize", component.handleWindowResize!);
      window.removeEventListener("message", component.handleMessage!);
    },
  }
);
