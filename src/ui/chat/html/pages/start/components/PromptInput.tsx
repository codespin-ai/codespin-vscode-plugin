import * as React from "react";
import { RefObject, useEffect } from "react";

interface PromptInputProps {
  prompt: string;
  promptRef: RefObject<HTMLTextAreaElement>;
  setPrompt: (value: string) => void;
  onGenerate: () => void;
}

export function PromptInput({
  prompt,
  promptRef,
  setPrompt,
  onGenerate,
}: PromptInputProps) {
  useEffect(() => {
    const ref = promptRef.current;
    if (!ref) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        e.stopPropagation();
        onGenerate();
      }
    };

    ref.focus();
    ref.addEventListener("keydown", handleKeyDown);

    return () => {
      ref.removeEventListener("keydown", handleKeyDown);
    };
  }, [onGenerate]);

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-vscode-editor-foreground mb-1">
        Prompt:
      </label>
      <textarea
        ref={promptRef}
        rows={10}
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        className="max-w-3xl w-full px-3 py-2 bg-vscode-input-background border border-vscode-input-border rounded text-vscode-input-foreground font-vscode-editor resize-both focus:outline-none focus:ring-2 focus:ring-vscode-focusBorder"
      />
    </div>
  );
}
