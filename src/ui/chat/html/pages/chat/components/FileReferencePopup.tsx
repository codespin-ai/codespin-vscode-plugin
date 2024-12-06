import * as React from "react";
import { FileReferenceMap } from "../fileReferences.js";

interface FileSelectionState {
  mode: "latest" | "inline";
  selectedFiles: Set<string>;
}

interface FileReferencePopupProps {
  fileMap: FileReferenceMap;
  selectionState: FileSelectionState;
  setSelectionState: React.Dispatch<React.SetStateAction<FileSelectionState>>;
  onClose: () => void;
}

export function FileReferencePopup({
  fileMap,
  selectionState,
  setSelectionState,
  onClose,
}: FileReferencePopupProps) {
  const toggleMode = (mode: "latest" | "inline") => {
    setSelectionState((prev) => ({
      ...prev,
      mode,
    }));
  };

  const toggleFile = (path: string) => {
    setSelectionState((prev) => {
      const newSelected = new Set(prev.selectedFiles);
      if (newSelected.has(path)) {
        newSelected.delete(path);
      } else {
        newSelected.add(path);
      }
      return {
        ...prev,
        selectedFiles: newSelected,
      };
    });
  };

  const toggleAll = (selected: boolean) => {
    setSelectionState((prev) => ({
      ...prev,
      selectedFiles: selected ? new Set(Array.from(fileMap.keys())) : new Set(),
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-vscode-editor-background rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <div className="flex gap-4">
            <button
              className={`px-3 py-1 rounded ${
                selectionState.mode === "latest"
                  ? "bg-vscode-button-background"
                  : ""
              }`}
              onClick={() => toggleMode("latest")}
            >
              Latest
            </button>
            <button
              className={`px-3 py-1 rounded ${
                selectionState.mode === "inline"
                  ? "bg-vscode-button-background"
                  : ""
              }`}
              onClick={() => toggleMode("inline")}
            >
              Inline
            </button>
          </div>
          <button onClick={onClose}>×</button>
        </div>

        <div className="mb-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={selectionState.selectedFiles.size === fileMap.size}
              onChange={(e) => toggleAll(e.target.checked)}
              className="form-checkbox"
            />
            Select All
          </label>
        </div>

        <div className="space-y-2">
          {Array.from(fileMap.entries()).map(([path, refs]) => (
            <div
              key={path}
              className="flex items-center gap-2 p-2 hover:bg-vscode-input-background rounded"
            >
              <input
                type="checkbox"
                checked={selectionState.selectedFiles.has(path)}
                onChange={() => toggleFile(path)}
                className="form-checkbox"
              />
              <span
                className={`w-2 h-2 rounded-full ${
                  refs[refs.length - 1].role === "user"
                    ? "bg-blue-500"
                    : "bg-green-500"
                }`}
              />
              <span>{path}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
