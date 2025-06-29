/// extension.ts - 主入口文件
import * as vscode from "vscode";
import { DesignTokenHoverProvider } from "./hover-providers/DesignTokenHoverProvider";
import { CommandLoader } from "./loaders/CommandLoader";
import { HoverProviderLoader } from "./loaders/HoverProviderLoader";

export function activate(context: vscode.ExtensionContext) {
  console.log("🎨 Design Token Tooltip extension is now active!");
  vscode.window.showInformationMessage(
    "Design Token Tooltip extension activated!",
  );

  const hoverProvider = new DesignTokenHoverProvider();
  new HoverProviderLoader(context, hoverProvider).load();
  new CommandLoader(context, hoverProvider).load();
}

export function deactivate() {}

// package.json config example
/*
{
  "name": "design-token-tooltip",
  "displayName": "Design Token Tooltip",
  "description": "Show design token information on hover",
  "version": "0.0.1",
  "engines": {
    "vscode": "^1.74.0"
  },
  "categories": ["Other"],
  "activationEvents": [],
  "main": "./out/extension.js",
  "contributes": {
    "configuration": {
      "title": "Design Token Tooltip",
      "properties": {
        "designToken.filePath": {
          "type": "string",
          "default": "tokens.json",
          "description": "Path to the design tokens JSON file (relative to workspace root or absolute path)"
        }
      }
    },
    "commands": [
      {
        "command": "designToken.reload",
        "title": "Reload Design Tokens"
      }
    ]
  },
  "scripts": {
    "vscode:prepublish": "npm run compile",
    "compile": "tsc -p ./",
    "watch": "tsc -watch -p ./"
  },
  "devDependencies": {
    "@types/vscode": "^1.74.0",
    "@types/node": "16.x",
    "typescript": "^4.9.4"
  }
}
*/
