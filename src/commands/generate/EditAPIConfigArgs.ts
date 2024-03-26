export type EditAPIConfigArgs = {
  api: "openai" | "anthropic" | "google";
  [key: string]: string | undefined;
};
