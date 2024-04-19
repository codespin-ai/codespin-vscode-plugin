import { promises as fs } from "fs";
import * as path from "path";
import { getHistoryDir } from "../codespinDirs.js";
import { pathExists } from "../../fs/pathExists.js";

// Helper function to recursively get all file paths
async function getAllFiles(
  dirPath: string,
  arrayOfFiles: string[] = []
): Promise<string[]> {
  if (await pathExists(dirPath)) {
    const files = await fs.readdir(dirPath, { withFileTypes: true });

    for (const file of files) {
      if (file.isDirectory()) {
        arrayOfFiles = await getAllFiles(
          path.join(dirPath, file.name),
          arrayOfFiles
        );
      } else {
        arrayOfFiles.push(path.join(dirPath, file.name));
      }
    }

    return arrayOfFiles;
  } else {
    return [];
  }
}

export async function readGeneratedFiles(
  dirName: string,
  workspaceRoot: string
) {
  const historyDir = await getHistoryDir(workspaceRoot);
  const originalDirPath = path.join(historyDir, dirName, "original");
  const generatedDirPath = path.join(historyDir, dirName, "generated");

  // Get all file paths in the original directory, including subdirectories
  const originalFilePaths = await getAllFiles(originalDirPath);

  const files = await Promise.all(
    originalFilePaths.map(async (originalFilePath) => {
      // Calculate the relative path to use it for finding the corresponding generated file
      const relativePath = path.relative(originalDirPath, originalFilePath);
      const generatedFilePath = path.join(generatedDirPath, relativePath);

      const originalContent = await fs.readFile(originalFilePath, "utf8");
      const generatedContent = await fs.readFile(generatedFilePath, "utf8");

      const sourceFile = {
        path: relativePath,
        original: originalContent,
        generated: generatedContent,
        history: {
          originalFilePath: originalFilePath,
          generatedFilePath: generatedFilePath,
        },
      };
      return sourceFile;
    })
  );

  return files;
}
