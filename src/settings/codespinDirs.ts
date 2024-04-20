import * as path from "path";

export function getCodespinDir(workspaceRoot: string) {
  return path.join(workspaceRoot, ".codespin");
}

export function getCodingConventionsDir(workspaceRoot: string) {
  return path.join(getCodespinDir(workspaceRoot), "conventions");
}

export function getHistoryDir(workspaceRoot: string) {
  return path.join(getCodespinDir(workspaceRoot), "history");
}
