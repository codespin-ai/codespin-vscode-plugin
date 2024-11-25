import { EventEmitter } from "events";
import * as path from "path";
import * as vscode from "vscode";
import { editAnthropicConfig } from "../../../settings/provider/editAnthropicConfig.js";
import { editOpenAIConfig } from "../../../settings/provider/editOpenAIConfig.js";
import {
  EditAnthropicConfigEvent,
  EditOpenAIConfigEvent,
} from "../../../settings/provider/types.js";
import { getConventions } from "../../../settings/conventions/getCodingConventions.js";
import { initialize } from "../../../settings/initialize.js";
import { isInitialized } from "../../../settings/isInitialized.js";
import { setDefaultModel } from "../../../settings/models/setDefaultModel.js";
import { getUIProps } from "../../../settings/ui/getUIProps.js";
import { saveUIProps } from "../../../settings/ui/saveUIProps.js";
import { getWorkspaceRoot } from "../../../vscode/getWorkspaceRoot.js";
import { EventTemplate } from "../../EventTemplate.js";
import { GeneratePageArgs } from "../../html/pages/generate/GeneratePageArgs.js";
import { navigateTo } from "../../navigateTo.js";
import { UIPanel } from "../UIPanel.js";
import { addDeps } from "./addDeps.js";
import { copyToClipboard } from "./copyToClipboard.js";
import { getGenerateArgs } from "./getGenerateArgs.js";
import { getPageArgs } from "./getPageArgs.js";
import { invokeGeneration } from "./invokeGenerate.js";
import {
  AddDepsEvent,
  CopyToClipboardEvent,
  GenerateEvent,
  GenerateUserInput,
  ModelChangeEvent,
  NewHistoryEntryEvent,
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
  userInput: GenerateEvent | undefined;
  dirName: string | undefined = undefined;
  cancelGeneration: (() => void) | undefined;

  constructor(
    context: vscode.ExtensionContext,
    globalEventEmitter: EventEmitter
  ) {
    super({}, context, globalEventEmitter);
  }

  async init(initArgs: InitArgs) {
    const workspaceRoot = getWorkspaceRoot(this.context);

    const initialized = await isInitialized(workspaceRoot);
    if (!initialized) {
      // Ask the user if they want to force initialize
      const userChoice = await vscode.window.showWarningMessage(
        "CodeSpin configuration is not initialized for this project. Create?",
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

    await this.webviewReadyEvent();

    const conventions = await getConventions(workspaceRoot);

    const uiProps = await getUIProps(workspaceRoot);

    const generatePageArgs: GeneratePageArgs = await getPageArgs(
      initArgs,
      workspaceRoot,
      conventions,
      uiProps
    );

    await navigateTo(this, "/generate", generatePageArgs);
  }

  async onMessage(message: EventTemplate) {
    const workspaceRoot = getWorkspaceRoot(this.context);

    switch (message.type) {
      case "addDeps":
        await addDeps(this, message as AddDepsEvent, workspaceRoot);
        break;
      case "copyToClipboard": {
        if (this.dirName === undefined) {
          this.dirName = Date.now().toString();
        }

        await copyToClipboard(
          message as CopyToClipboardEvent,
          this.dirName,
          workspaceRoot
        );

        const newHistoryEntry: NewHistoryEntryEvent = {
          type: "newHistoryEntry",
        };
        this.globalEventEmitter.emit("message", newHistoryEntry);

        break;
      }
      case "generate": {
        this.userInput = message as GenerateEvent;

        if (this.dirName === undefined) {
          this.dirName = Date.now().toString();
        }

        const generateArgs = await getGenerateArgs(
          this,
          this.dirName,
          workspaceRoot
        );

        switch (generateArgs.status) {
          case "can_generate":
            try {
              await invokeGeneration(
                this,
                generateArgs,
                this.dirName,
                workspaceRoot
              );
            } finally {
              const newHistoryEntry: NewHistoryEntryEvent = {
                type: "newHistoryEntry",
              };
              this.globalEventEmitter.emit("message", newHistoryEntry);
              this.dispose();
            }
            break;
          case "missing_config":
            await navigateTo(this, `/provider/config/edit`, {
              provider: generateArgs.provider,
            });
            break;
        }
        break;
      }
      case "editAnthropicConfig": {
        await editAnthropicConfig(message as EditAnthropicConfigEvent);
        await this.onMessage(this.userInput!);
        break;
      }
      case "editOpenAIConfig": {
        await editOpenAIConfig(message as EditOpenAIConfigEvent);
        await this.onMessage(this.userInput!);
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
