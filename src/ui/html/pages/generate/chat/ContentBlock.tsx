import * as React from "react";
import { ContentItem } from "./types.js";

type Props = {
  block: ContentItem;
};

export function ContentBlock({ block }: Props) {
  const baseBlockStyles =
    "rounded-lg p-4 mb-4 border bg-zinc-800 border-zinc-700 text-zinc-100";

  switch (block.type) {
    case "file-heading":
      return (
        <div data-block-type="file-heading" className={baseBlockStyles}>
          <div className="mb-2 font-mono">File: {block.path}</div>
          <pre className="whitespace-pre-wrap m-0 font-mono">
            {block.content}
          </pre>
        </div>
      );

    case "code":
      return (
        <div data-block-type="code" className={baseBlockStyles}>
          <pre className="m-0 font-mono">{block.content}</pre>
        </div>
      );

    case "text":
    default:
      return (
        <div data-block-type="text" className={baseBlockStyles}>
          <pre className="whitespace-pre-wrap m-0 font-mono">
            {block.content}
          </pre>
        </div>
      );
  }
}
