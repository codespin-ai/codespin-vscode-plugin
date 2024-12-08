import { SourceFile } from "codespin/dist/sourceCode/SourceFile.js";
import {
  AssistantMessage,
  CodeContent,
  Conversation,
  FileHeadingContent,
  MarkdownContent,
  Message,
  TextContent,
} from "../../../../../conversations/types.js";

export type ResponseStreamArgs = {
  data: string;
};

export type ResponseStreamEvent = {
  type: "responseStream";
} & ResponseStreamArgs;

export type ProcessedStreamingFileParseResult =
  | {
      type: "text";
      content: string;
    }
  | {
      type: "end-file-block";
      file: SourceFile;
      html: string;
    }
  | {
      type: "start-file-block";
      path: string;
    }
  | {
      type: "markdown";
      content: string;
      html: string;
    };

export type FileResultStreamArgs = {
  data: ProcessedStreamingFileParseResult;
};

export type FileResultStreamEvent = {
  type: "fileResultStream";
} & FileResultStreamArgs;

type FileBlockProcessorArgs = {
  currentBlock:
    | FileHeadingContent
    | TextContent
    | CodeContent
    | MarkdownContent
    | undefined;
  setCurrentBlock: React.Dispatch<
    React.SetStateAction<
      | FileHeadingContent
      | TextContent
      | CodeContent
      | MarkdownContent
      | undefined
    >
  >;
  setCurrentConversation: React.Dispatch<React.SetStateAction<Conversation>>;
};

function generateBlockId() {
  return Math.random().toString(36).substring(2, 9);
}

export function appendText(content: string, args: FileBlockProcessorArgs) {
  const { setCurrentBlock } = args;

  setCurrentBlock((prev) => {
    if (prev && prev.type === "text") {
      return { ...prev, content: prev.content + content };
    }
    return {
      id: generateBlockId(),
      type: "text",
      content,
    };
  });
}

export function startFileBlock(path: string, args: FileBlockProcessorArgs) {
  const { setCurrentBlock } = args;

  setCurrentBlock({
    id: generateBlockId(),
    type: "file-heading",
    path,
  });
}

export function endFileBlock(
  path: string,
  content: string,
  html: string,
  args: FileBlockProcessorArgs
) {
  const { setCurrentConversation, setCurrentBlock } = args;

  const codeBlock: CodeContent = {
    id: generateBlockId(),
    type: "code",
    path,
    content,
    html,
  };

  setCurrentConversation((prevConversation) => {
    const prevMessages = prevConversation.messages;
    let lastAssistantMessage = prevMessages[prevMessages.length - 1];

    if (!lastAssistantMessage || lastAssistantMessage.role !== "assistant") {
      const newAssistantMessage: AssistantMessage = {
        role: "assistant",
        content: [codeBlock],
      };
      return {
        ...prevConversation,
        messages: [...prevMessages, newAssistantMessage],
      };
    }

    const newMessages = [...prevMessages];
    const lastMessage = { ...lastAssistantMessage };
    lastMessage.content = [...lastMessage.content, codeBlock];
    newMessages[newMessages.length - 1] = lastMessage;
    return {
      ...prevConversation,
      messages: newMessages,
    };
  });
}

export function handleMarkdownBlock(
  markdownContent: string,
  html: string,
  args: FileBlockProcessorArgs
) {
  const { setCurrentConversation, setCurrentBlock } = args;

  const markdownBlock: MarkdownContent = {
    id: generateBlockId(),
    type: "markdown",
    content: markdownContent.trim(),
    html,
  };

  setCurrentConversation((prevConversation) => {
    const prevMessages = prevConversation.messages;
    let lastAssistantMessage = prevMessages[prevMessages.length - 1];

    if (!lastAssistantMessage || lastAssistantMessage.role !== "assistant") {
      const newAssistantMessage: AssistantMessage = {
        role: "assistant",
        content: [markdownBlock],
      };
      return {
        ...prevConversation,
        messages: [...prevMessages, newAssistantMessage],
      };
    }

    const newMessages = [...prevMessages];
    const lastMessage = { ...lastAssistantMessage };
    lastMessage.content = [...lastMessage.content, markdownBlock];
    newMessages[newMessages.length - 1] = lastMessage;
    return {
      ...prevConversation,
      messages: newMessages,
    };
  });

  setCurrentBlock(undefined);
}

export function handleStreamingResult(
  result: ProcessedStreamingFileParseResult,
  args: FileBlockProcessorArgs
) {
  switch (result.type) {
    case "text":
      appendText(result.content, args);
      break;

    case "start-file-block":
      startFileBlock(result.path, args);
      break;

    case "end-file-block":
      endFileBlock(result.file.path, result.file.content, result.html, args);
      break;

    case "markdown":
      handleMarkdownBlock(result.content, result.html, args);
      break;
  }
}
