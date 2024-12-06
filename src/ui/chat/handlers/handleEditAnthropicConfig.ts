import { editAnthropicConfig as updateAnthropicConfig } from "../../../settings/provider/editAnthropicConfig.js";
import { ChatPanel } from "../ChatPanel.js";
import { EditAnthropicConfigEvent } from "../types.js";
import { handleStartChat } from "./handleStartChat.js";

export async function handleEditAnthropicConfig(
  message: EditAnthropicConfigEvent,
  chatPanel: ChatPanel,
  workspaceRoot: string
): Promise<void> {
  await updateAnthropicConfig(message);
  await handleStartChat(
    { type: "startChat", ...message.startChatUserInput },
    chatPanel,
    workspaceRoot
  );
}
