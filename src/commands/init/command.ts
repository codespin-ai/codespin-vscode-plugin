import { init } from "codespin/dist/commands/init.js";
import * as fs from "fs";
import { mkdirSync } from "fs";
import * as path from "path";
import sqlite3 = require("better-sqlite3"); // Using the 'better-sqlite3' package to avoid the 'open' error
import * as vscode from "vscode";
import { getWorkspaceRoot } from "../../vscode/getWorkspaceRoot.js";

function createDatabase(codespinConfigPath: string) {
  console.log("CREATing... DB", codespinConfigPath);
  const dbPath = path.join(codespinConfigPath, "settings.db");
  console.log("FULLPATH... DB", dbPath);
  const createDatabasePromise = async () => {
    try {
      const db = new sqlite3(dbPath); // Creating a new instance of the database
      console.log("CREATED DB", dbPath);
      db.exec(`
      CREATE TABLE IF NOT EXISTS prompt (
        model TEXT,
        prompt TEXT,
        codegenTargets TEXT,
        codingConvention TEXT,
        fileVersion TEXT,
        includedFiles TEXT
      );
      CREATE TABLE IF NOT EXISTS file (
        id INTEGER PRIMARY KEY,
        prompt_id INTEGER,
        original_contents TEXT,
        updated_contents TEXT,
        FOREIGN KEY (prompt_id) REFERENCES prompt(rowid)
      );
    `);
      db.close(); // Closing the database connection
    } catch (ex: any) {
      console.log(ex.message);
    }
  };
  return createDatabasePromise;
}

export function getInitCommand(context: vscode.ExtensionContext) {
  return async function initCommand(_: unknown): Promise<void> {
    const workspaceRoot = getWorkspaceRoot(context);
    const codespinConfigPath = path.join(workspaceRoot, ".codespin");
    const conventionsPath = path.join(codespinConfigPath, "conventions");

    if (fs.existsSync(codespinConfigPath)) {
      const userChoice = await vscode.window.showWarningMessage(
        "The directory has already been initialized with codespin. Do you want to force initialize?",
        "Yes",
        "No"
      );

      if (userChoice === "Yes") {
        await init({
          force: true,
        });
        mkdirSync(conventionsPath, { recursive: true });
        const createDatabasePromise = createDatabase(codespinConfigPath);
        await createDatabasePromise();
      }
    } else {
      await init({});
      mkdirSync(conventionsPath, { recursive: true });
      const createDatabasePromise = createDatabase(codespinConfigPath);
      await createDatabasePromise();
    }
  };
}
