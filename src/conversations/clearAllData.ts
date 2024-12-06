// clearAllData.ts
import * as fs from "fs/promises";
import * as path from "path";

export async function clearAllData(conversationsDir: string): Promise<void> {
  try {
    const items = await fs.readdir(conversationsDir);
    await Promise.all(
      items.map(async (item) => {
        const itemPath = path.join(conversationsDir, item);
        const stats = await fs.stat(itemPath);

        if (stats.isDirectory()) {
          // If it's a directory, remove all its contents first
          const files = await fs.readdir(itemPath);
          await Promise.all(
            files.map((file) => fs.unlink(path.join(itemPath, file)))
          );
          // Then remove the directory
          await fs.rmdir(itemPath);
        } else {
          // If it's a file (like conversations.json), remove it
          await fs.unlink(itemPath);
        }
      })
    );
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      throw error;
    }
  }
}
