## 1. Install vsce (Visual Studio Code Extension manager):

```shell
npm install -g vsce
```

## 2. Package the extension for sharing

In the extension workspace (the repo we develop the intelliSense vscode extension), run following command:

```shell
npm run package

# or manually run below commands
# Build first (if using TypeScript)
npm run compile
# Package into VSIX (vsce will ignore unncessary files to reduce package size based on .vscodeignore)
vsce package
```

This creates a file like electric-design-token-intellisense-1.0.0.vsix, then proceed to share it within the team

## 3. Installing the extension for use

In the host workspace (the repo where we are using the extension e.g. PC, EDS), run following command:

via VS Code UI:

1. Command Palette -> "Extensions: Install from VSIX"
2. then pick the vsix file

> Please note there is a minimum vscode version requirement specified in package.json > engine > vscode

## 4. Uninstalling the extension

### VS Code UI Method:

1. Open Visual Studio Code
2. Go to Extensions view (Ctrl+Shift+X or Cmd+Shift+X)
3. Search for "electric-design-token-intellisense" in the installed extensions
4. Click the gear icon next to the extension
5. Select "Uninstall"
