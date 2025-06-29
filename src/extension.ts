/// extension.ts - 主入口文件
import * as vscode from "vscode";
import { DesignTokenHoverProvider } from "./hover-providers/DesignTokenHoverProvider";


export function activate(context: vscode.ExtensionContext) {
  console.log("🎨 Design Token Tooltip extension is now active!");

  // Show a notification to confirm activation
  vscode.window.showInformationMessage(
    "Design Token Tooltip extension activated!",
  );

  // Register a test command to verify the extension is loaded
  const testCommand = vscode.commands.registerCommand(
    "designToken.test",
    () => {
      vscode.window.showInformationMessage(
        "✅ Design Token extension is working!",
      );
    },
  );
  context.subscriptions.push(testCommand);

  // 注册悬停提供器
  const hoverProvider = new DesignTokenHoverProvider();

  // 支持多种文件类型
  const supportedLanguages = [
    "css",
    "scss",
    "less",
    "javascript",
    "typescript",
    "vue",
    "html",
  ];

  supportedLanguages.forEach((language) => {
    const disposable = vscode.languages.registerHoverProvider(
      language,
      hoverProvider,
    );
    context.subscriptions.push(disposable);
  });

  // 注册命令来重新加载 token 数据
  const reloadCommand = vscode.commands.registerCommand(
    "designToken.reload",
    () => {
      console.log("\n🔄 ===== MANUAL RELOAD TRIGGERED =====");
      hoverProvider.loadTokenData();
      console.log("🔄 ===== MANUAL RELOAD COMPLETED =====\n");
    },
  );

  context.subscriptions.push(reloadCommand);
}

export function deactivate() {}

// package.json 配置示例
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

// tokens.json 示例数据
/*
{
  "color": {
    "primary": {
      "50": {
        "value": "#eff6ff",
        "type": "color",
        "description": "Primary color - lightest shade"
      },
      "500": {
        "value": "#3b82f6",
        "type": "color",
        "description": "Primary color - main"
      },
      "900": {
        "value": "#1e3a8a",
        "type": "color",
        "description": "Primary color - darkest shade"
      }
    },
    "semantic": {
      "success": {
        "value": "#10b981",
        "type": "color",
        "description": "Success state color"
      },
      "error": {
        "value": "#ef4444",
        "type": "color",
        "description": "Error state color"
      }
    }
  },
  "spacing": {
    "xs": {
      "value": "4px",
      "type": "spacing",
      "description": "Extra small spacing"
    },
    "sm": {
      "value": "8px",
      "type": "spacing",
      "description": "Small spacing"
    },
    "md": {
      "value": "16px",
      "type": "spacing",
      "description": "Medium spacing"
    }
  },
  "typography": {
    "fontSize": {
      "sm": {
        "value": "14px",
        "type": "fontSize",
        "description": "Small font size"
      },
      "base": {
        "value": "16px",
        "type": "fontSize",
        "description": "Base font size"
      }
    }
  }
}
*/
