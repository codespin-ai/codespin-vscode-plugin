import { SourceFile } from "codespin/dist/sourceCode/SourceFile.js";

export type FileVersions = "current" | "HEAD";

export type ResponseStreamArgs = {
  data: string;
};

export type ResponseStreamEvent = {
  type: "responseStream";
} & ResponseStreamArgs;

export type ProcessedStreamingFileParseResult =
  | {
      type: "text";
      content: string;
    }
  | {
      type: "end-file-block";
      file: SourceFile;
      html: string;
    }
  | {
      type: "start-file-block";
      path: string;
    }
  | {
      type: "markdown";
      content: string;
      html: string;
    };

export type FileResultStreamArgs = {
  data: ProcessedStreamingFileParseResult;
};

export type FileResultStreamEvent = {
  type: "fileResultStream";
} & FileResultStreamArgs;

export type DoneEvent = {
  type: "done";
};

export type StartChatUserInput = {
  model: string;
  codingConvention: string | undefined;
  prompt: string;
  includedFiles: Array<{
    path: string;
    size: number;
  }>;
};

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
  startChatUserInput: StartChatUserInput;
}

export interface EditOpenAIConfigEvent {
  type: "editOpenAIConfig";
  apiKey: string;
  startChatUserInput: StartChatUserInput;
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

export interface StartChatEvent extends StartChatUserInput {
  type: "startChat";
}

export interface CancelEvent {
  type: "cancel";
}
