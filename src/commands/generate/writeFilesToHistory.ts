import { GeneratedSourceFile } from "codespin/dist/sourceCode/GeneratedSourceFile.js";
import { promises as fs } from "fs";
import * as path from "path";
import { getHistoryDir } from "../../settings/codespinDirs.js";

export async function writeFilesToHistory(
  dirName: string,
  files: GeneratedSourceFile[],
  workspaceRoot: string
) {
  const historyDir = await getHistoryDir(workspaceRoot);

  files.forEach(async (file) => {
    // Construct the full paths for the original and generated files
    const originalFilePath = path.join(historyDir, "original", file.path);
    const generatedFilePath = path.join(historyDir, "generated", file.path);

    // Ensure the directories exist
    await fs.mkdir(path.dirname(originalFilePath), {
      recursive: true,
    });

    await fs.mkdir(path.dirname(generatedFilePath), {
      recursive: true,
    });

    // Write the original and generated content to their respective files
    await fs.writeFile(originalFilePath, file.original, "utf8");
    await fs.writeFile(generatedFilePath, file.generated, "utf8");
  });
}
