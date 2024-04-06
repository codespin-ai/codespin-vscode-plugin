import * as os from "os";
import * as path from "path";
import { createDirIfMissing } from "../../fs/createDirIfMissing.js";
import { writeFile } from "fs/promises";

export type OpenAIConfigArgs = {
  apiKey: string;
};

export async function editOpenAIConfig(args: OpenAIConfigArgs) {
  const configDir = path.join(os.homedir(), ".codespin");
  await createDirIfMissing(configDir);
  const configFilePath = path.join(configDir, `openai.json`);

  const revisedConfig = {
    apiKey: args.apiKey,
  };

  await writeFile(
    configFilePath,
    JSON.stringify(revisedConfig, null, 2),
    "utf8"
  );
}
