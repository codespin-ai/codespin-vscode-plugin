import { generate as codespinGenerate } from "codespin/dist/commands/generate.js";
import { init as codespinInit } from "codespin/dist/commands/init.js";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import * as vscode from "vscode";
import { getDefaultModel } from "../models/getDefaultModel.js";
import { getModels } from "../models/getModels.js";
import { createAPIConfig } from "../settings/createAPIConfig.js";
import { getAPIConfigPath } from "../settings/getAPIConfigPath.js";
import { UIPanel } from "../ui/UIPanel.js";
import { GeneratePageArgs } from "../ui/pages/GeneratePageArgs.js";
import { getWorkspaceRoot } from "../vscode/getWorkspaceRoot.js";
import { GenerateArgs } from "./GenerateArgs.js";

export function getGenerateCommand(context: vscode.ExtensionContext) {
  let generateArgs: GenerateArgs | undefined;

  return async function generateCommand(
    _: unknown,
    uris: vscode.Uri[]
  ): Promise<void> {
    const workspaceRoot = getWorkspaceRoot(context);

    const fileDetails = uris
      .map((uri) => {
        const fullPath = uri.fsPath;
        const size = fs.statSync(fullPath).size;
        const relativePath = path.relative(workspaceRoot, fullPath);
        return { path: relativePath, size };
      })
      .sort((a, b) => a.path.localeCompare(b.path)); // Sorting by path for consistency.

    const uiPanel = new UIPanel(context, onMessage);

    await uiPanel.onReady();

    const generatePanelArgs: GeneratePageArgs = {
      files: fileDetails,
      rules: ["Typescript", "Python"],
      models: getModels(),
      selectedModel: getDefaultModel(),
    };

    await uiPanel.navigateTo("/generate", generatePanelArgs);

    async function onMessage(message: { type: string }) {
      switch (message.type) {
        case "generate":
          return generate(message as any);
        case "api:editConfig":
          await createAPIConfig(message as any);
          await generate(generateArgs!);
        default:
          return;
      }
    }

    async function generate(message: GenerateArgs) {
      const workspaceRoot = getWorkspaceRoot(context);

      const projectConfigDir = path.join(workspaceRoot, ".codespin");

      // Check if .codespin dir exists
      if (!fs.existsSync(projectConfigDir)) {
        // Ask the user if they want to force initialize
        const userChoice = await vscode.window.showWarningMessage(
          "Codespin settings not found for this project. Create?",
          "Yes",
          "No"
        );

        if (userChoice === "Yes") {
          await codespinInit({});
        }
        // If the user chooses No, we must exit.
        else {
          return;
        }
      }

      // Store it.
      generateArgs = message;

      const api = generateArgs.model.split(":")[0];

      const configFilePath = await getAPIConfigPath(api, workspaceRoot);

      // Check if the config file exists
      if (configFilePath) {
        const tmpFilePath = path.join(
          os.tmpdir(),
          `codespin-prompt-${Date.now()}.txt`
        );
        fs.writeFileSync(tmpFilePath, message.prompt, "utf8");

        const [vendor, model] = message.model.split(":");

        const codespinGenerateArgs = {
          promptFile: tmpFilePath,
          source:
            message.codegenTargets !== ":prompt"
              ? message.codegenTargets
              : undefined,
          version: message.fileVersion,
          model,
          write: true,
          include: message.includedFiles
            .filter((f) => f.includeOption === "source")
            .map((f) => f.path),
          exclude: undefined,
          declare: message.includedFiles
            .filter((f) => f.includeOption === "declaration")
            .map((f) => f.path),
          prompt: undefined,
          api: vendor,
          maxTokens: 4000,
          printPrompt: undefined,
          writePrompt: undefined,
          template: undefined,
          templateArgs: undefined,
          debug: true,
          exec: undefined,
          config: undefined,
          outDir: undefined,
          parser: undefined,
          parse: undefined,
          go: undefined,
          maxDeclare: undefined,
          apiVersion: undefined,
          dataCallback: (data: string) => {
            console.log("DATA:", data);
          },
        };
        
        await uiPanel.navigateTo(`/generate/invoke`);

        await codespinGenerate(codespinGenerateArgs);

      }
      // config file doesn't exist.
      else {
        await uiPanel.navigateTo(`/api/config/edit`, {
          api,
        });
      }
    }
  };
}
