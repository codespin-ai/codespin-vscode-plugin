import { generate as codespinGenerate } from "codespin/dist/commands/generate.js";
import { promises as fs } from "fs";
import * as path from "path";
import * as vscode from "vscode";
import { EventTemplate } from "../../EventTemplate.js";
import { getDefaultModel } from "../../models/getDefaultModel.js";
import { getModels } from "../../models/getModels.js";
import { createAPIConfig } from "../../settings/api/createAPIConfig.js";
import { getConventions } from "../../settings/conventions/getCodingConventions.js";
import { writeGeneratedFiles } from "../../settings/history/writeGeneratedFiles.js";
import { UIPanel } from "../../ui/UIPanel.js";
import { GeneratePageArgs } from "../../ui/pages/generate/GeneratePageArgs.js";
import { getWorkspaceRoot } from "../../vscode/getWorkspaceRoot.js";
import { ArgsFromGeneratePanel } from "./ArgsFromGeneratePanel.js";
import { getGenerateArgs } from "./getGenerateArgs.js";
import { writeUserInput } from "../../settings/history/writeUserInput.js";
import { RegeneratePageArgs } from "../../ui/pages/history/RegeneratePageArgs.js";
import { writeHistoryItem } from "../../settings/history/writeHistoryItem.js";

export function getGenerateCommand(context: vscode.ExtensionContext) {
  return async function generateCommand(
    _: unknown,
    commandArgs: vscode.Uri[] | RegeneratePageArgs
  ): Promise<void> {
    if (!commandArgs) {
      return;
    }

    let generateArgs: EventTemplate<ArgsFromGeneratePanel> | undefined;

    const workspaceRoot = getWorkspaceRoot(context);

    const uiPanel = new UIPanel(context, onMessage);

    await uiPanel.onWebviewReady();

    const conventions = await getConventions(workspaceRoot);

    const generatePageArgs: GeneratePageArgs = Array.isArray(commandArgs)
      ? await (async () => {
          const fileDetails = (
            await Promise.all(
              commandArgs.map(async (x) => {
                const fullPath = x.fsPath;
                const size = (await fs.stat(fullPath)).size;
                const relativePath = path.relative(workspaceRoot, fullPath);
                return { path: relativePath, size };
              })
            )
          ).sort((a, b) => a.path.localeCompare(b.path)); // Sorting by path for consistency.

          return {
            files: fileDetails,
            codingConventions: conventions,
            models: getModels(),
            selectedModel: getDefaultModel(),
            codegenTargets: ":prompt",
            fileVersion: "current",
            includedFiles: commandArgs.map((x) => ({
              includeOption: "source",
              path: path.relative(workspaceRoot, x.fsPath),
            })),
            prompt: "",
            codingConvention: undefined,
          };
        })()
      : await (async () => {
          const fileDetails = (
            await Promise.all(
              commandArgs.includedFiles.map(async (x) => {
                const fullPath = path.resolve(workspaceRoot, x.path);
                const size = (await fs.stat(fullPath)).size;
                const relativePath = path.relative(workspaceRoot, fullPath);
                return { path: relativePath, size };
              })
            )
          ).sort((a, b) => a.path.localeCompare(b.path)); // Sorting by path for consistency.

          const args: GeneratePageArgs = {
            files: fileDetails,
            codingConventions: conventions,
            models: getModels(),
            selectedModel: commandArgs.model,
            codegenTargets: commandArgs.codegenTargets,
            fileVersion: commandArgs.fileVersion,
            includedFiles: commandArgs.includedFiles,
            prompt: commandArgs.prompt,
            codingConvention: commandArgs.codingConvention?.filename,
          };
          return args;
        })();

    let cancelGeneration: (() => void) | undefined = undefined;

    function setCancelGeneration(cancel: () => void) {
      cancelGeneration = cancel;
    }

    await uiPanel.navigateTo("/generate", generatePageArgs);

    async function onMessage(message: EventTemplate<unknown>) {
      switch (message.type) {
        case "generate":
          generateArgs = message as EventTemplate<ArgsFromGeneratePanel>;

          const result = await getGenerateArgs(
            generateArgs!,
            setCancelGeneration,
            workspaceRoot
          );

          switch (result.status) {
            case "can_generate":
              await writeHistoryItem(
                generateArgs.prompt,
                "prompt.txt",
                result.dirName,
                workspaceRoot
              );

              const { type: unused1, ...messageSansType } =
                message as EventTemplate<ArgsFromGeneratePanel>;

              await writeHistoryItem(
                messageSansType.prompt,
                "unevaluated-prompt.txt",
                result.dirName,
                workspaceRoot
              );

              await writeUserInput(
                result.dirName,
                messageSansType as ArgsFromGeneratePanel,
                workspaceRoot
              );

              await uiPanel.navigateTo(`/generate/invoke`, {
                api: result.args.api,
                model: result.args.model,
              });

              result.args.promptCallback = async (prompt) => {
                await writeHistoryItem(
                  prompt,
                  "raw-prompt.txt",
                  result.dirName,
                  workspaceRoot
                );
              };

              result.args.responseStreamCallback = (text) => {
                uiPanel.postMessageToWebview({
                  type: "generate:stream:response",
                  data: text,
                });
              };

              result.args.responseCallback = (text) => {
                uiPanel.dispose();
              };

              result.args.parseCallback = async (files) => {
                await writeGeneratedFiles(result.dirName, files, workspaceRoot);
              };

              await codespinGenerate(result.args, {
                workingDir: workspaceRoot,
              });

              break;
            case "missing_config":
              await uiPanel.navigateTo(`/api/config/edit`, {
                api: result.api,
              });
              break;
          }
          break;
        case "api:editConfig":
          await createAPIConfig(message as any);
          await onMessage(generateArgs!);
          break;
        case "cancel":
          if (cancelGeneration) {
            cancelGeneration();
          }
          uiPanel.dispose();
          break;
        default:
          break;
      }
    }
  };
}
