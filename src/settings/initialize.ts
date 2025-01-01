import { mkdir } from "fs/promises";
import { getCodingConventionsDir, getCodeSpinDir } from "./codespinDirs.js";
import { pathExists } from "../fs/pathExists.js";
import * as path from "path";
import * as codespin from "codespin";

export async function initialize(force: boolean, workspaceRoot: string) {
  const codespinDirExists = await pathExists(getCodeSpinDir(workspaceRoot));
  if (!codespinDirExists || force) {
    await codespin.commands.init({ force }, { workingDir: workspaceRoot });
  }

  // Ensure conventions directory exists
  if (!(await pathExists(getCodingConventionsDir(workspaceRoot)))) {
    await mkdir(getCodingConventionsDir(workspaceRoot), {
      recursive: true,
    });
  }

  // Ensure conversations directory exists
  const conversationsDir = path.join(
    getCodeSpinDir(workspaceRoot),
    "conversations"
  );
  if (!(await pathExists(conversationsDir))) {
    await mkdir(conversationsDir, {
      recursive: true,
    });
  }
}
