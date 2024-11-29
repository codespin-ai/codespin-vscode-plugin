import {
  bundledLanguages,
  getSingletonHighlighter,
  type BundledTheme,
} from "shiki";
import * as vscode from "vscode";

function getCurrentVSCodeTheme(): BundledTheme {
  const theme = vscode.workspace
    .getConfiguration("workbench")
    .get("colorTheme");

  // Map VS Code theme to a valid Shiki theme
  switch (theme) {
    case "Default Dark+":
    case "Default Dark Modern":
      return "github-dark";
    case "Default Light+":
    case "Default Light Modern":
      return "github-light";
    // Add more mappings as needed
    default:
      return "github-dark"; // Safe fallback
  }
}

export async function getHtmlForCode(
  code: string,
  lang: string
): Promise<string> {
  try {
    const currentTheme = getCurrentVSCodeTheme();
    const highlighter = await getSingletonHighlighter({
      themes: [currentTheme],
      langs: Object.keys(bundledLanguages),
    });

    return highlighter.codeToHtml(code, {
      lang,
      theme: currentTheme,
    });
  } catch (ex: any) {
    return code;
  }
}
