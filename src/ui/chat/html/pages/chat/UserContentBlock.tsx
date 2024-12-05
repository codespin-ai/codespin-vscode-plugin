import * as React from "react";
import { UserMessage } from "../../../../../conversations/types.js";

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
  for (const content of message.content) {
    switch (content.type) {
      case "image":
        return <></>;
      case "text":
        return (
          <div data-block-type="user-text" className="pre-text">
            <pre>{content.text}</pre>
          </div>
        );
    }
  }
}
