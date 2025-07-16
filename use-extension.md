## 1. Install vsce (Visual Studio Code Extension manager):

```shell
npm install -g vsce
```

## 2. Package the extension for sharing

In the extension workspace (the repo we develop the intelliSense vscode extension), run following command:

```shell
# Build first (if using TypeScript)
npm run compile

# Package into VSIX (vsce will ignore unncessary files to reduce package size based on .vscodeignore)
vsce package
```

This creates a file like electric-design-token-intellisense-1.0.0.vsix, then proceed to share it within the team

## 3. Installing the extension for use

Please note there is a minimum vscode version requirement specified in package.json > engine > vscode

In the host workspace (the repo where we are using the extension e.g. PC, EDS), run following command:

```shell
# Command line
code --install-extension electric-design-token-intellisense-1.0.0.vsix

# Or via VS Code UI:
# Command Palette -> "Extensions: Install from VSIX" -> pick the vsix file
```

If `code` command is not availabe, you can manually add it command to your PATH:

1. Open Visual Studio Code
2. Press Cmd+Shift+P to open the Command Palette
3. Type "Shell Command: Install 'code' command in PATH" and select it
4. This will add the code command to your system PATH
