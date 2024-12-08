import { getModel } from "codespin/dist/settings/getModel.js";
import { readCodeSpinConfig } from "codespin/dist/settings/readCodeSpinConfig.js";
import { promises as fs } from "fs";
import * as path from "path";
import { getFilesRecursive } from "../../../fs/getFilesRecursive.js";
import { getConventions } from "../../../settings/conventions/getCodingConventions.js";
import { getWorkspaceRoot } from "../../../vscode/getWorkspaceRoot.js";
import { ChatPanel } from "../ChatPanel.js";
import { StartChatEvent as StartChatEvent } from "../types.js";
import { StartChatPageProps } from "../html/pages/start/StartChat.js";
import { createChatNavigator } from "../createChatNavigator.js";

export async function handleNewChat(
  chatPanel: ChatPanel,
  message: StartChatEvent
): Promise<void> {
  const workspaceRoot = getWorkspaceRoot(chatPanel.context);
  const conventions = await getConventions(workspaceRoot);

  const codespinConfig = await readCodeSpinConfig(undefined, workspaceRoot);
  const selectedModel = await getModel([codespinConfig.model], codespinConfig);
  const allPaths = await getFilesRecursive(message.args, workspaceRoot);

  const fileDetails = (
    await Promise.all(
      allPaths.map(async (filePath) => {
        const size = (await fs.stat(filePath)).size;
        return {
          path: path.relative(workspaceRoot, filePath),
          size,
          includeOption: "source" as "source",
        };
      })
    )
  ).sort((a, b) => a.path.localeCompare(b.path));

  const pageProps: StartChatPageProps = {
    includedFiles: fileDetails,
    codingConventions: conventions,
    models: codespinConfig.models ?? [],
    selectedModel: selectedModel.alias ?? selectedModel.name,
    prompt: message.prompt ?? "",
    codingConvention: undefined,
  };

  const navigate = createChatNavigator(chatPanel);
  await navigate("/start", pageProps);
}
