import * as React from "react";
import { EditAnthropicConfig } from "./EditAnthropicConfig.js";
import { EditOpenAIConfig } from "./EditOpenAIConfig.js";
import { GenerateUserInput } from "../../../types.js";

export type SupportedProviders = "openai" | "anthropic" | "google";

export type EditConfigPageProps = {
  provider: SupportedProviders;
  generateUserInput: GenerateUserInput;
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
