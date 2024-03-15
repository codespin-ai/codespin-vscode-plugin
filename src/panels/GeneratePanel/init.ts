export function init() {
  function setupDropdownAndFocus() {
    setTimeout(() => {
      const dropdown = document.getElementById(
        "model-selection-dropdown"
      ) as HTMLSelectElement;
      if (dropdown) {
        const options = dropdown.querySelectorAll("vscode-option");

        options.forEach((option, index: number) => {
          const typedOption = option as HTMLOptionElement;
          console.log(typedOption.textContent);
          console.log(typedOption.value);
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
    }, 100);
  }

  if (document.readyState === "complete") {
    setupDropdownAndFocus();
  } else {
    window.addEventListener("DOMContentLoaded", setupDropdownAndFocus);
  }
}
