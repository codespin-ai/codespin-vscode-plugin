import { existsSync, readdirSync, readFileSync } from "fs";
import { join } from "path";
import matter = require("gray-matter");
import { CodingConvention } from "./CodingConvention.js";

export async function getConventions(
  workspaceRoot: string
): Promise<Array<CodingConvention>> {
  const conventionsDir = join(workspaceRoot, ".codespin", "conventions");

  return existsSync(conventionsDir)
    ? readdirSync(conventionsDir)
        .filter((file) => file.endsWith(".md")) // Select only Markdown files
        .map((file) => {
          const filePath = join(conventionsDir, file);
          const fileContents = readFileSync(filePath, "utf8");
          const parsedContent = matter(fileContents);
          const autoSelectedConvention = autoSelectConvention(file);

          return {
            filename: file,
            extension:
              parsedContent.data.extension && parsedContent.data.extension
                ? parsedContent.data.extension
                : autoSelectedConvention?.extension || "$$unknown$$",
            description:
              parsedContent.data && parsedContent.data.description
                ? parsedContent.data.description
                : autoSelectedConvention?.description || file,
          };
        })
    : [];
}

const knownTypes = {
  ts: "TypeScript",
  py: "Python",
  js: "JavaScript",
  jsx: "JSX (React)",
  java: "Java",
  cpp: "C++",
  c: "C",
  cs: "C#",
  rb: "Ruby",
  go: "Go",
  rs: "Rust",
  swift: "Swift",
  kt: "Kotlin",
  php: "PHP",
  lua: "Lua",
  pl: "Perl",
  scm: "Scheme",
  clj: "Clojure",
  hs: "Haskell",
  erl: "Erlang",
  elixir: "Elixir",
  sh: "Shell",
  bash: "Bash",
  ps1: "PowerShell",
  bat: "Batch",
  cmd: "Command",
  yaml: "YAML",
  yml: "YAML",
  json: "JSON",
  xml: "XML",
  toml: "TOML",
  ini: "INI",
  cfg: "Config",
  conf: "Config",
  properties: "JavaProps",
  sql: "SQL",
  md: "Markdown",
  r: "R",
  dart: "Dart",
  groovy: "Groovy",
  gradle: "Gradle",
  m: "Obj-C",
  mm: "Obj-C++",
  h: "CHeader",
  hpp: "CppHeader",
  vb: "VB",
  fs: "F#",
  scala: "Scala",
  exs: "Elixir",
  ex: "Elixir",
  ml: "OCaml",
  mli: "OCaml",
  sml: "StdML",
  jl: "Julia",
  tex: "LaTeX",
  sty: "LaTeX",
  cls: "LaTeX",
  asm: "Assembly",
  s: "Assembly",
  vbs: "VBScript",
  tsx: "TSX",
  vue: "Vue.js",
  sass: "SASS",
  scss: "SCSS",
  less: "LESS",
  dockerfile: "Docker",
  makefile: "makefile",
  cmake: "cmake",
  nim: "Nim",
  crystal: "Crystal",
  prg: "xBase",
  p: "Pascal",
  pas: "Pascal",
  d: "D",
  ada: "Ada",
  for: "Fortran",
  f90: "Fortran90",
  f95: "Fortran95",
  cob: "COBOL",
  cobol: "COBOL",
  lsp: "LISP",
  cl: "Common Lisp",
  cljs: "Clojure Script",
  coffee: "Coffee Script",
  tsconfig: "TSConfig",
  gitignore: "gitignore",
  editorconfig: "editor",
  env: "env",
  htaccess: "Apache",
  patch: "patch",
};

function autoSelectConvention(
  filename: string
): { extension: string; description: string } | undefined {
  // Extract the file extension from the filename
  const extension = filename.split(".")[0];

  // Check if the extension exists in knownTypes and return the corresponding description
  if (extension && extension in knownTypes) {
    return {
      extension,
      description: (knownTypes as any)[extension],
    };
  }

  return undefined;
}
