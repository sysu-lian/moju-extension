// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  console.log("恭喜，您的扩展'code-assistant-extionsion'已被激活");
  vscode.window.showInformationMessage(
    "恭喜，您的扩展'code-assistant-extionsion'已被激活"
  );

  require("./webview")(context);
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {
  console.log("恭喜，您的扩展'code-assistant-extionsion'已被释放");
}

module.exports = {
  activate,
  deactivate,
};
