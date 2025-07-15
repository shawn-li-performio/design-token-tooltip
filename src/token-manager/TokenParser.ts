import { TokenData } from "../hover-providers/DesignTokenHoverProvider";
import { FlatTokenMap, TokenMapValue, TokenNames } from "./TokenContext";
import { TokenDataLoader } from "./TokenDataLoader";

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
  }): string | Record<string, string> | null {
    function createTokenRegex(tokenName: string): RegExp {
      // Escape special regex characters in tokenName
      const escapedTokenName = tokenName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      return new RegExp(`${escapedTokenName}\\.(\\w+)`);
    }
    function haveSamePrefix(keyArray: string[]): boolean {
      if (keyArray.length === 0) return true;

      // Extract prefix from each key (everything before the last dot)
      const prefixes = keyArray.map((key) => {
        const lastDotIndex = key.lastIndexOf(".");
        return lastDotIndex !== -1 ? key.substring(0, lastDotIndex) : key;
      });

      // Check if all prefixes are the same
      const firstPrefix = prefixes[0];
      return prefixes.every((prefix) => prefix === firstPrefix);
    }

    const compoundTokenValueFullPaths: string[] = [];
    for (const [fullPath, value] of flatTokenData.entries()) {
      if (fullPath.endsWith(`.${tokenName}`) || fullPath === tokenName) {
        return value;
      } else if (fullPath.includes(tokenName)) {
        // for compound token values, we need to collect all paths that match the tokenName
        const regex = createTokenRegex(tokenName);
        if (fullPath.match(regex)) {
          compoundTokenValueFullPaths.push(fullPath);
        }
      }
    }

    // construct the compound token value object
    if (
      compoundTokenValueFullPaths.length > 0 &&
      haveSamePrefix(compoundTokenValueFullPaths)
    ) {
      const compoundValue: Record<string, string> = {};
      // Extract the last part of the full path as the key
      for (const path of compoundTokenValueFullPaths) {
        const key = path.split(".").pop();
        const value = flatTokenData.get(path);
        if (key && value) {
          compoundValue[key] = value;
        }
      }
      return compoundValue;
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
          result.set(currentPath, value);
        } else if (typeof value === "number") {
          result.set(currentPath, value.toString()); // the value might be a number, this is likely due to upperstream typo
        } else if (typeof value === "object" && value !== null) {
          flattenTokenData(value, currentPath, result);
        }
      }
      return result;
    }
    const flatTokenData = flattenTokenData(tokenData);
    TokenDataLoader.exportTokenMap({
      map: flatTokenData,
      fileName: "flat-token-data.json",
    });

    /**
     * Flatten the token names structure into a Map
     * this is to facilitate flat token map creation process since token names can be duplicated in origial tokenNames
     * e.g. "forms.inputs.inline-placeholder-hover-foreground" can be both in 'ThemeColorsToken' and 'SemanticColorToken'
     * @returns Map<string, string[]> - A map where each key is a token name and the value is an array of token types (yes, a token name can have multiple token types)
     */
    function flattenTokenNames(tokenNames: TokenNames): Map<string, string[]> {
      const flatTokenNames = new Map<string, string[]>();
      Object.keys(tokenNames).forEach((tokenType) => {
        tokenNames[tokenType].forEach((tokenName) => {
          if (!flatTokenNames.has(tokenName)) {
            flatTokenNames.set(tokenName, []);
          }
          flatTokenNames.get(tokenName)?.push(tokenType);
        });
      });

      return flatTokenNames;
    }
    const flatTokenNames = flattenTokenNames(tokenNames);
    TokenDataLoader.exportTokenMap({
      map: flatTokenNames,
      fileName: "flat-token-names.json",
    });


    let notFoundTokens = [];
    let duplicatedTokenNames = [];
    for (const [tokenName, tokenTypes] of flatTokenNames.entries()) {
      const value = this.findTokenValue({ flatTokenData, tokenName });

      if (value !== null) {
        if (flatMap.has(tokenName)) {
          duplicatedTokenNames.push(tokenName);
        }

        flatMap.set(tokenName, {
          value,
          type: tokenTypes,
        });
      } else {
        notFoundTokens.push(tokenName);
      }
    }

    console.warn(
      "" +
        notFoundTokens.length +
        " tokens not found in token data" +
        "Details:\n",
      notFoundTokens
    );
    console.log(`flatTokenNames size: ${flatTokenNames.size}`);
    console.log(
      `✅ Token map created with ${flatMap.size} entries from ${
        Object.keys(tokenNames).length
      } token types with a total of ${flatTokenNames.size} tokens.`
    );
    console.log(`duplicated token names:`, duplicatedTokenNames);

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
