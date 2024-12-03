export default {
  content: ["./src/ui/**/*.{ts,tsx,html}"],
  theme: {
    extend: {
      colors: {
        "vscode-editor-background": "var(--vscode-editor-background)",
        "vscode-panel-border": "var(--vscode-panel-border)",
        "vscode-editor-foreground": "var(--vscode-editor-foreground)",
        "vscode-button-background": "var(--vscode-button-background)",
        "vscode-button-foreground": "var(--vscode-button-foreground)",
        "vscode-button-hover-background":
          "var(--vscode-button-hoverBackground)",
        "vscode-dropdown-background": "var(--vscode-dropdown-background)",
        "vscode-dropdown-border": "var(--vscode-dropdown-border)",
        "vscode-input-background": "var(--vscode-input-background)",
        "vscode-input-foreground": "var(--vscode-input-foreground)",
        "vscode-input-border": "var(--vscode-input-border)",
        "vscode-focusBorder": "var(--vscode-focusBorder)",
        "vscode-textLink-foreground": "var(--vscode-textLink-foreground)",
        "vscode-textLink-activeForeground":
          "var(--vscode-textLink-activeForeground)",
      },
      fontFamily: {
        "vscode-editor": "var(--vscode-editor-font-family)",
      },
    },
  },
};
