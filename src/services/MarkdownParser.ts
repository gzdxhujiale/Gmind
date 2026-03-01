/**
 * MarkdownParser - Parses markdown content into a heading tree structure
 * Uses remark and unist-util-visit to extract headings and build hierarchy
 */

import { unified } from 'unified';
import remarkParse from 'remark-parse';
import { visit } from 'unist-util-visit';
import type { Root, Heading, Content } from 'mdast';
import type { HeadingNode } from '../types/models';

/**
 * Parser for converting markdown content into a hierarchical heading tree
 */
export class MarkdownParser {
  /**
   * Parse markdown content and return a heading tree
   * @param content - Raw markdown content
   * @returns Root HeadingNode with children representing the document structure
   * @throws Error if parsing fails completely
   */
  parse(content: string): HeadingNode {
    try {
      // Handle empty or invalid content (Requirement 3.5)
      if (!content || content.trim() === '') {
        console.warn('Empty markdown content provided');
        return this.createEmptyRoot();
      }

      // Parse markdown to AST (Requirement 3.5)
      let tree: Root;
      try {
        tree = unified()
          .use(remarkParse)
          .parse(content) as Root;
      } catch (parseError) {
        // Log parsing error and return empty tree (Requirement 3.5)
        console.error('Failed to parse markdown AST:', parseError);
        throw new Error('Unable to parse markdown content. The file may be corrupted or contain invalid syntax.');
      }

      // Extract headings with their positions and content
      const headings = this.extractHeadings(tree, content);

      // Build hierarchical tree from flat heading list
      const root = this.buildTree(headings);

      // Mark leaf nodes
      this.markLeafNodes(root);

      return root;
    } catch (error) {
      // Log error for debugging (Requirement 3.5)
      console.error('Error parsing markdown:', error);
      
      // Re-throw if it's already a user-friendly error
      if (error instanceof Error && error.message.includes('Unable to parse')) {
        throw error;
      }
      
      // Otherwise, wrap in a user-friendly error
      throw new Error('An error occurred while parsing the markdown file. Some content may not be displayed correctly.');
    }
  }

  /**
   * Create an empty root node for cases where parsing fails or content is empty
   */
  private createEmptyRoot(): HeadingNode {
    return {
      id: 'root',
      level: 0,
      text: 'Root',
      content: '',
      children: [],
      isLeaf: true,
    };
  }

  /**
   * Extract all headings from the markdown AST with their content
   * Handles malformed markdown gracefully (Requirement 3.5)
   */
  private extractHeadings(tree: Root, content: string): HeadingInfo[] {
    const headings: HeadingInfo[] = [];
    
    try {
      visit(tree, 'heading', (node: Heading, index, parent) => {
        try {
          // Skip headings without position information
          if (!node.position) {
            console.warn('Heading node missing position information, skipping');
            return;
          }

          const text = this.extractHeadingText(node);
          const headingContent = this.extractContent(index ?? null, parent, content);

          headings.push({
            level: node.depth,
            text: text || '(Untitled)',
            content: headingContent,
            position: node.position.start.offset || 0,
          });
        } catch (nodeError) {
          // Log error but continue processing other headings (Requirement 3.5)
          console.warn('Error processing heading node:', nodeError);
        }
      });
    } catch (error) {
      // Log error but return whatever headings we managed to extract (Requirement 3.5)
      console.error('Error during heading extraction:', error);
    }

    return headings;
  }

  /**
   * Extract text content from a heading node
   * Handles malformed heading nodes gracefully (Requirement 3.5)
   */
  private extractHeadingText(heading: Heading): string {
    let text = '';
    
    try {
      visit(heading, 'text', (node: any) => {
        if (node.value) {
          text += node.value;
        }
      });
    } catch (error) {
      console.warn('Error extracting heading text:', error);
    }

    return text.trim();
  }

  /**
   * Extract content between this heading and the next heading (any level)
   * Handles malformed content gracefully (Requirement 3.5)
   */
  private extractContent(
    headingIndex: number | null,
    parent: any,
    fullContent: string
  ): string {
    try {
      if (headingIndex === null || !parent) return '';

      const siblings = parent.children as Content[];
      const currentHeading = siblings[headingIndex] as Heading;
      
      if (!currentHeading.position) return '';

      // Find the next heading at ANY level
      let endOffset = fullContent.length;
      
      for (let i = headingIndex + 1; i < siblings.length; i++) {
        const sibling = siblings[i];
        if (sibling.type === 'heading') {
          const nextHeading = sibling as Heading;
          if (nextHeading.position) {
            endOffset = nextHeading.position.start.offset || endOffset;
            break;
          }
        }
      }

      // Extract content from after the heading line to before the next heading
      const startOffset = currentHeading.position.end.offset || 0;
      
      // Validate offsets to prevent substring errors (Requirement 3.5)
      if (startOffset < 0 || endOffset < 0 || startOffset > fullContent.length || endOffset > fullContent.length) {
        console.warn('Invalid content offsets, skipping content extraction');
        return '';
      }

      const contentText = fullContent.substring(startOffset, endOffset).trim();

      return contentText;
    } catch (error) {
      // Log error but return empty string to continue processing (Requirement 3.5)
      console.warn('Error extracting content:', error);
      return '';
    }
  }

  /**
   * Build a hierarchical tree from a flat list of headings
   */
  private buildTree(headings: HeadingInfo[]): HeadingNode {
    // Create virtual root node
    const root: HeadingNode = {
      id: 'root',
      level: 0,
      text: 'Root',
      content: '',
      children: [],
      isLeaf: false,
    };

    if (headings.length === 0) {
      return root;
    }

    // Stack to track the current path in the tree
    const stack: HeadingNode[] = [root];

    headings.forEach((headingInfo, index) => {
      const node: HeadingNode = {
        id: `heading-${index}`,
        level: headingInfo.level,
        text: headingInfo.text,
        content: headingInfo.content,
        children: [],
        isLeaf: false,
      };

      // Find the appropriate parent by popping stack until we find a lower level
      while (stack.length > 0 && stack[stack.length - 1].level >= headingInfo.level) {
        stack.pop();
      }

      // The top of the stack is now the parent
      const parent = stack[stack.length - 1];
      node.parent = parent;
      parent.children.push(node);

      // Push this node onto the stack
      stack.push(node);
    });

    return root;
  }

  /**
   * Mark nodes that have no children as leaf nodes
   */
  private markLeafNodes(node: HeadingNode): void {
    if (node.children.length === 0) {
      node.isLeaf = true;
    } else {
      node.isLeaf = false;
      node.children.forEach(child => this.markLeafNodes(child));
    }
  }
}

/**
 * Internal interface for tracking heading information during parsing
 */
interface HeadingInfo {
  level: number;
  text: string;
  content: string;
  position: number;
}

/**
 * Create a singleton instance for convenience
 */
export const markdownParser = new MarkdownParser();
