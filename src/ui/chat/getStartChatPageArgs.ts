import { getModel } from "codespin/dist/settings/getModel.js";
import { readCodeSpinConfig } from "codespin/dist/settings/readCodeSpinConfig.js";
import { promises as fs } from "fs";
import * as path from "path";
import { getFilesRecursive } from "../../fs/getFilesRecursive.js";
import { CodingConvention } from "../../settings/conventions/CodingConvention.js";
import { StartChatPageInitArgs } from "./ChatPanel.js";
import { StartChatPageArgs } from "./html/pages/start/StartChatPageArgs.js";

export async function getStartChatPageArgs(
  initArgs: StartChatPageInitArgs,
  workspaceRoot: string,
  conventions: CodingConvention[],
): Promise<StartChatPageArgs> {
  const codespinConfig = await readCodeSpinConfig(undefined, workspaceRoot);
  const selectedModel = await getModel([codespinConfig.model], codespinConfig);
  const allPaths = await getFilesRecursive(initArgs.args, workspaceRoot);

  const fileDetails = (
    await Promise.all(
      allPaths.map(async (filePath) => {
        const size = (await fs.stat(filePath)).size;
        return {
          path: path.relative(workspaceRoot, filePath),
          size,
          includeOption: "source" as "source",
        };
      })
    )
  ).sort((a, b) => a.path.localeCompare(b.path));

  return {
    includedFiles: fileDetails,
    codingConventions: conventions,
    models: codespinConfig.models ?? [],
    selectedModel: selectedModel.alias ?? selectedModel.name,
    prompt: initArgs.prompt ?? "",
    codingConvention: undefined,
  };
}
