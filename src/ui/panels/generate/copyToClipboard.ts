import { formatPrompt } from "codespin/dist/commands/formatPrompt/index.js";
import { mkdir } from "fs/promises";
import * as vscode from "vscode";
import { pathExists } from "../../../fs/pathExists.js";
import { getHistoryItemDir } from "../../../settings/history/getHistoryItemDir.js";
import { writeHistoryItem } from "../../../settings/history/writeHistoryItem.js";
import { getPrintPromptArgs } from "./getPrintPromptArgs.js";
import { CopyToClipboardEvent } from "./types.js";
import { trimWhitespace } from "../../../text/trimWhitespace.js";
import { syncIsInstalled } from "../../../commands/sync/syncIsInstalled.js";

export async function copyToClipboard(
  clipboardArgs: CopyToClipboardEvent,
  dirName: string,
  workspaceRoot: string
) {
  if (clipboardArgs.includeFileFormatHint && !syncIsInstalled()) {
    vscode.window.showErrorMessage(
      "You need to 'npm install codespin-sync-server'"
    );
    return;
  }

  const args = await getPrintPromptArgs(clipboardArgs, workspaceRoot);

  const result = await formatPrompt(args, {
    workingDir: workspaceRoot,
  });

  const prompt = clipboardArgs.includeFileFormatHint
    ? result.prompt +
      trimWhitespace(`
      The project root is "${workspaceRoot}" but that's not relevant.
      
      Your response must be in the same format as the included content above.
      Make sure you mention "File path:" before beginning the markdown code blocks in your response - for each file.
      That is, "File path:" should come just before the markdown code block's triple backquotes begin.
      `).trim()
    : result.prompt;

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

  await writeHistoryItem(
    result.prompt,
    "raw-prompt.txt",
    dirName,
    workspaceRoot
  );
}
