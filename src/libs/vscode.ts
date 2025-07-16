import * as vscode from "vscode";

export interface MessageOptions {
  showVscodeWindowMessage?: boolean;
  message: string | string[];
}

function argConverter(message: string | string[]) {
  let _message: string;
  let _items: string[];
  if (Array.isArray(message)) {
    if (message.length === 0) {
      _message = "";
      _items = [];
      return { _message, _items };
    }

    _message = message[0];
    _items = message.slice(1);
  } else {
    _message = message;
    _items = [];
  }

  return { _message, _items };
}

export function error(options: MessageOptions) {
  const { showVscodeWindowMessage = false, message } = options;
  const { _message, _items } = argConverter(message);

  if (showVscodeWindowMessage) {
    vscode.window.showErrorMessage(_message, ..._items);
  }
  console.error(_message, ..._items);
}

export function info(options: MessageOptions) {
  const { showVscodeWindowMessage = false, message } = options;
  const { _message, _items } = argConverter(message);

  if (showVscodeWindowMessage) {
    vscode.window.showInformationMessage(_message, ..._items);
  }
  console.info(_message, ..._items);
}

export function warn(options: MessageOptions) {
  const { showVscodeWindowMessage = false, message } = options;
  const { _message, _items } = argConverter(message);

  if (showVscodeWindowMessage) {
    vscode.window.showWarningMessage(_message, ..._items);
  }
  console.warn(_message, ..._items);
}
