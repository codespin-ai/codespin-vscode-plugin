import {
  PromptResult,
  generate as codespinGenerate,
} from "codespin/dist/commands/generate.js";
import { EventEmitter } from "events";
import { promises as fs } from "fs";
import * as path from "path";
import * as vscode from "vscode";
import { getFilesRecursive } from "../../../fs/getFilesRecursive.js";
import { editAnthropicConfig } from "../../../settings/api/editAnthropicConfig.js";
import { editOpenAIConfig } from "../../../settings/api/editOpenAIConfig.js";
import {
  EditAnthropicConfigEvent,
  EditOpenAIConfigEvent,
} from "../../../settings/api/types.js";
import { getConventions } from "../../../settings/conventions/getCodingConventions.js";
import { initialize } from "../../../settings/initialize.js";
import { isInitialized } from "../../../settings/isInitialized.js";
import { setDefaultModel } from "../../../settings/models/setDefaultModel.js";
import { getUIProps } from "../../../settings/ui/getUIProps.js"; // Added import for getUIProps
import { saveUIProps } from "../../../settings/ui/saveUIProps.js";
import { getWorkspaceRoot } from "../../../vscode/getWorkspaceRoot.js";
import { EventTemplate } from "../../EventTemplate.js";
import { GeneratePageArgs } from "../../html/pages/generate/GeneratePageArgs.js";
import { UIPanel } from "../UIPanel.js";
import { addDeps } from "./addDeps.js";
import { getGenerateArgs } from "./getGenerateArgs.js";
import { getPageArgs } from "./getPageArgs.js";
import { getPrintPromptArgs } from "./getPrintPromptArgs.js";
import { invokeGeneration } from "./invokeGenerate.js";
import {
  AddDepsEvent,
  CopyToClipboardEvent,
  GenerateEvent,
  GenerateUserInput,
  IncludeFilesEvent,
  ModelChangeEvent,
  OpenFileEvent,
  UIPropsUpdateEvent,
} from "./types.js";

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

    const uiProps = await getUIProps(workspaceRoot);

    const generatePageArgs: GeneratePageArgs = await getPageArgs(
      initArgs,
      workspaceRoot,
      conventions,
      uiProps
    );

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
        await addDeps(
          message as AddDepsEvent,
          workspaceRoot,
          this.includeFiles.bind(this)
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
            await invokeGeneration(
              this.generateArgs!,
              result,
              workspaceRoot,
              this.navigateTo.bind(this),
              this.postMessageToWebview.bind(this),
              this.dispose.bind(this)
            );
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
