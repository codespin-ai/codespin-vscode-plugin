import * as React from "react";

export type CSFormFieldProps = {
  label?: { text: string; for?: string };
  children?: React.ReactNode;
};

export function CSFormField(props: CSFormFieldProps) {
  return (
    <div style={{ marginBottom: "1em" }}>
      {props.label ? (
        <>
          <label
            style={{ display: "block", marginBottom: "4px" }}
            htmlFor={props.label.for}
          >
            {props.label.text}
          </label>
        </>
      ) : (
        <></>
      )}
      {props.children}
    </div>
  );
}
