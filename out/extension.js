"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
// extension.ts - 主入口文件
const vscode = require("vscode");
const fs = require("fs");
const path = require("path");
function activate(context) {
    console.log("🎨 Design Token Tooltip extension is now active!");
    // Show a notification to confirm activation
    vscode.window.showInformationMessage("Design Token Tooltip extension activated!");
    // Register a test command to verify the extension is loaded
    const testCommand = vscode.commands.registerCommand("designToken.test", () => {
        vscode.window.showInformationMessage("✅ Design Token extension is working!");
    });
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
        const disposable = vscode.languages.registerHoverProvider(language, hoverProvider);
        context.subscriptions.push(disposable);
    });
    // 注册命令来重新加载 token 数据
    const reloadCommand = vscode.commands.registerCommand("designToken.reload", () => {
        hoverProvider.loadTokenData();
        vscode.window.showInformationMessage("Design tokens reloaded!");
    });
    context.subscriptions.push(reloadCommand);
}
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
        try {
            const config = vscode.workspace.getConfiguration("designToken");
            const tokenFilePath = config.get("filePath");
            if (!tokenFilePath) {
                console.log("No token file path configured");
                return;
            }
            // 支持相对路径和绝对路径
            let fullPath = tokenFilePath;
            if (!path.isAbsolute(tokenFilePath)) {
                const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
                if (workspaceFolder) {
                    fullPath = path.join(workspaceFolder.uri.fsPath, tokenFilePath);
                }
            }
            if (fs.existsSync(fullPath)) {
                const fileContent = fs.readFileSync(fullPath, "utf8");
                this.tokenData = JSON.parse(fileContent);
                this.buildTokenMap();
                console.log("Design tokens loaded successfully");
            }
            else {
                console.error("Token file not found:", fullPath);
            }
        }
        catch (error) {
            console.error("Error loading token data:", error);
            vscode.window.showErrorMessage("Failed to load design tokens: " + error);
        }
    }
    /**
     * 构建 token 映射表，方便快速查找
     */
    buildTokenMap() {
        this.tokenMap.clear();
        this.flattenTokens(this.tokenData, "");
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
                    this.tokenMap.set(`$${fullKey.replace(/\./g, "-")}`, value);
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
function deactivate() { }
//# sourceMappingURL=extension.js.map