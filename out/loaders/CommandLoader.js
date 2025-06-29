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
        // 注册命令来重新加载 token 数据
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
    }
}
exports.CommandLoader = CommandLoader;
//# sourceMappingURL=CommandLoader.js.map