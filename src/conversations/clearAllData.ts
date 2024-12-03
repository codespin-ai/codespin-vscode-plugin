import * as fs from "fs/promises";
import * as path from "path";

export async function clearAllData(conversationsDir: string): Promise<void> {
  try {
    const files = await fs.readdir(conversationsDir);
    await Promise.all(
      files.map((file) => fs.unlink(path.join(conversationsDir, file)))
    );
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      throw error;
    }
  }
}
