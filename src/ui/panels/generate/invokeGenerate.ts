import { generate as codespinGenerate } from "codespin/dist/commands/generate.js";
import { mkdir } from "fs/promises";
import * as path from "path";
import { pathExists } from "../../../fs/pathExists.js";
import { writeGeneratedFiles } from "../../../settings/history/writeGeneratedFiles.js";
import { writeHistoryItem } from "../../../settings/history/writeHistoryItem.js";
import { navigateTo } from "../../navigateTo.js";
import { GeneratePanel } from "./GeneratePanel.js";
import { PromptCreatedEvent, ResponseStreamEvent } from "./types.js";

export async function invokeGeneration(
  generatePanel: GeneratePanel,
  result: any,
  workspaceRoot: string
) {
  const generateArgs = generatePanel.generateArgs!;
  const historyDirPath = path.dirname(result.promptFilePath);

  // The entry will not exist. Make.
  if (!(await pathExists(historyDirPath))) {
    await mkdir(historyDirPath, { recursive: true });
  }

  await writeHistoryItem(
    generateArgs.prompt,
    "prompt.txt",
    result.dirName,
    workspaceRoot
  );

  const { type: unused1, ...messageSansType } = generateArgs;

  const inputAsJson = JSON.stringify(messageSansType, null, 2);

  await writeHistoryItem(
    inputAsJson,
    "user-input.json",
    result.dirName,
    workspaceRoot
  );

  await navigateTo(generatePanel, `/generate/invoke`, {
    model: result.args.model,
  });

  result.args.promptCallback = async (prompt: string) => {
    const promptCreated: PromptCreatedEvent = {
      type: "promptCreated",
      prompt,
    };

    generatePanel.getWebview().postMessage(promptCreated);

    await writeHistoryItem(
      prompt,
      "raw-prompt.txt",
      result.dirName,
      workspaceRoot
    );
  };

  result.args.responseStreamCallback = (text: string) => {
    const responseStreamEvent: ResponseStreamEvent = {
      type: "responseStream",
      data: text,
    };

    generatePanel.getWebview().postMessage(responseStreamEvent);
  };

  result.args.responseCallback = async (text: string) => {
    await writeHistoryItem(
      text,
      "raw-response.txt",
      result.dirName,
      workspaceRoot
    );
  };

  result.args.parseCallback = async (files: any) => {
    await writeGeneratedFiles(result.dirName, files, workspaceRoot);
  };

  await codespinGenerate(result.args, {
    workingDir: workspaceRoot,
  });
}
