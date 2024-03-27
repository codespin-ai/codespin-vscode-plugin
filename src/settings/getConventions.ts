import { existsSync, readdirSync } from "fs";
import { join } from "path";

export async function getConventions(
  workspaceRoot: string
): Promise<Array<{ extension: string; description: string }>> {
  const conventionsDir = join(workspaceRoot, ".codespin", "conventions");
  if (!existsSync(conventionsDir)) {
    return [];
  }

  const conventions: Array<{ extension: string; description: string }> = [];
  const files = readdirSync(conventionsDir);
  for (const file of files) {
    const [extension, _] = file.split(".");
    const description = getType(extension);
    conventions.push({ extension, description });
  }
  return conventions;
}

function getType(extension: string): string {
  const knownTypes = {
    ts: "TypeScript",
    py: "Python",
    js: "JavaScript",
    java: "Java",
    cpp: "C++",
    cs: "C#",
    rb: "Ruby",
    go: "Go",
    rs: "Rust",
    swift: "Swift",
    kt: "Kotlin",
    php: "PHP",
  };
  return (knownTypes as any)[extension] || extension;
}
