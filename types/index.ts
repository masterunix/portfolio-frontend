/**
 * types/index.ts — The site's content, as lib/content.ts loads it from content/.
 */

/** A file in public/, checked to exist when the content loads */
export interface Media {
  /** Site path, e.g. /media/logos/leetcode.png */
  url: string;
  /** The file's name, e.g. leetcode.png */
  name: string;
}

/** A project entry */
export interface Project {
  id: number;
  title: string;
  tech: string;
  description: string;
  icon?: string;
  logo?: Media;
  color: string;
  github?: string;
  visit?: string;
  order: number;
}

export type SkillType = 'skills_top' | 'skills_bottom' | 'career';
export type SkillCategory = 'beginner' | 'intermediate' | 'proficient' | 'expert';

/** A skill/experience entry */
export interface Skill {
  id: number;
  name: string;
  description: string;
  type: SkillType;
  category?: SkillCategory;
  color: string;
  icon?: string;
  logo?: Media;
  attachments: Array<{
    id: number;
    label: string;
    file: Media;
  }>;
  order: number;
}

/** A resume entry: downloads `file`, or opens `link` when there is no file */
export interface Resume {
  id: number;
  domain: string;
  description: string;
  /** The name the download is saved as */
  filename?: string;
  color: string;
  icon: string;
  order: number;
  file?: Media;
  link?: string;
}

/** A DSA platform entry */
export interface DSAPlatform {
  id: number;
  name: string;
  url: string;
  color: string;
  logo?: Media;
  order: number;
}

/** A DSA concept (content/dsa-concepts.yaml) */
export interface DSAConcept {
  id: number;
  title: string;
  icon: string;
  description: string;
  color: string;
  order: number;
}

/** A home page typewriter message */
export interface HomeMessage {
  id: number;
  text: string;
  link?: string;
  order: number;
}

/** A notice in the Gleck widget, its Markdown rendered to inline HTML */
export interface GleckNotice {
  id: number;
  html: string;
  link?: string;
  order: number;
}

/** The Gleck widget's "know more" link (content/settings/gleck.yaml) */
export interface GleckSettings {
  knowMoreLink: string;
  knowMoreText: string;
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
  /** YYYY-MM-DD */
  updated?: string;
  /** Short highlights shown as chips, like { value: "5+ yrs", label: "experience" } */
  facts: { value: string; label: string }[];
  /** Buttons under the header */
  links: { label: string; href: string }[];
  /** The body, rendered from Markdown */
  html: string;
}

export type ThemePage = 'all' | 'home' | 'projects' | 'skills' | 'dsa' | 'resumes' | 'blog' | 'summary';

/** A background theme for the animated shader */
export interface BackgroundTheme {
  id: number;
  name: string;
  slug: string;
  enabled: boolean;
  isDefault: boolean;
  order: number;
  animationType: 'static' | 'shader-mesh' | 'shader-wave' | 'css-gradient';
  animationSpeed: number;
  grainIntensity: number;
  colorPalettes: Array<{
    id: number;
    page: ThemePage;
    colors: string[];
  }>;
}
