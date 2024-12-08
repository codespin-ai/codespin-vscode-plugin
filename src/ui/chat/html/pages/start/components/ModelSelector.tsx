import * as React from "react";
import { ChatPanelBrokerType } from "../../../../getMessageBroker.js";
import { MessageClient } from "../../../../../../ipc/messageClient.js";

interface Model {
  name: string;
  alias?: string;
}

export interface ModelSelectorProps {
  model: string;
  models: Model[];
  messageClient: MessageClient<ChatPanelBrokerType>;
  onModelChange: (model: string) => void;
}

export function ModelSelector({
  model,
  models,
  messageClient,
  onModelChange,
}: ModelSelectorProps) {
  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newModel = e.target.value;
    onModelChange(newModel);

    messageClient.send("modelChange", {
      type: "modelChange" as const,
      model: newModel,
    });
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-vscode-editor-foreground mb-1">
        Model
      </label>
      <select
        value={model}
        onChange={handleModelChange}
        className="w-48 px-1 py-2 bg-vscode-dropdown-background border border-vscode-dropdown-border rounded text-vscode-editor-foreground focus:outline-none focus:ring-2 focus:ring-vscode-focusBorder"
      >
        {models.map((x) => (
          <option key={x.alias ?? x.name} value={x.alias ?? x.name}>
            {x.alias ?? x.name}
          </option>
        ))}
      </select>
    </div>
  );
}
