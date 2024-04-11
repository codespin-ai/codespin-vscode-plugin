import {
  GenerateArgs as CodespinGenerateArgs,
  GenerateArgs,
} from "codespin/dist/commands/generate.js";
import { mkdir } from "fs/promises";
import * as path from "path";
import { pathExists } from "../../../fs/pathExists.js";
import { getAPIConfigPath } from "../../../settings/api/getAPIConfigPath.js";
import { getCodingConventionPath } from "../../../settings/conventions/getCodingConventionPath.js";
import { isInitialized } from "../../../settings/isInitialized.js";
import { GenerationUserInput } from "./types.js";

type GetGenerateArgsResult =
  | {
      status: "not_initialized";
    }
  | {
      status: "missing_config";
      api: string;
    }
  | {
      status: "can_generate";
      args: CodespinGenerateArgs;
      dirName: string;
    };

export async function getGenerateArgs(
  argsFromPanel: GenerationUserInput,
  cancelCallback: (cancel: () => void) => void,
  workspaceRoot: string
): Promise<GetGenerateArgsResult> {
  // Check if .codespin dir exists
  if (!isInitialized(workspaceRoot)) {
    return { status: "not_initialized" };
  } else {
    const [api] = argsFromPanel.model.split(":");

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

      const promptFilePath = path.join(historyDirPath, "prompt.txt");

      const codespinGenerateArgs: GenerateArgs = {
        promptFile: promptFilePath,
        out:
          argsFromPanel.codegenTargets !== ":prompt"
            ? argsFromPanel.codegenTargets
            : undefined,
        model: argsFromPanel.model,
        write: true,
        include: argsFromPanel.includedFiles
          .filter((f) => f.includeOption === "source")
          .map((f) =>
            argsFromPanel.fileVersion === "HEAD" ? `HEAD:${f.path}` : f.path
          ),
        declare: argsFromPanel.includedFiles
          .filter((f) => f.includeOption === "declaration")
          .map((f) => f.path),
        spec: argsFromPanel.codingConvention
          ? await getCodingConventionPath(
              argsFromPanel.codingConvention,
              workspaceRoot
            )
          : undefined,
        debug: true,
        diff: argsFromPanel.outputKind === "diff",
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
