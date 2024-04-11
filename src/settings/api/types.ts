import { AnthropicConfigArgs } from "./editAnthropicConfig.js";
import { OpenAIConfigArgs } from "./editOpenAIConfig.js";

export type EditAnthropicConfigEvent = {
  type: "editAnthropicConfig";
} & AnthropicConfigArgs;

export type EditOpenAIConfigEvent = {
  type: "editOpenAIConfig";
} & OpenAIConfigArgs;
