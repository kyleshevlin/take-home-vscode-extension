import * as vscode from 'vscode'

const { registerCommand } = vscode.commands

const PROJECT_NAME = 'kyles-github-take-home'

function displayHelloWorld() {
  vscode.window.showInformationMessage(`Hello World from ${PROJECT_NAME}!`)
}

const COMMAND_MAP = {
  helloWorld: displayHelloWorld,
}

/**
 * This method is called when your extension is activated
 * your extension is activated the very first time the command is executed
 */
export function activate(context: vscode.ExtensionContext) {
  console.log(`Extension "${PROJECT_NAME}" is now active.`)

  const commandDisposers = Object.entries(COMMAND_MAP).map(([command, fn]) =>
    registerCommand(`${PROJECT_NAME}.${command}`, fn)
  )

  context.subscriptions.push(...commandDisposers)
}

/**
 * This method is called when your extension is deactivated
 */
export function deactivate() {
  console.log(`Extension "${PROJECT_NAME}" is now inactive`)
}
