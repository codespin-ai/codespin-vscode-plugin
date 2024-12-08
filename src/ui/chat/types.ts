import { Conversation } from "../../conversations/types.js";

export type GenerateUserInput = {
  model: string;
  conversationId: string;
  codingConvention: string | undefined;
  prompt: string;
  includedFiles: Array<{
    path: string;
    size: number;
  }>;
};

export type NewConversationEvent = {
  type: "newConversation";
} & Omit<GenerateUserInput, "conversationId">;

export type OpenChatArgs = {
  conversation: Conversation;
  isNew: boolean;
};

export type OpenChatEvent = {
  type: "openChat";
} & OpenChatArgs;

export type CopyToClipboardUserInput = {
  prompt: string;
  codingConvention: string | undefined;
  includedFiles: {
    path: string;
  }[];
};

export type CopyToClipboardEvent = {
  type: "copyToClipboard";
} & CopyToClipboardUserInput;

export interface AddDepsEvent {
  type: "addDeps";
  file: string;
  model: string;
}

export interface EditAnthropicConfigEvent {
  type: "editAnthropicConfig";
  apiKey: string;
  conversation: Conversation;
}

export interface EditOpenAIConfigEvent {
  type: "editOpenAIConfig";
  apiKey: string;
  conversation: Conversation;
}

export interface MarkdownToHtmlEvent {
  type: "markdownToHtml";
  content: string;
}

export interface ModelChangeEvent {
  type: "modelChange";
  model: string;
}

export interface OpenFileEvent {
  type: "openFile";
  file: string;
}

export interface SourceCodeToHtmlEvent {
  type: "sourceCodeToHtml";
  filePath: string;
  content: string;
}

export type GenerateArgs = {
  conversation: Conversation;
};

export type GenerateEvent = {
  type: "generate";
} & GenerateArgs;

export interface CancelEvent {
  type: "cancel";
}

// New event types for chat initialization
export interface OpenExistingConversationEvent {
  type: "openExistingConversation";
  conversation: Conversation;
}

export interface StartChatEvent {
  type: "startChat";
  prompt?: string;
  args: string[]; // file paths
}
