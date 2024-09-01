import { SYNC_SERVER_PORT } from "../../constants.js";

export async function keepAlive(projectPath: string) {
  fetch(`http://localhost:${SYNC_SERVER_PORT}/keepalive`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ projectPath }),
  });
}
