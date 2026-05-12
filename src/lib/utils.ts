import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/** Format a date as "12 mai 2026" */
export function formatDate(date: string | Date): string {
    return format(new Date(date), 'd MMM yyyy', { locale: fr });
}

/**
 * Extract plain-text excerpt from a TipTap JSON document.
 * Walks the node tree depth-first and returns the first non-empty paragraph text.
 */
export function extractExcerpt(
    content: Record<string, unknown> | null,
    maxChars = 140
): string {
    if (!content) return '';

    type TipTapNode = {
        type: string;
        text?: string;
        content?: TipTapNode[];
    };

    function getText(node: TipTapNode): string {
        if (node.type === 'text' && node.text) return node.text;
        if (!node.content) return '';
        return node.content.map(getText).join('');
    }

    const doc = content as TipTapNode;
    for (const node of doc.content ?? []) {
        if (node.type === 'paragraph') {
            const text = getText(node).trim();
            if (text) {
                return text.length > maxChars
                    ? text.slice(0, maxChars) + '…'
                    : text;
            }
        }
    }
    return '';
}
