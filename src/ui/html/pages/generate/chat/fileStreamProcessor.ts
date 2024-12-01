import { ProcessedStreamingFileParseResult } from "../../../../panels/generate/types.js";
import {
  ContentItem,
  Message,
  AssistantMessage,
  MarkdownContentItem,
} from "./types.js";

type FileBlockProcessorArgs = {
  currentBlock: ContentItem | null;
  setCurrentBlock: React.Dispatch<React.SetStateAction<ContentItem | null>>;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  generateBlockId: () => string;
};

/**
 * Handles incoming text content. Appends to the current block or creates a new one.
 */
export function appendText(content: string, args: FileBlockProcessorArgs) {
  const { setCurrentBlock, generateBlockId } = args;

  setCurrentBlock((prev) => {
    return prev && prev.type === "text"
      ? { ...prev, content: prev.content + content }
      : {
          id: generateBlockId(),
          type: "text",
          content,
        };
  });
}

/**
 * Starts a new file block, finalizing the current block if needed.
 */
export function startFileBlock(path: string, args: FileBlockProcessorArgs) {
  const { setCurrentBlock, generateBlockId } = args;

  setCurrentBlock({
    id: generateBlockId(),
    type: "file-heading",
    content: "",
    path,
  });
}

/**
 * Ends a file block by creating a code block and adding it to messages
 */
export function endFileBlock(
  path: string,
  content: string,
  html: string,
  args: FileBlockProcessorArgs
) {
  const { setMessages, setCurrentBlock, generateBlockId } = args;

  const codeBlock: ContentItem = {
    id: generateBlockId(),
    type: "code",
    content,
    html,
    path,
  };

  setMessages((prevMessages) => {
    // Find the last assistant message or create a new one
    let lastAssistantMessage = prevMessages[prevMessages.length - 1];
    if (!lastAssistantMessage || lastAssistantMessage.role !== "assistant") {
      const newAssistantMessage: AssistantMessage = {
        role: "assistant",
        content: [codeBlock],
      };
      return [...prevMessages, newAssistantMessage];
    }

    // Clone messages array and add new code block to last assistant message
    const newMessages = [...prevMessages];
    const lastMessage = { ...lastAssistantMessage };
    lastMessage.content = [...lastMessage.content, codeBlock];
    newMessages[newMessages.length - 1] = lastMessage;
    return newMessages;
  });

  setCurrentBlock(null);
}

/**
 * Handles a markdown block, adding it to the last assistant message or creating a new one
 */
export function handleMarkdownBlock(
  markdownContent: string,
  html: string,
  args: FileBlockProcessorArgs
) {
  const { setMessages, setCurrentBlock, generateBlockId } = args;

  const markdownBlock: MarkdownContentItem = {
    id: generateBlockId(),
    type: "markdown",
    content: markdownContent.trim(),
    html,
  };

  setMessages((prevMessages) => {
    // Find the last assistant message or create a new one
    let lastAssistantMessage = prevMessages[prevMessages.length - 1];
    if (!lastAssistantMessage || lastAssistantMessage.role !== "assistant") {
      const newAssistantMessage: AssistantMessage = {
        role: "assistant",
        content: [markdownBlock],
      };
      return [...prevMessages, newAssistantMessage];
    }

    // Clone messages array and add new markdown block to last assistant message
    const newMessages = [...prevMessages];
    const lastMessage = { ...lastAssistantMessage };
    lastMessage.content = [...lastMessage.content, markdownBlock];
    newMessages[newMessages.length - 1] = lastMessage;
    return newMessages;
  });

  setCurrentBlock(null);
}

/**
 * Handles incoming streaming results dynamically.
 */
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
