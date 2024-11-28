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
        content: [currentBlock],
      },
    ]);
    setCurrentBlock(null);
  }
}

/**
 * Handles incoming text content. Appends to the current block or creates a new one.
 */
export function appendText(content: string, args: FileBlockProcessorArgs) {
  const { currentBlock, setCurrentBlock, generateBlockId } = args;

  if (currentBlock && currentBlock.type !== "text") {
    // Finalize current block if it's not a text block
    finalizeCurrentBlock(args);
  }

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
  htmlContent: string,
  args: FileBlockProcessorArgs
) {
  const { currentBlock, setMessages, setCurrentBlock, generateBlockId } = args;

  if (currentBlock && currentBlock.type === "file-heading") {
    const htmlBlock: ContentItem = {
      id: generateBlockId(),
      type: "code",
      content: htmlContent,
      path: currentBlock.path,
    };

    setMessages((prevMessages) => [
      ...prevMessages,
      {
        role: "assistant",
        content: [htmlBlock],
      },
    ]);
    setCurrentBlock(null);
  }
}

/**
 * Handles a markdown block, finalizing the current block and replacing it.
 */
export function handleMarkdownBlock(
  markdownContent: string,
  args: FileBlockProcessorArgs
) {
  finalizeCurrentBlock(args);

  const { setCurrentBlock, generateBlockId } = args;
  setCurrentBlock({
    id: generateBlockId(),
    type: "markdown",
    content: markdownContent,
  });
}

/**
 * Handles incoming streaming results dynamically.
 */
export function handleStreamingResult(
  result: { type: string; content?: string; path?: string; html?: string },
  args: FileBlockProcessorArgs
) {
  const { type, content, path, html } = result;

  switch (type) {
    case "text":
      if (content) appendText(content, args);
      break;

    case "start-file-block":
      if (path) startFileBlock(path, args);
      break;

    case "end-file-block":
      if (html) endFileBlock(html, args);
      break;

    case "markdown":
      if (content) handleMarkdownBlock(content, args);
      break;

    default:
      console.warn(`Unhandled block type: ${type}`);
      break;
  }
}
