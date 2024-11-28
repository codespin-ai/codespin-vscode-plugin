import {
  GenerateArgs as CodeSpinGenerateArgs,
  generate as codespinGenerate,
} from "codespin/dist/commands/generate/index.js";
import { mkdir } from "fs/promises";
import { pathExists } from "../../../fs/pathExists.js";
import { getHistoryItemDir } from "../../../settings/history/getHistoryItemDir.js";
import { writeGeneratedFiles } from "../../../settings/history/writeGeneratedFiles.js";
import { writeHistoryItem } from "../../../settings/history/writeHistoryItem.js";
import { navigateTo } from "../../navigateTo.js";
import { GeneratePanel } from "./GeneratePanel.js";
import {
  FileResultStreamEvent,
  PromptCreatedEvent,
  ResponseStreamEvent,
} from "./types.js";
import { createMessageClient } from "../../../messaging/messageClient.js";
import { InvokePageBrokerType } from "../../html/pages/generate/chat/getMessageBroker.js";
import { StreamingFileParseResult } from "codespin/dist/responseParsing/streamingFileParser.js";
import { processStreamingFileParseResult } from "./processStreamingFileParseResult.js";

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

  argsForGeneration.args.promptCallback = async (prompt: string) => {
    const invokePageMessageClient = createMessageClient<InvokePageBrokerType>(
      (message) => {
        generatePanel.getWebview().postMessage(message);
      }
    );

    const promptCreated: PromptCreatedEvent = {
      type: "promptCreated",
      prompt,
    };

    invokePageMessageClient.send("promptCreated", promptCreated);

    await writeHistoryItem(prompt, "raw-prompt.txt", dirName, workspaceRoot);
  };

  argsForGeneration.args.fileResultStreamCallback = async (
    data: StreamingFileParseResult
  ) => {
    const invokePageMessageClient = createMessageClient<InvokePageBrokerType>(
      (message) => {
        generatePanel.getWebview().postMessage(message);
      }
    );

    const fileResultStreamEvent: FileResultStreamEvent = {
      type: "fileResultStream",
      data: await processStreamingFileParseResult(data),
    };

    invokePageMessageClient.send("fileResultStream", fileResultStreamEvent);
  };

  // FIXME
  // argsForGeneration.args.responseCallback = async (text: string) => {
  //   await writeHistoryItem(text, "raw-response.txt", dirName, workspaceRoot);
  // };

  // argsForGeneration.args.parseCallback = async (files: any) => {
  //   await writeGeneratedFiles(files, dirName, workspaceRoot);
  // };

  await codespinGenerate(argsForGeneration.args, {
    workingDir: workspaceRoot,
  });
}
