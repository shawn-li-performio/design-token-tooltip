import { TokenData } from "./DesignTokenHoverProvider";

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
  public buildTokenMap(tokenData: TokenData, tokenMap: Map<string, any>) {
    console.log("🗺️ Building token map...");
    tokenMap.clear();
    this.flattenTokens(tokenData, "", tokenMap);
    console.log(`📊 Token map built with ${tokenMap.size} entries`);
  }

  static isColor(value: any): boolean {
    if (typeof value !== "string") return false;

    const colorRegex = /^(#[0-9a-fA-F]{3,8}|rgb\(|rgba\(|hsl\(|hsla\()/;
    return colorRegex.test(value);
  }

  /**
   * look up related sub-tokens based on the base token name
   */
  public static findRelatedTokens(
    tokenName: string,
    tokenMap: Map<string, any>,
  ): Array<{ name: string; value: any }> {
    const related: Array<{ name: string; value: any }> = [];
    const baseTokenName = tokenName.replace(/^(--|\$)/, "").replace(/-/g, ".");

    for (const [key, value] of tokenMap.entries()) {
      if (
        key !== tokenName &&
        key.includes(baseTokenName) &&
        key !== baseTokenName
      ) {
        related.push({
          name: key,
          value: value.value || value,
        });
      }
    }

    return related.slice(0, 5); // limit to 5 related tokens for display
  }

  /**
   * recursively flatten token data
   */
  private flattenTokens(obj: any, prefix: string, tokenMap: Map<string, any>) {
    for (const [key, value] of Object.entries(obj)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;

      if (value && typeof value === "object") {
        // if there is a value property, treat it as a valid token
        if ("value" in value) {
          tokenMap.set(fullKey, value);
          // support different naming conventions
          tokenMap.set(key, value);
          tokenMap.set(`--${fullKey.replace(/\./g, "-")}`, value);
          tokenMap.set(`${fullKey.replace(/\./g, "-")}`, value);

          if ("type" in value) {
            console.log(
              `  ✓ Added token: ${fullKey} = ${value.value} (${
                value.type || "no-type"
              })`,
            );
          } else {
            console.log(
              `  ✓ Added token: ${fullKey} = ${value.value} (${"no-type"})`,
            );
          }
        } else {
          // recursively flatten nested objects
          this.flattenTokens(value, fullKey, tokenMap);
        }
      }
    }
  }
}
