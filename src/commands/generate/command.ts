import { generate as codespinGenerate } from "codespin/dist/commands/generate.js";
import { promises as fs } from "fs";
import * as path from "path";
import * as vscode from "vscode";
import { EventTemplate } from "../../EventTemplate.js";
import { getDefaultModel } from "../../models/getDefaultModel.js";
import { getModels } from "../../models/getModels.js";
import { createAPIConfig } from "../../settings/createAPIConfig.js";
import { getConventions } from "../../settings/getConventions.js";
import { UIPanel } from "../../ui/UIPanel.js";
import { GeneratePageArgs } from "../../ui/pages/generate/GeneratePageArgs.js";
import { getWorkspaceRoot } from "../../vscode/getWorkspaceRoot.js";
import { ArgsFromGeneratePanel } from "./ArgsFromGeneratePanel.js";
import { getGenerateArgs } from "./getGenerateArgs.js";

export function getGenerateCommand(context: vscode.ExtensionContext) {
  return async function generateCommand(
    _: unknown,
    uris: vscode.Uri[]
  ): Promise<void> {
    if (!uris) {
      return;
    }

    let generateArgs: EventTemplate<ArgsFromGeneratePanel> | undefined;

    const workspaceRoot = getWorkspaceRoot(context);

    const fileDetails = (
      await Promise.all(
        uris.map(async (uri) => {
          const fullPath = uri.fsPath;
          const size = (await fs.stat(fullPath)).size;
          const relativePath = path.relative(workspaceRoot, fullPath);
          return { path: relativePath, size };
        })
      )
    ).sort((a, b) => a.path.localeCompare(b.path)); // Sorting by path for consistency.

    const uiPanel = new UIPanel(context, onMessage);

    await uiPanel.onWebviewReady();

    const conventions = await getConventions(workspaceRoot);

    const generatePanelArgs: GeneratePageArgs = {
      files: fileDetails,
      conventions,
      models: getModels(),
      selectedModel: getDefaultModel(),
    };

    await uiPanel.navigateTo("/generate", generatePanelArgs);

    async function onMessage(message: EventTemplate<unknown>) {
      switch (message.type) {
        case "generate":
          generateArgs = message as EventTemplate<ArgsFromGeneratePanel>;

          const result = await getGenerateArgs(generateArgs!, context);

          switch (result.status) {
            case "can_generate":
              await uiPanel.navigateTo(`/generate/invoke`, {
                api: result.args.api,
                model: result.args.model,
              });

              result.args.promptCallback = (prompt) => {
                uiPanel.postMessageToWebview({
                  type: "generate:stream:prompt",
                  prompt,
                });
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

        case "api:editConfig":
          await createAPIConfig(message as any);
          await onMessage(generateArgs!);
        case "close":
          uiPanel.dispose();
          break;
        default:
          break;
      }
    }
  };
}