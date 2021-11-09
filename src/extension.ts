import * as vscode from 'vscode'
import * as tsEsTree from '@typescript-eslint/typescript-estree'
import { generate } from 'astring'

const PROJECT_NAME = 'kyles-github-take-home'

/**
 * This method is called when your extension is activated
 * your extension is activated the very first time the command is executed
 */
export function activate(context: vscode.ExtensionContext) {
  console.log(`Extension "${PROJECT_NAME}" is now active.`)

  context.subscriptions.push(
    vscode.languages.registerCodeActionsProvider(
      ['javascript', 'typescript'],
      new Refactorer(),
      {
        providedCodeActionKinds: Refactorer.providedCodeActionKinds,
      }
    )
  )
}

/**
 * This method is called when your extension is deactivated
 */
export function deactivate() {
  console.log(`Extension "${PROJECT_NAME}" is now inactive`)
}

/**
 * Goal
 *
 * I want to be able to quickly turn:
 *
 * ```
 * return value
 * ```
 *
 * into:
 *
 * ```
 * const result = value
 * console.log({ result })
 * return result
 */
export class Refactorer implements vscode.CodeActionProvider {
  public static readonly providedCodeActionKinds = [
    vscode.CodeActionKind.Refactor,
  ]

  public provideCodeActions(
    document: vscode.TextDocument,
    range: vscode.Range | vscode.Selection
  ) {
    if (!this.determineIfActionable(document, range)) {
      return
    }

    const resultLogger = this.createResultLoggerAction(document, range)

    return [resultLogger]
  }

  /**
   * This method determines if the current range for the document is actionable
   */
  private determineIfActionable(
    document: vscode.TextDocument,
    range: vscode.Range | vscode.Selection
  ) {
    const start = range.start
    const line = document.lineAt(start.line)

    return hasReturnValue(line.text)
  }

  /**
   * This method creates the action that will convert a returned value into a
   * "result logger"
   */
  private createResultLoggerAction(
    document: vscode.TextDocument,
    range: vscode.Range | vscode.Selection
  ) {
    const start = range.start
    const line = document.lineAt(start.line)
    // TODO: I would prefer not to create an action at all if there's somehow no return value
    const value = getReturnValue(line.text) || ''

    const action = new vscode.CodeAction(
      'Refactor into result logger',
      vscode.CodeActionKind.Refactor
    )
    action.edit = new vscode.WorkspaceEdit()
    action.isPreferred = true
    action.edit.replace(
      document.uri,
      line.range,
      createResultLoggerString(value)
    )

    return action
  }
}

function getAST(text: string) {
  return tsEsTree.parse(text)
}

function getReturnValue(text: string) {
  const ast = getAST(text)

  if (ast.type !== 'Program' || !ast.body.length) {
    return
  }

  const item = ast.body[0]

  if (item.type !== 'ReturnStatement' || item.argument === null) {
    return
  }

  const arg = item.argument

  return generate(arg)
}

function hasReturnValue(text: string) {
  return Boolean(getReturnValue(text))
}

function createResultLoggerString(value: string): string {
  // TODO: could improve by adding whitespacing at the start of lines to match
  return `const result = ${value};\nconsole.log({ result });\nreturn result;`
}
