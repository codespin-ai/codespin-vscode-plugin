import * as path from "path";
import * as fs from "fs/promises";
import { createDirIfMissing } from "../fs/createDirIfMissing.js";

export async function writeConfigFile(
  data: any,
  pathFragment: string,
  workspaceRoot: string
) {
  try {
    const fullPath = path.join(workspaceRoot, ".codespin", pathFragment);
    const dirPath = path.dirname(fullPath);

    await createDirIfMissing(dirPath);

    const dataAsString = JSON.stringify(data, null, 2);

    await fs.writeFile(fullPath, dataAsString, "utf8");

    return fullPath;
  } catch (error) {
    console.error("Error writing configuration file:", error);
    return undefined;
  }
}
