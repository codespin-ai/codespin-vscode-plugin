import { GenerateArgs } from "codespin/dist/commands/generate.js";
import { GenerateCommitMessageEvent } from "./types.js";

export async function getGenCommitMessageArgs(
  args: GenerateCommitMessageEvent
): Promise<GenerateArgs> {
  const codespinGenerateArgs: GenerateArgs = {
    model: args.model,
    prompt: `Convert the following prompt into a single line git commit message. Return just that single line and no other text.\n\nPrompt is as follows:\n${args.prompt}`,
    write: false,
    go: true,
  };

  return codespinGenerateArgs;
}
