import { GeneratedSourceFile } from "codespin/dist/sourceCode/GeneratedSourceFile.js";
import { promises as fs } from "fs";
import * as path from "path";
import { getHistoryDir } from "../codespinDirs.js";

export async function readGeneratedFiles(
  dirName: string,
  workspaceRoot: string
) {
  const historyDir = await getHistoryDir(workspaceRoot);
  const originalDirPath = path.join(historyDir, dirName, "original");
  const generatedDirPath = path.join(historyDir, dirName, "generated");

  // Assume directory structure and file names are identical between original and generated
  const originalFiles = await fs.readdir(originalDirPath);

  const files = await Promise.all(
    originalFiles.map(async (fileName) => {
      const originalFilePath = path.join(originalDirPath, fileName);
      const generatedFilePath = path.join(generatedDirPath, fileName);

      const originalContent = await fs.readFile(originalFilePath, "utf8");
      const generatedContent = await fs.readFile(generatedFilePath, "utf8");

      const sourceFile: GeneratedSourceFile = {
        path: fileName, // Assuming fileName includes any relative directory structure within the history
        original: originalContent,
        generated: generatedContent,
      };
      return sourceFile;
    })
  );

  return files;
}
