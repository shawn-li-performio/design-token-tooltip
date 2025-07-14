import { TokenData } from "../hover-providers/DesignTokenHoverProvider";
import { FlatTokenMap, TokenMapValue, TokenNames } from "./TokenContext";

/**
 * TokenParser: A utility class to parse and flatten design tokens, also includes some token related utilities.
 */
export class TokenParser {
  /**
   *! core logic of design token hover provider:
   *! build token map from token data to facilitate quick lookups when hovering
   *!FIXME: not yet support chunk loading of token data
   * - this is a simple implementation that flattens the token data structure

   * @param tokenData - The token data object containing design tokens
   * @param tokenMap - The map to store flattened tokens
   */
  public buildTokenMap(
    tokenNames: TokenNames,
    tokenData: TokenData
  ): FlatTokenMap {
    console.log("🗺️ Building token map...");

    return this.createFlatTokenMap(tokenNames, tokenData);
  }

  static isColor(value: any): boolean {
    if (typeof value !== "string") return false;

    const colorRegex = /^(#[0-9a-fA-F]{3,8}|rgb\(|rgba\(|hsl\(|hsla\()/;
    return colorRegex.test(value);
  }

  /**
   * !Recursively searches for a token value in the nested TokenData structure
   * @param tokenData - The nested token data structure
   * @param path - Array of path segments to traverse
   * @param tokenType - The type of the token (used for speedup map building and reduce conflicts when resolving the path)
   * @returns The string value if found, null otherwise
   */
  private findTokenValue(
    tokenData: TokenData,
    path: string[],
    tokenType: string
  ): string | null {
    let current: any = tokenData;

    // semantic token resolving
    if (tokenType.toLowerCase().includes("semantic") && tokenData.semanticTokens) {
      let semanticCurrent: any = tokenData.semanticTokens;
      for (const segment of path) {
        if (semanticCurrent && typeof semanticCurrent === "object" && segment in semanticCurrent) {
          semanticCurrent = semanticCurrent[segment];  // traverse down to the next node
        } else {
          semanticCurrent = null;
          break;
        }
      }
      if (typeof semanticCurrent === "string") {
        return semanticCurrent;
      }
    }

    // other token resolving
    for (const segment of path) {
      if (current && typeof current === "object" && segment in current) {
        current = current[segment];
      } else {
        return null;
      }
    }

    // The final value should be a string
    return typeof current === "string" ? current : null;
  }

  /**
   * Creates a flat token map from TokenNames and TokenData
   * @param tokenNames - Structure defining token types and their associated token names
   * @param tokenData - Nested structure containing actual token values
   * @returns A Map with token names as keys and {value, type} as values
   */
  private createFlatTokenMap(
    tokenNames: TokenNames,
    tokenData: TokenData
  ): FlatTokenMap {
    const flatMap = new Map<string, TokenMapValue>();

    let notFoundTokenCount = 0;
    // Iterate through all token types
    for (const [tokenType, names] of Object.entries(tokenNames)) {
      // For each token name in the current type
      for (const tokenName of names) {
        // Split the token name into path segments (e.g., "data-grid.typography.ag-font-family" -> ["data-grid", "typography", "ag-font-family"])
        const pathSegments = tokenName.split(".");

        //! Find the value in the nested token data
        const value = this.findTokenValue(tokenData, pathSegments, tokenType);

        if (value !== null) {
          flatMap.set(tokenName, {
            value,
            type: tokenType,
          });
        } else {
          // Handle missing tokens - you might want to log this or throw an error
          console.warn(
            `Token "${tokenName}" of type "${tokenType}" not found in token data`
          );
          notFoundTokenCount++;
        }
      }
    }

    console.warn("" + notFoundTokenCount + " tokens not found in token data");

    return flatMap;
  }

  /**
   * Determines the token type based on the TokenNames structure
   * @param tokenNames - The token names structure
   * @param tokenName - The specific token name to find the type for
   * @returns The token type (key from TokenNames) or 'unknown' if not found
   */
  private getTokenType(tokenNames: TokenNames, tokenName: string): string {
    for (const [type, names] of Object.entries(tokenNames)) {
      if (names.includes(tokenName)) {
        return type;
      }
    }
    return "unknown";
  }

  //! tokenParser: make sure the key is unique
  // the raw tokenData is hierarchical, but tokeMap needs to be flat for quick lookup (autocomplete might also make use of it)
  // given a token name, token map should returns info:
  // - the file path it comes from in style dictionary --> useful for resolving conflicts
  // - the resultant value
  // - the type of the token --> we may need it to determine how to preview the token
  // - the reference tree of the token
  // - the description of the token
  // - other metadata if needed
  public parseTokenDataToMap() {}
}
