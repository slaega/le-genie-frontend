import { Content } from '@tiptap/react';

type TiptapNode = {
    type: string;
    content?: TiptapNode[];
    text?: string;
};

export function tryParseJSON(input: string): Content | undefined {
    try {
        const parsed = JSON.parse(input);
        if (typeof parsed === 'string') {
            // Continue à parser récursivement si encore une string JSON
            return tryParseJSON(parsed);
        }
        return parsed as Content | undefined;
    } catch {
        return input as Content | undefined;
    }
}

export function getTiptapTextFromJSON(
    input: TiptapNode | string,
    maxLength = 200
): string {
    let result = '';

    function extractText(node: TiptapNode) {
        if (!node) {
            return;
        }

        if (node.type === 'text' && node.text) {
            result += node.text + ' ';
        }
        if (node.content) {
            node.content.forEach(extractText);
        }
    }

    const data = typeof input === 'string' ? tryParseJSON(input) : input;

    if (typeof data === 'string') {
        // Si même après tous les parsings c'est encore une string brute
        return data.slice(0, maxLength) + (data.length > maxLength ? '…' : '');
    }

    extractText(data as TiptapNode);

    const trimmed = result.trim().slice(0, maxLength);
    return trimmed + (result.length > maxLength ? '…' : '');
}
