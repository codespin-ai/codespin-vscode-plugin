import { execString } from "../process/execString.js";

export async function getChanges(
  workingDir: string
): Promise<GitFileChange[]> {
  const gitStatusOutput = await execString(
    "git status --porcelain=v1",
    workingDir
  );
  const lines = gitStatusOutput.split("\n");
  const fileChanges: GitFileChange[] = [];

  for (const line of lines) {
    if (line === "") {
      continue;
    } // Skip empty lines
    const status = line.substring(0, 2);
    const filePath = line.substring(3);

    if (status.includes("A")) {
      fileChanges.push({ filePath, change: "added" });
    }
    if (status.includes("M")) {
      fileChanges.push({ filePath, change: "modified" });
    }
    if (status.includes("D")) {
      fileChanges.push({ filePath, change: "deleted" });
    }
    if (status.trim() === "??") {
      // Untracked files
      fileChanges.push({ filePath, change: "untracked" });
    }
  }

  return fileChanges;
}
