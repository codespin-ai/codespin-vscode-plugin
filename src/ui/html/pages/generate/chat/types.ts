// types.ts
export type FileHeadingContentItem = {
  type: "file-heading";
  id: string;
  path: string;
  content: string;
};

export type TextContentItem = {
  type: "text";
  id: string;
  content: string;
};

export type CodeContentItem = {
  type: "code";
  id: string;
  path: string;
  content: string;
  html: string;
};

export type MarkdownContentItem = {
  type: "markdown";
  id: string;
  content: string;
};

export type ContentItem =
  | FileHeadingContentItem
  | TextContentItem
  | CodeContentItem
  | MarkdownContentItem;

export type Message = {
  role: "user" | "assistant";
  content: ContentItem;
};
