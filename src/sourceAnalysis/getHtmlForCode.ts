import { codeToHtml } from "shiki";

export async function getHtmlForCode(
  code: string,
  lang: string
): Promise<string> {
  return await codeToHtml(code, {
    lang,
    theme: "vitesse-black",
  });
}
