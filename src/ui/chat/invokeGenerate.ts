import {
  GenerateArgs as CodeSpinGenerateArgs,
  generate as codespinGenerate,
} from "codespin/dist/commands/generate/index.js";
import { StreamingFileParseResult } from "codespin/dist/responseParsing/streamingFileParser.js";
import { saveConversation } from "../../conversations/saveConversation.js";
import { UserMessage } from "../../conversations/types.js";
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
    content: [
      {
        type: "text",
        text: userInputFromPanel.prompt,
      },
    ],
  };

  await saveConversation({
    id: conversationId,
    title: userInputFromPanel.prompt.slice(0, 100), // Use first 100 chars of prompt as title
    timestamp,
    model: userInputFromPanel.model,
    codingConvention: userInputFromPanel.codingConvention || null,
    includedFiles: userInputFromPanel.includedFiles,
    messages: [userMessage],
    workspaceRoot,
  });

  const chatPageMessageClient = createMessageClient<ChatPageBrokerType>(
    (message) => {
      chatPanel.getWebview().postMessage(message);
    }
  );

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
