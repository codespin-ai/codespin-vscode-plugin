import { component, Component } from "magic-loop";
import { Conversation } from "../../../../../conversations/types.js";
import { createMessageClient } from "../../../../../ipc/messageClient.js";
import { getVSCodeApi } from "../../../../../vscode/getVSCodeApi.js";
import { ChatPanelBrokerType } from "../../../getMessageBroker.js";
import { EditAnthropicConfigEvent } from "../../../types.js";
import { EditConfigProps } from "./edit-config.js";

export async function* EditAnthropicConfig(
  component: HTMLElement & Component & EditConfigProps
) {
  let apiKey = "";

  const onSave = () => {
    // Guard against null conversation
    if (!component.conversation) {
      console.error("Cannot save config without a conversation");
      return;
    }

    const chatPanelMessageClient = createMessageClient<ChatPanelBrokerType>(
      (message: unknown) => {
        getVSCodeApi().postMessage(message);
      }
    );

    const event: EditAnthropicConfigEvent = {
      type: "editAnthropicConfig",
      apiKey,
      conversation: component.conversation, // Now TypeScript knows this is not null
    };

    chatPanelMessageClient.send("editAnthropicConfig", event);
  };

  while (true) {
    yield (
      <div class="min-h-screen bg-vscode-editor-background p-8">
        <div class="max-w-2xl mx-auto">
          <div class="mb-8">
            <h1 class="text-2xl font-semibold text-vscode-editor-foreground mb-2">
              {!apiKey ? "Configure Anthropic API" : "Anthropic API Settings"}
            </h1>
            {!apiKey && (
              <p class="text-vscode-editor-foreground opacity-80 text-sm">
                Set up your Anthropic API key to get started. Your key will be
                securely stored in .codespin/anthropic.json
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
                placeholder="Enter your Anthropic API key"
                class="w-full px-3 py-2 bg-vscode-input-background border border-vscode-input-border rounded text-vscode-input-foreground placeholder-vscode-input-placeholder focus:outline-none focus:ring-2 focus:ring-vscode-focusBorder"
              />
            </div>

            <div class="pt-4">
              <button
                onclick={onSave}
                disabled={!component.conversation}
                class="min-w-[120px] px-4 py-2 bg-vscode-button-background text-vscode-button-foreground rounded font-medium hover:bg-vscode-button-hover-background focus:outline-none focus:ring-2 focus:ring-vscode-focusBorder transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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

// The component props should require a non-null conversation
type RequiredEditConfigProps = Omit<EditConfigProps, "conversation"> & {
  conversation: Conversation;
};

component("edit-anthropic-config", EditAnthropicConfig, {
  provider: "",
  conversation: undefined as any as Conversation, // We have to cast this since we can't provide a real conversation as default
});
