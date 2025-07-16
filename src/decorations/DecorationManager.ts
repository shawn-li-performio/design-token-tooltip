import * as vscode from "vscode";
import { TokenColorDecorator } from "./TokenColorDecorator";
import { TokenContext } from "../token-manager/TokenContext";

export class DecorationManager {
  private decorator: TokenColorDecorator;
  private disposables: vscode.Disposable[] = [];

  constructor(
    private context: vscode.ExtensionContext,
    tokenContext: TokenContext
  ) {
    this.decorator = new TokenColorDecorator(tokenContext);
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    // Update decorations when the active editor changes
    this.disposables.push(
      vscode.window.onDidChangeActiveTextEditor((editor) => {
        if (
          editor &&
          this.isSupportedLanguage(editor.document.languageId) &&
          this.isInlinePreviewEnabled()
        ) {
          this.decorator.updateDecorations(editor); //! update action
        }
      })
    );

    // Update decorations when document content changes
    this.disposables.push(
      vscode.workspace.onDidChangeTextDocument((event) => {
        const editor = vscode.window.activeTextEditor;
        if (
          editor &&
          event.document === editor.document &&
          this.isSupportedLanguage(editor.document.languageId) &&
          this.isInlinePreviewEnabled()
        ) {
          // Debounce the decoration updates
          setTimeout(() => {
            this.decorator.updateDecorations(editor);
          }, 100);
        }
      })
    );

    // Update decorations when a text editor becomes visible
    this.disposables.push(
      vscode.window.onDidChangeVisibleTextEditors((editors) => {
        if (this.isInlinePreviewEnabled()) {
          editors.forEach((editor) => {
            if (this.isSupportedLanguage(editor.document.languageId)) {
              this.decorator.updateDecorations(editor);
            }
          });
        }
      })
    );

    // Listen for configuration changes
    this.disposables.push(
      vscode.workspace.onDidChangeConfiguration((event) => {
        if (event.affectsConfiguration("designToken.inlineColorPreview")) {
          // Refresh all visible editors when the setting changes
          vscode.window.visibleTextEditors.forEach((editor) => {
            if (this.isSupportedLanguage(editor.document.languageId)) {
              if (this.isInlinePreviewEnabled()) {
                this.decorator.updateDecorations(editor);
              } else {
                // Clear decorations if disabled
                editor.setDecorations(this.decorator.decorationType, []);
              }
            }
          });
        }
      })
    );

    // Initial decoration for currently open editors
    if (this.isInlinePreviewEnabled()) {
      vscode.window.visibleTextEditors.forEach((editor) => {
        if (this.isSupportedLanguage(editor.document.languageId)) {
          this.decorator.updateDecorations(editor);
        }
      });
    }
  }

  private isSupportedLanguage(languageId: string): boolean {
    const supportedLanguages = [
      "typescript",
      "javascript",
      "typescriptreact",
      "javascriptreact",
      "css",
      "scss",
      "less",
      "vue",
      "html",
    ];
    return supportedLanguages.includes(languageId);
  }

  private isInlinePreviewEnabled(): boolean {
    const config = vscode.workspace.getConfiguration("designToken");
    return config.get<boolean>("inlineColorPreview", true);
  }

  public refreshDecorations(): void {
    const editor = vscode.window.activeTextEditor;
    if (
      editor &&
      this.isSupportedLanguage(editor.document.languageId) &&
      this.isInlinePreviewEnabled()
    ) {
      this.decorator.updateDecorations(editor);
    }
  }

  public refreshAllVisibleEditors(): void {
    vscode.window.visibleTextEditors.forEach((editor) => {
      if (this.isSupportedLanguage(editor.document.languageId)) {
        this.decorator.updateDecorations(editor);
      }
    });
  }

  public clearAllDecorations(): void {
    vscode.window.visibleTextEditors.forEach((editor) => {
      if (this.isSupportedLanguage(editor.document.languageId)) {
        editor.setDecorations(this.decorator.decorationType, []);
      }
    });
  }

  public dispose(): void {
    this.disposables.forEach((disposable) => disposable.dispose());
    this.decorator.dispose();
  }
}
