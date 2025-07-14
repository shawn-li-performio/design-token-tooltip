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
   * @returns The string value if found, null otherwise
   */
  private findTokenValue({
    flatTokenData,
    tokenName,
  }: {
    flatTokenData: Map<string, string>;
    tokenName: string;
  }): string | null {
    for (const [fullPath, value] of flatTokenData.entries()) {
      if (fullPath.endsWith(`.${tokenName}`) || fullPath === tokenName) {
        return value;
      }
    }
    return null;
  }

  /**
   * Creates a flat token map for easy lookup
   * This method flattens the nested token data structure into a Map with full paths as keys
   * and their corresponding values as values.
   * @param tokenNames - Structure defining token types and their associated token names
   * @param tokenData - Nested structure containing actual token values
   * @returns A Map with token names as keys and {value, type} as values
   */
  private createFlatTokenMap(
    tokenNames: TokenNames,
    tokenData: TokenData
  ): FlatTokenMap {
    const flatMap = new Map<string, TokenMapValue>();

    /**
     * Flattens a nested TokenData structure into a Map of full paths to values
     * @param obj - The object to flatten
     * @param parentPath - Current path being built
     * @param result - The map to store results in
     */
    function flattenTokenData(
      obj: any,
      parentPath: string = "",
      result: Map<string, string> = new Map()
    ): Map<string, string> {
      if (!obj || typeof obj !== "object") {
        return result;
      }

      for (const [key, value] of Object.entries(obj)) {
        const currentPath = parentPath ? `${parentPath}.${key}` : key;

        if (typeof value === "string") {
          // Found a token value at leaf node
          result.set(currentPath, value);
        } else if (typeof value === "object" && value !== null) {
          // Recursively flatten nested objects
          flattenTokenData(value, currentPath, result);
        }
      }
      return result;
    }
    const flatTokenData = flattenTokenData(tokenData);

    let notFoundTokens = [];
    for (const [tokenType, names] of Object.entries(tokenNames)) {
      for (const tokenName of names) {
        //! Find the value in the nested token data
        const value = this.findTokenValue({ flatTokenData, tokenName });

        if (value !== null) {
          flatMap.set(tokenName, {
            value,
            type: tokenType,
          });
        } else {
          // Handle missing tokens - you might want to log this or throw an error
          notFoundTokens.push(tokenName);
        }
      }
    }

    console.warn(
      "" +
        notFoundTokens.length +
        " tokens not found in token data" +
        "Details:\n",
      notFoundTokens
    );
    console.log(
      `✅ Token map created with ${flatMap.size} entries from ${
        Object.keys(tokenNames).length
      } token types.`
    );
    console.log();

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
