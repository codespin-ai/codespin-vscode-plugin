import { BloomComponent, component } from "bloom-router";
import { Conversation } from "../../../../../conversations/types.js";

export type EditConfigProps = {
  provider: string;
  conversation: Conversation | null;
};

export async function* EditConfig(
  component: HTMLElement & BloomComponent & EditConfigProps
) {
  while (true) {
    const provider = component.provider;

    if (provider === "anthropic") {
      yield <edit-anthropic-config conversation={component.conversation} />;
    } else if (provider === "openai") {
      yield <edit-openai-config conversation={component.conversation} />;
    } else {
      yield <div>Unsupported API</div>;
    }
  }
}

component("edit-config", EditConfig, {
  provider: "",
  conversation: null,
});
