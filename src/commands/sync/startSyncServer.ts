import { exec } from "child_process";

// Function to start the sync server
export function startSyncServer() {
  const serverProcess = exec(
    "codespin-sync-server",
    (error, stdout, stderr) => {
      if (error) {
        console.error(`Error starting server: ${error.message}`);
        return;
      }
      if (stderr) {
        console.error(`Server stderr: ${stderr}`);
        return;
      }
      console.log(`Server stdout: ${stdout}`);
    }
  );

  serverProcess.on("exit", (code) => {
    console.log(`codespin-sync-server exited with code ${code}`);
  });
}
