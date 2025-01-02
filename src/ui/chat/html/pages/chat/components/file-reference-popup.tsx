import { BloomComponent, component } from "bloom-router";
import { FileReferenceMap } from "../fileReferences.js";

export type FileSelectionState = {
  mode: "latest" | "inline";
  selectedFiles: Set<string>;
};

export type FileReferencePopupProps = {
  fileMap: FileReferenceMap;
  selectionState: FileSelectionState;
  setSelectionState: (state: FileSelectionState) => void;
  onClose: () => void;
};

export async function* FileReferencePopup(
  component: HTMLElement & BloomComponent & FileReferencePopupProps
) {
  const toggleMode = (mode: "latest" | "inline") => {
    component.setSelectionState({
      ...component.selectionState,
      mode,
    });
  };

  const toggleFile = (path: string) => {
    component.setSelectionState({
      ...component.selectionState,
      selectedFiles: new Set(
        component.selectionState.selectedFiles.has(path)
          ? [...component.selectionState.selectedFiles].filter(
              (f) => f !== path
            )
          : [...component.selectionState.selectedFiles, path]
      ),
    });
  };

  const toggleAll = (selected: boolean) => {
    component.setSelectionState({
      ...component.selectionState,
      selectedFiles: selected
        ? new Set(Array.from(component.fileMap.keys()))
        : new Set(),
    });
  };

  while (true) {
    yield (
      <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div class="bg-vscode-editor-background rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
          <div class="flex justify-between items-center mb-4">
            <div class="flex gap-4">
              <button
                className={`px-3 py-1 rounded ${
                  component.selectionState.mode === "latest"
                    ? "bg-vscode-button-background"
                    : ""
                }`}
                onclick={() => toggleMode("latest")}
              >
                Latest
              </button>
              <button
                className={`px-3 py-1 rounded ${
                  component.selectionState.mode === "inline"
                    ? "bg-vscode-button-background"
                    : ""
                }`}
                onclick={() => toggleMode("inline")}
              >
                Inline
              </button>
            </div>
            <button onclick={component.onClose}>×</button>
          </div>

          <div class="mb-4">
            <label class="flex items-center gap-2">
              <input
                type="checkbox"
                checked={
                  component.selectionState.selectedFiles.size ===
                  component.fileMap.size
                }
                onchange={(e) =>
                  toggleAll((e.target as HTMLInputElement).checked)
                }
                class="form-checkbox"
              />
              Select All
            </label>
          </div>

          <div class="space-y-2">
            {Array.from(component.fileMap.entries()).map(([path, refs]) => (
              <div
                key={path}
                class="flex items-center gap-2 p-2 hover:bg-vscode-input-background rounded"
              >
                <input
                  type="checkbox"
                  checked={component.selectionState.selectedFiles.has(path)}
                  onchange={() => toggleFile(path)}
                  class="form-checkbox"
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
}

component("file-reference-popup", FileReferencePopup, {
  fileMap: new Map(),
  selectionState: {
    mode: "latest",
    selectedFiles: new Set(),
  },
  setSelectionState: () => {},
  onClose: () => {},
});
