import {
  GenerateArgs as CodeSpinGenerateArgs,
  generate as codespinGenerate,
} from "codespin/dist/commands/generate/index.js";
import { StreamingFileParseResult } from "codespin/dist/responseParsing/streamingFileParser.js";
import { mkdir } from "fs/promises";
import { marked } from "marked";
import { pathExists } from "../../../fs/pathExists.js";
import { createMessageClient } from "../../../messaging/messageClient.js";
import { getHistoryItemDir } from "../../../settings/history/getHistoryItemDir.js";
import { writeHistoryItem } from "../../../settings/history/writeHistoryItem.js";
import { getHtmlForCode } from "../../../sourceAnalysis/getHtmlForCode.js";
import { getLangFromFilename } from "../../../sourceAnalysis/getLangFromFilename.js";
import { InvokePageBrokerType } from "../../html/pages/generate/chat/getMessageBroker.js";
import { navigateTo } from "../../navigateTo.js";
import { GeneratePanel } from "./GeneratePanel.js";
import { PromptCreatedEvent } from "./types.js";

export async function invokeGeneration(
  generatePanel: GeneratePanel,
  argsForGeneration: { args: CodeSpinGenerateArgs; promptFilePath: string },
  dirName: string,
  workspaceRoot: string
) {
  const userInputFromPanel = generatePanel.userInput!;

  const historyDirPath = getHistoryItemDir(dirName, workspaceRoot);

  if (!(await pathExists(historyDirPath))) {
    await mkdir(historyDirPath, { recursive: true });
  }

  await writeHistoryItem(
    userInputFromPanel.prompt,
    "prompt.txt",
    dirName,
    workspaceRoot
  );

  const { type: unused1, ...messageSansType } = userInputFromPanel;

  const inputAsJson = JSON.stringify(messageSansType, null, 2);

  await writeHistoryItem(
    inputAsJson,
    "user-input.json",
    dirName,
    workspaceRoot
  );

  await navigateTo(generatePanel, `/generate/chat`, {
    model: argsForGeneration.args.model,
  });

  const invokePageMessageClient = createMessageClient<InvokePageBrokerType>(
    (message) => {
      generatePanel.getWebview().postMessage(message);
    }
  );

  let currentTextBlock = "";

  argsForGeneration.args.promptCallback = async (prompt: string) => {
    const promptCreated: PromptCreatedEvent = {
      type: "promptCreated",
      prompt,
    };

    invokePageMessageClient.send("promptCreated", promptCreated);

    await writeHistoryItem(prompt, "raw-prompt.txt", dirName, workspaceRoot);
  };

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

  argsForGeneration.args.responseCallback = async (text: string) => {
    await writeHistoryItem(
      text,
      `raw-response-${Date.now()}.txt`,
      dirName,
      workspaceRoot
    );
  };

  // argsForGeneration.args.parseCallback = async (files: any) => {
  //   await writeGeneratedFiles(files, dirName, workspaceRoot);
  // };

  await codespinGenerate(argsForGeneration.args, {
    workingDir: workspaceRoot,
  });
}
