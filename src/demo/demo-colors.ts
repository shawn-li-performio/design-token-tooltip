// Demo TypeScript file to test inline color previews
// This file demonstrates how design tokens with color values
// will show inline color swatches similar to Tailwind CSS IntelliSense

// Based on the actual tokens in flat-token-map.json
const styles = {
  // These should show color previews inline (RGB colors from token file)
  primary: "brand.primary-100", // rgb(96.9% 97.8% 99.5%)
  primaryMid: "brand.primary-300", // rgb(90.8% 93.3% 98.5%)
  primaryDark: "brand.primary-500", // rgb(70.8% 78.8% 95.1%)
  surface: "system-background.surface-light", // rgb(98.8% 98.9% 99%)
  surfaceDark: "system-background.surface-dark", // rgb(10.8% 11.4% 12.6%)
};

// CSS custom properties usage
const cssVariables = {
  primaryColor: "var(--brand-primary-300)",
  surfaceColor: "var(--system-background-surface-light)",
};

// SCSS variables
const scssVars = {
  primary: "$brand-primary-500",
  surface: "$system-background-surface-light",
};

// Object property access pattern (tokens.x.y.z)
declare const tokens: any;
const tokenAccess = {
  primary: tokens.brand.primary500,
  surface: tokens.system.background.surfaceLight,
};

// Example usage in React/Vue components
const Component = () => {
  return {
    color: "brand.primary-500",
    backgroundColor: "system-background.surface-light",
    borderColor: "brand.primary-300",
  };
};

// CSS-in-JS examples
const styledComponent = {
  base: {
    color: "brand.primary-500",
    backgroundColor: "system-background.surface-light",
  },
  hover: {
    color: "brand.primary-300",
    backgroundColor: "system-background.surface-dark",
  },
};

export default styles;
