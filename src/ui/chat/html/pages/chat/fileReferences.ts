import { Message } from "../../../../../conversations/types.js";

export type FileReference = {
  path: string;
  role: "user" | "assistant";
};

export type FileReferenceMap = Map<string, FileReference[]>;

export function buildFileReferenceMap(messages: Message[]): FileReferenceMap {
  const fileMap = new Map<string, FileReference[]>();

  for (const message of messages) {
    if (message.role === "user") {
      for (const content of message.content) {
        if (content.type === "files") {
          for (const file of content.includedFiles) {
            addFileReference(fileMap, file.path, "user");
          }
        }
      }
    } else {
      for (const content of message.content) {
        if (content.type === "code") {
          addFileReference(fileMap, content.path, "assistant");
        }
      }
    }
  }

  return fileMap;
}

function addFileReference(
  map: FileReferenceMap,
  path: string,
  role: "user" | "assistant"
) {
  const existing = map.get(path) || [];
  existing.push({ path, role });
  map.set(path, existing);
}

export function getFileCount(fileMap: FileReferenceMap): number {
  return fileMap.size;
}

export function getLatestReferences(
  fileMap: FileReferenceMap
): FileReference[] {
  return Array.from(fileMap.entries()).map(
    ([path, refs]) => refs[refs.length - 1]
  );
}

export function getAllReferences(fileMap: FileReferenceMap): FileReference[] {
  return Array.from(fileMap.values()).flat();
}
