import { init } from "codespin/dist/commands/init.js";
import { mkdir } from "fs/promises";
import { getConventionsDir, getHistoryDir } from "./codespinDirs.js";

export async function initialize(force: boolean, workspaceRoot: string) {
  await init(
    {
      force,
    },
    { workingDir: workspaceRoot }
  );
  await mkdir(await getConventionsDir(workspaceRoot), { recursive: true });
  await mkdir(await getHistoryDir(workspaceRoot), { recursive: true });
}
