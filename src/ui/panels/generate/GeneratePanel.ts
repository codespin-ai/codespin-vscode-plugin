import { dependencies as codespinDependencies } from "codespin/dist/commands/dependencies.js";
import { generate as codespinGenerate } from "codespin/dist/commands/generate.js";
import { promises as fs } from "fs";
import * as path from "path";
import * as vscode from "vscode";
import { getFilesRecursive } from "../../../fs/getFilesRecursive.js";
import { pathExists } from "../../../fs/pathExists.js";
import { getDefaultModel } from "../../../models/getDefaultModel.js";
import { getModels } from "../../../models/getModels.js";
import { setDefaultModel } from "../../../models/setDefaultModel.js";
import { editAnthropicConfig } from "../../../settings/api/editAnthropicConfig.js";
import { editOpenAIConfig } from "../../../settings/api/editOpenAIConfig.js";
import {
  EditAnthropicConfigEvent,
  EditOpenAIConfigEvent,
} from "../../../settings/api/types.js";
import { getConventions } from "../../../settings/conventions/getCodingConventions.js";
import { writeGeneratedFiles } from "../../../settings/history/writeGeneratedFiles.js";
import { writeHistoryItem } from "../../../settings/history/writeHistoryItem.js";
import { writeUserInput } from "../../../settings/history/writeUserInput.js";
import { initialize } from "../../../settings/initialize.js";
import { getWorkspaceRoot } from "../../../vscode/getWorkspaceRoot.js";
import { EventTemplate } from "../../EventTemplate.js";
import { UIPanel } from "../UIPanel.js";
import { getGenerateArgs } from "./getGenerateArgs.js";
import {
  AddDepsEvent,
  ArgsFromGeneratePanel,
  GenerateEvent,
  IncludeFilesEvent,
  ModelChangeEvent,
  PromptCreatedEvent,
  RegenerateArgs,
  ResponseStreamEvent,
} from "./types.js";
import { GeneratePageArgs } from "../../html/pages/generate/Generate.js";

let activePanel: GeneratePanel | undefined = undefined;

export function getActivePanel() {
  return activePanel;
}

export class GeneratePanel extends UIPanel {
  generateArgs: GenerateEvent | undefined;
  cancelGeneration: (() => void) | undefined;

  constructor(context: vscode.ExtensionContext) {
    super(context);
  }

  async init(commandArgs: string[] | RegenerateArgs) {
    const workspaceRoot = getWorkspaceRoot(this.context);
    await this.onWebviewReady();

    const conventions = await getConventions(workspaceRoot);

    const generatePageArgs: GeneratePageArgs = Array.isArray(commandArgs)
      ? await (async () => {
          const allPaths = await getFilesRecursive(commandArgs);

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
    const message: IncludeFilesEvent = {
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

  async onMessage(message: EventTemplate) {
    const workspaceRoot = getWorkspaceRoot(this.context);

    switch (message.type) {
      case "addDeps":
        const incomingMessage = message as AddDepsEvent;
        const dependenciesArgs = {
          file: incomingMessage.file,
          config: undefined,
          model: incomingMessage.model,
          maxTokens: undefined,
          debug: true,
        };
        const dependenciesResult = await codespinDependencies(
          dependenciesArgs,
          {
            workingDir: workspaceRoot,
          }
        );

        this.includeFiles(
          (
            await Promise.all(
              dependenciesResult.dependencies
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
        this.generateArgs = message as GenerateEvent;
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
              message as GenerateEvent;

            await writeUserInput(
              result.dirName,
              messageSansType as ArgsFromGeneratePanel,
              workspaceRoot
            );

            await this.navigateTo(`/generate/invoke`, {
              model: result.args.model,
            });

            result.args.promptCallback = async (prompt) => {
              const promptCreated: PromptCreatedEvent = {
                type: "promptCreated",
                prompt,
              };
              this.postMessageToWebview(promptCreated);

              await writeHistoryItem(
                prompt,
                "raw-prompt.txt",
                result.dirName,
                workspaceRoot
              );
            };

            result.args.responseStreamCallback = (text) => {
              const responseStreamEvent: ResponseStreamEvent = {
                type: "responseStream",
                data: text,
              };
              this.postMessageToWebview(responseStreamEvent);
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
        await editAnthropicConfig(message as EditAnthropicConfigEvent);
        await this.onMessage(this.generateArgs!);
        break;
      case "editOpenAIConfig":
        await editOpenAIConfig(message as EditOpenAIConfigEvent);
        await this.onMessage(this.generateArgs!);
        break;
      case "modelChange":
        await setDefaultModel(
          (message as ModelChangeEvent).model,
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
