export async function registerProject(projectPath: string) {
  const response = await fetch("http://localhost:60280/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ projectPath }),
  });

  const data = await response.json();
  console.log("Registration response:", data);
}
