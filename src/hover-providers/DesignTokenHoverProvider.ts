import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import { TokenParser } from "../token-manager/TokenParser";
import { HoverContentFactory } from "./HoverContentFactory";
import { TokenDataLoader } from "../token-manager/TokenDataLoader";
import { TokenContext } from "../token-manager/TokenContext";

interface DesignToken {
  [key: string]: any;
  value?: string | number;
  type?: string;
  description?: string;
}

export interface TokenData {
  [key: string]: DesignToken | TokenData;
}

/**
 * read token json files - tokenLoader
 * parse raw token into a map - tokenParser
 * provide hover information based on the token map - hoverRenderer, markdownFactory
 */
export class DesignTokenHoverProvider implements vscode.HoverProvider {
  private hoverContentFactory: null | HoverContentFactory = null;
  private tokenContext: TokenContext | null = null;

  constructor(tokenContext: TokenContext) {
    console.log("🔄 Initializing DesignTokenHoverProvider...");

    this.tokenContext = tokenContext;

    this.hoverContentFactory = new HoverContentFactory(this);

    // // watch for configuration changes
    // vscode.workspace.onDidChangeConfiguration((e) => {
    //   if (e.affectsConfiguration("designToken")) {
    //     this.loadTokenData();
    //   }
    // });
  }

  /**
   * ! Provide hover information for design tokens
   * @param document - The text document being hovered over
   * @param position - The position of the hover in the document
   * @param token - The cancellation token
   * @returns A vscode.Hover object containing the hover information
   */
  provideHover(
    document: vscode.TextDocument,
    position: vscode.Position,
    token: vscode.CancellationToken
  ): vscode.ProviderResult<vscode.Hover> {
    if (this.hoverContentFactory === null) {
      console.error("❌ HoverContentFactory is not initialized");
      return;
    }

    const wordRange = document.getWordRangeAtPosition(position, /[\w\-\.]+/);
    if (!wordRange) return;

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
      const tokenInfo = this.tokenContext?.getTokenMap().get(tokenName);
      console.log("hovering - ", `🔎 Checking token: ${tokenName}`, tokenInfo);
      if (tokenInfo) {
        const hoverContent = this.hoverContentFactory.createHoverContent(
          tokenName,
          tokenInfo
        );
        console.log("hover markdown string:", hoverContent);
        return new vscode.Hover(hoverContent, wordRange);
      }
    }

    return null;
  }

  public getTokenContext(): TokenContext {
    if (this.tokenContext === null) {
      throw new Error("TokenContext is not initialized");
    }
    return this.tokenContext;
  }
}
