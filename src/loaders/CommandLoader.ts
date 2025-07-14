import * as vscode from "vscode";
import { DesignTokenHoverProvider } from "../hover-providers/DesignTokenHoverProvider";
import { Loader } from "./Loader";

export class CommandLoader implements Loader {
  constructor(
    private context: vscode.ExtensionContext,
    private hoverProvider: DesignTokenHoverProvider
  ) {
    this.context = context;
    this.hoverProvider = hoverProvider;

    console.log("✅ Design Token Tooltip Command Loader initialized!");
  }

  public load() {
    // register command to reload token data
    const reloadCommand = vscode.commands.registerCommand(
      "designToken.reload",
      () => {
        console.log("\n🔄 ===== MANUAL RELOAD TRIGGERED =====");
        // this.hoverProvider.loadTokenData();  // TODO: check the logic that wires hover provider with token contetx
        console.log("🔄 ===== MANUAL RELOAD COMPLETED =====\n");
        vscode.window.showInformationMessage(
          "✅ Design Token reload completed!"
        );
      }
    );
    this.context.subscriptions.push(reloadCommand);

    // Register a test command to verify the extension is loaded
    const testCommand = vscode.commands.registerCommand(
      "designToken.test",
      () => {
        vscode.window.showInformationMessage(
          "✅ Design Token extension is working!"
        );
      }
    );
    this.context.subscriptions.push(testCommand);

    const inspectCommand = vscode.commands.registerCommand(
      "designToken.inspect",
      () => {
        const tokenData = this.hoverProvider.getTokenContext().getTokenData();
        const tokenMap = this.hoverProvider.getTokenContext().getTokenMap();
        console.log("🔍 Inspecting Design Token Data");
        console.log("📋 Token Data Structure:", Object.keys(tokenData));
        console.log("Token Data Sample:", tokenData);

        console.log("📊 Token Map Size:", tokenMap.size);
        console.log("📂 Token Map Sample:", Array.from(tokenMap.entries()));
        console.log(
          "🔍 Token Map Keys:",
          Array.from(tokenMap.keys()).slice(0, 10)
        );

        vscode.window.showInformationMessage(
          "🔍 Check the console for token data inspection results!"
        );
      }
    );
    this.context.subscriptions.push(inspectCommand);
  }
}
