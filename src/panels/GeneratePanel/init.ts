export function init() {
  function setupDropdownAndFocus() {
    setTimeout(() => {
      const dropdown: any = document.getElementById("model-selection-dropdown");
      if (dropdown) {
        const options = dropdown.querySelectorAll("vscode-option");

        options.forEach((option: any, index: number) => {
          console.log(option.textContent); // Log the text content of each option
          console.log(option.value); // Log the value of each option
          // Example of checking for a specific option and selecting it
          if (option.textContent.trim() === "GPT 4") {
            dropdown.selectedIndex = index; // Set the selected index
            // Alternatively, set the value directly if the options have value attributes
            dropdown.value = option.value;
          }
        });
      }
      const textArea: HTMLElement | null = document.getElementById("prompt-text-area");
      if (textArea) textArea.focus();
    }, 100); // Adjust the delay as needed
  }

  if (document.readyState === 'complete') {
    // The DOM has already loaded, so run the setup function directly.
    setupDropdownAndFocus();
  } else {
    // The DOM has not yet loaded, add the event listener.
    window.addEventListener('DOMContentLoaded', setupDropdownAndFocus);
  }
}
