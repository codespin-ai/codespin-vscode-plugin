export default {
  content: ["./src/ui/html/**/*.{ts,tsx,html}"],
  theme: {
    extend: {
      colors: {
        "vscode-editor-background": "var(--vscode-editor-background)",
        "vscode-panel-border": "var(--vscode-panel-border)",
        "vscode-editor-foreground": "var(--vscode-editor-foreground)",
      },
      fontFamily: {
        "vscode-editor": "var(--vscode-editor-font-family)",
      },
    },
  },
  plugins: [],
};
