import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import * as vscode from "vscode";
import { getDefaultModel } from "../models/getDefaultModel.js";
import { getModels } from "../models/getModels.js";
import { UIPanel } from "../ui/UIPanel.js";
import { GeneratePageArgs } from "../ui/pages/GeneratePageArgs.js";
import { getWorkspaceRoot } from "../vscode/getWorkspaceRoot.js";
import { GenerateArgs } from "./GenerateArgs.js";
import { EditProviderConfigArgs } from "./EditProviderConfigArgs.js";

export function getGenerateCommand(context: vscode.ExtensionContext) {
  let generateArgs: GenerateArgs | undefined;

  return async function generateCommand(
    _: unknown,
    uris: vscode.Uri[]
  ): Promise<void> {
    const workspaceRoot = getWorkspaceRoot(context);

    // Map each URI to a path relative to the workspace root.
    const relativePaths = uris
      .map((uri) => {
        const fullPath = uri.fsPath;
        return path.relative(workspaceRoot, fullPath);
      })
      .sort();

    const uiPanel = new UIPanel(context, onMessage);

    await uiPanel.onReady();

    const generatePanelArgs: GeneratePageArgs = {
      files: relativePaths.map((x) => ({ path: x, size: 100434 })),
      rules: ["Typescript", "Python"],
      models: getModels(),
      selectedModel: getDefaultModel(),
    };

    await uiPanel.navigateTo("/generate", generatePanelArgs);

    function onMessage(message: { type: string }) {
      switch (message.type) {
        case "generate":
          return generate(message as any);
        case "provider:editConfig":
          return editProviderConfig(message as any);
        default:
          return;
      }
    }

    async function generate(message: GenerateArgs) {
      // Store it.
      generateArgs = message;

      const llmProvider = generateArgs.model.split(":")[0];

      const configFilePath = path.join(
        os.homedir(),
        ".codespin",
        `${llmProvider}.json`
      );

      // Check if the config file exists
      if (!fs.existsSync(configFilePath)) {
        // If the file doesn't exist, navigate to the config page
        await uiPanel.navigateTo(`/providers/config/edit`, {
          provider: llmProvider,
        });
      } else {
        console.log("GENERATING!");
      }
    }

    async function editProviderConfig(message: EditProviderConfigArgs) {
      const llmProvider = message.provider;
      const configFilePath = path.join(
        os.homedir(),
        ".codespin",
        `${llmProvider}.json`
      );

      const { provider, ...config } = message;

      try {
        // fs.writeFileSync(
        //   configFilePath,
        //   JSON.stringify(config, null, 2),
        //   "utf8"
        // );
        console.log(`${llmProvider} configuration saved successfully.`);

        // Let's run generate again.
        await generate(generateArgs!);
      } catch (error) {
        console.error(`Failed to save ${llmProvider} configuration:`, error);
      }
    }
  };
}
