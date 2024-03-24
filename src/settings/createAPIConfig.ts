import * as os from "os";
import * as path from "path";
import * as fs from "fs";
import { createDirIfMissing } from "../fs/createDirIfMissing.js";

export type CreateAPIConfigArgs = {
  api: string;
  apiKey: string;
  vendor: string;
  completionsEndpoint: string;
};

export async function createAPIConfig(args: CreateAPIConfigArgs) {
  const configDir = path.join(os.homedir(), ".codespin");
  await createDirIfMissing(configDir);
  const configFilePath = path.join(configDir, `${args.api}.json`);

  const revisedConfig =
    args.api === "openai"
      ? {
          apiKey: args.apiKey,
          authType: args.vendor === "azure" ? "API_KEY" : undefined,
          completionsEndpoint: args.completionsEndpoint,
        }
      : args.api === "anthropic"
      ? {
          apiKey: args.apiKey,
        }
      : {};

  fs.writeFileSync(
    configFilePath,
    JSON.stringify(revisedConfig, null, 2),
    "utf8"
  );
}
