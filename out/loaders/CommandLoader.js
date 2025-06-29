"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommandLoader = void 0;
const vscode = require("vscode");
class CommandLoader {
    constructor(context, hoverProvider) {
        this.context = context;
        this.hoverProvider = hoverProvider;
        this.context = context;
        this.hoverProvider = hoverProvider;
        console.log("🎨 Design Token Tooltip Command Loader initialized!");
    }
    load() {
        // register command to reload token data
        const reloadCommand = vscode.commands.registerCommand("designToken.reload", () => {
            console.log("\n🔄 ===== MANUAL RELOAD TRIGGERED =====");
            this.hoverProvider.loadTokenData();
            console.log("🔄 ===== MANUAL RELOAD COMPLETED =====\n");
            vscode.window.showInformationMessage("✅ Design Token reload completed!");
        });
        this.context.subscriptions.push(reloadCommand);
        // Register a test command to verify the extension is loaded
        const testCommand = vscode.commands.registerCommand("designToken.test", () => {
            vscode.window.showInformationMessage("✅ Design Token extension is working!");
        });
        this.context.subscriptions.push(testCommand);
        const inspectCommand = vscode.commands.registerCommand("designToken.inspect", () => {
            const tokenData = this.hoverProvider.getTokenData();
            const tokenMap = this.hoverProvider.getTokenMap();
            console.log("🔍 Inspecting Design Token Data");
            console.log("📋 Token Data Structure:", Object.keys(tokenData));
            console.log("Token Data Sample:", tokenData);
            console.log("📊 Token Map Size:", tokenMap.size);
            console.log("📂 Token Map Sample:", Array.from(tokenMap.entries()));
            console.log("🔍 Token Map Keys:", Array.from(tokenMap.keys()).slice(0, 10));
            vscode.window.showInformationMessage("🔍 Check the console for token data inspection results!");
        });
        this.context.subscriptions.push(inspectCommand);
    }
}
exports.CommandLoader = CommandLoader;
//# sourceMappingURL=CommandLoader.js.map