import * as React from "react";
import { EditAnthropicConfig } from "./EditAnthropicConfig.js";
import { EditOpenAIConfig } from "./EditOpenAIConfig.js";

export type EditConfigPageArgs = {
  api: "openai" | "anthropic" | "google";
  [key: string]: string;
};

export function EditConfig() {
  const args: EditConfigPageArgs = history.state;
  const Page: any =
    args.api === "anthropic"
      ? EditAnthropicConfig
      : args.api === "openai"
      ? EditOpenAIConfig
      : undefined;

  return Page ? <Page {...args} /> : <div>Unsupported API</div>;
}
