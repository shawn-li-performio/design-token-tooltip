import { TokenData } from "../hover-providers/DesignTokenHoverProvider";
import { FlatTokenMap, TokenNames } from "./TokenContext";

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

    const flatTokenMap: FlatTokenMap = new Map();

    // TODO: core flatting logic here




    return flatTokenMap;
  }

  static isColor(value: any): boolean {
    if (typeof value !== "string") return false;

    const colorRegex = /^(#[0-9a-fA-F]{3,8}|rgb\(|rgba\(|hsl\(|hsla\()/;
    return colorRegex.test(value);
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
