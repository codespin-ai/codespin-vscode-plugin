import { editAnthropicConfig as updateAnthropicConfig } from "../../../settings/provider/editAnthropicConfig.js";
import { EditAnthropicConfigEvent } from "../../../settings/provider/types.js";
import { ChatPanel } from "../ChatPanel.js";
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
