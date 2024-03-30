import {
  GenerateArgs as CodespinGenerateArgs,
  GenerateArgs,
} from "codespin/dist/commands/generate.js";
import { init as codespinInit } from "codespin/dist/commands/init.js";
import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";
import { EventTemplate } from "../../EventTemplate.js";
import { getAPIConfigPath } from "../../settings/getAPIConfigPath.js";
import { processConvention } from "../../settings/processConvention.js";
import { getWorkspaceRoot } from "../../vscode/getWorkspaceRoot.js";
import { ArgsFromGeneratePanel } from "./ArgsFromGeneratePanel.js";

type Result =
  | {
      status: "missing_config";
      api: string;
    }
  | {
      status: "can_generate";
      args: CodespinGenerateArgs;
    }
  | {
      status: "close";
    };

export async function getGenerateArgs(
  unprocessedArgsFromPanel: EventTemplate<ArgsFromGeneratePanel>,
  context: vscode.ExtensionContext
): Promise<Result> {
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
      await codespinInit({}, { workingDir: workspaceRoot });
    }
    // If the user chooses No, we must exit.
    else {
      return { status: "close" };
    }
  }

  const api = unprocessedArgsFromPanel.model.split(":")[0];

  const configFilePath = await getAPIConfigPath(api, workspaceRoot);

  if (configFilePath) {
    const historyDirPath = path.join(
      workspaceRoot,
      ".codespin",
      "history",
      `${Date.now()}`
    );

    if (!fs.existsSync(historyDirPath)) {
      fs.mkdirSync(historyDirPath, { recursive: true });
    }

    const inputsPath = path.join(historyDirPath, "user-input.json");
    fs.writeFileSync(
      inputsPath,
      JSON.stringify(unprocessedArgsFromPanel, null, 2),
      "utf8"
    );

    const argsFromPanel = await processArgs(unprocessedArgsFromPanel, context);

    const promptFilePath = path.join(historyDirPath, "prompt.txt");
    fs.writeFileSync(promptFilePath, argsFromPanel.prompt, "utf8");

    const [vendor, model] = argsFromPanel.model.split(":");

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
    };

    return {
      status: "can_generate",
      args: codespinGenerateArgs,
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

async function processArgs(
  args: EventTemplate<ArgsFromGeneratePanel>,
  context: vscode.ExtensionContext
): Promise<EventTemplate<ArgsFromGeneratePanel>> {
  if (args.codingConvention !== undefined) {
    args.prompt = await processConvention(
      args.prompt,
      args.codingConvention,
      getWorkspaceRoot(context)
    );
  }
  return args;
}
