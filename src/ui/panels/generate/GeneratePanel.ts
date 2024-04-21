import { dependencies as codespinDependencies } from "codespin/dist/commands/dependencies.js";
import {
  PromptResult,
  generate as codespinGenerate,
} from "codespin/dist/commands/generate.js";
import { EventEmitter } from "events";
import { promises as fs } from "fs";
import { mkdir } from "fs/promises";
import * as path from "path";
import * as vscode from "vscode";
import { getFilesRecursive } from "../../../fs/getFilesRecursive.js";
import { pathExists } from "../../../fs/pathExists.js";
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
import { isInitialized } from "../../../settings/isInitialized.js";
import { getWorkspaceRoot } from "../../../vscode/getWorkspaceRoot.js";
import { EventTemplate } from "../../EventTemplate.js";
import { GeneratePageArgs } from "../../html/pages/generate/Generate.js";
import { UIPanel } from "../UIPanel.js";
import { getGenerateArgs } from "./getGenerateArgs.js";
import {
  AddDepsEvent,
  CopyToClipboardEvent,
  GenerateEvent,
  GenerateUserInput,
  IncludeFilesEvent,
  ModelChangeEvent,
  OpenFileEvent,
  PromptCreatedEvent,
  ResponseStreamEvent,
  UIPropsUpdateEvent,
} from "./types.js";
import { getPrintPromptArgs } from "./getPrintPromptArgs.js";
import { getDefaultModel } from "../../../settings/models/getDefaultModel.js";
import { getModels } from "../../../settings/models/getModels.js";
import { setDefaultModel } from "../../../settings/models/setDefaultModel.js";
import { saveUIProps } from "../../../settings/ui/saveUIProps.js";

type JustFiles = { type: "files"; prompt: string | undefined; args: string[] };
type RegenerateArgs = { type: "regenerate"; args: GenerateUserInput };
export type InitArgs = JustFiles | RegenerateArgs;

let activePanel: GeneratePanel | undefined = undefined;

export function getActivePanel() {
  return activePanel;
}

export class GeneratePanel extends UIPanel {
  generateArgs: GenerateEvent | undefined;
  cancelGeneration: (() => void) | undefined;

  constructor(
    context: vscode.ExtensionContext,
    globalEventEmitter: EventEmitter
  ) {
    super(context, globalEventEmitter);
  }

  async init(initArgs: InitArgs) {
    const workspaceRoot = getWorkspaceRoot(this.context);

    const initialized = await isInitialized(workspaceRoot);
    if (!initialized) {
      // Ask the user if they want to force initialize
      const userChoice = await vscode.window.showWarningMessage(
        "Codespin configuration is not initialized for this project. Create?",
        "Yes",
        "No"
      );

      if (userChoice === "Yes") {
        await initialize(false, workspaceRoot);
      }
      // If the user chooses No, we must exit.
      else {
        this.dispose();
        return;
      }
    }

    await this.onWebviewReady();

    const conventions = await getConventions(workspaceRoot);

    const generatePageArgs: GeneratePageArgs =
      initArgs.type === "files"
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
      case "copyToClipboard": {
        const clipboardArgs = message as CopyToClipboardEvent;

        const args = getPrintPromptArgs(clipboardArgs, workspaceRoot);

        const result = await codespinGenerate(args, {
          workingDir: workspaceRoot,
        });

        const prompt = (result as PromptResult).prompt;
        vscode.env.clipboard.writeText(prompt);
        break;
      }
      case "generate": {
        this.generateArgs = message as GenerateEvent;
        const result = await getGenerateArgs(
          this.generateArgs!,
          this.setCancelGeneration.bind(this),
          workspaceRoot
        );

        switch (result.status) {
          case "can_generate":
            const historyDirPath = path.dirname(result.promptFilePath);

            // The entry will not exist. Make.
            if (!(await pathExists(historyDirPath))) {
              await mkdir(historyDirPath, { recursive: true });
            }

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
              messageSansType as GenerateUserInput,
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

            result.args.responseCallback = async (text) => {
              await writeHistoryItem(
                text,
                "raw-response.txt",
                result.dirName,
                workspaceRoot
              );
              this.dispose();
            };

            result.args.parseCallback = async (files) => {
              await writeGeneratedFiles(result.dirName, files, workspaceRoot);
            };

            this.globalEventEmitter.emit("message", {
              type: "generate",
            });

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
      }
      case "editAnthropicConfig": {
        await editAnthropicConfig(message as EditAnthropicConfigEvent);
        await this.onMessage(this.generateArgs!);
        break;
      }
      case "editOpenAIConfig": {
        await editOpenAIConfig(message as EditOpenAIConfigEvent);
        await this.onMessage(this.generateArgs!);
        break;
      }
      case "modelChange": {
        await setDefaultModel(
          (message as ModelChangeEvent).model,
          workspaceRoot
        );
        break;
      }
      case "uiPropsUpdate": {
        const event = message as UIPropsUpdateEvent;
        saveUIProps(
          {
            promptTextAreaHeight: event.promptTextAreaHeight,
            promptTextAreaWidth: event.promptTextAreaWidth,
          },
          workspaceRoot
        );
        break;
      }
      case "openFile": {
        const filePath = path.resolve(
          workspaceRoot,
          (message as OpenFileEvent).file
        );
        const uri = vscode.Uri.file(filePath);
        vscode.window.showTextDocument(uri, {
          preview: false,
          preserveFocus: false,
        });
        break;
      }
      case "cancel": {
        if (this.cancelGeneration) {
          this.cancelGeneration();
        }
        this.dispose();
        break;
      }
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
