/**
 * Full editor extensions — includes behavioral extensions (Placeholder, CharacterCount,
 * Focus) that only make sense in an interactive editing context.
 *
 * For server-side HTML generation use `viewExtensions` from `./view-extensions`.
 */
import StarterKit from '@tiptap/starter-kit';
import Highlight from '@tiptap/extension-highlight';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import TaskItem from '@tiptap/extension-task-item';
import TaskList from '@tiptap/extension-task-list';
import TextAlign from '@tiptap/extension-text-align';
import Typography from '@tiptap/extension-typography';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';
import Focus from '@tiptap/extension-focus';
import Color from '@tiptap/extension-color';
import TextStyle from '@tiptap/extension-text-style';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { createLowlight, common } from 'lowlight';

const lowlight = createLowlight(common);

export const editorExtensions = [
    StarterKit.configure({
        heading: { levels: [1, 2, 3, 4] },
        bulletList: { keepMarks: true, keepAttributes: false },
        orderedList: { keepMarks: true, keepAttributes: false },
        codeBlock: false, // replaced by CodeBlockLowlight
    }),
    CodeBlockLowlight.configure({ lowlight }),
    Highlight.configure({ multicolor: true }),
    Image.configure({ inline: false, allowBase64: false }),
    Link.configure({
        openOnClick: false,
        autolink: true,
        defaultProtocol: 'https',
        HTMLAttributes: { rel: 'noopener noreferrer', target: '_blank' },
    }),
    TextStyle,
    Color,
    Subscript,
    Superscript,
    TaskList,
    TaskItem.configure({ nested: true }),
    TextAlign.configure({ types: ['heading', 'paragraph'] }),
    Typography,
    Underline,
    CharacterCount,
    Focus.configure({ className: 'has-focus', mode: 'all' }),
    Placeholder.configure({
        placeholder: ({
            node,
            pos,
        }: {
            node: { type: { name: string }; attrs?: { level?: number } };
            pos: number;
        }) => {
            // First H1 = post title; rest of headings = section headings.
            if (
                node.type.name === 'heading' &&
                node.attrs?.level === 1 &&
                pos === 0
            ) {
                return 'Titre de la publication…';
            }
            if (node.type.name === 'heading') return 'Titre de section…';
            return 'Commencez à écrire votre article…';
        },
        includeChildren: true,
    }),
];

export { lowlight };
