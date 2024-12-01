import {
  GenerateArgs as CodeSpinGenerateArgs,
  generate as codespinGenerate,
} from "codespin/dist/commands/generate/index.js";
import { StreamingFileParseResult } from "codespin/dist/responseParsing/streamingFileParser.js";
import { marked } from "marked";
import { InvokePageBrokerType } from "./html/pages/chat/getMessageBroker.js";
import { navigateTo } from "../navigateTo.js";
import { ChatPanel } from "./ChatPanel.js";
import { UserMessage } from "../../conversations/types.js";
import { saveConversation } from "../../conversations/saveConversation.js";
import { createMessageClient } from "../../messaging/messageClient.js";
import { getLangFromFilename } from "../../sourceAnalysis/getLangFromFilename.js";
import { getHtmlForCode } from "../../sourceAnalysis/getHtmlForCode.js";

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

  const invokePageMessageClient = createMessageClient<InvokePageBrokerType>(
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
        invokePageMessageClient.send("fileResultStream", {
          type: "fileResultStream",
          data: streamedBlock,
        });
      }
      currentTextBlock = "";

      invokePageMessageClient.send("fileResultStream", {
        type: "fileResultStream",
        data: streamedBlock,
      });
    } else if (streamedBlock.type === "end-file-block") {
      currentTextBlock = "";
      const lang = getLangFromFilename(streamedBlock.file.path);
      const html = await getHtmlForCode(streamedBlock.file.content, lang);

      invokePageMessageClient.send("fileResultStream", {
        type: "fileResultStream",
        data: {
          ...streamedBlock,
          html,
        },
      });
    } else if (streamedBlock.type === "text") {
      currentTextBlock = currentTextBlock + streamedBlock.content;
      invokePageMessageClient.send("fileResultStream", {
        type: "fileResultStream",
        data: streamedBlock,
      });
    } else if (streamedBlock.type === "text-block") {
      const html = await marked(streamedBlock.content, {
        gfm: true,
        breaks: true,
      });

      invokePageMessageClient.send("fileResultStream", {
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
