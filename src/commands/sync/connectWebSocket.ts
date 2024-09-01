function connectWebSocket(projectPath: string) {
  const ws = new WebSocket(`ws://localhost:60280/${projectPath}`);

  ws.onopen = () => {
    console.log(`Connected to WebSocket server for project: ${projectPath}`);
  };

  ws.onmessage = (event) => {
    console.log(`Received message: ${event.data}`);
  };

  ws.onerror = (error) => {
    console.error(`WebSocket error: ${error}`);
  };

  ws.onclose = () => {
    console.log("WebSocket connection closed. Attempting to reconnect...");
    setTimeout(() => connectWebSocket(projectPath), 5000); // Try to reconnect every 5 seconds
  };
}