import { UIPanel } from "../ui/UIPanel.js";
import { generate } from "./generate.js";

export async function processEvent(
  message: { type: string },
  panel: UIPanel
): Promise<void> {
  switch (message.type) {
    case "generate":
      return generate(message as any, panel);
    default:
      return;
  }
}
