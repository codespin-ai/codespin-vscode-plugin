import { EventEmitter } from "events";
import * as vscode from "vscode";
import { getConventions } from "../../../settings/conventions/getCodingConventions.js";
import { getUIProps } from "../../../settings/ui/getUIProps.js";
import { getWorkspaceRoot } from "../../../vscode/getWorkspaceRoot.js";
import { GeneratePageArgs } from "../../html/pages/generate/GeneratePageArgs.js";
import { navigateTo } from "../../navigateTo.js";
import { UIPanel } from "../UIPanel.js";
import { getMessageBroker } from "./getMessageBroker.js";
import { getPageArgs } from "./getPageArgs.js";
import { GenerateEvent, GenerateUserInput } from "./types.js";
import { MessageTemplate } from "../../types.js";

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

  async onMessage(message: MessageTemplate) {
    if (this.messageBroker.canHandle(message.type)) {
      this.messageBroker.handleRequest(message as any);
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
