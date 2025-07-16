import * as vscode from "vscode";
import { TokenContext } from "../token-manager/TokenContext";
import { TokenParser } from "../token-manager/TokenParser";

export class TokenColorDecorator {
  public decorationType: vscode.TextEditorDecorationType;
  private tokenContext: TokenContext;

  constructor(tokenContext: TokenContext) {
    this.tokenContext = tokenContext;

    // Create decoration type for color previews
    this.decorationType = vscode.window.createTextEditorDecorationType({
      before: {
        margin: "0 4px 0 0",
        width: "12px",
        height: "12px",
      },
    });
  }

  // ! core decoration creation logic
  public updateDecorations(editor: vscode.TextEditor): void {
    if (!editor) {
      return;
    }

    const decorations: vscode.DecorationOptions[] = [];
    const text = editor.document.getText();
    const tokenMap = this.tokenContext.getTokenMap();

    // Multiple regex patterns to match different token formats
    const tokenPatterns = [
      // String literals with quotes
      /["'`]([a-zA-Z][a-zA-Z0-9\-\.\_]*?)["'`]/g,
      // CSS custom properties
      /var\(\s*--([a-zA-Z][a-zA-Z0-9\-\.\_]*?)\s*\)/g,
      // SCSS variables
      /\$([a-zA-Z][a-zA-Z0-9\-\.\_]*)/g,
      // Object property access (tokens.color.primary)
      /tokens\.([a-zA-Z][a-zA-Z0-9\-\.\_]*(?:\.[a-zA-Z][a-zA-Z0-9\-\.\_]*)*)/g,
    ];

    tokenPatterns.forEach((regex, patternIndex) => {
      let match;
      const patternRegex = new RegExp(regex.source, regex.flags);

      while ((match = patternRegex.exec(text)) !== null) {
        const tokenName = match[1];
        const tokenInfo = this.findTokenInfo(tokenName, tokenMap);

        if (tokenInfo && TokenParser.isColor(tokenInfo.value)) {
          // Calculate the position for the decoration
          let startPos: vscode.Position;
          let endPos: vscode.Position;

          if (patternIndex === 0) {
            // For quoted strings, skip the quote
            startPos = editor.document.positionAt(match.index + 1);
            endPos = editor.document.positionAt(
              match.index + match[1].length + 1
            );
          } else {
            // For other patterns, use the full match
            startPos = editor.document.positionAt(match.index);
            endPos = editor.document.positionAt(match.index + match[0].length);
          }

          const decoration: vscode.DecorationOptions = {
            range: new vscode.Range(startPos, endPos),
            renderOptions: {
              before: {
                contentIconPath: this.createColorIcon(tokenInfo.value),
                margin: "0 4px 0 0",
                width: "12px",
                height: "12px",
              },
            },
            // hoverMessage: `🎨 **${tokenName}**: ${tokenInfo.value}`,
          };

          decorations.push(decoration);
        }
      }
    });

    editor.setDecorations(this.decorationType, decorations);
  }

  private findTokenInfo(tokenName: string, tokenMap: Map<string, any>): any {
    // Try different token name variations
    const possibleTokens = [
      tokenName,
      `--${tokenName}`,
      `$${tokenName}`,
      tokenName.replace(/^--/, ""),
      tokenName.replace(/^\$/, ""),
      tokenName.replace(/-/g, "."),
      tokenName.replace(/\./g, "-"),
    ];

    for (const possibleToken of possibleTokens) {
      const tokenInfo = tokenMap.get(possibleToken);
      if (tokenInfo) {
        return tokenInfo;
      }
    }

    return null;
  }

  private createColorIcon(colorValue: string): vscode.Uri {
    // Create an SVG data URI for the color swatch
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12">
      <rect width="12" height="12" rx="2" fill="${colorValue}" stroke="rgba(128,128,128,0.5)" stroke-width="0.5"/>
    </svg>`;

    const encodedSvg = encodeURIComponent(svg);
    return vscode.Uri.parse(`data:image/svg+xml;utf8,${encodedSvg}`);
  }

  public dispose(): void {
    this.decorationType.dispose();
  }
}
