import { promises as fs } from 'fs';
import { join, resolve } from 'path';

async function isDirectory(path: string): Promise<boolean> {
  const stats = await fs.lstat(path);
  return stats.isDirectory();
}

async function getFilesRecursively(path: string): Promise<string[]> {
  if (await isDirectory(path)) {
    const entries = await fs.readdir(path);
    const paths = await Promise.all(entries.map(entry => getFilesRecursively(join(path, entry))));
    return paths.flat();
  } else {
    return [path];
  }
}

export async function getFilesRecursive(paths: string[]): Promise<string[]> {
  const allPaths = await Promise.all(paths.map(path => getFilesRecursively(resolve(path))));
  return allPaths.flat();
}
