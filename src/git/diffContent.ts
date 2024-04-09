import { html as diff2Html } from "diff2html";
import { execString } from "../process/execString.js";

// Function to compare two files using Git and generate HTML diff
export async function diffContent(
  originalFilePath: string | undefined,
  newFilePath: string,
  workingDir: string
) {
  try {
    console.log({
      MXFG: originalFilePath,
    });
    const diffCommand = originalFilePath
      ? `git -P diff --no-index -- ${originalFilePath} ${newFilePath}`
      : `git -P diff --no-index /dev/null ${newFilePath}`;

    console.log(
      JSON.stringify({
        diffCommand,
      })
    );

    // Execute the git diff command
    const diffOutput = await execString(diffCommand, workingDir);

    console.log("GOTYA");

    console.log({
      diffOutput,
    });

    if (!diffOutput) {
      // If there's no diff, it means the files are identical or the new file is empty
      return "No changes detected.";
    }

    return diffOutput;

    // // Convert the git diff output to HTML using diff2html
    // const htmlOutput = diff2Html(diffOutput, {
    //   drawFileList: true,
    //   matching: "lines",
    //   outputFormat: "side-by-side",
    // });

    // return htmlOutput;
  } catch (error) {
    console.error(
      "Error generating HTML from git diff:",
      (error as any).message
    );
    throw error;
  }
}
