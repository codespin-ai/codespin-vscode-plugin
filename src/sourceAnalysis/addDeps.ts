import * as codespin from "codespin";

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
  return await codespin.commands.dependencies(dependenciesArgs, {
    workingDir: workspaceRoot,
  });
}
