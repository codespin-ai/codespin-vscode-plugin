import {
  VSCodeButton,
  VSCodePanelTab,
  VSCodePanelView,
  VSCodePanels,
  VSCodeTextArea,
} from "@vscode/webview-ui-toolkit/react/index.js";
import * as React from "react";
import { HistoryEntryPageArgs } from "./HistoryEntryPageArgs.js";

export function HistoryEntry() {
  const args: HistoryEntryPageArgs = history.state;

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  return (
    <div>
      <VSCodePanels>
        <VSCodePanelTab>PROMPT</VSCodePanelTab>
        <VSCodePanelTab>RAW</VSCodePanelTab>
        <VSCodePanelTab>DIFF</VSCodePanelTab>
        <VSCodePanelTab>COMMIT</VSCodePanelTab>
        <VSCodePanelView>
          Here we need to show the prompt, and print each file's generated output
        </VSCodePanelView>
        <VSCodePanelTab>
          Print the raw prompt which was sent to the LLM
        </VSCodePanelTab>
        <VSCodePanelTab>
          Show the diffs of all files (ie, between generated and original)
          You can import the function getDiffForContent from "./lib/getDiff.js"
        </VSCodePanelTab>
        <VSCodePanelTab>
          Leave this tab empty for now. We'll do this later.
        </VSCodePanelTab>
      </VSCodePanels>
    </div>
  );
}
