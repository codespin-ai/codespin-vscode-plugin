import { Dropdown, Option, Radio } from "@vscode/webview-ui-toolkit";
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
  if (files.length > 1) {
    const includedFilesDiv = document.getElementById(
      "included-files"
    ) as HTMLDivElement;
    includedFilesDiv.innerHTML = ""; // Clear existing content

    const label = document.createElement("div");
    label.innerText = "Included Files:";
    includedFilesDiv.appendChild(label);

    files.forEach((file, index) => {
      const fileOptionContainer = document.createElement("div");

      fileOptionContainer.className = "file-options";
      fileOptionContainer.setAttribute("data-file-path", file);
      fileOptionContainer.style.display = "flex";
      fileOptionContainer.style.flexDirection = "row";
      fileOptionContainer.style.alignItems = "center";

      const radioGroup = document.createElement("vscode-radio-group");
      radioGroup.setAttribute("name", `file-type-${index}`);

      const sourceRadio = document.createElement("vscode-radio") as Radio;
      sourceRadio.value = "source";
      sourceRadio.innerText = "Full Source";
      sourceRadio.checked = true;

      const declarationRadio = document.createElement("vscode-radio") as Radio;
      declarationRadio.value = "declaration";
      declarationRadio.innerText = "Declarations";
      declarationRadio.checked = false;

      radioGroup.appendChild(sourceRadio);
      radioGroup.appendChild(declarationRadio);

      fileOptionContainer.appendChild(radioGroup);

      const filenameLabel = document.createElement("label");
      filenameLabel.innerText = file;
      fileOptionContainer.appendChild(filenameLabel);

      includedFilesDiv.appendChild(fileOptionContainer);
    });
  }
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
