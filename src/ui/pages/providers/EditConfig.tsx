import * as React from "react";
import { EditAnthropicConfig } from "./EditAnthropicConfig.js";
import { EditOpenAIConfig } from "./EditOpenAIConfig.js";

export function EditConfig() {
  const args: EditProviderConfigPageArgs = history.state;
  const Page: any =
    args.provider === "anthropic"
      ? EditAnthropicConfig
      : args.provider === "openai"
      ? EditOpenAIConfig
      : undefined;

  return Page ? <Page {...args} /> : <div>Unsupported Provider</div>;
}
