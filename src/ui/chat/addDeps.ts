import { dependencies as codespinDependencies } from "codespin/dist/commands/dependencies.js";
import * as path from "path";
import { AddDepsEvent } from "./types.js";
import { includeFiles } from "./includeFiles.js";
import { pathExists } from "../../fs/pathExists.js";
import { GeneratePanel } from "./GeneratePanel.js";

export async function addDeps(
  generatePanel: GeneratePanel,
  message: AddDepsEvent,
  workspaceRoot: string
) {
  const dependenciesArgs = {
    file: message.file,
    config: undefined,
    model: message.model,
    maxTokens: undefined,
  };
  const dependenciesResult = await codespinDependencies(dependenciesArgs, {
    workingDir: workspaceRoot,
  });

  includeFiles(
    generatePanel,
    (
      await Promise.all(
        dependenciesResult.dependencies
          .filter((x) => x.isProjectFile)
          .map(async (x) => {
            const fullPath = path.resolve(workspaceRoot, x.filePath);
            const fileExists = await pathExists(fullPath);
            return fileExists ? fullPath : undefined;
          })
      )
    ).filter(Boolean) as string[],
    workspaceRoot
  );
}
