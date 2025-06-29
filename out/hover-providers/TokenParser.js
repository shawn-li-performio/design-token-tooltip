"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenParser = void 0;
class TokenParser {
    /**
     * 构建 token 映射表，方便快速查找
     * we made this method stateless
     */
    buildTokenMap(tokenData, tokenMap) {
        console.log("🗺️ Building token map...");
        tokenMap.clear();
        this.flattenTokens(tokenData, "", tokenMap);
        console.log(`📊 Token map built with ${tokenMap.size} entries`);
    }
    /**
     * 判断是否为颜色值
     */
    static isColor(value) {
        if (typeof value !== "string")
            return false;
        const colorRegex = /^(#[0-9a-fA-F]{3,8}|rgb\(|rgba\(|hsl\(|hsla\()/;
        return colorRegex.test(value);
    }
    /**
     * 查找相关的子 token
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
        return related.slice(0, 5); // 限制显示数量
    }
    /**
     * 递归扁平化 token 数据
     */
    flattenTokens(obj, prefix, tokenMap) {
        for (const [key, value] of Object.entries(obj)) {
            const fullKey = prefix ? `${prefix}.${key}` : key;
            if (value && typeof value === "object") {
                // 如果有 value 属性，说明这是一个具体的 token
                if ("value" in value) {
                    tokenMap.set(fullKey, value);
                    // 同时支持不同的命名方式
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
                    // 递归处理嵌套对象
                    this.flattenTokens(value, fullKey, tokenMap);
                }
            }
        }
    }
}
exports.TokenParser = TokenParser;
//# sourceMappingURL=TokenParser.js.map