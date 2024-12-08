import * as React from "react";
import { Conversation } from "../../../../../conversations/types.js";
import { EditAnthropicConfig } from "./EditAnthropicConfig.js";
import { EditOpenAIConfig } from "./EditOpenAIConfig.js";

export type SupportedProviders = "openai" | "anthropic" | "google";

export type EditConfigPageProps = {
  provider: SupportedProviders;
  conversation: Conversation;
};

export function EditConfig(props: EditConfigPageProps) {
  const Page: any =
    props.provider === "anthropic"
      ? EditAnthropicConfig
      : props.provider === "openai"
      ? EditOpenAIConfig
      : undefined;

  return Page ? <Page {...props} /> : <div>Unsupported API</div>;
}
