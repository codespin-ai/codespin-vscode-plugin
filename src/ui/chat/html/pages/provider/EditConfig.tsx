import * as React from "react";
import { EditAnthropicConfig } from "./EditAnthropicConfig.js";
import { EditOpenAIConfig } from "./EditOpenAIConfig.js";
import { StartChatUserInput } from "../../../types.js";

export type ConfigPageState = {
  provider: string;
  startChatUserInput: StartChatUserInput;
};

export type EditConfigPageArgs = {
  provider: "openai" | "anthropic" | "google";
  [key: string]: string;
};

export function EditConfig() {
  const args: EditConfigPageArgs = history.state;
  const Page: any =
    args.provider === "anthropic"
      ? EditAnthropicConfig
      : args.provider === "openai"
      ? EditOpenAIConfig
      : undefined;

  return Page ? <Page {...args} /> : <div>Unsupported API</div>;
}
