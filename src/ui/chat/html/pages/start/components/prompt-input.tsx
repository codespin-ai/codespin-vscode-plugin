import { BloomComponent, component } from "bloom-router";

type PromptInputProps = {
  prompt: string;
  promptRef: React.RefObject<HTMLTextAreaElement>;
  setPrompt: (value: string) => void;
  onGenerate: () => void;
};

export async function* PromptInput(
  component: HTMLElement & BloomComponent & PromptInputProps
) {
  // Set up event handlers for Ctrl/Cmd+Enter
  if (component.promptRef.current) {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        e.stopPropagation();
        component.onGenerate();
      }
    };

    component.promptRef.current.focus();
    component.promptRef.current.addEventListener("keydown", handleKeyDown);

    // Cleanup
    component.cleanup = () => {
      component.promptRef.current?.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }

  while (true) {
    yield (
      <div class="mb-4">
        <label class="block text-sm font-medium text-vscode-editor-foreground mb-1">
          Prompt:
        </label>
        <textarea
          ref={component.promptRef}
          rows={10}
          value={component.prompt}
          onchange={(e: Event) =>
            component.setPrompt((e.target as HTMLTextAreaElement).value)
          }
          class="max-w-3xl w-full px-3 py-2 bg-vscode-input-background border border-vscode-input-border rounded text-vscode-input-foreground font-vscode-editor resize-both focus:outline-none focus:ring-2 focus:ring-vscode-focusBorder"
        />
      </div>
    );
  }
}

component("prompt-input", PromptInput, {
  prompt: "",
  promptRef: null,
  setPrompt: () => {},
  onGenerate: () => {},
});
