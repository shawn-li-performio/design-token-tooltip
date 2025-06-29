"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenInspector = void 0;
class TokenInspector {
    constructor(designTokenHoverProvider) {
        this.designTokenHoverProvider = designTokenHoverProvider;
        this.designTokenHoverProvider = designTokenHoverProvider;
    }
    /**
     * 输出详细的加载结果
     */
    outputTokenLoadingResults() {
        const tokenData = this.designTokenHoverProvider.getTokenData();
        const tokenMap = this.designTokenHoverProvider.getTokenMap();
        console.log("\n🎨 ===== DESIGN TOKENS LOADED =====");
        console.log(`📊 Total tokens found: ${tokenMap.size}`);
        console.log("📋 Raw data structure keys:", Object.keys(tokenData));
        // Group tokens by type
        const tokensByType = {};
        const tokensByCategory = {};
        tokenMap.forEach((value, key) => {
            // Group by type
            const type = value.type || "unknown";
            if (!tokensByType[type])
                tokensByType[type] = [];
            tokensByType[type].push(key);
            // Group by category (first part of the key)
            const category = key.split(".")[0] || key.split("-")[0] || "root";
            if (!tokensByCategory[category])
                tokensByCategory[category] = [];
            tokensByCategory[category].push(key);
        });
        console.log("\n📂 Tokens by Type:");
        Object.entries(tokensByType).forEach(([type, tokens]) => {
            console.log(`  ${type}: ${tokens.length} tokens`);
            // Show first few examples
            const examples = tokens.slice(0, 3);
            examples.forEach((token) => {
                const value = tokenMap.get(token);
                console.log(`    ├─ ${token}: ${value.value}`);
            });
            if (tokens.length > 3) {
                console.log(`    └─ ... and ${tokens.length - 3} more`);
            }
        });
        console.log("\n🗂️ Tokens by Category:");
        Object.entries(tokensByCategory).forEach(([category, tokens]) => {
            console.log(`  ${category}: ${tokens.length} tokens`);
        });
        console.log("\n🔍 All Token Names:");
        const allTokens = Array.from(tokenMap.keys()).sort();
        allTokens.forEach((token, index) => {
            const value = tokenMap.get(token);
            const valueStr = typeof value.value === "string"
                ? value.value
                : JSON.stringify(value.value);
            console.log(`  ${(index + 1).toString().padStart(3, " ")}. ${token.padEnd(30, " ")} → ${valueStr}`);
        });
        console.log("\n✨ Sample Token Details:");
        const sampleTokens = Array.from(tokenMap.entries()).slice(0, 3);
        sampleTokens.forEach(([key, value]) => {
            console.log(`🏷️ Token: ${key}`);
            console.log(`   📝 Full data:`, JSON.stringify(value, null, 2));
        });
        console.log("\n🎯 ===== END DESIGN TOKENS =====\n");
    }
}
exports.TokenInspector = TokenInspector;
//# sourceMappingURL=OutputFormatter.js.map