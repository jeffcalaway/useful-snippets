'use strict';

import { languages, ExtensionContext } from 'vscode';
import LinkProvider from './providers/linkProvider';
import HoverProvider from './providers/hoverProvider';

export function activate(context: ExtensionContext) {
    let hover = languages.registerHoverProvider(['php'], new HoverProvider());
    let link = languages.registerDocumentLinkProvider(['php'], new LinkProvider());

    context.subscriptions.push(hover, link);
}

export function deactivate() {
    //
}