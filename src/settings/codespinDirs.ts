import * as path from "path";

export function getCodeSpinDir(workspaceRoot: string) {
  return path.join(workspaceRoot, ".codespin");
}

export function getCodingConventionsDir(workspaceRoot: string) {
  return path.join(getCodeSpinDir(workspaceRoot), "conventions");
}

export function getHistoryDir(workspaceRoot: string) {
  return path.join(getCodeSpinDir(workspaceRoot), "history");
}
