type EditProviderConfigPageArgs = {
  provider: "openai" | "anthropic" | "google";
  [key: string]: string;
};
