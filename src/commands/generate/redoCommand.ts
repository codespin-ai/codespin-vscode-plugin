import { generate as codespinGenerate } from "codespin/dist/commands/generate.js";
import { promises as fs } from "fs";
import * as path from "path";
import * as vscode from "vscode";
import { EventTemplate } from "../../EventTemplate.js";
import { getDefaultModel } from "../../models/getDefaultModel.js";
import { getModels } from "../../models/getModels.js";
import { createAPIConfig } from "../../settings/api/createAPIConfig.js";
import { getConventions } from "../../settings/conventions/getConventions.js";
import { writeGeneratedFiles } from "../../settings/history/writeGeneratedFiles.js";
import { UIPanel } from "../../ui/UIPanel.js";
import { GeneratePageArgs } from "../../ui/pages/generate/GeneratePageArgs.js";
import { getWorkspaceRoot } from "../../vscode/getWorkspaceRoot.js";
import { ArgsFromGeneratePanel } from "./ArgsFromGeneratePanel.js";
import { getGenerateArgs } from "./getGenerateArgs.js";
import { writePrompt } from "../../settings/history/writePrompt.js";
import { writeRawPrompt } from "../../settings/history/writeRawPrompt.js";
import { writeUserInput } from "../../settings/history/writeUserInput.js";

export function getRedoGenerateCommand(context: vscode.ExtensionContext) {
  return async function redoGenerateCommand(
    _: unknown,
    args: GeneratePageArgs
  ): Promise<void> {
    let generateArgs: EventTemplate<ArgsFromGeneratePanel> | undefined;

    const workspaceRoot = getWorkspaceRoot(context);

    const fileDetails = (
      await Promise.all(
        args.files.map(async (file) => {
          const fullPath = path.join(workspaceRoot, file.path);
          const size = (await fs.stat(fullPath)).size;
          const relativePath = path.relative(workspaceRoot, fullPath);
          return { path: relativePath, size };
        })
      )
    ).sort((a, b) => a.path.localeCompare(b.path)); // Sorting by path for consistency.

    const uiPanel = new UIPanel(context, onMessage);

    await uiPanel.onWebviewReady();

    const conventions = await getConventions(workspaceRoot);

    const generatePageArgs: GeneratePageArgs = {
      files: fileDetails,
      conventions,
      models: getModels(),
      selectedModel: getDefaultModel(),
    };

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
              await writePrompt(
                result.dirName,
                generateArgs.prompt,
                workspaceRoot
              );

              const { type: unused1, ...messageSansType } = message;

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
                await writeRawPrompt(result.dirName, prompt, workspaceRoot);
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
