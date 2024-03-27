import { existsSync, readdirSync, readFileSync } from "fs";
import { join } from "path";
import matter = require("gray-matter");

export async function getConventions(
  workspaceRoot: string
): Promise<Array<{ filename: string; description: string }>> {
  const conventionsDir = join(workspaceRoot, ".codespin", "conventions");

  return existsSync(conventionsDir)
    ? readdirSync(conventionsDir)
        .filter((file) => file.endsWith(".md")) // Select only Markdown files
        .map((file) => {
          const filePath = join(conventionsDir, file);
          const fileContent = readFileSync(filePath, "utf8");
          const parsedContent = matter(fileContent);
          const description =
            parsedContent.data && parsedContent.data.description
              ? parsedContent.data.description
              : getDescription(file);
          return { filename: file, description };
        })
    : [];
}

const knownTypes = {
  ts: "TypeScript",
  py: "Python",
  js: "JavaScript",
  jsx: "JavaScript XML (React)",
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
  sh: "Shell Script",
  bash: "Bash Script",
  ps1: "PowerShell",
  bat: "Batch File",
  cmd: "Command File",
  yaml: "YAML",
  yml: "YAML (alternative extension)",
  json: "JSON",
  xml: "XML",
  toml: "TOML",
  ini: "INI",
  cfg: "Configuration File",
  conf: "Configuration File (alternative extension)",
  properties: "Java Properties",
  sql: "SQL Script",
  md: "Markdown",
  r: "R",
  dart: "Dart",
  groovy: "Groovy",
  gradle: "Gradle Script",
  m: "Objective-C",
  mm: "Objective-C++",
  h: "C Header",
  hpp: "C++ Header",
  vb: "Visual Basic",
  fs: "F#",
  scala: "Scala",
  exs: "Elixir Script",
  ex: "Elixir",
  ml: "OCaml",
  mli: "OCaml Interface",
  sml: "Standard ML",
  jl: "Julia",
  tex: "LaTeX",
  sty: "LaTeX Style",
  cls: "LaTeX Class",
  asm: "Assembly Language",
  s: "Assembly Language (alternative extension)",
  vbs: "VBScript",
  tsx: "TypeScript XML (React with TypeScript)",
  vue: "Vue.js Single-File Component",
  sass: "SASS",
  scss: "SCSS",
  less: "LESS",
  styl: "Stylus",
  dockerfile: "Docker Configuration",
  makefile: "Makefile",
  cmake: "CMake Listfile",
  nim: "Nim",
  crystal: "Crystal",
  prg: "xBase",
  p: "Pascal",
  pas: "Pascal (alternative extension)",
  d: "D",
  ada: "Ada",
  for: "Fortran",
  f90: "Fortran 90",
  f95: "Fortran 95",
  cob: "COBOL",
  cobol: "COBOL (alternative extension)",
  lsp: "LISP",
  cl: "Common Lisp",
  cljs: "ClojureScript",
  coffee: "CoffeeScript",
  tsconfig: "TypeScript Configuration",
  gitignore: "Git Ignore File",
  editorconfig: "Editor Configuration",
  env: "Environment Variables File",
  htaccess: "Apache Configuration",
  log: "Log File",
  patch: "Patch File",
};

function getDescription(filename: string): string {
  // Extract the file extension from the filename
  const extension = filename.split(".")[0];

  // Check if the extension exists in knownTypes and return the corresponding description
  if (extension && extension in knownTypes) {
    return (knownTypes as any)[extension];
  }

  // If the extension is not found in knownTypes, return "Unknown Convention"
  return "Unknown Convention";
}
