"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HoverProviderLoader = void 0;
const vscode = require("vscode");
const SUPPORTED_LANGUAGES = [
    "css",
    "scss",
    "less",
    "javascript",
    "typescript",
    "vue",
    "html",
];
class HoverProviderLoader {
    constructor(context, hoverProvider) {
        this.context = context;
        this.hoverProvider = hoverProvider;
        this.context = context;
        this.hoverProvider = hoverProvider;
        console.log("🎨 Design Token Tooltip Hover Provider Loader initialized!");
    }
    load() {
        // register hover provider for supported languages
        SUPPORTED_LANGUAGES.forEach((language) => {
            const disposable = vscode.languages.registerHoverProvider(language, this.hoverProvider);
            this.context.subscriptions.push(disposable);
        });
    }
}
exports.HoverProviderLoader = HoverProviderLoader;
//# sourceMappingURL=HoverProviderLoader.js.map