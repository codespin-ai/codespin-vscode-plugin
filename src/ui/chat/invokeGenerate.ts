import * as codespin from "codespin";
import * as libllm from "libllm";
import { addMessage } from "../../conversations/addMessage.js";
import { AssistantMessage } from "../../conversations/types.js";
import { createMessageClient } from "../../ipc/messageClient.js";
import { markdownToHtml } from "../../markdown/markdownToHtml.js";
import { getHtmlForCode } from "../../sourceAnalysis/getHtmlForCode.js";
import { getLangFromFilename } from "../../sourceAnalysis/getLangFromFilename.js";
import { ChatPanel } from "./ChatPanel.js";
import { ChatPageBrokerType } from "./html/pages/chat/getMessageBroker.js";

export async function invokeGenerate(
  chatPanel: ChatPanel,
  conversationId: string,
  generateArgs: codespin.commands.GenerateArgs,
  workspaceRoot: string
): Promise<void> {
  // Send initial user message to chat page
  const chatPageMessageClient = createMessageClient<ChatPageBrokerType>(
    (message) => {
      chatPanel.getWebview().postMessage(message);
    }
  );

  let currentTextBlock = "";
  let currentAssistantMessage: AssistantMessage = {
    role: "assistant",
    content: [],
  };

  // Rest of the streaming callback remains the same
  generateArgs.fileResultStreamCallback = async (
    streamedBlock: libllm.types.StreamingFileParseResult
  ) => {
    if (streamedBlock.type === "start-file-block") {
      if (currentTextBlock !== "") {
        chatPageMessageClient.send("fileResultStream", {
          type: "fileResultStream",
          data: streamedBlock,
        });
      }
      currentTextBlock = "";
    } else if (streamedBlock.type === "end-file-block") {
      currentTextBlock = "";
      const lang = getLangFromFilename(streamedBlock.file.path);
      const html = await getHtmlForCode(streamedBlock.file.content, lang);

      const data = {
        ...streamedBlock,
        html,
      };

      chatPageMessageClient.send("fileResultStream", {
        type: "fileResultStream",
        data,
      });

      currentAssistantMessage.content.push({
        type: "code",
        id: Math.random().toString(36).substring(2, 9),
        path: streamedBlock.file.path,
        content: streamedBlock.file.content,
        html,
      });
    } else if (streamedBlock.type === "text") {
      currentTextBlock = currentTextBlock + streamedBlock.content;
      chatPageMessageClient.send("fileResultStream", {
        type: "fileResultStream",
        data: streamedBlock,
      });
    } else if (streamedBlock.type === "text-block") {
      const html = await markdownToHtml(streamedBlock.content);

      chatPageMessageClient.send("fileResultStream", {
        type: "fileResultStream",
        data: {
          type: "markdown",
          content: streamedBlock.content,
          html,
        },
      });

      currentAssistantMessage.content.push({
        type: "markdown",
        id: Math.random().toString(36).substring(2, 9),
        content: streamedBlock.content,
        html,
      });
    }
  };

  await codespin.commands.generate(generateArgs, {
    workingDir: workspaceRoot,
  });

  // Add assistant's response to conversation if there is content
  if (currentAssistantMessage.content.length > 0) {
    await addMessage(
      {
        conversationId,
        message: currentAssistantMessage,
      },
      workspaceRoot
    );
  }

  // Send done event to chat UI
  chatPageMessageClient.send("done", undefined);
}
