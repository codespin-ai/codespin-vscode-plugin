import { BloomComponent } from "bloom-router";

type PropType<T> = T extends (
  component: HTMLElement & Component & infer P
) => any
  ? P
  : never;

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "chat-icon": PropType<typeof ChatIconComponent>;
      "copy-icon": PropType<typeof CopyIconComponent>;
      "generate-icon": PropType<typeof GenerateIconComponent>;
      "chat-header": PropType<typeof ChatHeaderComponent>;
      "message-input": PropType<typeof MessageInputComponent>;
      "message-list": PropType<typeof MessageListComponent>;
      resizer: PropType<typeof ResizerComponent>;
      "user-content-block": PropType<typeof UserContentBlockComponent>;
      "assistant-content-block": PropType<
        typeof AssistantContentBlockComponent
      >;
      "file-reference-popup": PropType<typeof FileReferencePopupComponent>;
      "action-buttons": PropType<typeof ActionButtonsComponent>;
      "coding-conventions-selector": PropType<
        typeof CodingConventionsSelectorComponent
      >;
      "file-list": PropType<typeof FileListComponent>;
      "model-selector": PropType<typeof ModelSelectorComponent>;
      "prompt-input": PropType<typeof PromptInputComponent>;
      "start-chat": PropType<typeof StartChatComponent>;
      "edit-config": PropType<typeof EditConfigComponent>;
      "edit-anthropic-config": PropType<typeof EditAnthropicConfigComponent>;
      "edit-openai-config": PropType<typeof EditOpenAIConfigComponent>;
      chat: PropType<typeof ChatComponent>;
    }
  }
}
