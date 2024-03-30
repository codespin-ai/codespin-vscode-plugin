import {
  GenerateArgs as CodespinGenerateArgs,
  GenerateArgs,
} from "codespin/dist/commands/generate.js";
import { init as codespinInit } from "codespin/dist/commands/init.js";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import * as vscode from "vscode";
import { getAPIConfigPath } from "../../settings/getAPIConfigPath.js";
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
  argsFromPanel: ArgsFromGeneratePanel,
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
      await codespinInit({});
    }
    // If the user chooses No, we must exit.
    else {
      return { status: "close" };
    }
  }

  const api = argsFromPanel.model.split(":")[0];

  const configFilePath = await getAPIConfigPath(api, workspaceRoot);

  // Check if the config file exists
  if (configFilePath) {
    const tmpFilePath = path.join(
      os.tmpdir(),
      `codespin-prompt-${Date.now()}.txt`
    );
    fs.writeFileSync(tmpFilePath, argsFromPanel.prompt, "utf8");

    const [vendor, model] = argsFromPanel.model.split(":");

    const codespinGenerateArgs: GenerateArgs = {
      promptFile: tmpFilePath,
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
