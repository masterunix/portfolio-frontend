/**
 * markdown.ts: Markdown to HTML for the content files (blog posts, the summary,
 * Gleck's notices, the footer).
 *
 * Normal Markdown (and HTML, for anything else), links to other sites open in a new
 * tab, plus layout blocks:
 *
 *   :::callout Optional title      a highlighted box
 *   :::cards                       a grid of cards; each starts with ### Card title
 *   :::timeline                    entries down a line; ### 2021 – 2023 | Role at Company
 *   :::columns                     side by side; separate the columns with a +++ line
 *
 * Each block ends with a line containing just :::. Blocks don't nest.
 */
import 'server-only';
import fs from 'node:fs';
import path from 'node:path';
import { Marked, type Token, type Tokens } from 'marked';

const PUBLIC = path.join(process.cwd(), 'public');

const BLOCK_KINDS = ['callout', 'cards', 'timeline', 'columns'] as const;
type BlockKind = (typeof BLOCK_KINDS)[number];

function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

interface BlockItem { title?: Token[]; when?: Token[]; tokens: Token[] }
interface BlockToken extends Tokens.Generic {
  type: 'block';
  kind: BlockKind;
  title?: Token[];
  items: BlockItem[];
  /** Every item's tokens, so marked's walkTokens reaches them (image checks) */
  tokens: Token[];
}

/** Markdown → HTML: external links open in a new tab, plus the layout blocks above */
export const markdown = new Marked({
  gfm: true,
  renderer: {
    link({ href, title, tokens }: Tokens.Link) {
      const text = this.parser.parseInline(tokens);
      const external = /^https?:\/\//i.test(href) ? ' target="_blank" rel="noopener noreferrer"' : '';
      return `<a href="${escapeHtml(href)}"${title ? ` title="${escapeHtml(title)}"` : ''}${external}>${text}</a>`;
    },
  },
  extensions: [{
    name: 'block',
    level: 'block',
    start: (src) => /^:::[a-z]/m.exec(src)?.index,
    tokenizer(src) {
      const match = /^:::([a-z]+)[ \t]*([^\n]*)\n([\s\S]*?)\n?^:::[ \t]*(?:\n+|$)/m.exec(src);
      if (!match || match.index !== 0) return undefined;
      const [raw, kind, title, body] = match;
      if (!BLOCK_KINDS.includes(kind as BlockKind)) {
        throw new Error(`unknown block ":::${kind}"; use ${BLOCK_KINDS.map((k) => `:::${k}`).join(', ')}`);
      }
      if (title && kind !== 'callout') throw new Error(`":::${kind}" doesn't take a title; it was given "${title}"`);

      let items: BlockItem[];
      if (kind === 'cards' || kind === 'timeline') {
        // Each item starts at a "### " line
        const parts = body.split(/^### +/m);
        if (parts[0].trim()) throw new Error(`each entry in ":::${kind}" starts with a "### " line; found text before the first one`);
        if (parts.length < 2) throw new Error(`":::${kind}" needs at least one "### " entry`);
        items = parts.slice(1).map((part) => {
          const [heading, ...rest] = part.split('\n');
          // Timeline headings may start with when it happened: "2021 – 2023 | Role"
          const [when, name] = kind === 'timeline' && heading.includes('|')
            ? heading.split(/\s*\|\s*/, 2)
            : [undefined, heading];
          return {
            title: this.lexer.inlineTokens(name.trim()),
            when: when ? this.lexer.inlineTokens(when.trim()) : undefined,
            tokens: this.lexer.blockTokens(rest.join('\n'), []),
          };
        });
      } else if (kind === 'columns') {
        items = body.split(/^\+\+\+[ \t]*$/m).map((part) => ({ tokens: this.lexer.blockTokens(part, []) }));
        if (items.length < 2) throw new Error('":::columns" needs a +++ line between its columns');
      } else {
        items = [{ tokens: this.lexer.blockTokens(body, []) }];
      }

      const token: BlockToken = {
        type: 'block', raw, kind: kind as BlockKind, items,
        title: title ? this.lexer.inlineTokens(title) : undefined,
        tokens: items.flatMap((item) => item.tokens),
      };
      return token;
    },
    renderer(token) {
      const { kind, title, items } = token as BlockToken;
      const inline = (tokens?: Token[]) => (tokens ? this.parser.parseInline(tokens) : '');
      const inner = items.map((item) => {
        const body = this.parser.parse(item.tokens);
        if (kind === 'cards') return `<div class="md-card"><h3>${inline(item.title)}</h3>${body}</div>`;
        if (kind === 'timeline') {
          const when = item.when ? `<div class="md-when">${inline(item.when)}</div>` : '';
          return `<li>${when}<h3>${inline(item.title)}</h3>${body}</li>`;
        }
        if (kind === 'columns') return `<div>${body}</div>`;
        return body;
      }).join('');
      if (kind === 'timeline') return `<ol class="md-timeline">${inner}</ol>`;
      if (kind === 'callout') {
        return `<aside class="md-callout">${title ? `<p class="md-callout-title">${inline(title)}</p>` : ''}${inner}</aside>`;
      }
      return `<div class="md-${kind}">${inner}</div>`;
    },
  }],
});

/** Renders a Markdown body to HTML, checking its images and blocks; `where` names the file in errors */
export function renderMarkdown(where: string, body: string): { html: string; words: number } {
  let tokens: Token[];
  try {
    tokens = markdown.lexer(body);
  } catch (err) {
    throw new Error(`[content] ${where}: ${(err as Error).message}`);
  }

  markdown.walkTokens(tokens, (token) => {
    if (token.type === 'paragraph' && /^:::[a-z]/.test(token.raw)) {
      throw new Error(`[content] ${where}: "${token.raw.split('\n')[0]}" isn't closed; end the block with a line containing just :::`);
    }
    if (token.type !== 'image') return;
    // Images must exist, like every other media path
    const src = (token as Tokens.Image).href;
    if (/^[a-z]+:/i.test(src)) return; // https:, data:
    if (!src.startsWith('/')) {
      throw new Error(`[content] ${where}: image "${src}" must be a path in public/ starting with /, like /media/blog/diagram.png`);
    }
    const imageFile = path.join(PUBLIC, decodeURI(src.split(/[?#]/)[0]));
    if (!imageFile.startsWith(PUBLIC + path.sep) || !fs.existsSync(imageFile)) {
      throw new Error(`[content] ${where}: image "${src}" points to public${src}, which doesn't exist`);
    }
  });

  const words = body.replace(/```[\s\S]*?```/g, ' ').split(/\s+/).filter((w) => /\w/.test(w)).length;
  return { html: markdown.parser(tokens), words };
}
