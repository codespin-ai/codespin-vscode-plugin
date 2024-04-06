import { getConventions } from "../../../settings/conventions/getCodingConventions.js";
import { getWorkspaceRoot } from "../../../vscode/getWorkspaceRoot.js";
import { GeneratePageArgs } from "../../html/pages/generate/GeneratePageArgs.js";
import { RegeneratePageArgs } from "../../html/pages/history/RegeneratePageArgs.js";
import { UIPanel } from "../UIPanel.js";
import * as vscode from "vscode";
import { promises as fs } from "fs";
import * as path from "path";
import { getModels } from "../../../models/getModels.js";
import { getDefaultModel } from "../../../models/getDefaultModel.js";
import { EventTemplate } from "../../EventTemplate.js";
import { ArgsFromGeneratePanel } from "./ArgsFromGeneratePanel.js";
import {
  GenerateArgs as CodespinGenerateArgs,
  GenerateArgs,
  generate as codespinGenerate,
} from "codespin/dist/commands/generate.js";
import { mkdir } from "fs/promises";
import { pathExists } from "../../../fs/pathExists.js";
import { getAPIConfigPath } from "../../../settings/api/getAPIConfigPath.js";
import { initialize } from "../../../settings/initialize.js";
import { isInitialized } from "../../../settings/isInitialized.js";
import { getCodingConventionPath } from "../../../settings/conventions/getCodingConventionPath.js";
import { writeHistoryItem } from "../../../settings/history/writeHistoryItem.js";
import { writeUserInput } from "../../../settings/history/writeUserInput.js";
import { writeGeneratedFiles } from "../../../settings/history/writeGeneratedFiles.js";
import {
  AnthropicConfigArgs,
  editAnthropicConfig,
} from "../../../settings/api/editAnthropicConfig.js";
import {
  OpenAIConfigArgs,
  editOpenAIConfig,
} from "../../../settings/api/editOpenAIConfig.js";
import { setDefaultModel } from "../../../models/setDefaultModel.js";
import { ModelChange } from "./ModelChange.js";

type Result =
  | {
      status: "missing_config";
      api: string;
    }
  | {
      status: "can_generate";
      args: CodespinGenerateArgs;
      dirName: string;
    }
  | {
      status: "close";
    };

export class GeneratePanel extends UIPanel {
  generateArgs: EventTemplate<ArgsFromGeneratePanel> | undefined;
  cancelGeneration: (() => void) | undefined;

  constructor(context: vscode.ExtensionContext) {
    super(context);
  }

  async init(commandArgs: vscode.Uri[] | RegeneratePageArgs) {
    const workspaceRoot = getWorkspaceRoot(this.context);
    await this.onWebviewReady();

    const conventions = await getConventions(workspaceRoot);

    const generatePageArgs: GeneratePageArgs = Array.isArray(commandArgs)
      ? await (async () => {
          const fileDetails = (
            await Promise.all(
              commandArgs.map(async (x) => {
                const fullPath = x.fsPath;
                const size = (await fs.stat(fullPath)).size;
                const relativePath = path.relative(workspaceRoot, fullPath);
                return { path: relativePath, size };
              })
            )
          ).sort((a, b) => a.path.localeCompare(b.path)); // Sorting by path for consistency.

          return {
            files: fileDetails,
            codingConventions: conventions,
            models: await getModels(workspaceRoot),
            selectedModel: await getDefaultModel(workspaceRoot),
            codegenTargets: ":prompt",
            fileVersion: "current",
            includedFiles: commandArgs.map((x) => ({
              includeOption: "source",
              path: path.relative(workspaceRoot, x.fsPath),
            })),
            prompt: "",
            codingConvention: undefined,
          };
        })()
      : await (async () => {
          const fileDetails = (
            await Promise.all(
              commandArgs.includedFiles.map(async (x) => {
                const fullPath = path.resolve(workspaceRoot, x.path);
                const size = (await fs.stat(fullPath)).size;
                const relativePath = path.relative(workspaceRoot, fullPath);
                return { path: relativePath, size };
              })
            )
          ).sort((a, b) => a.path.localeCompare(b.path)); // Sorting by path for consistency.

          const args: GeneratePageArgs = {
            files: fileDetails,
            codingConventions: conventions,
            models: await getModels(workspaceRoot),
            selectedModel: commandArgs.model,
            codegenTargets: commandArgs.codegenTargets,
            fileVersion: commandArgs.fileVersion,
            includedFiles: commandArgs.includedFiles,
            prompt: commandArgs.prompt,
            codingConvention: commandArgs.codingConvention?.filename,
          };
          return args;
        })();

    await this.navigateTo("/generate", generatePageArgs);
  }

  async onMessage(message: EventTemplate<unknown>) {
    const workspaceRoot = getWorkspaceRoot(this.context);

    switch (message.type) {
      case "generate":
        this.generateArgs = message as EventTemplate<ArgsFromGeneratePanel>;

        const result = await this.getGenerateArgs(
          this.generateArgs!,
          this.setCancelGeneration.bind(this),
          workspaceRoot
        );

        switch (result.status) {
          case "can_generate":
            await writeHistoryItem(
              this.generateArgs.prompt,
              "prompt.txt",
              result.dirName,
              workspaceRoot
            );

            const { type: unused1, ...messageSansType } =
              message as EventTemplate<ArgsFromGeneratePanel>;

            await writeUserInput(
              result.dirName,
              messageSansType as ArgsFromGeneratePanel,
              workspaceRoot
            );

            await this.navigateTo(`/generate/invoke`, {
              api: result.args.api,
              model: result.args.model,
            });

            result.args.promptCallback = async (prompt) => {
              this.postMessageToWebview({
                type: "promptCreated",
                prompt,
              });

              await writeHistoryItem(
                prompt,
                "raw-prompt.txt",
                result.dirName,
                workspaceRoot
              );
            };

            result.args.responseStreamCallback = (text) => {
              this.postMessageToWebview({
                type: "responseStream",
                data: text,
              });
            };

            result.args.responseCallback = (text) => {
              this.dispose();
            };

            result.args.parseCallback = async (files) => {
              await writeGeneratedFiles(result.dirName, files, workspaceRoot);
            };

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
      case "editAnthropicConfig":
        await editAnthropicConfig(
          message as EventTemplate<AnthropicConfigArgs>
        );
        await this.onMessage(this.generateArgs!);
        break;
      case "editOpenAIConfig":
        await editOpenAIConfig(message as EventTemplate<OpenAIConfigArgs>);
        await this.onMessage(this.generateArgs!);
        break;
      case "modelChange":
        await setDefaultModel(
          (message as EventTemplate<ModelChange>).model,
          workspaceRoot
        );
        break;
      case "cancel":
        if (this.cancelGeneration) {
          this.cancelGeneration();
        }
        this.dispose();
        break;
      default:
        break;
    }
  }

  setCancelGeneration(cancel: () => void) {
    this.cancelGeneration = cancel;
  }

  async getGenerateArgs(
    argsFromPanel: EventTemplate<ArgsFromGeneratePanel>,
    cancelCallback: (cancel: () => void) => void,
    workspaceRoot: string
  ): Promise<Result> {
    // Check if .codespin dir exists
    if (!isInitialized(workspaceRoot)) {
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
        return { status: "close" };
      }
    }

    const api = argsFromPanel.model.split(":")[0];

    const configFilePath = await getAPIConfigPath(api, workspaceRoot);

    const dirName = Date.now().toString();
    if (configFilePath) {
      const historyDirPath = path.join(
        workspaceRoot,
        ".codespin",
        "history",
        dirName
      );

      if (!(await pathExists(historyDirPath))) {
        await mkdir(historyDirPath, { recursive: true });
      }

      const [vendor, model] = argsFromPanel.model.split(":");

      const promptFilePath = path.join(historyDirPath, "prompt.txt");

      const codespinGenerateArgs: GenerateArgs = {
        promptFile: promptFilePath,
        out:
          argsFromPanel.codegenTargets !== ":prompt"
            ? argsFromPanel.codegenTargets
            : undefined,
        model,
        write: true,
        include: argsFromPanel.includedFiles
          .filter((f) => f.includeOption === "source")
          .map((f) =>
            argsFromPanel.fileVersion === "HEAD" ? `HEAD:${f.path}` : f.path
          ),
        exclude: undefined,
        declare: argsFromPanel.includedFiles
          .filter((f) => f.includeOption === "declaration")
          .map((f) => f.path),
        spec: argsFromPanel.codingConvention
          ? await getCodingConventionPath(
              argsFromPanel.codingConvention,
              workspaceRoot
            )
          : undefined,
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
        cancelCallback,
      };

      return {
        status: "can_generate",
        args: codespinGenerateArgs,
        dirName,
      };
    }
    // config file doesn't exist.
    else {
      return {
        status: "missing_config",
        api,
      };
    }
  }
}
