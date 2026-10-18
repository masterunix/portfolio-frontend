/**
 * content.ts — The site's content, read from content/*.yaml (formerly the Strapi CMS).
 *
 *   content/projects.yaml          content/home-messages.yaml
 *   content/skills.yaml            content/gleck-notices.yaml
 *   content/resumes.yaml           content/background-themes.yaml
 *   content/dsa-platforms.yaml     content/settings/gleck.yaml
 *   content/dsa-concepts.yaml
 *   content/blog/<slug>.md         (blog posts: front matter + Markdown)
 *   content/summary.md             (the summary page: front matter + Markdown)
 *
 * Every entry is checked against the rules the Strapi schemas had (required fields,
 * enums, defaults, number ranges), plus a few Strapi never checked:
 * - media paths must exist in public/ and be the right kind of file
 * - links must be real links (https://, mailto:, /page, …), not placeholder text
 * - colours must be CSS colours
 * - unknown fields are errors, so a typo like `colour:` can't silently do nothing
 *
 * A broken entry throws with the file, entry and field in the message: in dev it shows
 * in the error overlay, and in a build it fails the build, so nothing broken deploys.
 *
 * Entries are sorted by `order` (lowest first; ties keep file order, as Strapi kept
 * creation order) and get an `id` from their position. `draft: true` hides an entry.
 * Files are re-read on every request in dev, and read once in production.
 */
import 'server-only';
import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';
import { Marked, type Token, type Tokens } from 'marked';

import type {
  BackgroundTheme, BlogPost, BlogPostSummary, DSAConcept, DSAPlatform, GleckNotice, GleckSettings,
  HomeMessage, Media, Project, Resume, Skill, SkillCategory, SkillType, Summary, ThemePage,
} from '@/types';

const CONTENT = path.join(process.cwd(), 'content');
const PUBLIC = path.join(process.cwd(), 'public');
const dev = process.env.NODE_ENV === 'development';

const IMAGE_EXTS = ['.png', '.jpg', '.jpeg', '.webp', '.avif', '.gif', '.svg'];
const LINK = /^(https?:\/\/\S+|mailto:\S+|tel:\S+|\/\S*|#\S*)$/i;
const COLOR = /^(#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})|[a-z]+|(rgb|hsl)a?\([^)]*\))$/i;

// ─── Field Reader ────────────────────────────────────────────────────────────

type Raw = Record<string, unknown>;

/** Reads one entry's fields, checking each, and remembers which keys were read. */
class Entry {
  private used = new Set<string>();
  private raw: Raw;
  readonly where: string;

  constructor(raw: Raw, where: string) {
    this.raw = raw;
    this.where = where;
  }

  fail(key: string, problem: string): never {
    throw new Error(`[content] ${this.where}: \`${key}\` ${problem}`);
  }

  private get(key: string): unknown {
    this.used.add(key);
    const value = this.raw[key];
    return value === null || value === '' ? undefined : value;
  }

  /** An optional string (numbers are accepted, so `title: 2048` works). */
  optText(key: string): string | undefined {
    const v = this.get(key);
    if (v === undefined) return undefined;
    if (typeof v !== 'string' && typeof v !== 'number') this.fail(key, `must be text, got ${JSON.stringify(v)}`);
    return String(v);
  }

  text(key: string, fallback?: string): string {
    const v = this.optText(key) ?? fallback;
    if (v === undefined) this.fail(key, 'is required');
    return v;
  }

  num(key: string, fallback: number, opts: { min?: number; max?: number; integer?: boolean } = {}): number {
    const v = this.get(key) ?? fallback;
    if (typeof v !== 'number' || Number.isNaN(v)) this.fail(key, `must be a number, got ${JSON.stringify(v)}`);
    if (opts.integer && !Number.isInteger(v)) this.fail(key, `must be a whole number, got ${v}`);
    if (opts.min !== undefined && v < opts.min) this.fail(key, `must be at least ${opts.min}, got ${v}`);
    if (opts.max !== undefined && v > opts.max) this.fail(key, `must be at most ${opts.max}, got ${v}`);
    return v;
  }

  bool(key: string, fallback: boolean): boolean {
    const v = this.get(key) ?? fallback;
    if (typeof v !== 'boolean') this.fail(key, `must be true or false, got ${JSON.stringify(v)}`);
    return v;
  }

  optOneOf<T extends string>(key: string, values: readonly T[]): T | undefined {
    const v = this.optText(key);
    if (v !== undefined && !values.includes(v as T)) this.fail(key, `must be one of ${values.join(', ')}; got "${v}"`);
    return v as T | undefined;
  }

  oneOf<T extends string>(key: string, values: readonly T[], fallback: T): T {
    return this.optOneOf(key, values) ?? fallback;
  }

  optLink(key: string): string | undefined {
    const v = this.optText(key)?.trim();
    if (v !== undefined && !LINK.test(v)) {
      this.fail(key, `must be a link (https://…, mailto:…, tel:…, /page or #…); got "${v}". ` +
        'To hide the button, leave the field out.');
    }
    return v;
  }

  link(key: string): string {
    return this.optLink(key) ?? this.fail(key, 'is required');
  }

  color(key: string): string {
    const v = this.text(key).trim();
    if (!COLOR.test(v)) this.fail(key, `must be a CSS colour (#667eea, purple, rgb(…)); got "${v}"`);
    return v;
  }

  /** A file in public/, given as its site path (/media/logos/x.png). */
  optMedia(key: string, kind: 'image' | 'file'): Media | undefined {
    const v = this.optText(key);
    if (v === undefined) return undefined;
    return this.checkMedia(key, v, kind);
  }

  media(key: string, kind: 'image' | 'file'): Media {
    return this.optMedia(key, kind) ?? this.fail(key, 'is required');
  }

  private checkMedia(key: string, url: string, kind: 'image' | 'file'): Media {
    if (!url.startsWith('/')) this.fail(key, `must be a path in public/ starting with /, like /media/logos/x.png; got "${url}"`);
    const file = path.join(PUBLIC, decodeURI(url));
    if (!file.startsWith(PUBLIC + path.sep)) this.fail(key, `must stay inside public/; got "${url}"`);
    if (!fs.existsSync(file) || !fs.statSync(file).isFile()) this.fail(key, `points to public${url}, which doesn't exist`);
    const ext = path.extname(file).toLowerCase();
    if (kind === 'image' && !IMAGE_EXTS.includes(ext)) {
      this.fail(key, `must be an image (${IMAGE_EXTS.join(' ')}); got "${url}"`);
    }
    return { url, name: path.basename(file) };
  }

  /** A list of nested entries (attachments, colour palettes). */
  list(key: string): Entry[] {
    const v = this.get(key) ?? [];
    if (!Array.isArray(v)) this.fail(key, 'must be a list');
    return v.map((item, i) => {
      if (!item || typeof item !== 'object' || Array.isArray(item)) this.fail(`${key}[${i}]`, 'must be a set of fields');
      return new Entry(item as Raw, `${this.where} ${key}[${i}]`);
    });
  }

  /** Raw access for fields with their own shape (a palette's colour list). */
  value(key: string): unknown {
    return this.get(key);
  }

  /** Call after reading every field: any key not read is a typo or a removed field. */
  done(): void {
    const unknown = Object.keys(this.raw).filter((k) => !this.used.has(k));
    if (unknown.length) {
      throw new Error(`[content] ${this.where}: unknown field${unknown.length > 1 ? 's' : ''} ` +
        `${unknown.map((k) => `\`${k}\``).join(', ')} (see the comments at the top of the file)`);
    }
  }
}

// ─── Loading ─────────────────────────────────────────────────────────────────

const cache = new Map<string, unknown>();

function readYaml(file: string): unknown {
  const full = path.join(CONTENT, file);
  if (!fs.existsSync(full)) throw new Error(`[content] content/${file} is missing`);
  try {
    return yaml.load(fs.readFileSync(full, 'utf8'));
  } catch (err) {
    throw new Error(`[content] content/${file} isn't valid YAML: ${(err as Error).message}`);
  }
}

/** Loads a list file: checks each entry, drops drafts, sorts by order, assigns ids. */
function loadList<T extends { id: number; order: number }>(
  file: string,
  label: (raw: Raw) => unknown,
  parse: (e: Entry, id: number) => T,
): T[] {
  if (!dev && cache.has(file)) return cache.get(file) as T[];

  const data = readYaml(file) ?? [];
  if (!Array.isArray(data)) throw new Error(`[content] content/${file} must be a list of entries (each starting with "- ")`);

  const entries: T[] = [];
  data.forEach((raw, i) => {
    const name = raw && typeof raw === 'object' ? label(raw as Raw) : undefined;
    const where = `content/${file} entry ${i + 1}${name ? ` ("${name}")` : ''}`;
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) throw new Error(`[content] ${where} must be a set of fields`);
    const e = new Entry(raw as Raw, where);
    const draft = e.bool('draft', false);
    const entry = parse(e, i + 1);
    e.done();
    if (!draft) entries.push(entry);
  });

  // Array.prototype.sort is stable, so equal orders keep file order
  entries.sort((a, b) => a.order - b.order);
  cache.set(file, entries);
  return entries;
}

function loadSettings<T>(file: string, parse: (e: Entry) => T): T {
  if (!dev && cache.has(file)) return cache.get(file) as T;
  const data = readYaml(file);
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error(`[content] content/${file} must be a set of fields`);
  const e = new Entry(data as Raw, `content/${file}`);
  const settings = parse(e);
  e.done();
  cache.set(file, settings);
  return settings;
}

// ─── Collections ─────────────────────────────────────────────────────────────

/** Projects, by order */
export function getProjects(): Project[] {
  return loadList('projects.yaml', (r) => r.title, (e, id) => ({
    id,
    title: e.text('title'),
    description: e.text('description'),
    tech: e.text('tech'),
    icon: e.optText('icon'),
    logo: e.optMedia('logo', 'image'),
    color: e.color('color'),
    github: e.optLink('github'),
    visit: e.optLink('visit'),
    order: e.num('order', 0, { integer: true }),
  }));
}

const SKILL_TYPES = ['skills_top', 'skills_bottom', 'career'] as const satisfies readonly SkillType[];
const SKILL_CATEGORIES = ['beginner', 'intermediate', 'proficient', 'expert'] as const satisfies readonly SkillCategory[];

/** Skills and experience (all types), by order */
export function getSkills(): Skill[] {
  return loadList('skills.yaml', (r) => r.name, (e, id) => ({
    id,
    name: e.text('name'),
    description: e.text('description'),
    type: e.oneOf('type', SKILL_TYPES, 'career'),
    category: e.optOneOf('category', SKILL_CATEGORIES),
    color: e.color('color'),
    icon: e.optText('icon'),
    logo: e.optMedia('logo', 'image'),
    attachments: e.list('attachments').map((a, i) => {
      const attachment = { id: i + 1, label: a.text('label', 'View File'), file: a.media('file', 'file') };
      a.done();
      return attachment;
    }),
    order: e.num('order', 0, { integer: true }),
  }));
}

/** Resumes, by order */
export function getResumes(): Resume[] {
  return loadList('resumes.yaml', (r) => r.domain, (e, id) => {
    const file = e.optMedia('file', 'file');
    const link = e.optLink('link');
    if (file && link) e.fail('link', "can't be set together with `file`: the tile either downloads or opens a link");
    const filename = e.optText('filename');
    if (filename && !file) e.fail('filename', 'only applies to a `file`');
    return {
      id,
      domain: e.text('domain'),
      description: e.text('description'),
      color: e.color('color'),
      icon: e.text('icon'),
      file,
      filename: file ? (filename ?? file.name) : undefined,
      link,
      order: e.num('order', 0, { integer: true }),
    };
  });
}

/** Coding platforms, by order */
export function getDSAPlatforms(): DSAPlatform[] {
  return loadList('dsa-platforms.yaml', (r) => r.name, (e, id) => ({
    id,
    name: e.text('name'),
    url: e.link('url'),
    color: e.color('color'),
    logo: e.optMedia('logo', 'image'),
    order: e.num('order', 0, { integer: true }),
  }));
}

/** DSA concepts, by order */
export function getDSAConcepts(): DSAConcept[] {
  return loadList('dsa-concepts.yaml', (r) => r.title, (e, id) => ({
    id,
    title: e.text('title'),
    icon: e.text('icon'),
    description: e.text('description'),
    color: e.color('color'),
    order: e.num('order', 0, { integer: true }),
  }));
}

/** Home page typewriter messages, by order */
export function getHomeMessages(): HomeMessage[] {
  return loadList('home-messages.yaml', (r) => r.text, (e, id) => ({
    id,
    text: e.text('text'),
    link: e.optLink('link'),
    order: e.num('order', 0, { integer: true }),
  }));
}

/** Gleck's active notices, by order, with their Markdown rendered to inline HTML */
export function getGleckNotices(): GleckNotice[] {
  const notices = loadList('gleck-notices.yaml', (r) => r.text, (e, id) => ({
    id,
    html: markdown.parseInline(e.text('text')) as string,
    link: e.optLink('link'),
    active: e.bool('active', true),
    order: e.num('order', 0, { integer: true }),
  }));
  return notices
    .filter((n) => n.active)
    .map(({ id, html, link, order }) => ({ id, html, link, order }));
}

/** The Gleck widget's "know more" link */
export function getGleckSettings(): GleckSettings {
  return loadSettings('settings/gleck.yaml', (e) => ({
    knowMoreLink: e.link('knowMoreLink'),
    knowMoreText: e.text('knowMoreText'),
  }));
}

const ANIMATION_TYPES = ['static', 'shader-mesh', 'shader-wave', 'css-gradient'] as const;
const THEME_PAGES = ['all', 'home', 'projects', 'skills', 'dsa', 'resumes', 'blog', 'summary'] as const satisfies readonly ThemePage[];

function getBackgroundThemes(): BackgroundTheme[] {
  const themes = loadList('background-themes.yaml', (r) => r.name, (e, id) => {
    const slug = e.text('slug');
    if (!/^[A-Za-z0-9\-_.~]+$/.test(slug)) e.fail('slug', `may only use letters, digits and - _ . ~; got "${slug}"`);
    return {
      id,
      name: e.text('name'),
      slug,
      enabled: e.bool('enabled', false),
      isDefault: e.bool('isDefault', false),
      animationType: e.oneOf('animationType', ANIMATION_TYPES, 'shader-mesh'),
      animationSpeed: e.num('animationSpeed', 1, { min: 0.1, max: 3 }),
      grainIntensity: e.num('grainIntensity', 0.05, { min: 0, max: 0.2 }),
      colorPalettes: e.list('colorPalettes').map((p, i) => {
        const colors = p.value('colors');
        if (!Array.isArray(colors) || colors.length !== 4 || !colors.every((c) => typeof c === 'string' && COLOR.test(c))) {
          p.fail('colors', `must be a list of 4 CSS colours; got ${JSON.stringify(colors)}`);
        }
        const palette = { id: i + 1, page: p.oneOf('page', THEME_PAGES, 'all'), colors: colors as string[] };
        p.done();
        return palette;
      }),
      order: e.num('order', 0, { integer: true }),
    };
  });
  const slugs = new Set<string>();
  for (const t of themes) {
    if (slugs.has(t.slug)) throw new Error(`[content] content/background-themes.yaml: two themes have the slug "${t.slug}"`);
    slugs.add(t.slug);
  }
  return themes;
}

/**
 * The theme the background animates with: the first enabled theme, by order,
 * that isn't static or one of the placeholder slugs. Null means plain black.
 */
export function getBackgroundTheme(): BackgroundTheme | null {
  return getBackgroundThemes().find((t) =>
    t.enabled &&
    t.animationType !== 'static' &&
    t.slug !== 'default' &&
    t.slug !== 'background-theme'
  ) ?? null;
}

// ─── Markdown ────────────────────────────────────────────────────────────────
//
// Blog posts and the summary are Markdown files with their details between two
// --- lines at the top (front matter), checked like every other entry.
//
// Besides normal Markdown (and HTML, for anything else), they can use layout blocks:
//
//   :::callout Optional title      a highlighted box
//   :::cards                       a grid of cards; each starts with ### Card title
//   :::timeline                    entries down a line; ### 2021 – 2023 | Role at Company
//   :::columns                     side by side; separate the columns with a +++ line
//
// Each block ends with a line containing just :::. Blocks don't nest.

const DATE = /^\d{4}-\d{2}-\d{2}$/;
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
const markdown = new Marked({
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

/** Reads a Markdown file: its front matter as an Entry, and its body */
function readMarkdownFile(file: string): { e: Entry; body: string } {
  const where = `content/${file}`;
  const full = path.join(CONTENT, file);
  if (!fs.existsSync(full)) throw new Error(`[content] ${where} is missing`);
  const text = fs.readFileSync(full, 'utf8');
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(text);
  if (!match) throw new Error(`[content] ${where} must start with its details between two --- lines`);

  let data: unknown;
  try {
    // CORE_SCHEMA keeps `date: 2026-10-18` as text instead of turning it into a Date
    data = yaml.load(match[1], { schema: yaml.CORE_SCHEMA });
  } catch (err) {
    throw new Error(`[content] ${where}: the details between the --- lines aren't valid YAML: ${(err as Error).message}`);
  }
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error(`[content] ${where}: the details must be a set of fields`);
  return { e: new Entry(data as Raw, where), body: match[2] };
}

/** Renders a Markdown body to HTML, checking its images and blocks */
function renderMarkdown(where: string, body: string): { html: string; words: number } {
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

function readDate(e: Entry, key: string, required: boolean): string | undefined {
  const v = required ? e.text(key) : e.optText(key);
  if (v === undefined) return undefined;
  if (!DATE.test(v) || Number.isNaN(Date.parse(`${v}T00:00:00Z`))) e.fail(key, `must be a date like 2026-10-18; got "${v}"`);
  return v;
}

// ─── Blog ────────────────────────────────────────────────────────────────────
//
// One Markdown file per post in content/blog/; the file name is the URL
// (my-first-post.md → /blog/my-first-post). Files starting with _ are skipped.
// Drafts show in dev with a Draft badge and are left out of production builds.

const BLOG = path.join(CONTENT, 'blog');
const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;

function parsePost(file: string): BlogPost {
  const slug = file.slice(0, -'.md'.length);
  if (!SLUG.test(slug)) {
    throw new Error(`[content] content/blog/${file}: the file name is the post's URL, so it may only use lowercase letters, ` +
      'digits and single dashes (e.g. my-first-post.md)');
  }

  const { e, body } = readMarkdownFile(`blog/${file}`);
  const date = readDate(e, 'date', true)!;
  const updated = readDate(e, 'updated', false);
  if (updated && updated < date) e.fail('updated', `is before \`date\` (${date})`);
  const tags = e.value('tags') ?? [];
  if (!Array.isArray(tags) || !tags.every((t) => typeof t === 'string' && t.trim())) e.fail('tags', 'must be a list of words, like [nextjs, design]');

  const post = {
    slug,
    title: e.text('title'),
    description: e.text('description'),
    date,
    updated,
    tags: (tags as string[]).map((t) => t.trim()),
    cover: e.optMedia('cover', 'image'),
    draft: e.bool('draft', false),
  };
  e.done();

  const { html, words } = renderMarkdown(e.where, body);
  return { ...post, readMins: Math.max(1, Math.ceil(words / 200)), html };
}

function loadPosts(): BlogPost[] {
  if (!dev && cache.has('blog')) return cache.get('blog') as BlogPost[];
  const files = fs.existsSync(BLOG)
    ? fs.readdirSync(BLOG).filter((f) => f.endsWith('.md') && !f.startsWith('_'))
    : [];
  const posts = files.map(parsePost)
    .filter((p) => dev || !p.draft)
    // Newest first
    .sort((a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug));
  cache.set('blog', posts);
  return posts;
}

/** Every post readers can see, newest first, without bodies */
export function getPosts(): BlogPostSummary[] {
  return loadPosts().map(({ slug, title, description, date, updated, tags, cover, readMins, draft }) =>
    ({ slug, title, description, date, updated, tags, cover, readMins, draft }));
}

/** One post with its body, or null when it doesn't exist (or is a draft in production) */
export function getPost(slug: string): BlogPost | null {
  return loadPosts().find((p) => p.slug === slug) ?? null;
}

// ─── Summary ─────────────────────────────────────────────────────────────────
//
// content/summary.md: the /summary page. Only `title` is required; the comments at
// the top of the file list the rest.

/** The summary page */
export function getSummary(): Summary {
  if (!dev && cache.has('summary')) return cache.get('summary') as Summary;
  const { e, body } = readMarkdownFile('summary.md');
  const summary = {
    title: e.text('title'),
    tagline: e.optText('tagline'),
    photo: e.optMedia('photo', 'image'),
    location: e.optText('location'),
    updated: readDate(e, 'updated', false),
    facts: e.list('facts').map((f) => {
      const fact = { value: f.text('value'), label: f.text('label') };
      f.done();
      return fact;
    }),
    links: e.list('links').map((l) => {
      const link = { label: l.text('label'), href: l.link('href') };
      l.done();
      return link;
    }),
  };
  e.done();
  const result = { ...summary, html: renderMarkdown(e.where, body).html };
  cache.set('summary', result);
  return result;
}
