import * as os from "os";
import * as path from "path";
import { createDirIfMissing } from "../../fs/createDirIfMissing.js";
import { writeFile } from "fs/promises";

export type AnthropicConfigArgs = {
  apiKey: string;
};

export async function editAnthropicConfig(args: AnthropicConfigArgs) {
  const configDir = path.join(os.homedir(), ".codespin");
  await createDirIfMissing(configDir);
  const configFilePath = path.join(configDir, `anthropic.json`);

  const revisedConfig = {
    apiKey: args.apiKey,
  };

  await writeFile(
    configFilePath,
    JSON.stringify(revisedConfig, null, 2),
    "utf8"
  );
}
