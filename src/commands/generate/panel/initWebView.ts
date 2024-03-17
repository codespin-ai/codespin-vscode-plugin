import { Checkbox } from "@vscode/webview-ui-toolkit";
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

      const primaryFile: string | undefined = Array.from(
        document.querySelectorAll(
          "#primary-file vscode-checkbox"
        ) as NodeListOf<Checkbox>
      ).find((x) => x.checked)?.value;

      vsCodeApi.postMessage({
        command: "execute",
        model: model,
        prompt: prompt,
        primaryFile,
      });
    });
  }
}

function loadFiles(files: string[]) {
  const primaryFileDiv = document.getElementById(
    "primary-file"
  ) as HTMLDivElement;

  // Create a function to uncheck all checkboxes except the one that's currently being checked
  const handleCheckboxChange = (currentCheckbox: Checkbox) => {
    const allCheckboxes = primaryFileDiv.querySelectorAll(
      "vscode-checkbox"
    ) as NodeListOf<Checkbox>;
    allCheckboxes.forEach((checkbox) => {
      if (checkbox !== currentCheckbox) {
        checkbox.checked = false; // Uncheck all other checkboxes
      }
    });
  };

  primaryFileDiv.innerHTML = ""; // Clear existing content

  files.forEach((file) => {
    const checkbox = document.createElement("vscode-checkbox") as Checkbox;
    checkbox.id = `include_${file}`;
    checkbox.value = file;
    checkbox.innerText = file;
    checkbox.checked = files.length === 1;

    // Append the list item to the container
    primaryFileDiv.appendChild(checkbox);

    checkbox.addEventListener("click", () => handleCheckboxChange(checkbox));
  });
}
