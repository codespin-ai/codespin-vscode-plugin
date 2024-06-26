import { promises as fs } from "fs";
import * as path from "path";
import { getFilesRecursive } from "../../../fs/getFilesRecursive.js";
import { getModels } from "../../../settings/models/getModels.js";
import { getDefaultModel } from "../../../settings/models/getDefaultModel.js";
import { GeneratePageArgs } from "../../html/pages/generate/GeneratePageArgs.js";
import { InitArgs } from "./GeneratePanel.js";

export async function getPageArgs(
  initArgs: InitArgs,
  workspaceRoot: string,
  conventions: any,
  uiProps: any
): Promise<GeneratePageArgs> {
  return initArgs.type === "files"
    ? await (async () => {
        const allPaths = await getFilesRecursive(initArgs.args);

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
          models: await getModels(workspaceRoot),
          selectedModel: await getDefaultModel(workspaceRoot),
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
          models: await getModels(workspaceRoot),
          selectedModel: initArgs.args.model,
          codegenTargets: initArgs.args.codegenTargets,
          fileVersion: initArgs.args.fileVersion,
          prompt: initArgs.args.prompt,
          codingConvention: initArgs.args.codingConvention,
          outputKind: initArgs.args.outputKind,
          multi: initArgs.args.multi,
          uiProps,
        };
        return args;
      })();
}
