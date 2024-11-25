import { init } from "codespin/dist/commands/init.js";
import { mkdir } from "fs/promises";
import { getCodingConventionsDir, getHistoryDir } from "./codespinDirs.js";
import { pathExists } from "../fs/pathExists.js";

export async function initialize(force: boolean, workspaceRoot: string) {
  await init({ force }, { workingDir: workspaceRoot });

  if (!pathExists(await getCodingConventionsDir(workspaceRoot))) {
    mkdir(await getCodingConventionsDir(workspaceRoot), {
      recursive: true,
    });
  }

  if (!pathExists(await getCodingConventionsDir(workspaceRoot))) {
    await mkdir(getHistoryDir(workspaceRoot), { recursive: true });
  }
}
