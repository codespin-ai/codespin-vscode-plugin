import {
  GenerateArgs as CodeSpinGenerateArgs,
  generate as codespinGenerate,
} from "codespin/dist/commands/generate/index.js";
import { StreamingFileParseResult } from "codespin/dist/responseParsing/streamingFileParser.js";
import { addMessage } from "../../conversations/addMessage.js";
import { createConversation } from "../../conversations/createConversation.js";
import {
  AssistantMessage,
  UserFileContent,
  UserMessage,
  UserTextContent,
} from "../../conversations/types.js";
import { markdownToHtml } from "../../markdown/markdownToHtml.js";
import { createMessageClient } from "../../messaging/messageClient.js";
import { getHtmlForCode } from "../../sourceAnalysis/getHtmlForCode.js";
import { getLangFromFilename } from "../../sourceAnalysis/getLangFromFilename.js";
import { navigateTo } from "../navigateTo.js";
import { ChatPanel } from "./ChatPanel.js";
import { ChatPageBrokerType } from "./html/pages/chat/getMessageBroker.js";
import { StartChatUserInput } from "./types.js";

export async function invokeGenerate(
  chatPanel: ChatPanel,
  generateArgs: CodeSpinGenerateArgs,
  startChatInput: StartChatUserInput,
  workspaceRoot: string
): Promise<void> {
  await navigateTo(chatPanel, `/chat`, {
    model: generateArgs.model,
    startChat: startChatInput,
  });

  // Create initial conversation with just the user message
  const timestamp = Date.now();

  // Construct user message from request
  const userContent: (UserTextContent | UserFileContent)[] = [
    {
      type: "text",
      text: startChatInput.prompt,
    },
    {
      type: "files" as const,
      includedFiles: startChatInput.includedFiles.map((file) => ({
        path: file.path,
      })),
    },
  ];

  const userMessage: UserMessage = {
    role: "user",
    content: userContent,
  };

  const conversationId = await createConversation({
    title: startChatInput.prompt.slice(0, 100) ?? "Untitled",
    timestamp,
    model: startChatInput.model,
    codingConvention: startChatInput.codingConvention || null,
    initialMessage: userMessage,
    workspaceRoot,
  });

  // Send initial user message to chat page
  const chatPageMessageClient = createMessageClient<ChatPageBrokerType>(
    (message) => {
      chatPanel.getWebview().postMessage(message);
    }
  );

  // Set initial messages with the user message
  chatPageMessageClient.send("messages", [userMessage]);

  let currentTextBlock = "";
  let currentAssistantMessage: AssistantMessage = {
    role: "assistant",
    content: [],
  };

  // Rest of the streaming callback remains the same
  generateArgs.fileResultStreamCallback = async (
    streamedBlock: StreamingFileParseResult
  ) => {
    if (streamedBlock.type === "start-file-block") {
      if (currentTextBlock !== "") {
        chatPageMessageClient.send("fileResultStream", {
          type: "fileResultStream",
          data: streamedBlock,
        });
      }
      currentTextBlock = "";
    } else if (streamedBlock.type === "end-file-block") {
      currentTextBlock = "";
      const lang = getLangFromFilename(streamedBlock.file.path);
      const html = await getHtmlForCode(streamedBlock.file.content, lang);

      const data = {
        ...streamedBlock,
        html,
      };

      chatPageMessageClient.send("fileResultStream", {
        type: "fileResultStream",
        data,
      });

      currentAssistantMessage.content.push({
        type: "code",
        id: Math.random().toString(36).substr(2, 9),
        path: streamedBlock.file.path,
        content: streamedBlock.file.content,
        html,
      });
    } else if (streamedBlock.type === "text") {
      currentTextBlock = currentTextBlock + streamedBlock.content;
      chatPageMessageClient.send("fileResultStream", {
        type: "fileResultStream",
        data: streamedBlock,
      });
    } else if (streamedBlock.type === "text-block") {
      const html = await markdownToHtml(streamedBlock.content);

      chatPageMessageClient.send("fileResultStream", {
        type: "fileResultStream",
        data: {
          type: "markdown",
          content: streamedBlock.content,
          html,
        },
      });

      currentAssistantMessage.content.push({
        type: "markdown",
        id: Math.random().toString(36).substr(2, 9),
        content: streamedBlock.content,
        html,
      });
    }
  };

  await codespinGenerate(generateArgs, {
    workingDir: workspaceRoot,
  });

  // Add assistant's response to conversation if there is content
  if (currentAssistantMessage.content.length > 0) {
    await addMessage({
      conversationId,
      message: currentAssistantMessage,
      workspaceRoot,
    });
  }

  // Send done event to chat UI
  chatPageMessageClient.send("done", undefined);
}
