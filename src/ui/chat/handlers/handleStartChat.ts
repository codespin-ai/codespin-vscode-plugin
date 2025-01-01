import * as codespin from "codespin";
import { promises as fs } from "fs";
import * as path from "path";
import { getFilesRecursive } from "../../../fs/getFilesRecursive.js";
import { getConventions } from "../../../settings/conventions/getCodingConventions.js";
import { getWorkspaceRoot } from "../../../vscode/getWorkspaceRoot.js";
import { ChatPanel } from "../ChatPanel.js";
import { StartChatEvent as StartChatEvent } from "../types.js";
import { StartChatPageProps } from "../html/pages/start/StartChat.js";
import { createChatNavigator } from "../createChatNavigator.js";
import { getProviders } from "libllm";

export async function handleNewChat(
  chatPanel: ChatPanel,
  message: StartChatEvent
): Promise<void> {
  const workspaceRoot = getWorkspaceRoot(chatPanel.context);
  const conventions = await getConventions(workspaceRoot);

  const codespinConfig = await codespin.settings.readCodeSpinConfig(
    undefined,
    workspaceRoot
  );
  const allPaths = await getFilesRecursive(message.args, workspaceRoot);

  const configDirs = await codespin.settings.getConfigDirs(
    undefined,
    workspaceRoot
  );

  const models = (
    await Promise.all(
      getProviders()
        .map((provider) =>
          provider.getAPI(
            configDirs.configDir,
            configDirs.globalConfigDir,
            codespin.console.getLoggers()
          )
        )
        .map((api) => api.getModels())
    )
  ).flat();

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
    models,
    includedFiles: fileDetails,
    codingConventions: conventions,
    selectedModel: codespinConfig.model,
    prompt: message.prompt ?? "",
    codingConvention: undefined,
  };

  const navigate = createChatNavigator(chatPanel);
  await navigate("/start", pageProps);
}
