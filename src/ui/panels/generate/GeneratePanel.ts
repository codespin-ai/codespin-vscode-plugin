import { EventEmitter } from "events";
import * as path from "path";
import * as vscode from "vscode";
import { getConventions } from "../../../settings/conventions/getCodingConventions.js";
import { setDefaultModel } from "../../../settings/models/setDefaultModel.js";
import { editAnthropicConfig } from "../../../settings/provider/editAnthropicConfig.js";
import { editOpenAIConfig } from "../../../settings/provider/editOpenAIConfig.js";
import {
  EditAnthropicConfigEvent,
  EditOpenAIConfigEvent,
} from "../../../settings/provider/types.js";
import { getUIProps } from "../../../settings/ui/getUIProps.js";
import { saveUIProps } from "../../../settings/ui/saveUIProps.js";
import { getWorkspaceRoot } from "../../../vscode/getWorkspaceRoot.js";
import { MessageTemplate } from "../../MessageTemplate.js";
import { GeneratePageArgs } from "../../html/pages/generate/GeneratePageArgs.js";
import { navigateTo } from "../../navigateTo.js";
import { UIPanel } from "../UIPanel.js";
import { addDeps } from "./addDeps.js";
import { copyToClipboard } from "./copyToClipboard.js";
import { getGenerateArgs } from "./getGenerateArgs.js";
import { getMessageBroker } from "./getMessageBroker.js";
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
  messageBroker: ReturnType<typeof getMessageBroker>;

  constructor(
    context: vscode.ExtensionContext,
    globalEventEmitter: EventEmitter
  ) {
    super({}, context, globalEventEmitter);

    const workspaceRoot = getWorkspaceRoot(context);
    this.messageBroker = getMessageBroker(this, workspaceRoot);
  }

  async init(initArgs: InitArgs) {
    const workspaceRoot = getWorkspaceRoot(this.context);

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

  async onMessage(request: MessageTemplate) {
    const workspaceRoot = getWorkspaceRoot(this.context);

    switch (request.type) {
      case "addDeps":
        await addDeps(this, request as AddDepsEvent, workspaceRoot);
        break;
      case "copyToClipboard": {
        if (this.dirName === undefined) {
          this.dirName = Date.now().toString();
        }

        await copyToClipboard(
          request as CopyToClipboardEvent,
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
        this.userInput = request as GenerateEvent;

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
        await editAnthropicConfig(request as EditAnthropicConfigEvent);
        await this.onMessage(this.userInput!);
        break;
      }
      case "editOpenAIConfig": {
        await editOpenAIConfig(request as EditOpenAIConfigEvent);
        await this.onMessage(this.userInput!);
        break;
      }
      case "modelChange": {
        await setDefaultModel(
          (request as ModelChangeEvent).model,
          workspaceRoot
        );
        break;
      }
      case "uiPropsUpdate": {
        const event = request as UIPropsUpdateEvent;
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
          (request as OpenFileEvent).file
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
