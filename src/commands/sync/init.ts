import { keepAlive } from "./keepAlive.js";
import { registerProject } from "./register.js";

export function init(projectPath: string) {
  setTimeout(() => {
    registerProject(projectPath);

    setInterval(() => {
      keepAlive(projectPath);
    }, 30000);
  }, 1000);
}
