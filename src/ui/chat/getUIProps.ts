import { readFile } from "fs/promises";
import * as path from "path";
import { getCodeSpinDir } from "../../settings/codespinDirs.js";
import { pathExists } from "../../fs/pathExists.js";
import { UIPropsUpdateArgs } from "./types.js";

export async function getUIProps(
  workspaceRoot: string
): Promise<UIPropsUpdateArgs | undefined> {
  const projectConfigDir = getCodeSpinDir(workspaceRoot);
  const uiConfigPath = path.join(projectConfigDir, `ui.json`);

  if (await pathExists(uiConfigPath)) {
    const existingContent = await readFile(uiConfigPath, { encoding: "utf-8" });
    const existingProps: UIPropsUpdateArgs = JSON.parse(existingContent);
    return existingProps;
  } else {
    return undefined;
  }
}
