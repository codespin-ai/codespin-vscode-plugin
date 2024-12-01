import { promises as fs } from "fs";
import { readCodeSpinConfig } from "codespin/dist/settings/readCodeSpinConfig.js";
import { getModel } from "codespin/dist/settings/getModel.js";
import * as path from "path";
import { StartChatPageArgs } from "./html/pages/generate/StartChatPageArgs.js";
import { InitArgs } from "./ChatPanel.js";
import { getFilesRecursive } from "../../fs/getFilesRecursive.js";

export async function getPageArgs(
  initArgs: InitArgs,
  workspaceRoot: string,
  conventions: any,
  uiProps: any
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
    uiProps,
  };
}
