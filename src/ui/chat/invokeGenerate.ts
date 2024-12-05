import {
  GenerateArgs as CodeSpinGenerateArgs,
  generate as codespinGenerate,
} from "codespin/dist/commands/generate/index.js";
import { StreamingFileParseResult } from "codespin/dist/responseParsing/streamingFileParser.js";
import { saveConversation } from "../../conversations/saveConversation.js";
import {
  AssistantMessage,
  Message,
  UserMessage,
  UserTextContent,
  UserFileContent,
} from "../../conversations/types.js";
import { markdownToHtml } from "../../markdown/markdownToHtml.js";
import { createMessageClient } from "../../messaging/messageClient.js";
import { getHtmlForCode } from "../../sourceAnalysis/getHtmlForCode.js";
import { getLangFromFilename } from "../../sourceAnalysis/getLangFromFilename.js";
import { navigateTo } from "../navigateTo.js";
import { ChatPanel } from "./ChatPanel.js";
import { ChatPageBrokerType } from "./html/pages/chat/getMessageBroker.js";

export async function invokeGenerate(
  chatPanel: ChatPanel,
  argsForGeneration: { args: CodeSpinGenerateArgs },
  workspaceRoot: string
) {
  const request = chatPanel.userInput!;

  await navigateTo(chatPanel, `/chat`, {
    model: argsForGeneration.args.model,
  });

  // Save initial conversation with just the user message
  const conversationId = `gen_${Date.now()}`;
  const timestamp = Date.now();

  // Construct user message from request
  const userContent: (UserTextContent | UserFileContent)[] = [
    {
      type: "text",
      text: request.prompt,
    },
    ...request.includedFiles.map((file) => ({
      type: "file" as const,
      path: file.path,
      size: file.size,
    })),
  ];

  const userMessage: UserMessage = {
    role: "user",
    content: userContent,
  };

  let currentMessages: Message[] = [userMessage];
  let currentAssistantMessage: AssistantMessage = {
    role: "assistant",
    content: [],
  };

  await saveConversation({
    id: conversationId,
    title: request.prompt.slice(0, 100) ?? "Untitled",
    timestamp,
    model: request.model,
    codingConvention: request.codingConvention || null,
    messages: currentMessages,
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

  // Rest of the streaming callback remains the same
  argsForGeneration.args.fileResultStreamCallback = async (
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

  await codespinGenerate(argsForGeneration.args, {
    workingDir: workspaceRoot,
  });

  // Save final conversation state including assistant's response
  if (currentAssistantMessage.content.length > 0) {
    currentMessages.push(currentAssistantMessage);
    await saveConversation({
      id: conversationId,
      title: request.prompt.slice(0, 100) ?? "Untitled",
      timestamp,
      model: request.model,
      codingConvention: request.codingConvention || null,
      messages: currentMessages,
      workspaceRoot,
    });
  }

  // Send done event to chat UI
  chatPageMessageClient.send("done", undefined);
}
