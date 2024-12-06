import { setDefaultModel } from "../../../settings/models/setDefaultModel.js";
import { ModelChangeEvent } from "../types.js";

export async function handleModelChange(
  message: ModelChangeEvent,
  workspaceRoot: string
): Promise<void> {
  await setDefaultModel(message.model, workspaceRoot);
}