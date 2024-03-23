export type EditProviderConfigArgs = {
  provider: "openai" | "anthropic" | "google";
  [key: string]: string | undefined;
};
