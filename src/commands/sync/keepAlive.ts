export async function keepAlive(projectPath: string) {
  try {
    const response = await fetch("http://localhost:60280/keepalive", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ projectPath }),
    });

    const data = await response.json();
    console.log("Keep-alive response:", data);
  } catch (error) {
    console.error("Failed to send keep-alive:", error);
  }
}
