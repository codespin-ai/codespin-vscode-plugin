import * as React from "react";
import { VSCodeDropdown, VSCodeOption } from "@vscode/webview-ui-toolkit/react";
import { CSFormField } from "./CSFormField.js";

export type CSDropDownProps = {
  items: { text: string; value: string }[];
  selectedItem?: string;
  dropdownStyle?: React.CSSProperties;
};

export function CSDropDown(props: CSDropDownProps) {
  console.log({
    x: props.selectedItem,
  });
  return (
    <VSCodeDropdown
      style={props.dropdownStyle}
      currentValue={props.selectedItem}
    >
      {props.items.map((item) => (
        <VSCodeOption key={item.value} value={item.value}>
          {item.text}
        </VSCodeOption>
      ))}
    </VSCodeDropdown>
  );
}
