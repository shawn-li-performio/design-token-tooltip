import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import { TokenInspector } from "../token-manager/TokenInspector";
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
  private tokenData: TokenData = {};
  private tokenMap: Map<string, any> = new Map();

  private hoverContentFactory: null | HoverContentFactory = null;
  private tokenInspector: TokenInspector | null = null;
  private tokenContext: TokenContext | null = null;

  constructor(tokenContext: TokenContext) {
    console.log("🔄 Initializing DesignTokenHoverProvider...");

    this.tokenContext = tokenContext;
    // TOOD: populate value for tokenData and tokenMap from merged file

    // // TODO: build tokenMap
    // //! core logic: build the token map to facilitate quick lookup when hovering
    // new TokenParser().buildTokenMap(this.tokenData, this.tokenMap);
    // this.tokenInspector?.outputTokenLoadingResults();

    // vscode.window.showInformationMessage(
    //   `✅ Design tokens loaded! Found ${this.tokenMap.size} tokens.`,
    // );

    // this.hoverContentFactory = new HoverContentFactory(this);
    // this.tokenInspector = new TokenInspector(this);

    // // watch for configuration changes
    // vscode.workspace.onDidChangeConfiguration((e) => {
    //   if (e.affectsConfiguration("designToken")) {
    //     this.loadTokenData();
    //   }
    // });
  }

  /**
   * load Design Token data
   */
  // loadTokenData() {
  //   console.log("🔄 Starting to load design tokens...");

  //   try {
  //     //! core logic: build the token map to facilitate quick lookup when hovering
  //     new TokenParser().buildTokenMap(this.tokenNa, this.tokenMap);
  //     this.tokenInspector?.outputTokenLoadingResults();

  //     vscode.window.showInformationMessage(
  //       `✅ Design tokens loaded! Found ${this.tokenMap.size} tokens.`
  //     );
  //   } catch (error) {
  //     console.error("💥 Error loading token data:", error);
  //     if (error instanceof SyntaxError) {
  //       vscode.window.showErrorMessage(
  //         `Invalid JSON in token file: ${error.message}`
  //       );
  //     } else {
  //       vscode.window.showErrorMessage(
  //         "Failed to load design tokens: " + error
  //       );
  //     }
  //   }
  // }

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
      const tokenInfo = this.tokenMap.get(tokenName);
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

  public getTokenData(): TokenData {
    return this.tokenData;
  }
  public getTokenMap(): Map<string, any> {
    return this.tokenMap;
  }
}
