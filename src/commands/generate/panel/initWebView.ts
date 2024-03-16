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

      // Gather values for posting
      const model = dropdown.value; // Get the selected model's value from the dropdown
      const prompt = textArea.value; // Get the prompt from the textarea

      // Gather checked files
      const checkedFiles: string[] = [];
      const checkboxes = document.querySelectorAll(
        "#include-files input[type='checkbox']"
      );
      checkboxes.forEach((checkbox) => {
        const cb = checkbox as HTMLInputElement;
        if (cb.checked) {
          checkedFiles.push(cb.value);
        }
      });

      // Post message with gathered values
      vsCodeApi.postMessage({
        command: "execute",
        model: model,
        prompt: prompt,
        files: checkedFiles,
      });
    });
  }
}

function loadFiles(files: string[]) {
  const includeFilesContainer = document.getElementById(
    "include-files"
  ) as HTMLUListElement;

  includeFilesContainer.innerHTML = ""; // Clear existing content

  files.forEach((file) => {
    const li = document.createElement("li"); // Create a new list item
    li.style.margin = "0.2em"; // Apply margin to the list item

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.id = `include_${file}`;
    checkbox.value = file;
    checkbox.style.verticalAlign = "middle";
    checkbox.checked = true;
    checkbox.style.marginRight = "0.5em";

    const label = document.createElement("label");
    label.htmlFor = `include_${file}`; // Ensure the htmlFor matches the checkbox id
    label.textContent = file;
    label.style.verticalAlign = "middle"; // Align label text vertically
    label.style.display = "inline-block"; // Ensure label is in line

    // Append the checkbox and label to the list item, not directly to the container
    li.appendChild(checkbox);
    li.appendChild(label);

    // Append the list item to the container
    includeFilesContainer.appendChild(li);
  });
}
