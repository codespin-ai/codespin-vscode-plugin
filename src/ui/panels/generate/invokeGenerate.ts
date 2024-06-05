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
import { PromptCreatedEvent, ResponseStreamEvent } from "./types.js";

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

  await navigateTo(generatePanel, `/generate/invoke`, {
    model: argsForGeneration.args.model,
  });

  argsForGeneration.args.promptCallback = async (prompt: string) => {
    const promptCreated: PromptCreatedEvent = {
      type: "promptCreated",
      prompt,
    };

    generatePanel.getWebview().postMessage(promptCreated);

    await writeHistoryItem(prompt, "raw-prompt.txt", dirName, workspaceRoot);
  };

  argsForGeneration.args.responseStreamCallback = (text: string) => {
    const responseStreamEvent: ResponseStreamEvent = {
      type: "responseStream",
      data: text,
    };

    generatePanel.getWebview().postMessage(responseStreamEvent);
  };

  argsForGeneration.args.responseCallback = async (text: string) => {
    await writeHistoryItem(text, "raw-response.txt", dirName, workspaceRoot);
  };

  argsForGeneration.args.parseCallback = async (files: any) => {
    await writeGeneratedFiles(files, dirName, workspaceRoot);
  };

  await codespinGenerate(argsForGeneration.args, {
    workingDir: workspaceRoot,
  });
}
