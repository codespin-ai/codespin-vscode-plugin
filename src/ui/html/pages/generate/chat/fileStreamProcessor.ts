type ContentBlock = {
  id: string;
  type: "file" | "text" | "html";
  content: string;
  path?: string;
};

type Message = {
  role: "user" | "assistant";
  content: ContentBlock[];
};

type FileBlockProcessorArgs = {
  currentBlock: ContentBlock | null;
  setCurrentBlock: React.Dispatch<React.SetStateAction<ContentBlock | null>>;
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

  if (currentBlock) {
    // Append to "text" or "file" blocks
    if (currentBlock.type === "text" || currentBlock.type === "file") {
      setCurrentBlock({
        ...currentBlock,
        content: currentBlock.content + content,
      });
      return;
    }

    // If the current block is not "text" or "file", finalize it
    finalizeCurrentBlock(args);
  }

  // Start a new "text" block if no current block exists
  setCurrentBlock({
    id: generateBlockId(),
    type: "text",
    content,
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
    type: "file",
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

  if (currentBlock && currentBlock.type === "file") {
    const htmlBlock: ContentBlock = {
      id: generateBlockId(),
      type: "html",
      content: htmlContent,
      path: currentBlock.path,
    };

    // Add the HTML block to messages
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
 * Replaces the current block with a markdown (HTML) block.
 */
export function replaceWithMarkdownBlock(
  markdownContent: string,
  args: FileBlockProcessorArgs
) {
  finalizeCurrentBlock(args);

  const { setCurrentBlock, generateBlockId } = args;
  setCurrentBlock({
    id: generateBlockId(),
    type: "html",
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
      if (html) replaceWithMarkdownBlock(html, args);
      break;

    default:
      console.warn(`Unhandled block type: ${type}`);
      break;
  }
}
