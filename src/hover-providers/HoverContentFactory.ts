import * as vscode from "vscode";
import { TokenParser } from "./TokenParser";
import { DesignTokenHoverProvider } from "./DesignTokenHoverProvider";

export class HoverContentFactory {
  constructor(private designTokenHoverProvider: DesignTokenHoverProvider) {
    this.designTokenHoverProvider = designTokenHoverProvider;
  }

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
    if (TokenParser.isColor(tokenInfo.value)) {
      const colorValue = tokenInfo.value;
      markdown.appendMarkdown(
        `**Color Preview:** <span style="display:inline-block;width:20px;height:20px;background-color:${colorValue};border:1px solid #ccc;border-radius:3px;margin-left:8px;vertical-align:middle;"></span>\n\n`,
      );
    }

    //! 相关子 token（如果存在）
    const relatedTokens = TokenParser.findRelatedTokens(
      tokenName,
      this.designTokenHoverProvider.getTokenMap(),
    );
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
    if (tokenInfo.type === "color" || TokenParser.isColor(tokenInfo.value)) {
      examples.push({
        code: `const primaryColor = tokens.${tokenName
          .replace(/^(--|\$)/, "")
          .replace(/-/g, ".")};\n// Usage: ${tokenInfo.value}`,
        language: "javascript",
      });
    }

    return examples;
  }
}
