import * as vscode from "vscode";
import { TokenDataLoader } from "./TokenDataLoader";
import { TokenParser } from "./TokenParser";

interface DesignToken {
  [key: string]: any;
  value?: string | number;
  type?: string;
  description?: string;
}

interface TokenData {
  [key: string]: DesignToken | TokenData;
}

export class TokenContext {
  private tokenData: TokenData = {};
  private tokenMap: Map<string, any> = new Map();

  private tokenDataLoader: null | TokenDataLoader = null;
  // token parser - parse tokanData into tokenMap
  // token query (including current token inspector) - mainly for extracting information from tokenMap
  // a dedicated HoverContentFactory that uses token query to build hover content

  constructor() {
    // step1:
    this.tokenDataLoader = new TokenDataLoader(this);
    this.tokenDataLoader.load(); // read and merge into a big token json file,
    console.log("🔄 Token Json file merged...");

    //! step2: build tokenMap from the big merged token json file
    new TokenParser().buildTokenMap(this.tokenData, this.tokenMap);
    // this.tokenInspector?.outputTokenLoadingResults();

    vscode.window.showInformationMessage(
    `✅ Design tokens loaded! Found ${this.tokenMap.size} tokens.`
    );
  }

  //! tokenParser: make sure the key is unique

  // token query methods -> allowing lookup token reference tree
  // isReferenceToken
  // isPrimitiveToken
  // getTokenReference tree

  public getTokenData(): TokenData {
    return this.tokenData;
  }
  public getTokenMap(): Map<string, any> {
    return this.tokenMap;
  }
}
