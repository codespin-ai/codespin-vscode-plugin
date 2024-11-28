import { ProcessedStreamingFileParseResult } from "../../../../panels/generate/types.js";
import { ContentItem, Message } from "./types.js";

type FileBlockProcessorArgs = {
  currentBlock: ContentItem | null;
  setCurrentBlock: React.Dispatch<React.SetStateAction<ContentItem | null>>;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  generateBlockId: () => string;
};

/**
 * Finalizes the current block by appending it to messages and clearing the current block.
 */
function finalizeCurrentBlock(args: FileBlockProcessorArgs) {
  const { currentBlock, setCurrentBlock, setMessages } = args;

  if (currentBlock) {
    setMessages((prevMessages) => [
      ...prevMessages,
      {
        role: "assistant",
        content: currentBlock,
      },
    ]);
    setCurrentBlock(null);
  }
}

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
  finalizeCurrentBlock(args);

  const { setCurrentBlock, generateBlockId } = args;

  setCurrentBlock({
    id: generateBlockId(),
    type: "file-heading",
    content: "",
    path,
  });
}

/**
 * Ends a file block by replacing it with an HTML block.
 */
export function endFileBlock(
  path: string,
  htmlContent: string,
  args: FileBlockProcessorArgs
) {
  const { setMessages, setCurrentBlock, generateBlockId } = args;

  const codeBlock: ContentItem = {
    id: generateBlockId(),
    type: "code",
    content: htmlContent,
    path,
  };

  setMessages((prevMessages) => [
    ...prevMessages,
    {
      role: "assistant",
      content: codeBlock,
    },
  ]);

  setCurrentBlock(null);
}

/**
 * Handles a markdown block, finalizing the current block and replacing it.
 */
export function handleMarkdownBlock(
  markdownContent: string,
  args: FileBlockProcessorArgs
) {
  const { setMessages, setCurrentBlock, generateBlockId } = args;

  const markdownBlock: ContentItem = {
    id: generateBlockId(),
    type: "markdown",
    content: markdownContent,
  };

  setMessages((prevMessages) => [
    ...prevMessages,
    {
      role: "assistant",
      content: markdownBlock,
    },
  ]);

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
      endFileBlock(result.file.path, result.html, args);
      break;

    case "markdown":
      handleMarkdownBlock(result.content, args);
      break;
  }
}
