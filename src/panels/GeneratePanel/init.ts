export function initGeneratePanel(files: string[]) {
  if (document.readyState === "complete") {
    doInit();
  } else {
    window.addEventListener("DOMContentLoaded", doInit);
  }
}

function doInit() {
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

  window.addEventListener("message", (event) => {
    const message = event.data; // The JSON data our extension sent
    switch (message.command) {
      case "loadFiles":
        console.log({ message });
        loadFiles(message.files);
        break;
    }
  });

  const vscode = acquireVsCodeApi();
  vscode.postMessage({ command: "webviewReady" });
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
    checkbox.style.verticalAlign = "middle"; // Align checkbox vertically

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
