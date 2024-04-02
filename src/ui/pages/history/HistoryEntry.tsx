// Import necessary React and VSCode UI toolkit components
import {
  VSCodeButton,
  VSCodePanelTab,
  VSCodePanelView,
  VSCodePanels,
  VSCodeTextArea,
} from "@vscode/webview-ui-toolkit/react/index.js";
import * as React from "react";
import { useEffect, useState } from "react";
import { diffContent } from "../../../git/diffContent.js";
import { getVsCodeApi } from "../../../vscode/getVsCodeApi.js";
import { CSFormField } from "../../components/CSFormField.js";
import { HistoryEntryPageArgs } from "./HistoryEntryPageArgs.js";
import { RegeneratePageArgs } from "./RegeneratePageArgs.js";

// HistoryEntry component definition
export function HistoryEntry() {
  const args: HistoryEntryPageArgs = history.state;

  const [commitMessage, setCommitMessage] = useState<string>("");
  const [diffs, setDiffs] = useState<Array<{ path: string; diff: string }>>([]);

  // Function to format date from timestamp
  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  // Function to fetch diffs asynchronously
  useEffect(() => {
    const fetchDiffs = async () => {
      if (!args.entry.files) {
        return;
      }
      const diffsPromises = args.entry.files.map(async (file) => ({
        path: file.path,
        diff: await diffContent(file.original, file.generated),
      }));
      const diffs = await Promise.all(diffsPromises);
      setDiffs(diffs);
    };

    fetchDiffs();
  }, [args.entry]);

  // const gatherArgsForRegenerateCommand = (): RegeneratePageArgs => {
  //   // Example data structure for files, models, conventions, and other properties.
  //   // You will need to replace these with actual data from your component's state,
  //   // props, or other sources as appropriate.
  //   const files = entry.userInput.includedFiles.map((file) => ({
  //     path: file.path,
  //     size: undefined, // Assuming size is not readily available; set appropriately.
  //   }));

  //   // Assuming you have a way to determine the models, selected model, and conventions.
  //   // These could be state variables, fetched data, etc.
  //   const models = [
  //     { name: "ModelName1", value: "ModelValue1" },
  //     // Add more models as necessary
  //   ];

  //   const selectedModel = "ModelName1"; // The model selected by the user or a default one

  //   const conventions = [
  //     {
  //       filename: "ExampleFilename",
  //       extension: ".ext",
  //       description: "Example coding convention",
  //     },
  //     // Add more coding conventions as necessary
  //   ];

  //   // Optional properties, populate as needed
  //   const prompt = entry.prompt; // Example: use the current entry's prompt
  //   const codegenTargets = "targets"; // Placeholder, set appropriately
  //   const codingConvention = "standard"; // Placeholder, set appropriately
  //   const fileVersion = "current"; // or 'HEAD', depending on your use case
  //   const includedFiles = [
  //     {
  //       path: "path/to/file",
  //       includeOption: "source", // or 'declaration', as applicable
  //     },
  //     // Add more included files as necessary
  //   ];

  //   // Assemble the args object
  //   return {
  //     files,
  //     models,
  //     selectedModel,
  //     conventions,
  //     prompt,
  //     codegenTargets,
  //     codingConvention,
  //     fileVersion,
  //     includedFiles,
  //   };
  // };

  // Function to post the commit message
  // const postCommit = () => {
  //   getVsCodeApi().postMessage({
  //     type: "command:codespin-ai.regenerate",
  //     args: gatherArgsForRegenerateCommand(),
  //   });
  // };

  // Render the component
  return (
    <div>
      <VSCodePanels>
        <VSCodePanelTab>PROMPT</VSCodePanelTab>
        <VSCodePanelTab>RAW</VSCodePanelTab>
        <VSCodePanelTab>DIFF</VSCodePanelTab>
        <VSCodePanelTab>COMMIT</VSCodePanelTab>
        <VSCodePanelView>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {
              <>
                <CSFormField>
                  <div
                    style={{
                      padding: "1em",
                      background: "black",
                      fontFamily: "var(--vscode-editor-font-family)",
                      borderRadius: "4px",
                    }}
                  >
                    {args.entry.prompt}
                  </div>
                </CSFormField>
                <CSFormField>
                  <VSCodeButton>Edit Prompt</VSCodeButton>
                </CSFormField>
                {Array.from(
                  Object.keys(args.formattedFiles).map((key) => (
                    <div key={`file-gen-${key}`}>
                      <h2 style={{ fontSize: "14px", marginTop: "1em" }}>
                        Generated Files
                      </h2>
                      <h3 style={{ fontSize: "14px", fontWeight: "normal" }}>
                        {key}
                      </h3>
                      <div
                        style={{
                          padding: "0.5em 1em 0.5em 1em",
                          background: "black",
                          borderRadius: "4px",
                        }}
                        dangerouslySetInnerHTML={{
                          __html: args.formattedFiles[key].generated,
                        }}
                      />
                    </div>
                  ))
                )}
              </>
            }
          </div>
        </VSCodePanelView>
        <VSCodePanelView>
          <div
            style={{
              padding: "1em",
              background: "black",
              fontFamily: "var(--vscode-editor-font-family)",
              borderRadius: "4px",
            }}
          >
            <pre>
              {/* Show the raw prompt */}
              {<div>{args.entry.rawPrompt}</div>}
            </pre>
          </div>
        </VSCodePanelView>
        <VSCodePanelView>
          {/* Show diffs of all files using the diffs state */}
          {diffs.map((diff, index) => (
            <div key={index}>
              <h3>{diff.path}</h3>
              <p>{diff.diff}</p>
            </div>
          ))}
        </VSCodePanelView>
        <VSCodePanelView>
          {/* Show commit message and provide a commit action */}
          <VSCodeTextArea value={commitMessage} readOnly />
          <VSCodeButton>Commit</VSCodeButton>
        </VSCodePanelView>
      </VSCodePanels>
    </div>
  );
}
