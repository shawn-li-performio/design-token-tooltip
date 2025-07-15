import * as vscode from "vscode";
import { TokenDataLoader } from "./TokenDataLoader";
import { TokenParser } from "./TokenParser";

export type TokenNames = {
  [key: string]: string[];
};

type AllTokenNames<T extends TokenNames> = T[keyof T][number]; // flat the token names into a single type

type DesignToken = {
  [key: string]: string | { [key: string]: DesignToken };
};

export type TokenData = {
  [key: string]: DesignToken;
};

export type TokenMapValue = {
  value: string | Record<string, string>; // some token has a compound value
  type: string;
};

export type FlatTokenMap = Map<AllTokenNames<TokenNames>, TokenMapValue>;

/**
 * main class for managing design tokens - backend of the extension
 * - load token data from file
 * - parse token data into a flat map for quick lookup
 * - provide methods to query token data
 * - provide methods to inspect token data
 *
 */
export class TokenContext {
  private tokenNames: TokenNames = {};
  private tokenData: TokenData = {};
  private flatTokenMap: FlatTokenMap = new Map(); // core data structure for quick token lookup in hover provider

  private tokenDataLoader: null | TokenDataLoader = null;
  // token parser - parse tokanData into flatTokenMap
  // token query (including current token inspector) - mainly for extracting information from flatTokenMap
  // a dedicated HoverContentFactory that uses token query to build hover content

  constructor() {
    // step1:
    this.tokenDataLoader = new TokenDataLoader(this);
    this.tokenDataLoader.load(); // read electric-raw-token.json and assgin value to `this.tokenData` and `this.tokenNames`
    console.log("✅ Token names loaded:", Object.keys(this.tokenNames));
    console.log("✅ Token data loaded:", Object.keys(this.tokenData));

    //! step2: build flatTokenMap from the big merged token json file
    const flatTokenMap = new TokenParser().buildTokenMap(
      this.tokenNames,
      this.tokenData
    );
    this.flatTokenMap = flatTokenMap;

    TokenDataLoader.exportTokenMap({
      map: flatTokenMap,
      fileName: "flat-token-map.json",
    }); // export the token map to a json file for quick lookup
    vscode.window.showInformationMessage(
      `✅ Design tokens loaded! Found ${this.flatTokenMap.size} tokens.`
    );
  }

  // token query methods -> allowing lookup token reference tree
  // isReferenceToken
  // isPrimitiveToken
  // getTokenReference tree

  public getTokenNames(): TokenNames {
    return this.tokenNames;
  }
  public setTokenNames(tokenNames: TokenNames): void {
    this.tokenNames = tokenNames;
  }

  public getTokenData(): TokenData {
    return this.tokenData;
  }
  public setTokenData(tokenData: TokenData): void {
    this.tokenData = tokenData;
  }

  public getTokenMap(): Map<string, any> {
    return this.flatTokenMap;
  }
  public setTokenMap(flatTokenMap: Map<string, any>): void {
    this.flatTokenMap = flatTokenMap;
  }
}
