type GitChangeType = "modified" | "added" | "deleted" | "untracked";

interface GitFileChange {
  filePath: string;
  change: GitChangeType;
}
