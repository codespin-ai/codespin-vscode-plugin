import * as React from "react";
import { EditAnthropicConfig } from "./EditAnthropicConfig.js";
import { EditOpenAIConfig } from "./EditOpenAIConfig.js";
import { EditConfigPageArgs } from "./EditConfigPageArgs.js";

export function EditConfig() {
  const args: EditConfigPageArgs = history.state;
  const Page: any =
    args.provider === "anthropic"
      ? EditAnthropicConfig
      : args.provider === "openai"
      ? EditOpenAIConfig
      : undefined;

  return Page ? <Page {...args} /> : <div>Unsupported Provider</div>;
}
