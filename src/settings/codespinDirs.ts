import * as path from "path";

export async function getCodespinDir(workspaceRoot: string) {
  return path.join(workspaceRoot, ".codespin");
}

export async function getCodingConventionsDir(workspaceRoot: string) {
  return path.join(await getCodespinDir(workspaceRoot), "conventions");
}

export async function getHistoryDir(workspaceRoot: string) {
  return path.join(await getCodespinDir(workspaceRoot), "history");
}
