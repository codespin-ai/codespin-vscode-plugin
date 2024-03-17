import { Dropdown, Option } from "@vscode/webview-ui-toolkit";
import { WebviewApi } from "vscode-webview";

let vsCodeApi: WebviewApi<unknown>;

export function initWebView() {
  function onReady() {
    window.addEventListener("message", (event) => {
      const message = event.data;
      switch (message.command) {
        case "load":
          load(message);
          break;
      }
    });

    vsCodeApi = acquireVsCodeApi();
    vsCodeApi.postMessage({ command: "webviewReady" });
  }

  if (document.readyState === "complete") {
    onReady();
  } else {
    window.addEventListener("DOMContentLoaded", onReady);
  }
}

function load(message: any) {
  updateGenerationTargetDropdown(message.files);
  updateModelSelectionDropdown(message.models);
  updateRulesDropdown(message.rules);
  updateIncludedFiles(message.files);

  // Add here the code for setting the default value for the dropdowns if needed
  const executeButton = document.querySelector("vscode-button");
  if (executeButton) {
    executeButton.addEventListener("click", () => {
      // Handle the execute button click event
    });
  }
}

function updateIncludedFiles(files: string[]) {
  const includedFilesDiv = document.getElementById(
    "included-files"
  ) as HTMLDivElement;
  includedFilesDiv.innerHTML = ""; // Clear existing content

  files.forEach((file) => {
    const fileOptionContainer = document.createElement("div");
    fileOptionContainer.className = "file-options";
    fileOptionContainer.setAttribute("data-file-path", file);
    fileOptionContainer.style.display = "flex";
    fileOptionContainer.style.flexDirection = "row";
    fileOptionContainer.style.alignItems = "center";
    fileOptionContainer.style.paddingTop = "4px";
    fileOptionContainer.style.paddingBottom = "4px";

    const dropdown = document.createElement("vscode-dropdown") as Dropdown;
    dropdown.innerHTML = `<vscode-option value="source">Full Source</vscode-option><vscode-option value="declaration">Declarations</vscode-option>`;
    dropdown.value = "source";
    dropdown.style.marginRight = "1em";
    dropdown.style.width = "120px";
    fileOptionContainer.appendChild(dropdown);

    const filenameLabel = document.createElement("label");
    filenameLabel.innerText = file;
    fileOptionContainer.appendChild(filenameLabel);

    includedFilesDiv.appendChild(fileOptionContainer);
  });
}

function updateGenerationTargetDropdown(files: string[]) {
  const generationTargetDropdown = document.getElementById(
    "generation-target-dropdown"
  ) as HTMLDivElement;
  files.forEach((file) => {
    const option = document.createElement("vscode-option") as Option;
    option.value = file;
    option.textContent = file;
    generationTargetDropdown.appendChild(option);
  });
}

function updateModelSelectionDropdown(models: string[]) {
  const modelSelectionDropdown = document.getElementById(
    "model-selection-dropdown"
  ) as HTMLDivElement;
  models.forEach((model) => {
    const option = document.createElement("vscode-option") as Option;
    option.value = model;
    option.textContent = model;
    modelSelectionDropdown.appendChild(option);
  });
}

function updateRulesDropdown(rules: string[]) {
  const rulesDropdown = document.getElementById(
    "select-rules-dropdown"
  ) as Dropdown;
  rules.forEach((rule) => {
    const option = document.createElement("vscode-option") as Option;
    option.value = rule;
    option.textContent = rule;
    rulesDropdown.appendChild(option);
  });
}
