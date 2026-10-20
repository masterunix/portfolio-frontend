/**
 * types/index.ts: The site's content, as lib/content.ts loads it from content/.
 */

/** A file in public/, checked to exist when the content loads */
export interface Media {
  /** Site path, e.g. /media/logos/leetcode.png */
  url: string;
  /** The file's name, e.g. leetcode.png */
  name: string;
  /** A logo that's a whole app icon, with its own background: it fills the icon square */
  fill?: boolean;
}

/** content/projects/<slug>.md */
export interface Project {
  slug: string;
  title: string;
  tech: string;
  /** When it ran, e.g. "Jul 2025" */
  period?: string;
  /** The tile's text: `summary`, or the details as plain text */
  description: string;
  summary?: string;
  /** The full details (the body), rendered from Markdown, for the Read more popup */
  html: string;
  icon?: string;
  logo?: Media;
  color: string;
  github?: string;
  visit?: string;
}

/** Which row of /skills: experience in the middle, skills above and below */
export type SkillRow = 'top' | 'middle' | 'bottom';
export type SkillLevel = 'beginner' | 'intermediate' | 'proficient' | 'expert';

/** content/skills/<slug>.md */
export interface Skill {
  slug: string;
  title: string;
  period?: string;
  /** The tile's text: `summary`, or the details as plain text */
  description: string;
  summary?: string;
  /** The full details (the body), rendered from Markdown; experience shows it in a popup */
  html: string;
  row: SkillRow;
  level?: SkillLevel;
  color: string;
  icon?: string;
  logo?: Media;
  attachments: Array<{ label: string; file: Media }>;
}

/** content/resumes/<slug>.md: downloads `file`, or opens `link` */
export interface Resume {
  slug: string;
  title: string;
  description: string;
  color: string;
  icon: string;
  file?: Media;
  /** The name the download is saved as */
  filename?: string;
  link?: string;
}

/** content/dsa/platforms/<slug>.md */
export interface DSAPlatform {
  slug: string;
  title: string;
  url: string;
  color: string;
  logo?: Media;
}

/** One of content/dsa/concepts.md */
export interface DSAConcept {
  title: string;
  icon: string;
  description: string;
  color: string;
}

/** A tile of the home menu (content/home.md) */
export interface MenuItem {
  title: string;
  description: string;
  href: string;
  /** [row, column] in the home honeycomb */
  cell: [number, number];
  /** A built-in icon's name (lib/icons.ts), unless `logo` is set */
  icon?: string;
  logo?: Media;
  color: string;
  /** A glow pulses around the icon */
  pulse: boolean;
}

/** content/home.md */
export interface Home {
  menu: MenuItem[];
  /** The typewriter lines */
  messages: Array<{ text: string; link?: string }>;
}

/** content/gleck.md */
export interface Gleck {
  moreText: string;
  moreLink: string;
  /** Each notice's Markdown rendered to inline HTML */
  notices: Array<{ html: string; link?: string }>;
}

export type ThemePage = 'all' | 'home' | 'projects' | 'skills' | 'dsa' | 'resumes' | 'blog' | 'summary';

/** content/background.md (null when not animated) */
export interface Background {
  speed: number;
  /** 0.2–1: dims the colours, so text over them is easier to read */
  brightness: number;
  /** 4 colours per page; `all` is always there */
  palettes: Partial<Record<ThemePage, string[]>> & { all: string[] };
}

export interface PageText {
  title: string;
  description: string;
  /** The hint under the carousel buttons */
  hint?: string;
}

/** content/site.md */
export interface Site {
  /** Shown in the footer, e.g. 2.01.02 */
  version: string;
  /** The site's address, like https://www.vatsalgoyal.com (no trailing slash) */
  url: string;
  title: string;
  description: string;
  pages: Record<'projects' | 'skills' | 'dsa' | 'resumes' | 'blog', PageText>;
  /** The popup for Firefox-engine browsers, as inline HTML */
  firefoxNotice: string;
  /** The footer's lines as inline HTML; the first shows everywhere */
  footer: string[];
  feedback: Feedback;
  compatibility: Compatibility;
}

/** The compatibility-mode toggle (content/site.md's `compatibility`) */
export interface Compatibility {
  /** Its name, e.g. "Compatibility mode" */
  label: string;
  /** What it does, shown on hover */
  tip: string;
}

/** The feedback button and popup (content/site.md's `feedback`) */
export interface Feedback {
  /** Where the message is mailed */
  email: string;
  title: string;
  /** The line under the button on wide screens */
  note: string;
  /** The "About" choices; one with a `page` is picked by default on that page */
  topics: { label: string; page?: string }[];
}

/** A blog post's details, without its body (content/blog/<slug>.md) */
export interface BlogPostSummary {
  /** The URL name: the file name without .md */
  slug: string;
  title: string;
  description: string;
  /** YYYY-MM-DD */
  date: string;
  /** YYYY-MM-DD, when the post was last changed */
  updated?: string;
  tags: string[];
  cover?: Media;
  /** The hexagon tile's icon (an emoji or a few letters) and its square's colour */
  icon: string;
  color: string;
  /** Words / 200, rounded up */
  readMins: number;
  /** Only ever true in dev: drafts are left out of production builds */
  draft: boolean;
}

/** A blog post with its body rendered to HTML */
export interface BlogPost extends BlogPostSummary {
  html: string;
}

/** The summary page (content/summary.md) */
export interface Summary {
  title: string;
  tagline?: string;
  photo?: Media;
  location?: string;
  /** For search engines: what you do, and where you studied */
  jobTitle?: string;
  school?: string;
  /** YYYY-MM-DD */
  updated?: string;
  /** Short highlights shown as chips, like { value: "5+ yrs", label: "experience" } */
  facts: { value: string; label: string }[];
  /** Buttons under the header */
  links: { label: string; href: string }[];
  /** The body, rendered from Markdown */
  html: string;
}
