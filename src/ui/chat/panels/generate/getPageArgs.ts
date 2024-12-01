import { promises as fs } from "fs";
import { readCodeSpinConfig } from "codespin/dist/settings/readCodeSpinConfig.js";
import { getModel } from "codespin/dist/settings/getModel.js";
import * as path from "path";
import { GeneratePageArgs } from "../../html/pages/generate/GeneratePageArgs.js";
import { InitArgs } from "./GeneratePanel.js";
import { getFilesRecursive } from "../../../../fs/getFilesRecursive.js";

export async function getPageArgs(
  initArgs: InitArgs,
  workspaceRoot: string,
  conventions: any,
  uiProps: any
): Promise<GeneratePageArgs> {
  const codespinConfig = await readCodeSpinConfig(undefined, workspaceRoot);
  const selectedModel = await getModel([codespinConfig.model], codespinConfig);

  return initArgs.type === "files"
    ? await (async () => {
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
          codegenTargets: ":prompt",
          fileVersion: "current",
          prompt: initArgs.prompt ?? "",
          codingConvention: undefined,
          outputKind: "full",
          multi: 0,
          uiProps,
        };
      })()
    : await (async () => {
        const fileDetails = (
          await Promise.all(
            initArgs.args.includedFiles.map(async (x) => {
              const filePath = path.resolve(workspaceRoot, x.path);
              const size = (await fs.stat(filePath)).size;
              const relativePath = path.relative(workspaceRoot, filePath);
              return {
                path: relativePath,
                size,
                includeOption: "source" as "source",
              };
            })
          )
        ).sort((a, b) => a.path.localeCompare(b.path)); // Sorting by path for consistency.

        const args: GeneratePageArgs = {
          includedFiles: fileDetails,
          codingConventions: conventions,
          models: codespinConfig.models ?? [],
          selectedModel: initArgs.args.model,
          prompt: initArgs.args.prompt,
          codingConvention: initArgs.args.codingConvention,
          uiProps,
        };
        return args;
      })();
}
