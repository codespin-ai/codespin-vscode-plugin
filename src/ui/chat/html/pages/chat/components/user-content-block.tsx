import { component, Component } from "magic-loop";
import { UserMessage } from "../../../../../../conversations/types.js";

type UserContentBlockProps = {
  message: UserMessage;
};

export async function* UserContentBlock(
  component: HTMLElement & Component & UserContentBlockProps
) {
  while (true) {
    const { message } = component;
    if (!message) {
      yield <div>No message to display</div>;
      continue;
    }

    yield (
      <div class="user-messages-list">
        {message.content.map((content, index) => {
          switch (content.type) {
            case "image":
              return <></>;
            case "text":
              return (
                <div key={index} data-block-type="user-text" class="markdown">
                  <div
                    dangerouslySetInnerHTML={{
                      __html: `${content.html}`,
                    }}
                  />
                </div>
              );
            case "files":
              return (
                <div key={index} class="user-files-block">
                  <ul class="file-attachment">
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
}

component("user-content-block", UserContentBlock, {
  // Initialize with an empty but valid UserMessage structure
  message: {
    role: "user",
    content: [],
  },
});
