import {
  PromptResult,
  generate as codespinGenerate,
} from "codespin/dist/commands/generate.js";
import { mkdir } from "fs/promises";
import * as vscode from "vscode";
import { pathExists } from "../../../fs/pathExists.js";
import { getHistoryItemDir } from "../../../settings/history/getHistoryItemDir.js";
import { writeHistoryItem } from "../../../settings/history/writeHistoryItem.js";
import { getPrintPromptArgs } from "./getPrintPromptArgs.js";
import { CopyToClipboardEvent } from "./types.js";

export async function copyToClipboard(
  clipboardArgs: CopyToClipboardEvent,
  dirName: string,
  workspaceRoot: string
) {
  const args = getPrintPromptArgs(clipboardArgs, workspaceRoot);

  const result = await codespinGenerate(args, {
    workingDir: workspaceRoot,
  });

  const prompt = (result as PromptResult).prompt;
  vscode.env.clipboard.writeText(prompt);

  // Write prompt and raw-prompt to history
  const historyDirPath = getHistoryItemDir(dirName, workspaceRoot);

  if (!(await pathExists(historyDirPath))) {
    await mkdir(historyDirPath, { recursive: true });
  }

  await writeHistoryItem(
    clipboardArgs.prompt,
    "prompt.txt",
    dirName,
    workspaceRoot
  );

  const { type: unused1, ...messageSansType } = clipboardArgs;

  const inputAsJson = JSON.stringify(messageSansType, null, 2);
  
  await writeHistoryItem(
    inputAsJson,
    "user-input.json",
    dirName,
    workspaceRoot
  );

  await writeHistoryItem(prompt, "raw-prompt.txt", dirName, workspaceRoot);
}
