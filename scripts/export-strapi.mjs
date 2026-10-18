#!/usr/bin/env node
/**
 * export-strapi.mjs — One-time export of the Strapi CMS into content/ and public/media/.
 *
 *   node scripts/export-strapi.mjs [strapi-url]     (default: http://localhost:1337)
 *
 * Writes one YAML file per collection in content/ and downloads every logo, resume and
 * attachment into public/media/. It overwrites what is there, so only run it on purpose.
 *
 * While copying, it cleans up what the old site handled badly:
 * - links without a scheme ("450houseofsourdough.com") get https://
 * - placeholder text in link fields ("Client Work", "Coming Soon") is dropped, so the button hides
 * - `logoPath` is folded into `logo`
 * - a resume whose `filename` is really a link (mailto:, https:) becomes `link`
 * - Strapi's hashed file names ("Leetcode_cd1fefe466.png") become readable ones ("leetcode.png")
 *
 * Every change it makes is printed, so you can check them.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';

const BASE = (process.argv[2] || 'http://localhost:1337').replace(/\/$/, '');
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CONTENT = path.join(ROOT, 'content');
const PUBLIC = path.join(ROOT, 'public');

const notes = [];
const note = (where, msg) => notes.push(`${where}: ${msg}`);

// ─── Strapi ──────────────────────────────────────────────────────────────────

async function get(endpoint) {
  const sep = endpoint.includes('?') ? '&' : '?';
  const res = await fetch(`${BASE}/api/${endpoint}${sep}pagination[pageSize]=1000`);
  if (!res.ok) throw new Error(`GET ${endpoint}: HTTP ${res.status}`);
  return (await res.json()).data;
}

// ─── Media ───────────────────────────────────────────────────────────────────

const downloaded = new Map(); // "<folder> <Strapi URL>" → public path

function cleanName(name, ext) {
  const stem = path.basename(name, path.extname(name))
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'file';
  return stem + ext.toLowerCase();
}

/** Downloads a Strapi media object into public/media/<folder>/ and returns its public path. */
async function media(file, folder) {
  if (!file?.url) return undefined;
  const key = `${folder} ${file.url}`;
  if (downloaded.has(key)) return downloaded.get(key);

  const src = file.url.startsWith('http') ? file.url : `${BASE}${file.url}`;
  const res = await fetch(src);
  if (!res.ok) throw new Error(`download ${src}: HTTP ${res.status}`);
  const bytes = Buffer.from(await res.arrayBuffer());

  const dir = path.join(PUBLIC, 'media', folder);
  fs.mkdirSync(dir, { recursive: true });
  let name = cleanName(file.name || path.basename(file.url), file.ext || path.extname(file.url));
  // Two different files with the same clean name get -2, -3, …
  for (let n = 2; fs.existsSync(path.join(dir, name)) && !fs.readFileSync(path.join(dir, name)).equals(bytes); n++) {
    name = name.replace(/(-\d+)?(\.[^.]+)$/, `-${n}$2`);
  }
  fs.writeFileSync(path.join(dir, name), bytes);

  const publicPath = `/media/${folder}/${name}`;
  downloaded.set(key, publicPath);
  return publicPath;
}

// ─── Links ───────────────────────────────────────────────────────────────────

/** A usable link, or undefined. Mirrors the rule lib/content.ts enforces. */
function link(value, where) {
  if (value == null || value === '') return undefined;
  const v = String(value).trim();
  if (/^(https?:\/\/|mailto:|tel:|\/|#)/i.test(v)) return v;
  if (/^[\w-]+(\.[\w-]+)+(\/\S*)?$/.test(v)) {
    note(where, `"${v}" → "https://${v}"`);
    return `https://${v}`;
  }
  note(where, `"${v}" isn't a link, dropped (the button is hidden)`);
  return undefined;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Drops null/undefined/empty values so the YAML only shows what is set. */
function compact(obj) {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) =>
    v !== null && v !== undefined && v !== '' && !(Array.isArray(v) && v.length === 0)));
}

function write(file, header, data) {
  const body = yaml.dump(data, { lineWidth: -1, noRefs: true, quotingType: '"' });
  const text = header.trim().split('\n').map(l => `# ${l}`.trimEnd()).join('\n') + '\n\n' + body;
  fs.mkdirSync(path.dirname(path.join(CONTENT, file)), { recursive: true });
  fs.writeFileSync(path.join(CONTENT, file), text);
  console.log(`wrote content/${file} (${Array.isArray(data) ? `${data.length} entries` : 'settings'})`);
}

const COMMON = `
Entries show in \`order\` (lowest first, default 0); equal orders keep the order of this file.
\`draft: true\` hides an entry, like an unpublished entry in Strapi.
Media paths point into public/ (e.g. /media/logos/leetcode.png) and must exist, or the build fails.
Links must start with https://, http://, mailto:, tel:, / or #.
Field rules: lib/content.ts.`;

// ─── Collections ─────────────────────────────────────────────────────────────

async function main() {
  console.log(`Exporting from ${BASE}\n`);

  const projects = await get('projects?sort=order:asc&populate=logo');
  write('projects.yaml', `
Projects: the middle row of /projects and the cards on mobile.
title, description, tech, color: required
icon: an emoji or short text, shown when there is no logo (default 📦)
logo: an image in public/; when it fails to load, the icon shows instead
github, visit: links; leave out to hide the button. visit can be a page here (/dsa).
${COMMON}`, await Promise.all(projects.map(async p => compact({
    title: p.title,
    description: p.description,
    tech: p.tech,
    icon: p.icon,
    logo: await media(p.logo, 'logos'),
    color: p.color,
    github: link(p.github, `projects "${p.title}" github`),
    visit: link(p.visit, `projects "${p.title}" visit`),
    order: p.order,
  }))));

  const skills = await get('skills?sort=order:asc&populate[logo]=true&populate[attachments][populate]=file');
  write('skills.yaml', `
Skills and experience.
type: career (default; the middle row of /skills), skills_top or skills_bottom (the outer rows)
category: beginner, intermediate, proficient or expert (the badge on skill tiles)
name, description, color: required
icon: an emoji or short text, shown when there is no logo (default 📦, ⚡ on skill tiles)
logo: an image in public/
attachments: buttons that open a file: { label (default "View File"), file (required) }
${COMMON}`, await Promise.all(skills.map(async s => compact({
    name: s.name,
    description: s.description,
    type: s.type,
    category: s.category,
    color: s.color,
    icon: s.icon,
    logo: await media(s.logo, 'logos'),
    attachments: await Promise.all((s.attachments || []).map(async a => compact({
      label: a.label,
      file: await media(a.file, 'attachments'),
    }))),
    order: s.order,
  }))));

  const resumes = await get('resumes?sort=order:asc&populate=file');
  write('resumes.yaml', `
Resumes: the tiles on /resumes.
domain, description, color, icon: required
file: the PDF in public/ that Download saves, named \`filename\` (default: the file's own name)
link: for a tile that opens a link instead (e.g. mailto:). A tile with neither has no button.
${COMMON}`, await Promise.all(resumes.map(async r => {
    const file = await media(r.file, 'resumes');
    let filename = r.filename;
    let resumeLink;
    if (!file && /^(mailto:|tel:|https?:\/\/)/i.test(filename || '')) {
      resumeLink = filename;
      filename = undefined;
      note(`resumes "${r.domain}"`, `filename "${resumeLink}" is a link and there is no file → link`);
    } else if (!file) {
      note(`resumes "${r.domain}"`, 'has no file, so it has no Download button');
    }
    return compact({
      domain: r.domain,
      description: r.description,
      color: r.color,
      icon: r.icon,
      file,
      filename: file ? filename : undefined,
      link: resumeLink,
      order: r.order,
    });
  })));

  const platforms = await get('dsa-platforms?sort=order:asc&populate=logo');
  write('dsa-platforms.yaml', `
Coding platforms: the middle row of /dsa.
name, url, color: required
logo: an image in public/; without one (or if it fails to load) the tile shows the name's first letter
${COMMON}`, await Promise.all(platforms.map(async d => {
    let logo = await media(d.logo, 'logos');
    if (!logo && d.logoPath && d.logoPath !== 'None') {
      const p = '/' + d.logoPath.replace(/^\/+/, '');
      if (fs.existsSync(path.join(PUBLIC, p))) logo = p;
      else note(`dsa-platforms "${d.name}"`, `logoPath "${d.logoPath}" doesn't exist in public/, dropped`);
    }
    return compact({
      name: d.name,
      url: link(d.url, `dsa-platforms "${d.name}" url`),
      color: d.color,
      logo,
      order: d.order,
    });
  })));

  const messages = await get('home-messages?sort=order:asc');
  write('home-messages.yaml', `
The typewriter lines at the top of the home page. text: required. link: opens on click.
${COMMON}`, messages.map(m => compact({
    text: m.text,
    link: link(m.link, `home-messages "${m.text}" link`),
    order: m.order,
  })));

  const notices = await get('gleck-notices?sort=order:asc');
  write('gleck-notices.yaml', `
Gleck's notices (the widget at the bottom left).
text: required; may use <b> <i> <em> <strong> <a> <br> <p> <span>
link: makes the notice clickable. active: false hides it (default true).
${COMMON}`, notices.map(n => compact({
    text: n.text,
    link: link(n.link, `gleck-notices "${n.text}" link`),
    active: n.active,
    order: n.order,
  })));

  const themes = await get('background-themes?sort=order:asc&populate=colorPalettes');
  write('background-themes.yaml', `
Background themes. The site uses the first enabled theme (by order) that isn't static.
name, slug: required
animationType: static, shader-mesh (default), shader-wave or css-gradient
animationSpeed: 0.1–3 (default 1). grainIntensity: 0–0.2 (default 0.05)
colorPalettes: { page: all, home, projects, skills, dsa or resumes; colors: 4 colours }.
A page without its own palette uses the "all" one.
${COMMON}`, themes.map(t => compact({
    name: t.name,
    slug: t.slug,
    enabled: t.enabled,
    isDefault: t.isDefault,
    animationType: t.animationType,
    animationSpeed: t.animationSpeed,
    grainIntensity: t.grainIntensity,
    colorPalettes: (t.colorPalettes || []).map(p => ({ page: p.page, colors: p.colors })),
    order: t.order,
  })));

  console.log(notes.length ? `\nChanged while copying:\n- ${notes.join('\n- ')}` : '\nNothing needed changing.');
  console.log('\nNot exported: navigation-items and help (the site never used them), and gleck-setting');
  console.log('(the site always showed its own link; see content/settings/gleck.yaml).');
}

main().catch(err => { console.error(err.message); process.exit(1); });
