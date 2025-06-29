import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import { OutputFormatter } from "./OutputFormatter";
import { TokenParser } from "./TokenParser";

interface DesignToken {
  [key: string]: any;
  value?: string | number;
  type?: string;
  description?: string;
}

export interface TokenData {
  [key: string]: DesignToken | TokenData;
}

export class DesignTokenHoverProvider implements vscode.HoverProvider {
  private tokenData: TokenData = {};
  private tokenMap: Map<string, any> = new Map();

  constructor() {
    this.loadTokenData();

    // 监听配置变化
    vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration("designToken")) {
        this.loadTokenData();
      }
    });
  }

  /**
   * 加载 Design Token 数据
   */
  loadTokenData() {
    console.log("🔄 Starting to load design tokens...");

    try {
      const config = vscode.workspace.getConfiguration("designToken");
      const tokenFilePath = config.get<string>("filePath");

      console.log("📋 Configuration:", {
        configuredPath: tokenFilePath,
        workspaceFolders: vscode.workspace.workspaceFolders?.map(
          (f) => f.uri.fsPath,
        ),
      });

      if (!tokenFilePath) {
        console.log("⚠️ No token file path configured in settings");
        vscode.window.showWarningMessage(
          'No design token file path configured. Please set "designToken.filePath" in settings.',
        );
        return;
      }

      // 支持相对路径和绝对路径
      let fullPath = tokenFilePath;
      if (!path.isAbsolute(tokenFilePath)) {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (workspaceFolder) {
          fullPath = path.join(workspaceFolder.uri.fsPath, tokenFilePath);
        } else {
          console.error("❌ No workspace folder found for relative path");
          vscode.window.showErrorMessage(
            "No workspace folder found. Cannot resolve relative token file path.",
          );
          return;
        }
      }

      console.log("📁 Resolved token file path:", fullPath);

      // read the file content =========================================
      if (fs.existsSync(fullPath)) {
        console.log("✅ Token file found, reading content...");
        const fileContent = fs.readFileSync(fullPath, "utf8");

        console.log("📄 File size:", fileContent.length, "characters");
        console.log(
          "📄 File preview (first 200 chars):",
          fileContent.substring(0, 200) + "...",
        );

        this.tokenData = JSON.parse(fileContent);
        console.log(
          "🎯 Raw token data structure:",
          Object.keys(this.tokenData),
        );

        //! core logic: build the token map to facilitate quick lookup when hovering
        new TokenParser().buildTokenMap(this.tokenData, this.tokenMap);
        OutputFormatter.outputLoadingResults(this.tokenData, this.tokenMap);

        vscode.window.showInformationMessage(
          `✅ Design tokens loaded! Found ${this.tokenMap.size} tokens.`,
        );
      } else {
        console.error("❌ Token file not found:", fullPath);
        vscode.window.showErrorMessage(`Token file not found: ${fullPath}`);
      }
    } catch (error) {
      console.error("💥 Error loading token data:", error);
      if (error instanceof SyntaxError) {
        vscode.window.showErrorMessage(
          `Invalid JSON in token file: ${error.message}`,
        );
      } else {
        vscode.window.showErrorMessage(
          "Failed to load design tokens: " + error,
        );
      }
    }
  }

  /**
   * !提供悬停信息 - 必须实现的方法
   */
  provideHover(
    document: vscode.TextDocument,
    position: vscode.Position,
    token: vscode.CancellationToken,
  ): vscode.ProviderResult<vscode.Hover> {
    // FIXME: get word logic not really works
    const wordRange = document.getWordRangeAtPosition(position, /[\w\-\.]+/);
    if (!wordRange) return;

    const word = document.getText(wordRange);

    console.log("------🔍 Hover triggered for word:", word);

    // 尝试多种 token 命名格式
    const possibleTokens = [
      word,
      `--${word}`,
      `$${word}`,
      word.replace(/^--/, ""),
      word.replace(/^\$/, ""),
      word.replace(/-/g, "."),
    ];

    for (const tokenName of possibleTokens) {
      const tokenInfo = this.tokenMap.get(tokenName);
      console.log("hovering - ", `🔎 Checking token: ${tokenName}`, tokenInfo);
      if (tokenInfo) {
        const hoverContent = this.createHoverContent(tokenName, tokenInfo);
        console.log("hover markdown string:", hoverContent);
        return new vscode.Hover(hoverContent, wordRange);
      }
    }

    return null;
  }

  /**
   * 创建悬停内容
   */
  createHoverContent(tokenName: string, tokenInfo: any): vscode.MarkdownString {
    const markdown = new vscode.MarkdownString();
    markdown.supportHtml = true;

    // 标题
    markdown.appendMarkdown(`### 🎨 Design Token: \`${tokenName}\`\n\n`);

    // 主要值
    if (tokenInfo.value !== undefined) {
      markdown.appendMarkdown(`**Value:** \`${tokenInfo.value}\`\n\n`);
    }

    // 类型信息
    if (tokenInfo.type) {
      markdown.appendMarkdown(`**Type:** ${tokenInfo.type}\n\n`);
    }

    // 描述
    if (tokenInfo.description) {
      markdown.appendMarkdown(`**Description:** ${tokenInfo.description}\n\n`);
    }

    // 如果是颜色，显示颜色预览
    if (this.isColor(tokenInfo.value)) {
      const colorValue = tokenInfo.value;
      markdown.appendMarkdown(
        `**Color Preview:** <span style="display:inline-block;width:20px;height:20px;background-color:${colorValue};border:1px solid #ccc;border-radius:3px;margin-left:8px;vertical-align:middle;"></span>\n\n`,
      );
    }

    // 相关子 token（如果存在）
    const relatedTokens = this.findRelatedTokens(tokenName);
    if (relatedTokens.length > 0) {
      markdown.appendMarkdown(`**Related Tokens:**\n`);
      relatedTokens.forEach((related) => {
        markdown.appendMarkdown(`- \`${related.name}\`: ${related.value}\n`);
      });
      markdown.appendMarkdown(`\n`);
    }

    // 使用示例
    const examples = this.generateUsageExamples(tokenName, tokenInfo);
    if (examples.length > 0) {
      markdown.appendMarkdown(`**Usage Examples:**\n`);
      examples.forEach((example) => {
        markdown.appendCodeblock(example.code, example.language);
      });
    }

    return markdown;
  }

  /**
   * 判断是否为颜色值
   */
  isColor(value: any): boolean {
    if (typeof value !== "string") return false;

    const colorRegex = /^(#[0-9a-fA-F]{3,8}|rgb\(|rgba\(|hsl\(|hsla\()/;
    return colorRegex.test(value);
  }

  /**
   * 查找相关的子 token
   */
  findRelatedTokens(tokenName: string): Array<{ name: string; value: any }> {
    const related: Array<{ name: string; value: any }> = [];
    const baseTokenName = tokenName.replace(/^(--|\$)/, "").replace(/-/g, ".");

    for (const [key, value] of this.tokenMap.entries()) {
      if (
        key !== tokenName &&
        key.includes(baseTokenName) &&
        key !== baseTokenName
      ) {
        related.push({
          name: key,
          value: value.value || value,
        });
      }
    }

    return related.slice(0, 5); // 限制显示数量
  }

  /**
   * 生成使用示例
   */
  generateUsageExamples(
    tokenName: string,
    tokenInfo: any,
  ): Array<{ code: string; language: string }> {
    const examples: Array<{ code: string; language: string }> = [];
    const cssVarName = `--${tokenName
      .replace(/^(--|\$)/, "")
      .replace(/\./g, "-")}`;
    const scssVarName = `$${tokenName
      .replace(/^(--|\$)/, "")
      .replace(/\./g, "-")}`;

    // CSS 示例
    examples.push({
      code: `.my-element {\n  color: var(${cssVarName});\n}`,
      language: "css",
    });

    // SCSS 示例
    examples.push({
      code: `.my-element {\n  color: ${scssVarName};\n}`,
      language: "scss",
    });

    // JavaScript 示例（如果适用）
    if (tokenInfo.type === "color" || this.isColor(tokenInfo.value)) {
      examples.push({
        code: `const primaryColor = tokens.${tokenName
          .replace(/^(--|\$)/, "")
          .replace(/-/g, ".")};\n// Usage: ${tokenInfo.value}`,
        language: "javascript",
      });
    }

    return examples;
  }

  public getTokenData(): TokenData {
    return this.tokenData;
  }
  public getTokenMap(): Map<string, any> {
    return this.tokenMap;
  }
}
