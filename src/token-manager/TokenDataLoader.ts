import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import { Loader } from "../loaders/Loader";
import { TokenContext } from "./TokenContext";

export class TokenDataLoader implements Loader {
  private tokenContext: TokenContext;
  private config = vscode.workspace.getConfiguration("designToken");
  private tokenFilePath = this.config.get<string>("filePath");
  private mergedTokenJsonFilePath = "merged-design-tokens.json" as const; // default path for merged tokens

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

    const jsonFilePathList = this.findJsonFiles(dirPath);
    console.log("Found JSON files:", jsonFilePathList);

    await this.mergeJsonFiles(jsonFilePathList);
    console.log(
      `✅ Merged design tokens written to ${this.mergedTokenJsonFilePath}`
    );

    //! crucial step - load the merged json file data into the map --> the key should never overlap with the existing keys in the map, need to check
  }

  findJsonFiles(dir: string): string[] {
    let results: string[] = [];

    if (!fs.existsSync(dir)) return results;

    const list = fs.readdirSync(dir);
    for (const file of list) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      if (stat && stat.isDirectory()) {
        results = results.concat(this.findJsonFiles(filePath));
      } else if (file.endsWith(".json")) {
        results.push(filePath);
      }
    }
    return results;
  }

  async mergeJsonFiles(jsonFiles: string[]): Promise<void> {
    // then merge the json file one by one (the json file name might also contains information about the design token) ===================
    console.log("🔄 Starting to load design tokens...");
    if (jsonFiles.length === 0) {
      vscode.window.showWarningMessage(
        "No design token JSON files found in the configured directory."
      );
      return;
    }

    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (!workspaceFolder) {
      vscode.window.showErrorMessage(
        "No workspace folder found. Cannot write merged token file."
      );
      return;
    }
    const mergedFileUri = vscode.Uri.joinPath(
      workspaceFolder.uri,
      this.mergedTokenJsonFilePath
    );

    try {
      // fisrtly, get the json string
      let currentJsonFileIndex = 0;
      let resMergedTokenString = "";
      const skippedJsonFiles: string[] = [];
      for (const filePath of jsonFiles) {
        const currentRawJsonData = this.loadJsonFile({
          filePath,
          topKeyWithFileName: true,
        });
        // Write the raw JSON data into the merged token JSON file

        const content = JSON.stringify(currentRawJsonData, null, 2);
        let trimmedContent = content.trim();
        if (trimmedContent.startsWith("{") && trimmedContent.endsWith("}")) {
          trimmedContent = trimmedContent.slice(1, -1).trim();
        } else {
          vscode.window.showErrorMessage(
            `❌ Invalid JSON format in file: ${filePath} - skipping it`
          );
          skippedJsonFiles.push(filePath);
          continue;
        }
        if (trimmedContent.length > 0) {
          resMergedTokenString += trimmedContent + ",\n"; // add a comma to separate the objects
        }

        currentJsonFileIndex++;
        console.log(
          `🔄 reading token JSON file from ${filePath}: (${currentJsonFileIndex}/${jsonFiles.length})`
        );
      }
      if (resMergedTokenString.endsWith(",\n")) {
        resMergedTokenString = resMergedTokenString.slice(0, -2);
      }
      resMergedTokenString = `{\n${resMergedTokenString}\n}`; // wrap the merged content in an object

      //! write the merged token json into a new file
      await vscode.workspace.fs.writeFile(
        mergedFileUri,
        Buffer.from(resMergedTokenString, "utf8")
      );

      // merge reporting =========================================================
      let mergeReport = `\n🎯🎯🎯🎯🎯🎯🎯\n Merged ${currentJsonFileIndex} JSON files into ${mergedFileUri.fsPath}:\n`;
      if (skippedJsonFiles.length > 0) {
        mergeReport += `⚠️ Skipped ${skippedJsonFiles.length} files due to invalid JSON format:\n`;
        skippedJsonFiles.forEach((file) => {
          mergeReport += `  - ${file}\n`;
        });
      } else {
        mergeReport += `✅ All files merged successfully.\n`;
      }
      mergeReport += `\n🎯🎯🎯🎯🎯🎯🎯\n`;
      console.log(mergeReport);
    } catch (err) {
      console.error(
        `❌ Failed to write to ${this.mergedTokenJsonFilePath}:`,
        err
      );
      vscode.window.showErrorMessage(
        `Failed to write to merged token file: ${err}`
      );
    }
  }

  /**
   *
   * @param filePath: string - The absolute or relative path in the workspace to the design token JSON file.
   * @returns raw JSON data of the given json file
   */
  loadJsonFile({
    filePath,
    topKeyWithFileName = false,
  }: {
    filePath: string;
    topKeyWithFileName?: boolean; // if true, the top level key will be
  }): Record<string, any> | null {
    console.log("🔄 Starting to load design tokens...");

    try {
      const tokenFilePath = filePath;

      console.log("📋 Configuration:", {
        configuredPath: tokenFilePath,
        workspaceFolders: vscode.workspace.workspaceFolders?.map(
          (f) => f.uri.fsPath
        ),
      });

      if (!tokenFilePath) {
        console.log("⚠️ No token file path configured in settings");
        vscode.window.showWarningMessage(
          'No design token file path configured. Please set "designToken.filePath" in settings.'
        );
        return null;
      }

      // support both absolute and relative paths
      let fullPath = tokenFilePath;
      if (!path.isAbsolute(tokenFilePath)) {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (workspaceFolder) {
          fullPath = path.join(workspaceFolder.uri.fsPath, tokenFilePath);
        } else {
          console.error("❌ No workspace folder found for relative path");
          vscode.window.showErrorMessage(
            "No workspace folder found. Cannot resolve relative token file path."
          );
          return null;
        }
      }

      console.log("📁 Resolved token file path:", fullPath); //! fullPath is absolute path

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

        if (topKeyWithFileName) {
          const fileName = path.basename(fullPath, ".json");
          if (newTokenData && typeof newTokenData === "object") {
            for (const key of Object.keys(newTokenData)) {
              const value = newTokenData[key];
              delete newTokenData[key];
              newTokenData[`${key}_${fileName}`] = value;
            }
          }
        }

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
