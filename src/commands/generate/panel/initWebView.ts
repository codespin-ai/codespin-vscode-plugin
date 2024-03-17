import { Checkbox, Radio, RadioGroup } from "@vscode/webview-ui-toolkit";
import { WebviewApi } from "vscode-webview";

let vsCodeApi: WebviewApi<unknown>;

export function initWebView(files: string[]) {
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

function load(message: { files: string[] }) {
  const dropdown = document.getElementById(
    "model-selection-dropdown"
  ) as HTMLSelectElement;

  if (dropdown) {
    const options = dropdown.querySelectorAll("vscode-option");

    options.forEach((option, index: number) => {
      const typedOption = option as HTMLOptionElement;
      if (
        typedOption.textContent &&
        typedOption.textContent.trim() === "GPT 4"
      ) {
        dropdown.selectedIndex = index;
        dropdown.value = typedOption.value;
      }
    });
  }

  const textArea = document.getElementById(
    "prompt-text-area"
  ) as HTMLTextAreaElement;
  if (textArea) {
    textArea.focus();
  }

  loadFiles(message.files);

  const executeButton = document.querySelector("vscode-button");
  if (executeButton) {
    executeButton.addEventListener("click", () => {
      const dropdown = document.getElementById(
        "model-selection-dropdown"
      ) as HTMLSelectElement;
      const textArea = document.getElementById(
        "prompt-text-area"
      ) as HTMLTextAreaElement;

      const model = dropdown.value;
      const prompt = textArea.value;

      const filesInfo = Array.from(
        document.querySelectorAll(".file-options")
      ).map((div: Element) => {
        const path = div.getAttribute("data-file-path");
        const selectedType =
          (div.querySelector("vscode-radio-group:checked") as HTMLInputElement)
            ?.value || "source";
        return { path, type: selectedType };
      });

      vsCodeApi.postMessage({
        command: "execute",
        model: model,
        prompt: prompt,
        files: filesInfo,
      });
    });
  }
}

function loadFiles(files: string[]) {
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

function handlePrimarySelection(selectedFile: string, files: string[]) {
  // files.forEach((file) => {
  //   if (file !== selectedFile) {
  //     const fileDiv = document.querySelector(`div[data-file-path="${file}"]`);
  //     const primaryRadio = fileDiv.querySelector(
  //       `vscode-radio[value="primary"]`
  //     ) as HTMLInputElement;
  //     const sourceRadio = fileDiv.querySelector(
  //       `vscode-radio[value="source"]`
  //     ) as HTMLInputElement;
  //     if (primaryRadio && primaryRadio.checked) {
  //       primaryRadio.checked = false;
  //       sourceRadio.checked = true;
  //     }
  //   }
  // });
}
