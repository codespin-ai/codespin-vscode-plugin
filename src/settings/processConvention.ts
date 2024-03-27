import { existsSync, promises as fsPromises } from "fs";
import { join } from "path";

export async function processConvention(
  prompt: string,
  filename: string,
  workspaceRoot: string
): Promise<string> {
  const conventionsDir = join(workspaceRoot, ".codespin", "conventions");
  const filePath = join(conventionsDir, filename);

  // Check if the specific convention file exists
  if (existsSync(filePath)) {
    try {
      let fileContents = await fsPromises.readFile(filePath, {
        encoding: "utf-8",
      });
      // Replace occurrences of {prompt} in the file content with the actual prompt value
      fileContents = fileContents.replace(/\{prompt\}/g, prompt);
      return fileContents;
    } catch (error) {
      console.error("Error reading the file:", error);
      // In case of any error reading the file, return prompt unmodified
      return prompt;
    }
  } else {
    // If the file doesn't exist, return the prompt unmodified
    return prompt;
  }
}
