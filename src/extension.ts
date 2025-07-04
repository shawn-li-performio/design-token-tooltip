/// extension.ts - 主入口文件
import * as vscode from "vscode";
import { DesignTokenHoverProvider } from "./hover-providers/DesignTokenHoverProvider";
import { CommandLoader } from "./loaders/CommandLoader";
import { HoverProviderLoader } from "./loaders/HoverProviderLoader";

export function activate(context: vscode.ExtensionContext) {
  console.log("🎨 Design Token Tooltip extension is now active!");
  vscode.window.showInformationMessage(
    "Design Token Tooltip extension activated!",
  );

  // need to have a TokenContextProvider at the top level, then hoverProvider, autocompleteProvider, etc. can use it
  const hoverProvider = new DesignTokenHoverProvider();
  new HoverProviderLoader(context, hoverProvider).load();
  new CommandLoader(context, hoverProvider).load();
}

export function deactivate() {}
