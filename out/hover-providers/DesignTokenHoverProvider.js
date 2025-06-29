"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DesignTokenHoverProvider = void 0;
const vscode = require("vscode");
const fs = require("fs");
const path = require("path");
const TokenInspector_1 = require("./TokenInspector");
const TokenParser_1 = require("./TokenParser");
const HoverContentFactory_1 = require("./HoverContentFactory");
/**
 * read token json files - tokenLoader
 * parse raw token into a map - tokenParser
 * provide hover information based on the token map - hoverRenderer, markdownFactory
 */
class DesignTokenHoverProvider {
    constructor() {
        this.tokenData = {};
        this.tokenMap = new Map();
        this.semanticTokenData = {};
        this.semanticTokenMap = new Map();
        this.hoverContentFactory = null;
        this.tokenInspector = null;
        this.loadTokenData();
        this.hoverContentFactory = new HoverContentFactory_1.HoverContentFactory(this);
        this.tokenInspector = new TokenInspector_1.TokenInspector(this);
        // watch for configuration changes
        vscode.workspace.onDidChangeConfiguration((e) => {
            if (e.affectsConfiguration("designToken")) {
                this.loadTokenData();
            }
        });
    }
    /**
     * load Design Token data
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
            // support both absolute and relative paths
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
            // read the file content =========================================
            if (fs.existsSync(fullPath)) {
                console.log("✅ Token file found, reading content...");
                const fileContent = fs.readFileSync(fullPath, "utf8");
                console.log("📄 File size:", fileContent.length, "characters");
                console.log("📄 File preview (first 200 chars):", fileContent.substring(0, 200) + "...");
                this.tokenData = JSON.parse(fileContent);
                console.log("🎯 Raw token data structure:", Object.keys(this.tokenData));
                //! core logic: build the token map to facilitate quick lookup when hovering
                new TokenParser_1.TokenParser().buildTokenMap(this.tokenData, this.tokenMap);
                this.tokenInspector?.outputTokenLoadingResults();
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
     * ! Provide hover information for design tokens
     * @param document - The text document being hovered over
     * @param position - The position of the hover in the document
     * @param token - The cancellation token
     * @returns A vscode.Hover object containing the hover information
     */
    provideHover(document, position, token) {
        if (this.hoverContentFactory === null) {
            console.error("❌ HoverContentFactory is not initialized");
            return;
        }
        const wordRange = document.getWordRangeAtPosition(position, /[\w\-\.]+/);
        if (!wordRange)
            return;
        const word = document.getText(wordRange);
        console.log("------🔍 Hover triggered for word:", word);
        // Check if the word is a valid token name
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
                const hoverContent = this.hoverContentFactory.createHoverContent(tokenName, tokenInfo);
                console.log("hover markdown string:", hoverContent);
                return new vscode.Hover(hoverContent, wordRange);
            }
        }
        return null;
    }
    getTokenData() {
        return this.tokenData;
    }
    getTokenMap() {
        return this.tokenMap;
    }
    getSemanticTokenData() {
        return this.semanticTokenData;
    }
    getSemanticTokenMap() {
        return this.semanticTokenMap;
    }
}
exports.DesignTokenHoverProvider = DesignTokenHoverProvider;
//# sourceMappingURL=DesignTokenHoverProvider.js.map