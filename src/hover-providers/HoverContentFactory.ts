import * as vscode from "vscode";
import { TokenParser } from "./TokenParser";
import { DesignTokenHoverProvider } from "./DesignTokenHoverProvider";

export class HoverContentFactory {
  constructor(
    private designTokenHoverProvider: DesignTokenHoverProvider,
    private shouldDisplayUsageExamples = false,
  ) {
    this.designTokenHoverProvider = designTokenHoverProvider;
  }

  createHoverContent(tokenName: string, tokenInfo: any): vscode.MarkdownString {
    const markdown = new vscode.MarkdownString();
    markdown.supportHtml = true;


    markdown.appendMarkdown(`### 🎨 Design Token: \`${tokenName}\`\n\n`);
    if (tokenInfo.value !== undefined) {
      markdown.appendMarkdown(`**Value:** \`${tokenInfo.value}\`\n\n`);
    }
    if (tokenInfo.type) {
      markdown.appendMarkdown(`**Type:** ${tokenInfo.type}\n\n`);
    }
    if (tokenInfo.description) {
      markdown.appendMarkdown(`**Description:** ${tokenInfo.description}\n\n`);
    }

    if (TokenParser.isColor(tokenInfo.value)) {
      const colorValue = tokenInfo.value;
      // use a span to show color preview
      markdown.appendMarkdown(`**Color Preview:** <span style="display:inline-block;width:16px;height:16px;border-radius:3px;border:1px solid #ccc;background:${colorValue};vertical-align:middle;margin-right:4px;"></span> \`${colorValue}\`\n\n`);
    }

    //! related child tokens
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

    if (this.shouldDisplayUsageExamples) {
      const examples = this.generateUsageExamples(tokenName, tokenInfo);
      if (examples.length > 0) {
        markdown.appendMarkdown(`**Usage Examples:**\n`);
        examples.forEach((example) => {
          markdown.appendCodeblock(example.code, example.language);
        });
      }
    }

    return markdown;
  }

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

    // CSS example
    examples.push({
      code: `.my-element {\n  color: var(${cssVarName});\n}`,
      language: "css",
    });

    // SCSS example
    examples.push({
      code: `.my-element {\n  color: ${scssVarName};\n}`,
      language: "scss",
    });

    // JavaScript example (if applicable)
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
