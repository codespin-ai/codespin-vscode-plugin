import { component, Component } from "magic-loop";import { Router } from "magic-loop-router";
import { Ref } from "webjsx";

type PromptInputProps = {
  prompt: string;
  promptRef: { current: HTMLTextAreaElement | null };
  setPrompt: (value: string) => void;
  onGenerate: () => void;
  handleKeyDown?: (e: KeyboardEvent) => void;
};

export async function* PromptInput(
  component: HTMLElement & Component & PromptInputProps
) {
  // Set up event handler
  component.handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      e.stopPropagation();
      component.onGenerate();
    }
  };

  while (true) {
    yield (
      <div class="mb-4">
        <label class="block text-sm font-medium text-vscode-editor-foreground mb-1">
          Prompt:
        </label>
        <textarea
          ref={(el: HTMLTextAreaElement) => {
            if (el instanceof HTMLTextAreaElement) {
              component.promptRef.current = el;
              // Only add event listener when element is first mounted
              el.addEventListener("keydown", component.handleKeyDown!);
            }
          }}
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

const promptRef: Ref<HTMLTextAreaElement> = { current: null };

component(
  "prompt-input",
  PromptInput,
  {
    prompt: "",
    promptRef,
    setPrompt: () => {},
    onGenerate: () => {},
    handleKeyDown: undefined,
  },
  {
    onConnected: (component) => {
      // Focus on mount
      if (component.promptRef.current) {
        component.promptRef.current.focus();
      }
    },
    onDisconnected: (component) => {
      // Clean up event listener
      if (component.promptRef.current && component.handleKeyDown) {
        component.promptRef.current.removeEventListener(
          "keydown",
          component.handleKeyDown
        );
      }
    },
  }
);
