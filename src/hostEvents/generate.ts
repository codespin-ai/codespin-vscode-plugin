import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { UIPanel } from "../vscode/UIPanel.js";
import { GenerateEventArgs } from "./GenerateEventArgs.js";

export async function generate(message: GenerateEventArgs, panel: UIPanel) {
  console.log(message);
  // Extract the model provider from the message
  const modelProvider = message.model.split(":")[0];

  // Construct the path to the config file
  const configFilePath = path.join(
    os.homedir(),
    ".codespin",
    `${modelProvider}.json`
  );

  // Check if the config file exists
  if (!fs.existsSync(configFilePath)) {
    // If the file doesn't exist, navigate to the config page
    await panel.navigateTo(`configs/${modelProvider}`);
  } else {
    // If the file exists, proceed with generation
    console.log("GENERATING!");
    // Here, you would add your logic to handle the generation process
  }
}
