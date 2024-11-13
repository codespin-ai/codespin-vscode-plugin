import ignore, { Ignore } from "ignore";
import { promises as fs } from "fs";
import { join, relative } from "path";
import { pathExists } from "./pathExists.js";

let gitignoreCache = new Map<string, Ignore>();

export async function getGitignoreMatcher(
  workspaceRoot: string
): Promise<Ignore> {
  // Check cache first
  if (gitignoreCache.has(workspaceRoot)) {
    return gitignoreCache.get(workspaceRoot)!;
  }

  const gitignorePath = join(workspaceRoot, ".gitignore");
  const ig = ignore();

  // Always ignore .git directory
  ig.add("**/.git/**");

  if (await pathExists(gitignorePath)) {
    const gitignoreContent = await fs.readFile(gitignorePath, "utf8");
    ig.add(gitignoreContent);
  }

  // Cache the matcher
  gitignoreCache.set(workspaceRoot, ig);
  return ig;
}

export function clearGitignoreCache() {
  gitignoreCache.clear();
}

export async function shouldIncludeFile(
  filePath: string,
  workspaceRoot: string
): Promise<boolean> {
  const ig = await getGitignoreMatcher(workspaceRoot);
  const relativePath = relative(workspaceRoot, filePath);
  return !ig.ignores(relativePath);
}
