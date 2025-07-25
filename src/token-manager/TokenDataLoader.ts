import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import { Loader } from "../loaders/Loader";
import { TokenContext } from "./TokenContext";
import { error } from "../libs/vscode";

/**
 * TokenDataLoader: An IO utility class to load design token data from a JSON file.
 * - Loads token data from a specified file path
 * - Exports the flat token map to a JSON file for quick access
 */
export class TokenDataLoader implements Loader {
  private tokenContext: TokenContext;
  private extensionContext: vscode.ExtensionContext;
  private TOKEN_FILE_PATH = "./style-dictionary/electric-raw-tokens.json";
  private static EXPORT_BASE_DIR_PATH = "./style-dictionary";

  constructor(
    tokenContext: TokenContext,
    extensionContext: vscode.ExtensionContext
  ) {
    this.tokenContext = tokenContext;
    this.extensionContext = extensionContext;
  }

  async load() {
    // resolve the all the files under the nominated directory,
    if (!this.TOKEN_FILE_PATH) {
      vscode.window.showWarningMessage(
        'No design token file path configured. Please set "designToken.filePath" in settings.'
      );
      return;
    }

    let dirPath = this.TOKEN_FILE_PATH;
    if (!path.isAbsolute(dirPath)) {
      dirPath = path.join(this.extensionContext.extensionPath, dirPath);
    }

    const electricRawTokenJsonData = this.loadJsonFile({
      filePath: dirPath,
    });
    if (!electricRawTokenJsonData) {
      vscode.window.showErrorMessage(
        `Failed to load design tokens from ${this.TOKEN_FILE_PATH}`
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
        error({
          showVscodeWindowMessage: true,
          message: ["❌ Token file not found:", fullPath],
        });

        return null;
      }
    } catch (err) {
      console.error("💥 Error loading token data:", err);
      if (err instanceof SyntaxError) {
        error({
          showVscodeWindowMessage: true,
          message: `❌ Invalid JSON in token file: ${err.message}`,
        });

        return null;
      } else {
        error({
          showVscodeWindowMessage: true,
          message: `❌ Failed to load design tokens json file from ${filePath}`,
        });

        return null;
      }
    }
  }

  public static exportTokenMap({
    map,
    fileName,
  }: {
    map: Map<string, any>;
    fileName: string;
  }) {
    const isDevelopment = process.env.NODE_ENV === "development";
    if (!isDevelopment) {
      return;
    }

    // export the token map to a json file
    // const map = this.tokenContext.getTokenMap();
    const mapJson = JSON.stringify(Object.fromEntries(map), null, 2);
    const exportPath = path.join(
      vscode.workspace.workspaceFolders?.[0].uri.fsPath || "",
      this.EXPORT_BASE_DIR_PATH + "/" + fileName
    );
    fs.writeFileSync(exportPath, mapJson, "utf8");
    vscode.window.showInformationMessage(`Token map exported to ${exportPath}`);
  }
}
