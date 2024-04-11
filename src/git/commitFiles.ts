import { execString } from "../process/execString.js";

export async function commitFiles(
  commitMessage: string,
  workingDir: string
): Promise<void> {
  await execString("git add .", workingDir);
  await execString(`git commit -m "${commitMessage}"`, workingDir);
}
