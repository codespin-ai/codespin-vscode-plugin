export type ContentBlockType = "file-heading" | "text" | "code" | "markdown";

export type ContentItem = {
  id: string;
  type: ContentBlockType;
  content: string;
  path?: string;
};

export type Message = {
  role: "user" | "assistant";
  content: ContentItem;
};
