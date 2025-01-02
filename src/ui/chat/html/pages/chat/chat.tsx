import { BloomComponent, component } from "bloom-router";
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
import { buildFileReferenceMap, FileReferenceMap } from "./fileReferences.js";
import { handleStreamingResult } from "./fileStreamProcessor.js";
import { getMessageBroker } from "./getMessageBroker.js";

const DEFAULT_INPUT_HEIGHT = 120;

type ChatProps = {
  conversation: Conversation;
  isNew: boolean;
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
  const handleWindowResize = () => {
    const maxHeight = calculateMaxHeight();
    inputHeight = Math.min(inputHeight, maxHeight);
    localStorage.setItem("chatInputHeight", inputHeight.toString());
    component.render();
  };

  window.addEventListener("resize", handleWindowResize);
  component.cleanup = () =>
    window.removeEventListener("resize", handleWindowResize);

  // Set up initial message broker and event handling
  const pageMessageBroker = getMessageBroker({
    setIsGenerating: (value) => {
      isGenerating = value;
      component.render();
    },
    setCurrentConversation: (newConv) => {
      conversation = newConv;
      component.render();
    },
    onFileResult: (result) =>
      handleStreamingResult(result, {
        currentBlock,
        setCurrentBlock: (block) => {
          currentBlock = block;
          component.render();
        },
        setCurrentConversation: (newConv) => {
          conversation = newConv;
          component.render();
        },
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

  const sendMessage = async () => {
    if (!newMessage.trim() || isGenerating) return;

    const chatPanelMessageClient = createMessageClient<ChatPanelBrokerType>(
      (message: unknown) => {
        getVSCodeApi().postMessage(message);
      }
    );

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
            setNewMessage={(msg) => {
              newMessage = msg;
              component.render();
            }}
            sendMessage={sendMessage}
            isGenerating={isGenerrating}
            fileMap={fileMap}
          />
        </div>
      </div>
    );
  }
}

component("chat", Chat, {
  conversation: null,
  isNew: false,
});
