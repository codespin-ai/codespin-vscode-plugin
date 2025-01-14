import { component, Component } from "magic-loop";
import { Conversation } from "../../../../../conversations/types.js";
import { createMessageClient } from "../../../../../ipc/messageClient.js";
import { getVSCodeApi } from "../../../../../vscode/getVSCodeApi.js";
import { ChatPanelBrokerType } from "../../../getMessageBroker.js";
import { EditOpenAIConfigEvent } from "../../../types.js";

type EditOpenAIConfigProps = {
  conversation: Conversation;
  provider: string;
};

export async function* EditOpenAIConfig(
  component: HTMLElement & Component & EditOpenAIConfigProps
) {
  let apiKey = "";

  const onSave = () => {
    const chatPanelMessageClient = createMessageClient<ChatPanelBrokerType>(
      (message: unknown) => {
        getVSCodeApi().postMessage(message);
      }
    );

    const message: EditOpenAIConfigEvent = {
      type: "editOpenAIConfig",
      apiKey,
      conversation: component.conversation,
    };

    chatPanelMessageClient.send("editOpenAIConfig", message);
  };

  while (true) {
    yield (
      <div class="min-h-screen bg-vscode-editor-background p-8">
        <div class="max-w-2xl mx-auto">
          <div class="mb-8">
            <h1 class="text-2xl font-semibold text-vscode-editor-foreground mb-2">
              {apiKey === "" ? "Configure OpenAI API" : "OpenAI API Settings"}
            </h1>
            {apiKey === "" && (
              <p class="text-vscode-editor-foreground opacity-80 text-sm">
                Set up your OpenAI API key to get started. Your key will be
                securely stored in .codespin/openai.json
              </p>
            )}
            <p class="text-vscode-editor-foreground opacity-80 text-sm mt-2">
              After saving, you'll return to your previous chat.
            </p>
          </div>

          <div class="space-y-6 bg-vscode-input-background rounded-lg p-6 shadow-sm border border-vscode-panel-border">
            <div class="space-y-2">
              <label
                htmlFor="api-key"
                class="block text-sm font-medium text-vscode-editor-foreground"
              >
                API Key
              </label>
              <input
                id="api-key"
                type="text"
                value={apiKey}
                onchange={(e) => {
                  apiKey = (e.target as HTMLInputElement).value;
                  component.render();
                }}
                placeholder="Enter your OpenAI API key"
                class="w-full px-3 py-2 bg-vscode-input-background border border-vscode-input-border rounded text-vscode-input-foreground placeholder-vscode-input-placeholder focus:outline-none focus:ring-2 focus:ring-vscode-focusBorder"
              />
            </div>

            <div class="pt-4">
              <button
                onclick={onSave}
                class="min-w-[120px] px-4 py-2 bg-vscode-button-background text-vscode-button-foreground rounded font-medium hover:bg-vscode-button-hover-background focus:outline-none focus:ring-2 focus:ring-vscode-focusBorder transition-colors duration-200"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

component("edit-openai-config", EditOpenAIConfig, {
  conversation: null as unknown as Conversation, // This is a required prop that must be provided when using the component
  provider: "openai", // Default provider value
});
