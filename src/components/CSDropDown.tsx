import * as React from "react";
import { VSCodeDropdown, VSCodeOption } from "@vscode/webview-ui-toolkit/react";
import { CSFormField } from "./CSFormField.js";

export type CSDropDownProps = {
  items: { text: string; value: string }[];
  dropdownStyle?: React.CSSProperties;
};

export function CSDropDown(props: CSDropDownProps) {
  return (
    <VSCodeDropdown style={props.dropdownStyle}>
      {props.items.map((item) => (
        <VSCodeOption value={item.value}>{item.text}</VSCodeOption>
      ))}
    </VSCodeDropdown>
  );
}
