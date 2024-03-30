import { init } from "codespin/dist/commands/init.js";
import { mkdirSync } from "fs";
import * as path from "path";

export async function initialize(force: boolean, workspaceRoot: string) {
  const codespinConfigPath = path.join(workspaceRoot, ".codespin");
  const conventionsPath = path.join(codespinConfigPath, "conventions");
  const historyPath = path.join(codespinConfigPath, "history");

  await init(
    {
      force,
    },
    { workingDir: workspaceRoot }
  );
  mkdirSync(conventionsPath, { recursive: true });
  mkdirSync(historyPath, { recursive: true });
}
