import * as React from "react";
import { EditAnthropicConfig } from "./EditAnthropicConfig.js";
import { EditOpenAIConfig } from "./EditOpenAIConfig.js";

export type EditConfigPageArgs = {
  provider: "openai" | "anthropic" | "google";
  [key: string]: string;
};

export function EditConfig() {
  debugger;
  const args: EditConfigPageArgs = history.state;
  const Page: any =
    args.provider === "anthropic"
      ? EditAnthropicConfig
      : args.provider === "openai"
      ? EditOpenAIConfig
      : undefined;

  return Page ? <Page {...args} /> : <div>Unsupported API</div>;
}
