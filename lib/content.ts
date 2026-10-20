/**
 * content.ts: Reads the site's content from content/, all Markdown files:
 *
 *   content/site.md               the site's title, page headings and hints, the footer
 *   content/home.md               the home menu and the typewriter lines
 *   content/summary.md            the summary page
 *   content/projects/<slug>.md    one file per project      ┐ settings between the two
 *   content/skills/<slug>.md      one per skill/experience  │ --- lines at the top,
 *   content/resumes/<slug>.md     one per resume            │ the description below;
 *   content/dsa/platforms/<slug>.md  one per platform       │ _template.md in each
 *   content/blog/<slug>.md        one per post              ┘ folder lists the fields
 *   content/dsa/concepts.md       the DSA concept tiles
 *   content/gleck.md              Gleck's notices and link
 *   content/background.md         the animated background's colours
 *
 * Every field is checked: required fields, allowed values, number ranges, colours,
 * links (https://, mailto:, /page, …), and that pictures and files exist in public/.
 * Unknown fields are errors, so a typo like `colour:` can't silently do nothing. A
 * mistake throws with the file and field in the message: in dev it shows in the error
 * overlay, and in a build it fails the build, so nothing broken deploys.
 *
 * Entries in a folder sort by `order` (lowest first), then file name; files starting
 * with _ are skipped and `draft: true` hides one. Files are re-read on every request
 * in dev and read once in production.
 */
import 'server-only';
import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';

import { gridCells, WIDE_GRID } from '@/lib/hexLayout';
import { MENU_ICONS } from '@/lib/icons';
import { markdown, renderMarkdown } from '@/lib/markdown';
import type {
  Background, BlogPost, BlogPostSummary, DSAConcept, DSAPlatform, Gleck, Home, Media, MenuItem,
  PageText, Project, Resume, Site, Skill, SkillLevel, SkillRow, Summary, ThemePage,
} from '@/types';

const CONTENT = path.join(process.cwd(), 'content');
const PUBLIC = path.join(process.cwd(), 'public');
const dev = process.env.NODE_ENV === 'development';

const IMAGE_EXTS = ['.png', '.jpg', '.jpeg', '.webp', '.avif', '.gif', '.svg'];
const LINK = /^(https?:\/\/\S+|mailto:\S+|tel:\S+|\/\S*|#\S*)$/i;
const COLOR = /^(#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})|[a-z]+|(rgb|hsl)a?\([^)]*\))$/i;
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;

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

  /** An entry's `logo`, and `logoFill: true` when it's a whole app icon that fills the square */
  logo(): Media | undefined {
    const logo = this.optMedia('logo', 'image');
    const fill = this.bool('logoFill', false);
    if (fill && !logo) this.fail('logoFill', 'only applies to a `logo`');
    return logo && fill ? { ...logo, fill } : logo;
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

  /** A nested set of fields (site.md's pages). */
  group(key: string): Entry {
    const v = this.get(key);
    if (v === undefined) this.fail(key, 'is missing');
    if (!v || typeof v !== 'object' || Array.isArray(v)) this.fail(key, 'must be a set of fields');
    return new Entry(v as Raw, `${this.where} ${key}`);
  }

  /** A list of nested entries (attachments, menu tiles). */
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
        `${unknown.map((k) => `\`${k}\``).join(', ')} (the comments at the top of the file, or its folder's _template.md, list the fields)`);
    }
  }
}

// ─── Reading files ───────────────────────────────────────────────────────────

const cache = new Map<string, unknown>();

/** Reads once in production; every time in dev, so edits show on reload */
function cached<T>(key: string, load: () => T): T {
  if (!dev && cache.has(key)) return cache.get(key) as T;
  const value = load();
  cache.set(key, value);
  return value;
}

/** Reads a Markdown file: its front matter as an Entry, and its body */
function readMarkdownFile(file: string): { e: Entry; body: string } {
  const where = `content/${file}`;
  const full = path.join(CONTENT, file);
  if (!fs.existsSync(full)) throw new Error(`[content] ${where} is missing`);
  const text = fs.readFileSync(full, 'utf8');
  // House style: no em dashes (see AGENTS.md, "Writing")
  const dash = text.split('\n').findIndex((line) => line.includes('\u2014'));
  if (dash !== -1) {
    throw new Error(`[content] ${where}, line ${dash + 1}: has an em dash (\u2014). Use a comma, a colon or two sentences instead`);
  }
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

/** One page's file: its fields and body, checked by `parse` */
function loadFile<T>(file: string, parse: (e: Entry, body: string) => T): T {
  return cached(file, () => {
    const { e, body } = readMarkdownFile(file);
    const value = parse(e, body);
    e.done();
    return value;
  });
}

/** A folder of entries, one Markdown file each: checked, drafts dropped, sorted */
function loadFolder<T>(dir: string, parse: (e: Entry, body: string, slug: string) => T): T[] {
  return cached(dir, () => {
    const full = path.join(CONTENT, dir);
    if (!fs.existsSync(full)) return [];
    return fs.readdirSync(full)
      .filter((f) => f.endsWith('.md') && !f.startsWith('_'))
      .sort()
      .map((file) => {
        const slug = file.slice(0, -'.md'.length);
        if (!SLUG.test(slug)) {
          throw new Error(`[content] content/${dir}/${file}: name files with lowercase letters, digits and single dashes (e.g. my-project.md)`);
        }
        const { e, body } = readMarkdownFile(`${dir}/${file}`);
        const draft = e.bool('draft', false);
        const order = e.num('order', 0);
        const value = parse(e, body, slug);
        e.done();
        return { value, draft, order };
      })
      .filter((x) => !x.draft)
      // Array.prototype.sort is stable, so equal orders keep file-name order
      .sort((a, b) => a.order - b.order)
      .map((x) => x.value);
  });
}

/** The text below the --- lines, as one plain line (tile descriptions) */
/** HTML to plain text, for tile descriptions written in Markdown */
function plainText(html: string): string {
  return html.replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ').trim();
}

/**
 * An entry with a popup: the body is its full details (Markdown), and the tile shows
 * `summary`, or the start of the details when there's no summary.
 */
function details(e: Entry, body: string): { description: string; summary?: string; html: string } {
  const { html } = renderMarkdown(e.where, body);
  const summary = e.optText('summary');
  const description = summary ?? plainText(html);
  if (!description) e.fail('description', 'is missing: write it below the second --- line');
  return { description, summary, html };
}

function description(e: Entry, body: string, required = true): string {
  const text = body.trim().replace(/\s+/g, ' ');
  if (!text && required) e.fail('description', 'is missing: write it below the second --- line');
  return text;
}

/** The "- " lines of a body, in order; a line that is just [text](link) is a linked item */
function bullets(e: Entry, body: string): Array<{ text: string; link?: string }> {
  return body.split('\n')
    .filter((line) => /^[-*] /.test(line))
    .map((line) => {
      const text = line.slice(2).trimEnd();
      const linked = /^\[(.+)\]\((\S+)\)$/.exec(text.trim());
      if (!linked) return { text };
      if (!LINK.test(linked[2])) e.fail(`- ${text}`, `links to "${linked[2]}", which isn't a link (https://…, mailto:…, /page)`);
      return { text: linked[1], link: linked[2] };
    });
}

function readDate(e: Entry, key: string, required: boolean): string | undefined {
  const v = required ? e.text(key) : e.optText(key);
  if (v === undefined) return undefined;
  if (!DATE.test(v) || Number.isNaN(Date.parse(`${v}T00:00:00Z`))) e.fail(key, `must be a date like 2026-10-18; got "${v}"`);
  return v;
}

// ─── The site ────────────────────────────────────────────────────────────────

const PAGES = ['projects', 'skills', 'dsa', 'resumes', 'blog'] as const;

/** The project's own .md files, which each state the current version */
const VERSIONED_DOCS = ['AGENTS.md', 'CLAUDE.md', 'README.md', 'future.md', 'completed.md'];

/** Fails when a doc's "Current version" line doesn't match content/site.md */
function checkDocVersions(e: Entry, version: string): void {
  for (const doc of VERSIONED_DOCS) {
    const file = path.join(/*turbopackIgnore: true*/ process.cwd(), doc);
    if (!fs.existsSync(file)) continue;
    const stated = /Current version:\s*\**v?(\d+\.\d+\.\d+)/i.exec(fs.readFileSync(file, 'utf8'))?.[1];
    if (stated !== version) {
      e.fail('version', `is ${version}, but ${doc} says "Current version: ${stated ?? '(missing)'}". Update ${doc} to match.`);
    }
  }
}

/** Site title, page headings and hints, and the footer (content/site.md) */
export function getSite(): Site {
  return loadFile('site.md', (e, body) => {
    const version = e.text('version');
    if (!/^\d+\.\d+\.\d+$/.test(version)) e.fail('version', `must look like 2.01.02; got "${version}"`);
    checkDocVersions(e, version);
    const pages = e.group('pages');
    const feedback = e.group('feedback');
    const url = e.link('url').replace(/\/$/, '');
    if (!url.startsWith('https://')) e.fail('url', `must be the site's https:// address; got "${url}"`);
    const site = {
      version,
      url,
      title: e.text('title'),
      description: e.text('description'),
      firefoxNotice: markdown.parseInline(e.text('firefoxNotice')) as string,
      pages: Object.fromEntries(PAGES.map((page) => {
        const p = pages.group(page);
        const text: PageText = { title: p.text('title'), description: p.text('description'), hint: p.optText('hint') };
        p.done();
        return [page, text];
      })) as Site['pages'],
      // One line per paragraph
      footer: body.trim().split(/\n\s*\n/).filter(Boolean).map((line) =>
        markdown.parseInline(line.trim().replace(/\{year\}/g, String(new Date().getFullYear()))) as string),
      feedback: readFeedback(feedback),
    };
    pages.done();
    feedback.done();
    if (!site.footer.length) e.fail('footer', 'is missing: write it below the second --- line');
    return site;
  });
}

/** The feedback button's settings (site.md's `feedback`) */
function readFeedback(f: Entry): Site['feedback'] {
  const email = f.text('email').trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) f.fail('email', `must be an email address; got "${email}"`);
  const topics = f.list('topics').map((t) => {
    const page = t.optText('page');
    if (page !== undefined && !/^\/\S*$/.test(page)) t.fail('page', `must be a page here, like /projects; got "${page}"`);
    const topic = { label: t.text('label'), page };
    t.done();
    return topic;
  });
  if (!topics.length) f.fail('topics', 'needs at least one topic');
  return { email, title: f.text('title'), note: f.text('note'), topics };
}

/** The home menu and the typewriter lines (content/home.md) */
export function getHome(): Home {
  return loadFile('home.md', (e, body) => {
    const cells = new Map(gridCells(WIDE_GRID).map(([r, c]) => [`${r}-${c}`, '']));
    const menu = e.list('menu').map((m): MenuItem => {
      const cell = m.value('cell') as number[];
      if (!Array.isArray(cell) || cell.length !== 2 || !cell.every(Number.isInteger) || !cells.has(cell.join('-'))) {
        m.fail('cell', `must be [row, column] of a hexagon in the grid (rows 0–3, columns 0–6; rows 0 and 2 start at 1); got ${JSON.stringify(cell)}`);
      }
      const taken = cells.get(cell.join('-'));
      const title = m.text('title');
      if (taken) m.fail('cell', `[${cell}] is already used by "${taken}"`);
      cells.set(cell.join('-'), title);

      const icon = m.text('icon');
      const logo = icon.startsWith('/') ? m.optMedia('icon', 'image') : undefined;
      if (!logo && !(icon in MENU_ICONS)) {
        m.fail('icon', `must be a built-in icon (${Object.keys(MENU_ICONS).join(', ')}) or a picture in public/ like /media/logos/me.png; got "${icon}"`);
      }
      const item = {
        title, description: m.text('description'), href: m.link('href'), cell: cell as [number, number],
        icon: logo ? undefined : icon, logo, color: m.color('color'), pulse: m.bool('pulse', false),
      };
      m.done();
      return item;
    });
    return { menu, messages: bullets(e, body) };
  });
}

/** The summary page (content/summary.md). Only `title` is required. */
export function getSummary(): Summary {
  return loadFile('summary.md', (e, body) => ({
    title: e.text('title'),
    tagline: e.optText('tagline'),
    photo: e.optMedia('photo', 'image'),
    location: e.optText('location'),
    jobTitle: e.optText('jobTitle'),
    school: e.optText('school'),
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
    html: renderMarkdown(e.where, body).html,
  }));
}

/** Gleck's notices and link (content/gleck.md) */
export function getGleck(): Gleck {
  return loadFile('gleck.md', (e, body) => ({
    moreText: e.text('moreText'),
    moreLink: e.link('moreLink'),
    notices: bullets(e, body).map(({ text, link }) => ({ html: markdown.parseInline(text) as string, link })),
  }));
}

const THEME_PAGES = ['all', 'home', 'projects', 'skills', 'dsa', 'resumes', 'blog', 'summary'] as const satisfies readonly ThemePage[];

/** The animated background's colours (content/background.md); null for plain black */
export function getBackground(): Background | null {
  return loadFile('background.md', (e) => {
    const animated = e.bool('animated', true);
    const speed = e.num('speed', 1, { min: 0.1, max: 3 });
    const brightness = e.num('brightness', 1, { min: 0.2, max: 1 });
    const p = e.group('palettes');
    const palettes: Partial<Record<ThemePage, string[]>> = {};
    for (const page of THEME_PAGES) {
      const colors = p.value(page);
      if (colors === undefined) continue;
      if (!Array.isArray(colors) || colors.length !== 4 || !colors.every((c) => typeof c === 'string' && COLOR.test(c))) {
        p.fail(page, `must be a list of 4 CSS colours, like ["#667eea", "#764ba2", "#f093fb", "#f5576c"]; got ${JSON.stringify(colors)}`);
      }
      palettes[page] = colors as string[];
    }
    p.done();
    if (!palettes.all) e.fail('palettes', 'needs an `all` palette, for pages without their own');
    return animated ? { speed, brightness, palettes: palettes as Background['palettes'] } : null;
  });
}

// ─── Entries ─────────────────────────────────────────────────────────────────

/** Projects (content/projects/), by order */
export function getProjects(): Project[] {
  return loadFolder('projects', (e, body, slug) => ({
    slug,
    title: e.text('title'),
    tech: e.text('tech'),
    period: e.optText('period'),
    ...details(e, body),
    icon: e.optText('icon'),
    logo: e.logo(),
    color: e.color('color'),
    github: e.optLink('github'),
    visit: e.optLink('visit'),
  }));
}

const ROWS = ['top', 'middle', 'bottom'] as const satisfies readonly SkillRow[];
const LEVELS = ['beginner', 'intermediate', 'proficient', 'expert'] as const satisfies readonly SkillLevel[];

/** Skills and experience (content/skills/), by order */
export function getSkills(): Skill[] {
  return loadFolder('skills', (e, body, slug) => ({
    slug,
    title: e.text('title'),
    period: e.optText('period'),
    ...details(e, body),
    row: e.oneOf('row', ROWS, 'middle'),
    level: e.optOneOf('level', LEVELS),
    color: e.color('color'),
    icon: e.optText('icon'),
    logo: e.logo(),
    attachments: e.list('attachments').map((a) => {
      const attachment = { label: a.text('label', 'View File'), file: a.media('file', 'file') };
      a.done();
      return attachment;
    }),
  }));
}

/** Resumes (content/resumes/), by order */
export function getResumes(): Resume[] {
  return loadFolder('resumes', (e, body, slug) => {
    const file = e.optMedia('file', 'file');
    const link = e.optLink('link');
    if (file && link) e.fail('link', "can't be set together with `file`: the tile either downloads or opens a link");
    const filename = e.optText('filename');
    if (filename && !file) e.fail('filename', 'only applies to a `file`');
    return {
      slug,
      title: e.text('title'),
      description: description(e, body),
      color: e.color('color'),
      icon: e.text('icon'),
      file,
      filename: file ? (filename ?? file.name) : undefined,
      link,
    };
  });
}

/** Coding platforms (content/dsa/platforms/), by order */
export function getDSAPlatforms(): DSAPlatform[] {
  return loadFolder('dsa/platforms', (e, _body, slug) => ({
    slug,
    title: e.text('title'),
    url: e.link('url'),
    color: e.color('color'),
    logo: e.logo(),
  }));
}

/** DSA concepts (content/dsa/concepts.md), in order */
export function getDSAConcepts(): DSAConcept[] {
  return loadFile('dsa/concepts.md', (e) => e.list('concepts').map((c) => {
    const concept = { title: c.text('title'), icon: c.text('icon'), description: c.text('description'), color: c.color('color') };
    c.done();
    return concept;
  }));
}

// ─── Blog ────────────────────────────────────────────────────────────────────
//
// One Markdown file per post in content/blog/; the file name is the URL
// (my-first-post.md → /blog/my-first-post). Unlike other entries, drafts show in dev
// (with a Draft badge) and are only left out of production builds.

function loadPosts(): BlogPost[] {
  return cached('blog', () => {
    const dir = path.join(CONTENT, 'blog');
    const files = fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => f.endsWith('.md') && !f.startsWith('_')) : [];
    return files.map((file) => {
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
        icon: e.optText('icon') ?? '✍️',
        color: e.optText('color') === undefined ? '#a29bfe' : e.color('color'),
        draft: e.bool('draft', false),
      };
      e.done();
      const { html, words } = renderMarkdown(e.where, body);
      return { ...post, readMins: Math.max(1, Math.ceil(words / 200)), html };
    })
      .filter((p) => dev || !p.draft)
      // Newest first
      .sort((a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug));
  });
}

/** Every post readers can see, newest first, without bodies */
export function getPosts(): BlogPostSummary[] {
  return loadPosts().map(({ slug, title, description, date, updated, tags, cover, icon, color, readMins, draft }) =>
    ({ slug, title, description, date, updated, tags, cover, icon, color, readMins, draft }));
}

/** One post with its body, or null when it doesn't exist (or is a draft in production) */
export function getPost(slug: string): BlogPost | null {
  return loadPosts().find((p) => p.slug === slug) ?? null;
}
