import { component, Component } from "magic-loop";

export type ChatHeaderProps = {
  provider: string;
  model: string;
};

export async function* ChatHeader(
  component: HTMLElement & Component & ChatHeaderProps
) {
  return (
    <div class="p-4 border-b border-vscode-panel-border">
      <h2 class="text-xl font-semibold text-vscode-editor-foreground">
        Chat ({component.provider}:{component.model})
      </h2>
    </div>
  );
}

component("chat-header", ChatHeader, {
  provider: "",
  model: "",
});
