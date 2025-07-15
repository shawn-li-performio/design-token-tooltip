# Inline Color Preview Feature - Testing Guide

## 🎨 New Feature: Inline Color Preview

This extension now includes **inline color preview** functionality similar to Tailwind CSS IntelliSense. Color swatches appear directly next to design tokens in your code.

## How It Works

The extension automatically detects design tokens in your code and displays color swatches inline when:

1. The token value is a valid color (hex, rgb, rgba, hsl, hsla)
2. The inline preview feature is enabled (default: true)
3. You're working in a supported file type

## Supported Token Formats

### 1. String Literals

```typescript
const colors = {
  primary: "brand.primary-500", // 🔵 Shows color swatch
  surface: "system-background.surface-light", // 🔘 Shows color swatch
};
```

### 2. CSS Custom Properties

```css
.button {
  color: var(--brand-primary-500); /* 🔵 Shows color swatch */
  background: var(
    --system-background-surface-light
  ); /* 🔘 Shows color swatch */
}
```

### 3. SCSS Variables

```scss
.component {
  color: $brand-primary-500; // 🔵 Shows color swatch
  background: $system-background-surface-light; // 🔘 Shows color swatch
}
```

### 4. Object Property Access

```typescript
const theme = {
  primary: tokens.brand.primary500, // 🔵 Shows color swatch (if tokens object exists)
};
```

## Testing the Feature

### 1. Open Demo Files

- Open `src/demo-colors.ts` - TypeScript examples
- Open `src/demo-styles.css` - CSS examples

### 2. Configure Token File

Make sure your VS Code settings point to the token file:

```json
{
  "designToken.filePath": "./samples/flat-token-map.json"
}
```

### 3. Expected Behavior

You should see small color swatches (12x12px) appearing before color tokens that match your token definitions.

### 4. Test Commands

- **Ctrl+Shift+P** → "Reload Design Tokens" - Refresh token data
- **Ctrl+Shift+P** → "Toggle Inline Color Preview" - Enable/disable feature
- **Ctrl+Shift+P** → "Inspect Design Token Data" - Debug token loading

## Configuration Options

### Enable/Disable Feature

```json
{
  "designToken.inlineColorPreview": true // default: true
}
```

### Toggle via Command

Use the command palette: "Toggle Inline Color Preview"

## Supported File Types

- TypeScript (`.ts`, `.tsx`)
- JavaScript (`.js`, `.jsx`)
- CSS (`.css`)
- SCSS (`.scss`)
- Less (`.less`)
- Vue (`.vue`)
- HTML (`.html`)

## Troubleshooting

### No Color Swatches Appearing?

1. **Check token file path**: Ensure `designToken.filePath` points to valid JSON
2. **Verify feature is enabled**: Check `designToken.inlineColorPreview` setting
3. **Check token format**: Ensure your tokens match supported patterns
4. **Reload tokens**: Use "Reload Design Tokens" command
5. **Check console**: Open Developer Tools to see any error messages

### Performance Notes

- Decorations update automatically when you type
- Updates are debounced (100ms delay) for performance
- Only processes visible editors to save resources

## Known Token Patterns

Based on `flat-token-map.json`, these tokens should show color previews:

- `"brand.primary-100"` → rgb(96.9% 97.8% 99.5%)
- `"brand.primary-300"` → rgb(90.8% 93.3% 98.5%)
- `"brand.primary-500"` → rgb(70.8% 78.8% 95.1%)
- `"system-background.surface-light"` → rgb(98.8% 98.9% 99%)
- `"system-background.surface-dark"` → rgb(10.8% 11.4% 12.6%)

## Development Notes

The feature uses VS Code's `TextEditorDecorationType` API to render SVG-based color swatches as inline decorations. The implementation includes:

- Smart token pattern matching with multiple regex patterns
- Automatic token name normalization (handles dashes, dots, prefixes)
- Configuration-aware updates
- Performance optimizations with debouncing
- Proper cleanup and disposal
