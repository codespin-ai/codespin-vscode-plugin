import { StartChatUserInput } from "../../ui/chat/types.js";
import { AnthropicConfigArgs } from "./editAnthropicConfig.js";
import { OpenAIConfigArgs } from "./editOpenAIConfig.js";

export type EditAnthropicConfigEvent = {
  type: "editAnthropicConfig";
} & { startChatUserInput: StartChatUserInput } & AnthropicConfigArgs;

export type EditOpenAIConfigEvent = {
  type: "editOpenAIConfig";
} & { startChatUserInput: StartChatUserInput } & OpenAIConfigArgs;
