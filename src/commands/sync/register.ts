import { SYNC_SERVER_PORT } from "../../constants.js";

export async function registerProject(projectPath: string) {
  const response = await fetch(
    `http://localhost:${SYNC_SERVER_PORT}/register`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ projectPath }),
    }
  );

  const data = await response.json();
}
