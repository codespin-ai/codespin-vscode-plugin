export default {
  content: ["./src/ui/html/**/*.{ts,tsx,html}"],
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
      typography: {
        DEFAULT: {
          css: {
            "--tw-prose-body": "var(--vscode-editor-foreground)",
            "--tw-prose-headings": "var(--vscode-editor-foreground)",
            "--tw-prose-lead": "var(--vscode-editor-foreground)",
            "--tw-prose-links": "var(--vscode-textLink-foreground)",
            "--tw-prose-bold": "var(--vscode-editor-foreground)",
            "--tw-prose-counters": "var(--vscode-editor-foreground)",
            "--tw-prose-bullets": "var(--vscode-editor-foreground)",
            "--tw-prose-hr": "var(--vscode-panel-border)",
            "--tw-prose-quotes": "var(--vscode-editor-foreground)",
            "--tw-prose-quote-borders": "var(--vscode-panel-border)",
            "--tw-prose-captions": "var(--vscode-editor-foreground)",
            "--tw-prose-code": "var(--vscode-editor-foreground)",
            "--tw-prose-pre-code": "var(--vscode-editor-foreground)",
            "--tw-prose-pre-bg": "var(--vscode-input-background)",
            "--tw-prose-th-borders": "var(--vscode-panel-border)",
            "--tw-prose-td-borders": "var(--vscode-panel-border)",
            p: {
              fontSize: "1em",
              lineHeight: "1.25",
              margin: "0 0 0.25em 0",
              padding: 0,
            },
            ul: {
              margin: "0 0 0.25em 0",
              lineHeight: "1",
            },
            ol: {
              marginTop: "0.25em",
              marginBottom: "0.25em",
              lineHeight: "1",
            },
            li: {
              marginTop: "0",
              marginBottom: "0",
              lineHeight: "1",
            },
            h1: {
              lineHeight: "1",
            },
            h2: {
              lineHeight: "1",
            },
            h3: {
              lineHeight: "1",
            },
            h4: {
              lineHeight: "1",
            },
            h5: {
              lineHeight: "1",
            },
            h6: {
              lineHeight: "1",
            },
            blockquote: {
              lineHeight: "1",
            },
            "> * + *": {
              marginTop: "0.25em",
            },
          },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
