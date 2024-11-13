import { promises as fs } from "fs";
import { join, resolve } from "path";
import { shouldIncludeFile } from "./gitignore.js";

async function isDirectory(path: string): Promise<boolean> {
  const stats = await fs.lstat(path);
  return stats.isDirectory();
}

async function getFilesRecursively(
  path: string,
  workspaceRoot: string
): Promise<string[]> {
  if (await isDirectory(path)) {
    // Check if this directory should be included
    if (!(await shouldIncludeFile(path, workspaceRoot))) {
      return [];
    }

    const entries = await fs.readdir(path);
    const paths = await Promise.all(
      entries.map((entry) =>
        getFilesRecursively(join(path, entry), workspaceRoot)
      )
    );
    return paths.flat();
  } else {
    // Check if this file should be included
    if (await shouldIncludeFile(path, workspaceRoot)) {
      return [path];
    }
    return [];
  }
}

export async function getFilesRecursive(
  paths: string[],
  workspaceRoot: string
): Promise<string[]> {
  const allPaths = await Promise.all(
    paths.map((path) => getFilesRecursively(resolve(path), workspaceRoot))
  );
  return allPaths.flat();
}
