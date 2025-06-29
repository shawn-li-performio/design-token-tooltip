"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DesignTokenHoverProvider = void 0;
const vscode = require("vscode");
const fs = require("fs");
const path = require("path");
class DesignTokenHoverProvider {
    constructor() {
        this.tokenData = {};
        this.tokenMap = new Map();
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
            const tokenFilePath = config.get("filePath");
            console.log("📋 Configuration:", {
                configuredPath: tokenFilePath,
                workspaceFolders: vscode.workspace.workspaceFolders?.map((f) => f.uri.fsPath),
            });
            if (!tokenFilePath) {
                console.log("⚠️ No token file path configured in settings");
                vscode.window.showWarningMessage('No design token file path configured. Please set "designToken.filePath" in settings.');
                return;
            }
            // 支持相对路径和绝对路径
            let fullPath = tokenFilePath;
            if (!path.isAbsolute(tokenFilePath)) {
                const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
                if (workspaceFolder) {
                    fullPath = path.join(workspaceFolder.uri.fsPath, tokenFilePath);
                }
                else {
                    console.error("❌ No workspace folder found for relative path");
                    vscode.window.showErrorMessage("No workspace folder found. Cannot resolve relative token file path.");
                    return;
                }
            }
            console.log("📁 Resolved token file path:", fullPath);
            if (fs.existsSync(fullPath)) {
                console.log("✅ Token file found, reading content...");
                const fileContent = fs.readFileSync(fullPath, "utf8");
                console.log("📄 File size:", fileContent.length, "characters");
                console.log("📄 File preview (first 200 chars):", fileContent.substring(0, 200) + "...");
                this.tokenData = JSON.parse(fileContent);
                console.log("🎯 Raw token data structure:", Object.keys(this.tokenData));
                this.buildTokenMap();
                // Output detailed loading results
                this.outputLoadingResults();
                vscode.window.showInformationMessage(`✅ Design tokens loaded! Found ${this.tokenMap.size} tokens.`);
            }
            else {
                console.error("❌ Token file not found:", fullPath);
                vscode.window.showErrorMessage(`Token file not found: ${fullPath}`);
            }
        }
        catch (error) {
            console.error("💥 Error loading token data:", error);
            if (error instanceof SyntaxError) {
                vscode.window.showErrorMessage(`Invalid JSON in token file: ${error.message}`);
            }
            else {
                vscode.window.showErrorMessage("Failed to load design tokens: " + error);
            }
        }
    }
    /**
     * 输出详细的加载结果
     */
    outputLoadingResults() {
        console.log("\n🎨 ===== DESIGN TOKENS LOADED =====");
        console.log(`📊 Total tokens found: ${this.tokenMap.size}`);
        console.log("📋 Raw data structure keys:", Object.keys(this.tokenData));
        // Group tokens by type
        const tokensByType = {};
        const tokensByCategory = {};
        this.tokenMap.forEach((value, key) => {
            // Group by type
            const type = value.type || "unknown";
            if (!tokensByType[type])
                tokensByType[type] = [];
            tokensByType[type].push(key);
            // Group by category (first part of the key)
            const category = key.split(".")[0] || key.split("-")[0] || "root";
            if (!tokensByCategory[category])
                tokensByCategory[category] = [];
            tokensByCategory[category].push(key);
        });
        console.log("\n📂 Tokens by Type:");
        Object.entries(tokensByType).forEach(([type, tokens]) => {
            console.log(`  ${type}: ${tokens.length} tokens`);
            // Show first few examples
            const examples = tokens.slice(0, 3);
            examples.forEach((token) => {
                const value = this.tokenMap.get(token);
                console.log(`    ├─ ${token}: ${value.value}`);
            });
            if (tokens.length > 3) {
                console.log(`    └─ ... and ${tokens.length - 3} more`);
            }
        });
        console.log("\n🗂️ Tokens by Category:");
        Object.entries(tokensByCategory).forEach(([category, tokens]) => {
            console.log(`  ${category}: ${tokens.length} tokens`);
        });
        console.log("\n🔍 All Token Names:");
        const allTokens = Array.from(this.tokenMap.keys()).sort();
        allTokens.forEach((token, index) => {
            const value = this.tokenMap.get(token);
            const valueStr = typeof value.value === "string"
                ? value.value
                : JSON.stringify(value.value);
            console.log(`  ${(index + 1).toString().padStart(3, " ")}. ${token.padEnd(30, " ")} → ${valueStr}`);
        });
        console.log("\n✨ Sample Token Details:");
        const sampleTokens = Array.from(this.tokenMap.entries()).slice(0, 3);
        sampleTokens.forEach(([key, value]) => {
            console.log(`🏷️ Token: ${key}`);
            console.log(`   📝 Full data:`, JSON.stringify(value, null, 2));
        });
        console.log("\n🎯 ===== END DESIGN TOKENS =====\n");
    }
    /**
     * 构建 token 映射表，方便快速查找
     */
    buildTokenMap() {
        console.log("🗺️ Building token map...");
        this.tokenMap.clear();
        this.flattenTokens(this.tokenData, "");
        console.log(`📊 Token map built with ${this.tokenMap.size} entries`);
    }
    /**
     * 递归扁平化 token 数据
     */
    flattenTokens(obj, prefix) {
        for (const [key, value] of Object.entries(obj)) {
            const fullKey = prefix ? `${prefix}.${key}` : key;
            if (value && typeof value === "object") {
                // 如果有 value 属性，说明这是一个具体的 token
                if ("value" in value) {
                    this.tokenMap.set(fullKey, value);
                    // 同时支持不同的命名方式
                    this.tokenMap.set(key, value);
                    this.tokenMap.set(`--${fullKey.replace(/\./g, "-")}`, value);
                    this.tokenMap.set(`${fullKey.replace(/\./g, "-")}`, value);
                    if ("type" in value) {
                        console.log(`  ✓ Added token: ${fullKey} = ${value.value} (${value.type || "no-type"})`);
                    }
                    else {
                        console.log(`  ✓ Added token: ${fullKey} = ${value.value} (${"no-type"})`);
                    }
                }
                else {
                    // 递归处理嵌套对象
                    this.flattenTokens(value, fullKey);
                }
            }
        }
    }
    /**
     * 提供悬停信息
     */
    provideHover(document, position, token) {
        const wordRange = document.getWordRangeAtPosition(position, /[\w\-\.]+/);
        if (!wordRange)
            return;
        const word = document.getText(wordRange);
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
            if (tokenInfo) {
                const hoverContent = this.createHoverContent(tokenName, tokenInfo);
                return new vscode.Hover(hoverContent, wordRange);
            }
        }
        return null;
    }
    /**
     * 创建悬停内容
     */
    createHoverContent(tokenName, tokenInfo) {
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
            markdown.appendMarkdown(`**Color Preview:** <span style="display:inline-block;width:20px;height:20px;background-color:${colorValue};border:1px solid #ccc;border-radius:3px;margin-left:8px;vertical-align:middle;"></span>\n\n`);
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
    isColor(value) {
        if (typeof value !== "string")
            return false;
        const colorRegex = /^(#[0-9a-fA-F]{3,8}|rgb\(|rgba\(|hsl\(|hsla\()/;
        return colorRegex.test(value);
    }
    /**
     * 查找相关的子 token
     */
    findRelatedTokens(tokenName) {
        const related = [];
        const baseTokenName = tokenName.replace(/^(--|\$)/, "").replace(/-/g, ".");
        for (const [key, value] of this.tokenMap.entries()) {
            if (key !== tokenName &&
                key.includes(baseTokenName) &&
                key !== baseTokenName) {
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
}
exports.DesignTokenHoverProvider = DesignTokenHoverProvider;
//# sourceMappingURL=DesignTokenHoverProvider.js.map