import { generate as codespinGenerate } from "codespin/dist/commands/generate.js";
import { promises as fs } from "fs";
import * as path from "path";
import * as vscode from "vscode";
import { getDefaultModel } from "../../../models/getDefaultModel.js";
import { getModels } from "../../../models/getModels.js";
import { setDefaultModel } from "../../../models/setDefaultModel.js";
import {
  AnthropicConfigArgs,
  editAnthropicConfig,
} from "../../../settings/api/editAnthropicConfig.js";
import {
  OpenAIConfigArgs,
  editOpenAIConfig,
} from "../../../settings/api/editOpenAIConfig.js";
import { getConventions } from "../../../settings/conventions/getCodingConventions.js";
import { writeGeneratedFiles } from "../../../settings/history/writeGeneratedFiles.js";
import { writeHistoryItem } from "../../../settings/history/writeHistoryItem.js";
import { writeUserInput } from "../../../settings/history/writeUserInput.js";
import { getWorkspaceRoot } from "../../../vscode/getWorkspaceRoot.js";
import { EventTemplate } from "../../EventTemplate.js";
import { GeneratePageArgs } from "../../html/pages/generate/GeneratePageArgs.js";
import { RegeneratePageArgs } from "../../html/pages/history/RegeneratePageArgs.js";
import { UIPanel } from "../UIPanel.js";
import { ArgsFromGeneratePanel } from "./ArgsFromGeneratePanel.js";
import { ModelChange } from "./ModelChange.js";
import { getGenerateArgs } from "./getGenerateArgs.js";
import { initialize } from "../../../settings/initialize.js";
import { AddDepsEventArgs, IncludeFilesEventArgs } from "./eventArgs.js";
import { getFilesRecursive } from "../../../fs/getFilesRecursive.js";
import { deps as codespinDeps } from "codespin/dist/commands/deps.js"; // Import codespinDeps
import { pathExists } from "../../../fs/pathExists.js";

let activePanel: GeneratePanel | undefined = undefined;

export function getActivePanel() {
  return activePanel;
}

export class GeneratePanel extends UIPanel {
  generateArgs: EventTemplate<ArgsFromGeneratePanel> | undefined;
  cancelGeneration: (() => void) | undefined;

  constructor(context: vscode.ExtensionContext) {
    super(context);
  }

  async init(commandArgs: vscode.Uri[] | RegeneratePageArgs) {
    const workspaceRoot = getWorkspaceRoot(this.context);
    await this.onWebviewReady();

    const conventions = await getConventions(workspaceRoot);

    const generatePageArgs: GeneratePageArgs = Array.isArray(commandArgs)
      ? await (async () => {
          const allPaths = await getFilesRecursive(
            commandArgs.map((x) => x.fsPath)
          );

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
            files: fileDetails,
            codingConventions: conventions,
            models: await getModels(workspaceRoot),
            selectedModel: await getDefaultModel(workspaceRoot),
            codegenTargets: ":prompt",
            fileVersion: "current",
            prompt: "",
            codingConvention: undefined,
          };
        })()
      : await (async () => {
          const fileDetails = (
            await Promise.all(
              commandArgs.includedFiles.map(async (x) => {
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
            files: fileDetails,
            codingConventions: conventions,
            models: await getModels(workspaceRoot),
            selectedModel: commandArgs.model,
            codegenTargets: commandArgs.codegenTargets,
            fileVersion: commandArgs.fileVersion,
            prompt: commandArgs.prompt,
            codingConvention: commandArgs.codingConvention?.filename,
          };
          return args;
        })();

    await this.navigateTo("/generate", generatePageArgs);
  }

  // Method to include files
  async includeFiles(filePaths: string[]) {
    const allPaths = await getFilesRecursive(filePaths);
    const workspaceRoot = getWorkspaceRoot(this.context);
    const message: EventTemplate<IncludeFilesEventArgs> = {
      type: "includeFiles",
      files: await Promise.all(
        allPaths.map(async (filePath) => ({
          path: path.relative(workspaceRoot, filePath),
          size: (await fs.stat(path.resolve(workspaceRoot, filePath))).size,
        }))
      ),
    };
    this.postMessageToWebview(message);
  }

  async onMessage(message: EventTemplate<unknown>) {
    const workspaceRoot = getWorkspaceRoot(this.context);

    switch (message.type) {
      case "addDeps":
        const incomingMessage = message as EventTemplate<AddDepsEventArgs>;
        const [vendor, model] = incomingMessage.model.split(":");
        const dependenciesArgs = {
          file: incomingMessage.file,
          config: undefined,
          api: vendor,
          model,
          maxTokens: undefined,
          debug: true,
        };
        const dependencies = await codespinDeps(dependenciesArgs, {
          workingDir: workspaceRoot,
        });

        this.includeFiles(
          (
            await Promise.all(
              dependencies
                .filter((x) => x.isProjectFile)
                .map(async (x) => {
                  const fullPath = path.resolve(workspaceRoot, x.filePath);
                  const fileExists = await pathExists(fullPath);
                  return fileExists ? fullPath : undefined;
                })
            )
          ).filter(Boolean) as string[]
        );
        break;
      case "generate":
        this.generateArgs = message as EventTemplate<ArgsFromGeneratePanel>;

        const result = await getGenerateArgs(
          this.generateArgs!,
          this.setCancelGeneration.bind(this),
          workspaceRoot
        );

        switch (result.status) {
          case "not_initialized":
            // Ask the user if they want to force initialize
            const userChoice = await vscode.window.showWarningMessage(
              "Codespin configuration is not initialized for this project. Create?",
              "Yes",
              "No"
            );

            if (userChoice === "Yes") {
              await initialize(false, workspaceRoot);

              // Now we can retry.
              await this.onMessage(this.generateArgs!);
            }
            // If the user chooses No, we must exit.
            else {
              this.dispose();
            }
            break;
          case "can_generate":
            await writeHistoryItem(
              this.generateArgs.prompt,
              "prompt.txt",
              result.dirName,
              workspaceRoot
            );

            const { type: unused1, ...messageSansType } =
              message as EventTemplate<ArgsFromGeneratePanel>;

            await writeUserInput(
              result.dirName,
              messageSansType as ArgsFromGeneratePanel,
              workspaceRoot
            );

            await this.navigateTo(`/generate/invoke`, {
              api: result.args.api,
              model: result.args.model,
            });

            result.args.promptCallback = async (prompt) => {
              this.postMessageToWebview({
                type: "promptCreated",
                prompt,
              });

              await writeHistoryItem(
                prompt,
                "raw-prompt.txt",
                result.dirName,
                workspaceRoot
              );
            };

            result.args.responseStreamCallback = (text) => {
              this.postMessageToWebview({
                type: "responseStream",
                data: text,
              });
            };

            result.args.responseCallback = (text) => {
              this.dispose();
            };

            result.args.parseCallback = async (files) => {
              await writeGeneratedFiles(result.dirName, files, workspaceRoot);
            };

            await codespinGenerate(result.args, {
              workingDir: workspaceRoot,
            });

            break;
          case "missing_config":
            await this.navigateTo(`/api/config/edit`, {
              api: result.api,
            });
            break;
        }
        break;
      case "editAnthropicConfig":
        await editAnthropicConfig(
          message as EventTemplate<AnthropicConfigArgs>
        );
        await this.onMessage(this.generateArgs!);
        break;
      case "editOpenAIConfig":
        await editOpenAIConfig(message as EventTemplate<OpenAIConfigArgs>);
        await this.onMessage(this.generateArgs!);
        break;
      case "modelChange":
        await setDefaultModel(
          (message as EventTemplate<ModelChange>).model,
          workspaceRoot
        );
        break;
      case "cancel":
        if (this.cancelGeneration) {
          this.cancelGeneration();
        }
        this.dispose();
        break;
      default:
        break;
    }
  }

  setCancelGeneration(cancel: () => void) {
    this.cancelGeneration = cancel;
  }

  onDidChangeViewState(e: vscode.WebviewPanelOnDidChangeViewStateEvent): void {
    this.setIncludeFilesContext(e.webviewPanel.visible);
  }

  setIncludeFilesContext(visible: boolean) {
    if (visible) {
      activePanel = this;
    } else {
      if (activePanel === this) {
        activePanel = undefined;
      }
    }

    // Set the context key to control visibility of the context menu item
    vscode.commands.executeCommand(
      "setContext",
      "codespin-ai.enableIncludeFiles",
      activePanel !== undefined
    );
  }

  onDispose(): void {
    this.setIncludeFilesContext(false);
  }
}
