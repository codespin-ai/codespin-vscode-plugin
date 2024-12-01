import { AssistantMessage, CodeContent, FileHeadingContent, MarkdownContent, Message, TextContent } from "../../../../../conversations/types.js";
import { ProcessedStreamingFileParseResult } from "../../../types.js";

type FileBlockProcessorArgs = {
  currentBlock:
    | FileHeadingContent
    | TextContent
    | CodeContent
    | MarkdownContent
    | null;
  setCurrentBlock: React.Dispatch<
    React.SetStateAction<
      FileHeadingContent | TextContent | CodeContent | MarkdownContent | null
    >
  >;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  generateBlockId: () => string;
};

export function appendText(content: string, args: FileBlockProcessorArgs) {
  const { setCurrentBlock, generateBlockId } = args;

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
  const { setCurrentBlock, generateBlockId } = args;

  setCurrentBlock({
    id: generateBlockId(),
    type: "file-heading",
    path,
    content: "",
  });
}

export function endFileBlock(
  path: string,
  content: string,
  html: string,
  args: FileBlockProcessorArgs
) {
  const { setMessages, setCurrentBlock, generateBlockId } = args;

  const codeBlock: CodeContent = {
    id: generateBlockId(),
    type: "code",
    path,
    content,
    html,
  };

  setMessages((prevMessages) => {
    let lastAssistantMessage = prevMessages[prevMessages.length - 1];
    if (!lastAssistantMessage || lastAssistantMessage.role !== "assistant") {
      const newAssistantMessage: AssistantMessage = {
        role: "assistant",
        content: [codeBlock],
      };
      return [...prevMessages, newAssistantMessage];
    }

    const newMessages = [...prevMessages];
    const lastMessage = { ...lastAssistantMessage };
    lastMessage.content = [...lastMessage.content, codeBlock];
    newMessages[newMessages.length - 1] = lastMessage;
    return newMessages;
  });

  setCurrentBlock(null);
}

export function handleMarkdownBlock(
  markdownContent: string,
  html: string,
  args: FileBlockProcessorArgs
) {
  const { setMessages, setCurrentBlock, generateBlockId } = args;

  const markdownBlock: MarkdownContent = {
    id: generateBlockId(),
    type: "markdown",
    content: markdownContent.trim(),
    html,
  };

  setMessages((prevMessages) => {
    let lastAssistantMessage = prevMessages[prevMessages.length - 1];
    if (!lastAssistantMessage || lastAssistantMessage.role !== "assistant") {
      const newAssistantMessage: AssistantMessage = {
        role: "assistant",
        content: [markdownBlock],
      };
      return [...prevMessages, newAssistantMessage];
    }

    const newMessages = [...prevMessages];
    const lastMessage = { ...lastAssistantMessage };
    lastMessage.content = [...lastMessage.content, markdownBlock];
    newMessages[newMessages.length - 1] = lastMessage;
    return newMessages;
  });

  setCurrentBlock(null);
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
