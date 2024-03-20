import * as React from "react";
import { VSCodeTextArea } from "@vscode/webview-ui-toolkit/react";
import { CSFormField } from "./CSFormField.js";

export type CSTextAreaProps = {
  rows: number;
  cols: number;
  defaultValue?: string;
  textareaStyle?: React.CSSProperties;
  resize?: "none" | "vertical" | "horizontal" | "both";
};

export function CSTextArea(props: CSTextAreaProps) {
  return (
    <VSCodeTextArea
      rows={props.rows}
      cols={props.cols}
      defaultValue={props.defaultValue}
      style={props.textareaStyle}
      resize={props.resize}
    ></VSCodeTextArea>
  );
}
