import * as codespin from "codespin";
import {
  Conversation,
  UserMessage,
  UserTextContent,
} from "../../conversations/types.js";
import { getCodingConventionPath } from "../../settings/conventions/getCodingConventionPath.js";

type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] };

export async function getGenerateArgs(
  conversation: Conversation,
  workspaceRoot: string
): Promise<WithRequired<codespin.commands.GenerateArgs, "model">> {
  const userMessage = conversation.messages[0] as UserMessage;
  const prompt = (userMessage.content[0] as UserTextContent).text;
  const includedFiles =
    userMessage.content[1]?.type === "files"
      ? userMessage.content[1].includedFiles.map((file) => file.path)
      : [];

  const codespinGenerateArgs: WithRequired<codespin.commands.GenerateArgs, "model"> = {
    prompt,
    model: conversation.model,
    write: false,
    include: includedFiles,
    spec: conversation.codingConvention
      ? await getCodingConventionPath(
          conversation.codingConvention,
          workspaceRoot
        )
      : undefined,
    reloadProviderConfig: true,
  };

  return codespinGenerateArgs;
}
