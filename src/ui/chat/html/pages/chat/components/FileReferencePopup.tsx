import * as React from "react";
import { FileReferenceMap } from "../fileReferences.js";

type ViewMode = "latest" | "inline";

interface FileReferencePopupProps {
  fileMap: FileReferenceMap;
  onClose: () => void;
}

export function FileReferencePopup({
  fileMap,
  onClose,
}: FileReferencePopupProps) {
  const [viewMode, setViewMode] = React.useState<ViewMode>("latest");

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-vscode-editor-background rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <div className="flex gap-4">
            <button
              className={`px-3 py-1 rounded ${
                viewMode === "latest" ? "bg-vscode-button-background" : ""
              }`}
              onClick={() => setViewMode("latest")}
            >
              Latest
            </button>
            <button
              className={`px-3 py-1 rounded ${
                viewMode === "inline" ? "bg-vscode-button-background" : ""
              }`}
              onClick={() => setViewMode("inline")}
            >
              Inline
            </button>
          </div>
          <button onClick={onClose}>×</button>
        </div>

        <FileList fileMap={fileMap} viewMode={viewMode} />
      </div>
    </div>
  );
}

interface FileListProps {
  fileMap: FileReferenceMap;
  viewMode: ViewMode;
}

function FileList({ fileMap, viewMode }: FileListProps) {
  const files =
    viewMode === "latest"
      ? Array.from(fileMap.entries()).map(
          ([path, refs]) => refs[refs.length - 1]
        )
      : Array.from(fileMap.values()).flat();

  return (
    <div className="space-y-2">
      {files.map((file, index) => (
        <div
          key={`${file.path}-${index}`}
          className="flex items-center gap-2 p-2 hover:bg-vscode-input-background rounded"
        >
          <span
            className={`w-2 h-2 rounded-full ${
              file.role === "user" ? "bg-blue-500" : "bg-green-500"
            }`}
          />
          <span>{file.path}</span>
        </div>
      ))}
    </div>
  );
}
