/// extension.ts - 主入口文件
import * as vscode from "vscode";
import { DesignTokenHoverProvider } from "./hover-providers/DesignTokenHoverProvider";
import { CommandLoader } from "./loaders/CommandLoader";
import { HoverProviderLoader } from "./loaders/HoverProviderLoader";
import { TokenContext } from "./token-manager/TokenContext";
import { DecorationManager } from "./decorations/DecorationManager";

export function activate(context: vscode.ExtensionContext) {
  console.log("🎨 Design Token Tooltip extension is now active!");
  vscode.window.showInformationMessage(
    "Design Token Tooltip extension activated!"
  );

  // need to have a TokenContextProvider at the top level, then hoverProvider, autocompleteProvider, etc. can use it

  const tokenContext = new TokenContext(context); //! read and build token context --> flat token map
  console.log("✅ Token context initialized...");

  const hoverProvider = new DesignTokenHoverProvider(tokenContext); // wire up the hover provider with the token context

  // Initialize inline color decorations
  const decorationManager = new DecorationManager(context, tokenContext);
  context.subscriptions.push(decorationManager);
  console.log("✅ Token color decorations initialized...");

  new HoverProviderLoader(context, hoverProvider).load(); // load into vscode
  new CommandLoader(context, hoverProvider, decorationManager).load();
}

export function deactivate() {}
