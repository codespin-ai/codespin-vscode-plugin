import { existsSync, promises as fsPromises } from "fs";
import { join } from "path";
import matter = require("gray-matter");

export async function processConvention(
  prompt: string,
  filename: string,
  workspaceRoot: string
): Promise<string> {
  const conventionsDir = join(workspaceRoot, ".codespin", "conventions");
  const filePath = join(conventionsDir, filename);

  // Check if the specific convention file exists
  if (existsSync(filePath)) {
    const templateContents = await fsPromises.readFile(filePath, {
      encoding: "utf-8",
    });
    const parsedTemplate = matter(templateContents);
    return parsedTemplate.content.replace("{prompt}", prompt);
  } else {
    // If the file doesn't exist, return the prompt unmodified
    return prompt;
  }
}
