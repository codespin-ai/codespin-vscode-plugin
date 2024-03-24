import { init as codespinInit } from "codespin/dist/commands/init.js";
import { generate as codespinGenerate } from "codespin/dist/commands/generate.js";
import * as path from "path";
import * as vscode from "vscode";
import { getDefaultModel } from "../models/getDefaultModel.js";
import { getModels } from "../models/getModels.js";
import { UIPanel } from "../ui/UIPanel.js";
import { GeneratePageArgs } from "../ui/pages/GeneratePageArgs.js";
import { getWorkspaceRoot } from "../vscode/getWorkspaceRoot.js";
import { EditAPIConfigArgs } from "./EditAPIConfigArgs.js";
import { GenerateArgs } from "./GenerateArgs.js";
import * as os from "os";
import * as fs from "fs";
import { createDirIfMissing } from "../fs/createDirIfMissing.js";
import { pathExists } from "../fs/pathExists.js";

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

    function onMessage(message: { type: string }) {
      switch (message.type) {
        case "generate":
          return generate(message as any);
        case "api:editConfig":
          return editAPIConfig(message as any);
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

      const configFilePath = await getAPIConfigPath(api);

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
          maxTokens: undefined,
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
          dataCallback: undefined,
        };

        await codespinGenerate(codespinGenerateArgs);

        await uiPanel.navigateTo(`/generate/invoke`);
      }
      // config file doesn't exist.
      else {
        await uiPanel.navigateTo(`/api/config/edit`, {
          api,
        });
      }
    }

    async function getAPIConfigPath(api: string): Promise<string | undefined> {
      const workspaceRoot = getWorkspaceRoot(context);

      const projectConfigDir = path.join(workspaceRoot, ".codespin");
      const configFilePath = path.join(projectConfigDir, `${api}.json`);
      if (await pathExists(configFilePath)) {
        return configFilePath;
      }

      const rootConfigDir = path.join(os.homedir(), ".codespin");
      const rootConfigPath = path.join(rootConfigDir, `${api}.json`);
      if (await pathExists(rootConfigPath)) {
        return rootConfigPath;
      }

      return undefined;
    }

    async function editAPIConfig(message: EditAPIConfigArgs) {
      const configDir = path.join(os.homedir(), ".codespin");
      await createDirIfMissing(configDir);
      const configFilePath = path.join(configDir, `${message.api}.json`);

      try {
        const revisedConfig =
          message.api === "openai"
            ? {
                apiKey: message.apiKey,
                authType: message.vendor === "azure" ? "API_KEY" : undefined,
                completionsEndpoint: message.completionsEndpoint,
              }
            : message.api === "anthropic"
            ? {
                apiKey: message.apiKey,
              }
            : {};

        fs.writeFileSync(
          configFilePath,
          JSON.stringify(revisedConfig, null, 2),
          "utf8"
        );
        await generate(generateArgs!);
      } catch (error) {
        console.error(
          `Failed to save ${message.api} configuration:`,
          error
        );
      }
    }
  };
}
