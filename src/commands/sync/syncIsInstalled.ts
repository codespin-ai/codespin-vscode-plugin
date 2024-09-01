import { execSync } from "child_process";

let isSyncServerInstalled: boolean | null = null;

export function syncIsInstalled(): boolean {
  // Return the cached result if available
  if (isSyncServerInstalled !== null) {
    return isSyncServerInstalled;
  }

  try {
    // Try to execute the command to see if it's available
    execSync("which codespin-sync-server", { stdio: "ignore" });
    isSyncServerInstalled = true; // Cache the result as true
  } catch (error) {
    isSyncServerInstalled = false; // Cache the result as false
  }

  return isSyncServerInstalled;
}
