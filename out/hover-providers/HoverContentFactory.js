"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HoverContentFactory = void 0;
const vscode = require("vscode");
const TokenParser_1 = require("./TokenParser");
class HoverContentFactory {
    constructor(designTokenHoverProvider, shouldDisplayUsageExamples = false) {
        this.designTokenHoverProvider = designTokenHoverProvider;
        this.shouldDisplayUsageExamples = shouldDisplayUsageExamples;
        this.designTokenHoverProvider = designTokenHoverProvider;
    }
    createHoverContent(tokenName, tokenInfo) {
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
        if (TokenParser_1.TokenParser.isColor(tokenInfo.value)) {
            const colorValue = tokenInfo.value;
            // 使用 VSCode 支持的 markdown 颜色块语法预览颜色
            markdown.appendMarkdown(`**Color Preview:** <span style="display:inline-block;width:16px;height:16px;border-radius:3px;border:1px solid #ccc;background:${colorValue};vertical-align:middle;margin-right:4px;"></span> \`${colorValue}\`\n\n`);
        }
        //! 相关子 token（如果存在）
        const relatedTokens = TokenParser_1.TokenParser.findRelatedTokens(tokenName, this.designTokenHoverProvider.getTokenMap());
        if (relatedTokens.length > 0) {
            markdown.appendMarkdown(`**Related Tokens:**\n`);
            relatedTokens.forEach((related) => {
                markdown.appendMarkdown(`- \`${related.name}\`: ${related.value}\n`);
            });
            markdown.appendMarkdown(`\n`);
        }
        // 使用示例
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
    /**
     * 生成使用示例
     */
    generateUsageExamples(tokenName, tokenInfo) {
        const examples = [];
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
        if (tokenInfo.type === "color" || TokenParser_1.TokenParser.isColor(tokenInfo.value)) {
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
exports.HoverContentFactory = HoverContentFactory;
//# sourceMappingURL=HoverContentFactory.js.map