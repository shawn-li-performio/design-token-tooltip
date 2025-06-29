"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenParser = void 0;
/**
 * TokenParser: A utility class to parse and flatten design tokens, also includes some token related utilities.
 */
class TokenParser {
    /**
     *! core logic of design token hover provider:
     *! build token map from token data to facilitate quick lookups when hovering
     * @param tokenData - The token data object containing design tokens
     * @param tokenMap - The map to store flattened tokens
     */
    buildTokenMap(tokenData, tokenMap) {
        console.log("🗺️ Building token map...");
        tokenMap.clear();
        this.flattenTokens(tokenData, "", tokenMap);
        console.log(`📊 Token map built with ${tokenMap.size} entries`);
    }
    static isColor(value) {
        if (typeof value !== "string")
            return false;
        const colorRegex = /^(#[0-9a-fA-F]{3,8}|rgb\(|rgba\(|hsl\(|hsla\()/;
        return colorRegex.test(value);
    }
    /**
     * look up related sub-tokens based on the base token name
     */
    static findRelatedTokens(tokenName, tokenMap) {
        const related = [];
        const baseTokenName = tokenName.replace(/^(--|\$)/, "").replace(/-/g, ".");
        for (const [key, value] of tokenMap.entries()) {
            if (key !== tokenName &&
                key.includes(baseTokenName) &&
                key !== baseTokenName) {
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
    flattenTokens(obj, prefix, tokenMap) {
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
                        console.log(`  ✓ Added token: ${fullKey} = ${value.value} (${value.type || "no-type"})`);
                    }
                    else {
                        console.log(`  ✓ Added token: ${fullKey} = ${value.value} (${"no-type"})`);
                    }
                }
                else {
                    // recursively flatten nested objects
                    this.flattenTokens(value, fullKey, tokenMap);
                }
            }
        }
    }
}
exports.TokenParser = TokenParser;
//# sourceMappingURL=TokenParser.js.map