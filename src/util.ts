'use strict';

import { workspace, TextDocument, Uri, ExtensionContext, WorkspaceConfiguration } from 'vscode';
import * as fs from "fs";
import * as path from "path";

interface Result {
    fileId: string,
    fileType: string;
    fileName: string;
    filePath: string;
    fileUri: Uri;
}

export function getFileName(file: string, type: string) {
    switch (type) {
        case 'components':
            file = `${file}.php`;
            break;
        case 'styles':
            file = `${file}.scss`;
            break;
        case 'scripts':
            file = `${file}.js`;
            break;
    }

    return file;
}

export function titleCase(text: string){
    return text.toLowerCase().split('-').map(word => {
        return word.charAt(0).toUpperCase() + word.slice(1)
    }).join(' ');
}

export function getFilePath(text: string, document: TextDocument, type: string = 'components' ) {
    let workspaceFolder = workspace.getWorkspaceFolder(document.uri)?.uri.fsPath || '';
    let config          = workspace.getConfiguration('wordpress_snippets');
    let base            = config[type];
    let id              = text.replace(/\"|\'/g, '');
    let folder          = path.dirname(id);
    let file            = path.basename(id);
    let filename        = getFileName(file, type)

    let filePaths = [
        path.join(workspaceFolder, base, folder, filename),
        path.join(workspaceFolder, base, folder, file, filename),
    ];

    for (const filePath of filePaths) {
        if (fs.existsSync(filePath)) {
            return {
                "fileId": id,
                "fileType": titleCase(folder),
                "fileName": titleCase(file),
                "filePath": filePath,
                "fileUri": Uri.file(filePath)
            }
        }
    }
}

export function getContentsPart(contents: string, pattern: string) {
    let reg = new RegExp(pattern, 'g');
    let results = contents.replace(/(=>\s?)\[([^\]]*)\]/g, '$1{$2}').match(reg)

    if ( !results ) return null

    return results.join(',').replace(/(=>\s?)\{([^\}]*)\}/g, '$1[$2]').replace(/\n|\s+|\"|\'/g, '').replace(/=>/g, ':')
}

export function getFileInfo(file: Result, document: TextDocument) {
    let text: string = "";
    let config       = workspace.getConfiguration('wordpress_snippets');

    text += `✅ \`${file.fileType}\` > [\`${file.fileName}\`](${file.fileUri})\r\n`;

    let styles  = getFilePath(file.fileId, document, 'styles');
    if (styles) text += ` - [\`SCSS\`](${styles.fileUri})\r\n`;
    
    let scripts = getFilePath(file.fileId, document, 'scripts');
    if (scripts) text += ` - [\`JS\`](${scripts.fileUri})\r\n`;

    text += `\r\n ___ \r\n`

    let contents = fs.readFileSync(file.filePath).toString('utf8');

    let dependancies = getContentsPart(contents, config.regex)?.split(',');
    let props        = getContentsPart(contents, '(?<=\\$props->admit_props\\(\\[)([^\\]\\)]+)')?.split(',');
    let defaults     = getContentsPart(contents, '(?<=\\$props->set_defaults\\(\\[)([^\\]\\)]+)')?.split(',').reduce((a,v) => {
        let pieces = v.split(':')
        return { ...a, [pieces[0]]: pieces[1] }
    }, {}) || [];

    if (dependancies) {
        text += `\r\n**Dependancies**\r\n`;
        for (let item of dependancies){
            let file = getFilePath(item, document)
            
            if (file) {
                text += `- \`${file.fileType}\` > [\`${file.fileName}\`](${file.fileUri})\r\n`;
            }
        }
    }
    
    text += `\r\n ___ \r\n`

    if (props) {
        text += `\r\n**Props**\r\n`;
        for (let item of props){
            let value = defaults[item as keyof typeof defaults] || '';

            if ( value ) item += `: *${value}*`

            text += `- ${item}\r\n`
        }
    }
    
    return text
}

