import * as React from "react";
import { EditAnthropicConfig } from "./EditAnthropicConfig.js";
import { EditOpenAIConfig } from "./EditOpenAIConfig.js";

export type EditConfigPageProps = {
  provider: "openai" | "anthropic" | "google";
  [key: string]: string;
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
