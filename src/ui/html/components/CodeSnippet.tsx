import * as React from "react";

export type CodeSnippetProps = {
  filePath: string;
  code: string;
  codeHtml: string;
};

export function CodeSnippet(props: CodeSnippetProps) {
  return (
    <div key={`file-gen-${props.filePath}`}>
      <h3 style={{ fontSize: "14px", fontWeight: "normal" }}>
        {props.filePath}
      </h3>
      <div style={{ padding: "1em", background: "black" }}>
        <div
          style={{
            padding: "0.5em 1em 0.5em 1em",
            borderRadius: "4px",
          }}
          dangerouslySetInnerHTML={{
            __html: props.codeHtml,
          }}
        />
      </div>
    </div>
  );
}
