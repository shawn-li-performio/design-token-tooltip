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
        const markdown = new vscode.MarkdownString(undefined, true);
        markdown.isTrusted = true;
        markdown.appendMarkdown(`### 🎨 Design Token: \`${tokenName}\`\n\n`);
        // Display token info as a JSON code snippet for hierarchical support
        const tokenJson = JSON.stringify(tokenInfo, null, 2);
        markdown.appendCodeblock(tokenJson, "json");
        // nested token info ======================================================================
        const fakeChildToken = {
            name: tokenName,
            value: tokenInfo.value,
            type: tokenInfo.type,
            description: tokenInfo.description,
        };
        markdown.appendMarkdown(`> **\`${fakeChildToken.name}\`:**\n`);
        markdown.appendMarkdown(`> \`\`\`json\n`);
        markdown.appendMarkdown(`> ${JSON.stringify(fakeChildToken, null, 2).replace(/\n/g, "\n> ")}\n`);
        markdown.appendMarkdown(`> \`\`\`\n\n`);
        // nested token info =====================================================================
        if (TokenParser_1.TokenParser.isColor(tokenInfo.value)) {
            const colorValue = tokenInfo.value;
            // Use a Markdown image with a data URI SVG for color preview
            const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"><rect width="16" height="16" rx="3" fill="${colorValue}" stroke="#ccc" /></svg>`;
            const encodedSvg = encodeURIComponent(svg);
            markdown.appendMarkdown(`**Color Preview:** ![color](data:image/svg+xml;utf8,${encodedSvg}) \`${colorValue}\`\n\n`);
        }
        //! related child tokens
        const relatedTokens = TokenParser_1.TokenParser.findRelatedTokens(tokenName, this.designTokenHoverProvider.getTokenMap());
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
    generateUsageExamples(tokenName, tokenInfo) {
        const examples = [];
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