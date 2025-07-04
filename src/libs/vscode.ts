import * as vscode from "vscode";

function notift(msg: string) {
  vscode.window.showErrorMessage(msg);
}
