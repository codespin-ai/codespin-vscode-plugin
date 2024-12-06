import { editOpenAIConfig as updateOpenAIConfig } from "../../../settings/provider/editOpenAIConfig.js";
import { ChatPanel } from "../ChatPanel.js";
import { EditOpenAIConfigEvent } from "../types.js";
import { handleGenerate } from "./handleGenerate.js";

export async function handleEditOpenAIConfig(
  chatPanel: ChatPanel,
  message: EditOpenAIConfigEvent,
  workspaceRoot: string
): Promise<void> {
  await updateOpenAIConfig(message);
  await handleGenerate(
    chatPanel,
    { type: "generate", ...message.generateUserInput },
    workspaceRoot
  );
}
