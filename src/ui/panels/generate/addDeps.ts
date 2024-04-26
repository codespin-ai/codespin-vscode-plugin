import { dependencies as codespinDependencies } from "codespin/dist/commands/dependencies.js";
import { pathExists } from "../../../fs/pathExists.js";
import * as path from "path";
import { AddDepsEvent } from "./types.js";

export async function addDeps(
  message: AddDepsEvent,
  workspaceRoot: string,
  includeFiles: (filePaths: string[]) => Promise<void>
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
    ).filter(Boolean) as string[]
  );
}
