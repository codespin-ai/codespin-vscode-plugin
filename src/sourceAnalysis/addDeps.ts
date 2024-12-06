import { dependencies as codespinDependencies } from "codespin/dist/commands/dependencies.js";

export async function addDeps(
  file: string,
  model: string,
  workspaceRoot: string
) {
  const dependenciesArgs = {
    file,
    config: undefined,
    model,
    maxTokens: undefined,
  };
  return await codespinDependencies(dependenciesArgs, {
    workingDir: workspaceRoot,
  });
}
