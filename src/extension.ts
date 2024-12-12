'use strict';

import { languages, ExtensionContext } from 'vscode';
import LinkProvider from './providers/linkProvider';
import HoverProvider from './providers/hoverProvider';
import { registerArrayFillProvider } from './providers/arrayFillProvider';

export function activate(context: ExtensionContext) {
    let hover = languages.registerHoverProvider(['php'], new HoverProvider());
    let link = languages.registerDocumentLinkProvider(['php'], new LinkProvider());
    let arrayFill = registerArrayFillProvider();

    context.subscriptions.push(hover, link, arrayFill);
}

export function deactivate() {}