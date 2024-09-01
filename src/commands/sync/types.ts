export type SyncData = {
  type: string;
};

export type SyncCodeData = {
  type: "code";
  projectPath: string;
  filePath: string;
  contents: string;
};
