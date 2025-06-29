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