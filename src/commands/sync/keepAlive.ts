export async function keepAlive(projectPath: string) {
  fetch("http://localhost:60280/keepalive", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ projectPath }),
  });
}
