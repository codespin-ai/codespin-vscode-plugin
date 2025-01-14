import { component, Component } from "magic-loop";import { Router } from "magic-loop-router";
import { ChatPanelBrokerType } from "../../../../getMessageBroker.js";
import { MessageClient } from "../../../../../../ipc/messageClient.js";

interface Model {
  name: string;
  alias?: string;
}

type ModelSelectorProps = {
  model: string;
  models: Model[];
  messageClient: MessageClient<ChatPanelBrokerType>;
  onModelChange: (model: string) => void;
};

export async function* ModelSelector(
  component: HTMLElement & Component & ModelSelectorProps
) {
  const handleModelChange = (e: Event) => {
    const newModel = (e.target as HTMLSelectElement).value;
    component.onModelChange(newModel);

    component.messageClient.send("modelChange", {
      type: "modelChange" as const,
      model: newModel,
    });
  };

  while (true) {
    yield (
      <div class="mb-4">
        <label class="block text-sm font-medium text-vscode-editor-foreground mb-1">
          Model
        </label>
        <select
          value={component.model}
          onchange={handleModelChange}
          class="w-48 px-1 py-2 bg-vscode-dropdown-background border border-vscode-dropdown-border rounded text-vscode-editor-foreground focus:outline-none focus:ring-2 focus:ring-vscode-focusBorder"
        >
          {component.models.map((x) => (
            <option key={x.alias ?? x.name} value={x.alias ?? x.name}>
              {x.alias ?? x.name}
            </option>
          ))}
        </select>
      </div>
    );
  }
}

component("model-selector", ModelSelector, {
  model: "",
  models: [],
  messageClient: null,
  onModelChange: () => {},
});
