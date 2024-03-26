import { generate as codespinGenerate } from "codespin/dist/commands/generate.js";
import { promises as fs } from "fs";
import * as path from "path";
import * as vscode from "vscode";
import { getDefaultModel } from "../../models/getDefaultModel.js";
import { getModels } from "../../models/getModels.js";
import { createAPIConfig } from "../../settings/createAPIConfig.js";
import { GeneratePageArgs } from "../../ui/pages/GeneratePageArgs.js";
import { UIPanel } from "../../ui/UIPanel.js";
import { getWorkspaceRoot } from "../../vscode/getWorkspaceRoot.js";
import { ArgsFromGeneratePanel } from "./ArgsFromGeneratePanel.js";
import { getGenerateArgs } from "./getGenerateArgs.js";
import { EventTemplate } from "../../EventTemplate.js";

export function getGenerateCommand(context: vscode.ExtensionContext) {
  let generateArgs: EventTemplate<ArgsFromGeneratePanel> | undefined;

  return async function generateCommand(
    _: unknown,
    uris: vscode.Uri[]
  ): Promise<void> {
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

    await uiPanel.onReady();

    const generatePanelArgs: GeneratePageArgs = {
      files: fileDetails,
      rules: ["Typescript", "Python"],
      models: getModels(),
      selectedModel: getDefaultModel(),
    };

    await uiPanel.navigateTo("/generate", generatePanelArgs);

    async function onMessage(message: EventTemplate<unknown>) {
      console.log({
        message,
      });
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
              result.args.dataCallback = (data) => {
                uiPanel.postMessageToWebview({
                  type: "generate:stream:response",
                  data,
                });
              };
              await codespinGenerate(result.args);
              return;
            case "missing_config":
              await uiPanel.navigateTo(`/api/config/edit`, {
                api: result.api,
              });
              return;
          }

        case "api:editConfig":
          await createAPIConfig(message as any);
          await onMessage(generateArgs!);
        case "close":
          uiPanel.dispose();
        default:
          return;
      }
    }
  };
}
