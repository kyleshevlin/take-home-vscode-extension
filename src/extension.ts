import * as vscode from 'vscode'
import * as tsEsTree from '@typescript-eslint/typescript-estree'

const PROJECT_NAME = 'kyles-github-take-home'

/**
 * This method is called when your extension is activated
 * your extension is activated the very first time the command is executed
 */
export function activate(context: vscode.ExtensionContext) {
  console.log(`Extension "${PROJECT_NAME}" is now active.`)

  context.subscriptions.push(
    vscode.languages.registerCodeActionsProvider(
      // TODO: add TS and activationEvent in package.json
      'javascript',
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
    vscode.CodeActionKind.QuickFix,
  ]

  public provideCodeActions(
    document: vscode.TextDocument,
    range: vscode.Range | vscode.Selection
  ) {
    if (!this.determineIfActionable(document, range)) {
      console.log('nope')
      return
    }

    console.log('yep')

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
    const ast = tsEsTree.parse(line.text)

    return hasReturnStatementWithArgument(ast)
  }

  /**
   * This method creates the action that will convert a returned value into a
   * "result logger"
   */
  private createResultLoggerAction(
    document: vscode.TextDocument,
    range: vscode.Range | vscode.Selection
  ) {
    const action = new vscode.CodeAction(
      'Refactor into result logger',
      vscode.CodeActionKind.QuickFix
    )
    action.edit = new vscode.WorkspaceEdit()
    action.isPreferred = true
    action.edit.replace(document.uri, range, 'TODO: get this to work')

    return action
  }
}

// TODO: improve type later
function hasReturnStatementWithArgument(ast: tsEsTree.AST<any>) {
  if (!ast || ast.type !== 'Program' || !ast.body.length) {
    return false
  }

  const item = ast.body[0]
  return item.type === 'ReturnStatement' && item.argument !== null
}
