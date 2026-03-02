import { HeadingNode } from '../types/models';

export class MarkdownStringifier {
    /**
     * Converts a heading tree back into a markdown string.
     */
    stringify(root: HeadingNode): string {
        let md = '';

        // Add root content if any (content before the first heading)
        if (root.content) {
            md += root.content.trim() + '\n\n';
        }

        const traverse = (node: HeadingNode) => {
            if (node.id !== 'root') {
                md += '#'.repeat(node.level) + ' ' + node.text + '\n\n';
                if (node.content) {
                    md += node.content.trim() + '\n\n';
                }
            }
            for (const child of node.children) {
                traverse(child);
            }
        };

        traverse(root);
        return md.trim() + '\n';
    }
}

export const markdownStringifier = new MarkdownStringifier();
