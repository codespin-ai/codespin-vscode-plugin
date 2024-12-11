import * as React from "react";
import { UserMessage } from "../../../../../../conversations/types.js";
import { formatFileSize } from "../../../../../../fs/formatFileSize.js";

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
    <div className="user-messages-list">
      {message.content.map((content, index) => {
        switch (content.type) {
          case "image":
            return <></>; // Keep existing image handling
          case "text":
            return (
              <div key={index} data-block-type="user-text" className="markdown">
                <div
                  dangerouslySetInnerHTML={{
                    __html: `${content.html}`,
                  }}
                />
              </div>
            );
          case "files":
            return (
              <div key={index} className="user-files-block">
                <ul className="file-attachment">
                  {content.includedFiles.map((file) => (
                    <li>{file.path}</li>
                  ))}
                </ul>
              </div>
            );
        }
      })}
    </div>
  );
}
