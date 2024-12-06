import { editAnthropicConfig as updateAnthropicConfig } from "../../../settings/provider/editAnthropicConfig.js";
import { ChatPanel } from "../ChatPanel.js";
import { EditAnthropicConfigEvent } from "../types.js";
import { handleStartChat } from "./handleStartChat.js";

export async function handleEditAnthropicConfig(
  chatPanel: ChatPanel,
  message: EditAnthropicConfigEvent,
  workspaceRoot: string
): Promise<void> {
  await updateAnthropicConfig(message);
  await handleStartChat(
    chatPanel,
    { type: "generate", ...message.generateUserInput },
    workspaceRoot
  );
}
