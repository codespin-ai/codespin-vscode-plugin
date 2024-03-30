import * as fs from "fs";
import * as path from "path";

export async function isInitialized(workspaceRoot: string) {
  const codespinConfigPath = path.join(workspaceRoot, ".codespin");
  return fs.existsSync(codespinConfigPath);
}
