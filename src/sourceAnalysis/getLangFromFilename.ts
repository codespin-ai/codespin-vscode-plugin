// getLangFromFilename.ts

/**
 * Gets the programming language from a filename based on its extension.
 * Supports a broad range of languages recognized by Markdown syntax highlighting via Highlight.js.
 *
 * @param filePath The name of the file, including its extension.
 * @returns The programming language or 'unknown' if not recognized.
 */
export function getLangFromFilename(filePath: string): string {
  // Expanded mapping of file extensions to programming languages
  const extensionToLang: { [key: string]: string } = {
    // JavaScript and alternatives
    js: "javascript",
    mjs: "javascript",
    jsx: "javascript",
    // TypeScript and alternatives
    ts: "typescript",
    tsx: "typescript",
    // Python
    py: "python",
    // Java
    java: "java",
    // C++
    cpp: "cpp",
    cxx: "cpp",
    cc: "cpp",
    h: "cpp",
    hpp: "cpp",
    // C#
    cs: "csharp",
    // Ruby
    rb: "ruby",
    // Go
    go: "go",
    // Rust
    rs: "rust",
    // PHP
    php: "php",
    php3: "php",
    php4: "php",
    php5: "php",
    phtml: "php",
    // HTML
    html: "html",
    htm: "html",
    // CSS
    css: "css",
    // Markdown
    md: "markdown",
    markdown: "markdown",
    // JSON
    json: "json",
    // XML
    xml: "xml",
    // YAML
    yml: "yaml",
    yaml: "yaml",
    // SQL
    sql: "sql",
    // Swift
    swift: "swift",
    // Kotlin
    kt: "kotlin",
    kts: "kotlin",
    // Scala
    scala: "scala",
    // Perl
    pl: "perl",
    pm: "perl",
    // Objective-C
    m: "objectivec",
    // Groovy
    groovy: "groovy",
    // Dart
    dart: "dart",
    // Assembly
    asm: "assembly",
    s: "assembly",
    // Lua
    lua: "lua",
    // Clojure
    clj: "clojure",
    cljs: "clojure",
    cljc: "clojure",
    // Haskell
    hs: "haskell",
    lhs: "haskell",
    // Erlang
    erl: "erlang",
    hrl: "erlang",
    // Shell scripts
    sh: "bash",
    bash: "bash",
    // PowerShell
    ps1: "powershell",
    psm1: "powershell",
    psd1: "powershell",
    // R
    r: "r",
    R: "r",
    // Julia
    jl: "julia",
  };

  // Extract the file extension
  const extension = filePath.split(".").pop()?.toLowerCase() || "";

  // Return the corresponding language, or 'unknown' if not found
  return extensionToLang[extension] || "unknown";
}
