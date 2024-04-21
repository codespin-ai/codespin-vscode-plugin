import { readFile, writeFile, access } from "fs/promises";
import * as path from "path";
import { getCodespinDir } from "../codespinDirs.js";
import { pathExists } from "../../fs/pathExists.js";

export type UIProps = {
  promptTextAreaWidth: number;
  promptTextAreaHeight: number;
};

export async function saveUIProps(
  props: UIProps,
  workspaceRoot: string
): Promise<void> {
  const projectConfigDir = getCodespinDir(workspaceRoot);
  const uiConfigPath = path.join(projectConfigDir, `ui.json`);

  if (await pathExists(uiConfigPath)) {
    // Read the existing configuration
    const existingContent = await readFile(uiConfigPath, { encoding: "utf-8" });
    const existingProps = JSON.parse(existingContent);

    // Compare existing properties with new properties
    if (JSON.stringify(existingProps) !== JSON.stringify(props)) {
      // If different, write the new configuration
      await writeFile(uiConfigPath, JSON.stringify(props, null, 2), {
        encoding: "utf-8",
      });
    }
  } else {
    await writeFile(uiConfigPath, JSON.stringify(props, null, 2), {
      encoding: "utf-8",
    });
  }
}
