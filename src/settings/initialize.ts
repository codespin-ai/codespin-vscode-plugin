import { init } from "codespin/dist/commands/init.js";
import { mkdir } from "fs/promises";
import { getCodingConventionsDir, getHistoryDir } from "./codespinDirs.js";

export async function initialize(force: boolean, workspaceRoot: string) {
  await init(
    {
      force,
    },
    { workingDir: workspaceRoot }
  );
  await mkdir(await getCodingConventionsDir(workspaceRoot), { recursive: true });
  await mkdir(await getHistoryDir(workspaceRoot), { recursive: true });
}
