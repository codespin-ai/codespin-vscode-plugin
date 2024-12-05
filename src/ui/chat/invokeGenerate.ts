import { promises as fs } from "fs";
import * as path from "path";
import {
  GenerateArgs as CodeSpinGenerateArgs,
  generate as codespinGenerate,
} from "codespin/dist/commands/generate/index.js";
import { StreamingFileParseResult } from "codespin/dist/responseParsing/streamingFileParser.js";
import { saveConversation } from "../../conversations/saveConversation.js";
import { UserFileContent, UserMessage } from "../../conversations/types.js";
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
  const userInputFromPanel = chatPanel.userInput!;

  await navigateTo(chatPanel, `/chat`, {
    model: argsForGeneration.args.model,
  });

  // Save initial conversation with just the user message
  const conversationId = `gen_${Date.now()}`;
  const timestamp = Date.now();

  const userMessage: UserMessage = {
    role: "user",
    content: userInputFromPanel.content,
  };

  const firstTextMessage = userInputFromPanel.content.find(
    (x) => x.type === "text"
  );

  await saveConversation({
    id: conversationId,
    title: firstTextMessage?.text.slice(0, 100) ?? "Untitled",
    timestamp,
    model: userInputFromPanel.model,
    codingConvention: userInputFromPanel.codingConvention || null,
    messages: [userMessage],
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

      chatPageMessageClient.send("fileResultStream", {
        type: "fileResultStream",
        data: {
          ...streamedBlock,
          html,
        },
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
    }
  };

  await codespinGenerate(argsForGeneration.args, {
    workingDir: workspaceRoot,
  });
}
