'use strict';

import * as vscode from 'vscode';

export function registerArrayFillProvider(): vscode.Disposable {
  const provider = vscode.languages.registerCompletionItemProvider(
    { language: 'php', scheme: 'file' },
    {
      provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
        const range = document.getWordRangeAtPosition(position, /af\d+/);
        if (!range) return;

        const prefix = document.getText(range);

        const match = prefix.match(/^af(\d+)/);
        if (!match) return;

        const count = match[1];

        const completion = new vscode.CompletionItem(prefix, vscode.CompletionItemKind.Snippet);
        completion.insertText = new vscode.SnippetString(`array_fill(0,${count},[\n\t$0\n])`);
        const itemString = count == '1' ? 'Item' : 'Items';
        completion.detail = `📎 Array Fill (${count} ${itemString})`;
        completion.documentation = `array_fill(0,${count},[\n\t\n])`;

        return [completion];
      }
    },
    // Trigger characters
    ...['a', 'f', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
  );

  return provider;
}