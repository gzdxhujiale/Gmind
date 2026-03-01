/**
 * Unit tests for MarkdownParser
 */

import { describe, it, expect } from 'vitest';
import { MarkdownParser } from './MarkdownParser';

describe('MarkdownParser', () => {
  const parser = new MarkdownParser();

  describe('parse', () => {
    it('should parse a simple markdown with one heading', () => {
      const markdown = '# Hello World\n\nSome content here.';
      const result = parser.parse(markdown);

      expect(result.level).toBe(0); // Root node
      expect(result.children).toHaveLength(1);
      expect(result.children[0].level).toBe(1);
      expect(result.children[0].text).toBe('Hello World');
      expect(result.children[0].content).toBe('Some content here.');
      expect(result.children[0].isLeaf).toBe(true);
    });

    it('should parse nested headings correctly', () => {
      const markdown = `# H1
Content for H1

## H2
Content for H2

### H3
Content for H3`;

      const result = parser.parse(markdown);

      expect(result.children).toHaveLength(1);
      const h1 = result.children[0];
      expect(h1.level).toBe(1);
      expect(h1.text).toBe('H1');
      expect(h1.content).toBe('Content for H1');
      expect(h1.isLeaf).toBe(false);

      expect(h1.children).toHaveLength(1);
      const h2 = h1.children[0];
      expect(h2.level).toBe(2);
      expect(h2.text).toBe('H2');
      expect(h2.content).toBe('Content for H2');
      expect(h2.isLeaf).toBe(false);

      expect(h2.children).toHaveLength(1);
      const h3 = h2.children[0];
      expect(h3.level).toBe(3);
      expect(h3.text).toBe('H3');
      expect(h3.content).toBe('Content for H3');
      expect(h3.isLeaf).toBe(true);
    });

    it('should handle multiple siblings at the same level', () => {
      const markdown = `# First
Content 1

# Second
Content 2

# Third
Content 3`;

      const result = parser.parse(markdown);

      expect(result.children).toHaveLength(3);
      expect(result.children[0].text).toBe('First');
      expect(result.children[1].text).toBe('Second');
      expect(result.children[2].text).toBe('Third');
      expect(result.children[0].content).toBe('Content 1');
      expect(result.children[1].content).toBe('Content 2');
      expect(result.children[2].content).toBe('Content 3');
    });

    it('should handle complex hierarchy', () => {
      const markdown = `# H1-1
Content H1-1

## H2-1
Content H2-1

## H2-2
Content H2-2

# H1-2
Content H1-2`;

      const result = parser.parse(markdown);

      expect(result.children).toHaveLength(2);
      
      const h1_1 = result.children[0];
      expect(h1_1.text).toBe('H1-1');
      expect(h1_1.children).toHaveLength(2);
      expect(h1_1.children[0].text).toBe('H2-1');
      expect(h1_1.children[1].text).toBe('H2-2');

      const h1_2 = result.children[1];
      expect(h1_2.text).toBe('H1-2');
      expect(h1_2.children).toHaveLength(0);
      expect(h1_2.isLeaf).toBe(true);
    });

    it('should handle empty markdown', () => {
      const markdown = '';
      const result = parser.parse(markdown);

      expect(result.level).toBe(0);
      expect(result.children).toHaveLength(0);
    });

    it('should handle markdown with no headings', () => {
      const markdown = 'Just some text without any headings.';
      const result = parser.parse(markdown);

      expect(result.level).toBe(0);
      expect(result.children).toHaveLength(0);
    });

    it('should mark leaf nodes correctly', () => {
      const markdown = `# Parent
Content

## Child
Content

# Leaf`;

      const result = parser.parse(markdown);

      const parent = result.children[0];
      expect(parent.isLeaf).toBe(false);
      expect(parent.children[0].isLeaf).toBe(true);
      expect(result.children[1].isLeaf).toBe(true);
    });

    it('should preserve parent-child relationships', () => {
      const markdown = `# H1
## H2
### H3`;

      const result = parser.parse(markdown);

      const h1 = result.children[0];
      const h2 = h1.children[0];
      const h3 = h2.children[0];

      expect(h1.parent).toBe(result);
      expect(h2.parent).toBe(h1);
      expect(h3.parent).toBe(h2);
    });

    it('should handle headings with no content', () => {
      const markdown = `# Heading 1
## Heading 2
# Heading 3`;

      const result = parser.parse(markdown);

      expect(result.children).toHaveLength(2);
      expect(result.children[0].content).toBe('');
      expect(result.children[0].children[0].content).toBe('');
      expect(result.children[1].content).toBe('');
    });
  });
});
