import { readFile, writeFile, access } from "fs/promises";
import * as path from "path";
import { getCodespinDir } from "../codespinDirs.js";
import { pathExists } from "../../fs/pathExists.js";

export type UIProps = {
  promptTextAreaWidth?: number;
  promptTextAreaHeight?: number;
};

export async function saveUIProps(
  props: UIProps,
  workspaceRoot: string
): Promise<void> {
  const projectConfigDir = getCodespinDir(workspaceRoot);
  const uiConfigPath = path.join(projectConfigDir, `ui.json`);

  let existingProps: UIProps = {
    promptTextAreaWidth: undefined,
    promptTextAreaHeight: undefined,
  };

  if (await pathExists(uiConfigPath)) {
    // Read the existing configuration
    const existingContent = await readFile(uiConfigPath, { encoding: "utf-8" });
    existingProps = JSON.parse(existingContent);
  }

  // Merge existing properties with new properties
  const mergedProps: UIProps = {
    promptTextAreaWidth: props.promptTextAreaWidth ?? existingProps.promptTextAreaWidth,
    promptTextAreaHeight: props.promptTextAreaHeight ?? existingProps.promptTextAreaHeight,
  };

  // Compare merged properties with existing properties
  if (JSON.stringify(mergedProps) !== JSON.stringify(existingProps)) {
    // If different, write the merged configuration
    await writeFile(uiConfigPath, JSON.stringify(mergedProps, null, 2), {
      encoding: "utf-8",
    });
  }
}