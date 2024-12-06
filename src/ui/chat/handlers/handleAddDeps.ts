import { addDeps } from "../../../sourceAnalysis/addDeps.js";
import { includeFiles } from "../includeFiles.js";
import { AddDepsEvent } from "../types.js";
import { ChatPanel } from "../ChatPanel.js";
import * as path from "path";
import { pathExists } from "../../../fs/pathExists.js";

export async function handleAddDeps(
  chatPanel: ChatPanel,
  message: AddDepsEvent,
  workspaceRoot: string
): Promise<void> {
  const dependenciesResult = await addDeps(
    message.file,
    message.model,
    workspaceRoot
  );

  const filePaths = (
    await Promise.all(
      dependenciesResult.dependencies
        .filter((x) => x.isProjectFile)
        .map(async (x) => {
          const fullPath = path.resolve(workspaceRoot, x.filePath);
          const fileExists = await pathExists(fullPath);
          return fileExists ? fullPath : undefined;
        })
    )
  ).filter(Boolean) as string[];

  await includeFiles(chatPanel, filePaths, workspaceRoot);
}
