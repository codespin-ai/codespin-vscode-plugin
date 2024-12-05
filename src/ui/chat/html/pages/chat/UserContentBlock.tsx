import * as React from "react";
import { UserMessage } from "../../../../../conversations/types.js";
import { formatFileSize } from "../../../../../fs/formatFileSize.js";

type Props = {
  message: UserMessage;
};

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "markdown-component": any;
    }
  }
}

export function UserContentBlock({ message }: Props) {
  return (
    <div>
      {message.content.map((content, index) => {
        switch (content.type) {
          case "image":
            return <></>; // Keep existing image handling
          case "text":
            return (
              <div key={index} data-block-type="user-text" className="pre-text">
                <pre>{content.text}</pre>
              </div>
            );
          case "file":
            return (
              <div key={index} className="user-file-block">
                <div className="file-header text-sm opacity-70">
                  {content.path}
                </div>
              </div>
            );
        }
      })}
    </div>
  );
}
