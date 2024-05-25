import { GoArgs } from "codespin/dist/commands/go.js";
import { GenerateCommitMessageEvent } from "./types.js";

export async function getGenCommitMessageArgs(
  args: GenerateCommitMessageEvent
): Promise<GoArgs> {
  const codespinGoArgs: GoArgs = {
    model: args.model,
    prompt: `Convert the following prompt into a single line git commit message. Return just that single line and no other text.\n\nPrompt is as follows:\n${args.prompt}`,
    template: undefined,
    config: undefined,
  };

  return codespinGoArgs;
}
