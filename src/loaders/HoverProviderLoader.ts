import * as vscode from "vscode";
import { Loader } from "./Loader";
import { DesignTokenHoverProvider } from "../hover-providers/DesignTokenHoverProvider";

const SUPPORTED_LANGUAGES = [
  "css",
  "scss",
  "less",
  "javascript",
  "typescript",
  "typescriptreact", // for TSX
  "javascriptreact", // for JSX
  "vue",
  "html",
];

export class HoverProviderLoader implements Loader {
  constructor(
    private context: vscode.ExtensionContext,
    private hoverProvider: DesignTokenHoverProvider
  ) {
    this.context = context;
    this.hoverProvider = hoverProvider;

    console.log("✅ Design Token Tooltip Hover Provider Loader initialized!");
  }

  public load() {
    // register hover provider for supported languages
    SUPPORTED_LANGUAGES.forEach((language) => {
      const disposable = vscode.languages.registerHoverProvider(
        language,
        this.hoverProvider
      );
      this.context.subscriptions.push(disposable);
    });
  }
}
