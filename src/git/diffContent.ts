import { execString } from "../process/execString.js";

// Function to compare two files using Git and generate HTML diff
export async function diffContent(
  originalFilePath: string | undefined,
  newFilePath: string,
  workingDir: string
) {
  try {
    const diffCommand = originalFilePath
      ? `git -P diff --no-index -- ${originalFilePath} ${newFilePath}`
      : `git -P diff --no-index /dev/null ${newFilePath}`;

    // Execute the git diff command
    const diffOutput = await execString(diffCommand, workingDir);

    if (!diffOutput) {
      // If there's no diff, it means the files are identical or the new file is empty
      return "No changes detected.";
    }

    return diffOutput;
  } catch (error) {
    console.error(
      "Error generating HTML from git diff:",
      (error as any).message
    );
    throw error;
  }
}
