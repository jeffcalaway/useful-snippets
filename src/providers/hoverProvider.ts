'use strict';

import {
    HoverProvider as vsHoverProvider,
    TextDocument,
    Position,
    ProviderResult,
    Hover,
    workspace,
    MarkdownString
} from "vscode";
import * as util from '../util';

export default class HoverProvider implements vsHoverProvider {
    provideHover(doc: TextDocument, pos: Position): ProviderResult<Hover> {
        let config    = workspace.getConfiguration('wordpress_snippets');
        let reg       = new RegExp(config.regex);
        let linkRange = doc.getWordRangeAtPosition(pos, reg);

        if (!linkRange) return

        let item = util.getFilePath(doc.getText(linkRange), doc);
        if (item) {
            let text = util.getFileInfo(item, doc)

            return new Hover(new MarkdownString(text));
        }
    }
}