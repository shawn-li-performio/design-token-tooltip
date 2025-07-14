import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import { Loader } from "../loaders/Loader";
import { TokenContext } from "./TokenContext";

export class TokenDataLoader implements Loader {
  private tokenContext: TokenContext;
  private tokenFilePath = "./style-dictionary/electric-raw-tokens.json";

  constructor(tokenContext: TokenContext) {
    this.tokenContext = tokenContext;
  }

  async load() {
    // resolve the all the files under the nominated directory,
    if (!this.tokenFilePath) {
      vscode.window.showWarningMessage(
        'No design token file path configured. Please set "designToken.filePath" in settings.'
      );
      return;
    }

    // make sure the dirPath is absolute
    let dirPath = this.tokenFilePath;
    if (!path.isAbsolute(dirPath)) {
      const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
      if (workspaceFolder) {
        dirPath = path.join(workspaceFolder.uri.fsPath, dirPath);
      } else {
        vscode.window.showErrorMessage(
          "No workspace folder found. Cannot resolve relative directory path."
        );
        return;
      }
    }

    const electricRawTokenJsonData = this.loadJsonFile({
      filePath: dirPath,
    });
    if (!electricRawTokenJsonData) {
      vscode.window.showErrorMessage(
        `Failed to load design tokens from ${this.tokenFilePath}`
      );
      return;
    }
    console.log(
      "✅ Loaded electric raw token JSON data:",
      Object.keys(electricRawTokenJsonData)
    );

    if (electricRawTokenJsonData["tokenData"]) {
      this.tokenContext.setTokenData(electricRawTokenJsonData["tokenData"]);
    } else {
      console.warn(
        "⚠️ No 'tokenData' key found in the JSON. Using the entire JSON as token data."
      );
    }

    if (electricRawTokenJsonData["tokenNames"]) {
      this.tokenContext.setTokenNames(electricRawTokenJsonData["tokenNames"]);
    } else {
      console.warn(
        "⚠️ No 'tokenNames' key found in the JSON. Using an empty object for token names."
      );
      this.tokenContext.setTokenNames({});
    }
  }

  /**
   *
   * @param filePath: string - The absolute or relative path in the workspace to the design token JSON file.
   * @returns raw JSON data of the given json file
   */
  loadJsonFile({
    filePath,
  }: {
    filePath: string;
    appendFilePath?: boolean; // if true, the file path will be appended to each top level object in the json file
  }): Record<string, any> | null {
    console.log("🔄 Starting to load design tokens...");

    try {
      const fullPath = filePath;

      //! read the file content =========================================
      if (fs.existsSync(fullPath)) {
        console.log("✅ Token file found, reading content...");
        const fileContent = fs.readFileSync(fullPath, "utf8");

        console.log("📄 File size:", fileContent.length, "characters");
        console.log(
          "📄 File preview (first 200 chars):",
          fileContent.substring(0, 200) + "..."
        );

        const newTokenData = JSON.parse(fileContent); //! get the raw json

        console.log("🎯 Raw token data structure:", Object.keys(newTokenData));
        return newTokenData;
      } else {
        console.error("❌ Token file not found in json file:", fullPath);
        vscode.window.showErrorMessage(
          `Token file not found in json file: ${fullPath}`
        );
        return null;
      }
    } catch (error) {
      console.error("💥 Error loading token data:", error);
      if (error instanceof SyntaxError) {
        vscode.window.showErrorMessage(
          `Invalid JSON in token file: ${error.message}`
        );
        return null;
      } else {
        vscode.window.showErrorMessage(
          "Failed to load design tokens: " + error
        );
        return null;
      }
    }
  }
}
