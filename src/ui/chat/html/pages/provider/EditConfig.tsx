import * as React from "react";
import { EditAnthropicConfig } from "./EditAnthropicConfig.js";
import { EditOpenAIConfig } from "./EditOpenAIConfig.js";
import { GenerateUserInput } from "../../../types.js";
import { useLocation } from "react-router-dom";

export type ProviderConfigPageArgs = {
  provider: string;
  generateUserInput: GenerateUserInput;
};

export type EditConfigPageArgs = {
  provider: "openai" | "anthropic" | "google";
  [key: string]: string;
};

export function EditConfig() {
  const location = useLocation();
  const state = location.state as EditConfigPageArgs;

  const Page: any =
    state.provider === "anthropic"
      ? EditAnthropicConfig
      : state.provider === "openai"
      ? EditOpenAIConfig
      : undefined;

  return Page ? <Page {...state} /> : <div>Unsupported API</div>;
}
