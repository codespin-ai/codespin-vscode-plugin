import { editAnthropicConfig as updateAnthropicConfig } from "../../../settings/provider/editAnthropicConfig.js";
import { ChatPanel } from "../ChatPanel.js";
import { EditAnthropicConfigEvent } from "../types.js";
import { handleGenerate } from "./handleGenerate.js";

export async function handleEditAnthropicConfig(
  chatPanel: ChatPanel,
  message: EditAnthropicConfigEvent,
  workspaceRoot: string
): Promise<void> {
  await updateAnthropicConfig(message);
  await handleGenerate(
    chatPanel,
    { type: "generate", ...message.generateUserInput },
    workspaceRoot
  );
}
