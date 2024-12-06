import { ChatPanel } from "../ChatPanel.js";

export function handleCancel(chatPanel: ChatPanel): void {
  if (chatPanel.cancelGeneration) {
    chatPanel.cancelGeneration();
  }
  chatPanel.dispose();
}
