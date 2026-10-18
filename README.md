# Portfolio Frontend - Next.js with Glassmorphism

This is a modern portfolio website built with Next.js 15, featuring glassmorphism design and Apple's liquid glass UI aesthetic.

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the website.

## 📁 Project Structure

```
portfolio-frontend/
├── app/
│   ├── page.tsx              # Home page with navigation hexagons
│   ├── projects/             # Projects carousel page
│   ├── dsa/                  # DSA stats page
│   ├── skills/               # Skills & journey page (TODO)
│   ├── resumes/              # Resumes page (TODO)
│   ├── layout.tsx            # Root layout
│   └── globals.css           # Global styles with glassmorphism
├── components/
│   ├── Hexagon.tsx           # Reusable hexagon component
│   ├── NavHexagon.tsx        # Navigation hexagon with icon
│   └── HoneycombGrid.tsx     # Grid layout component
├── content/                  # The site's content (YAML), see "Content" below
├── lib/
│   └── content.ts            # Reads and checks content/
├── public/
│   └── media/                # Logos, resumes and attachments the content points to
└── scripts/
    └── export-strapi.mjs     # One-time export from the old Strapi CMS
```

## 🎨 Features

### Glassmorphism Design
- Frosted glass effect with backdrop blur
- Subtle borders and shadows
- Smooth hover transitions
- Apple-inspired liquid glass aesthetic

### Honeycomb Layout
- SVG-based hexagons
- Responsive grid system
- Smooth animations with Framer Motion
- Hover effects with scale and glow

### Pages Implemented
- ✅ **Home** - Navigation hexagons
- ✅ **Projects** - Horizontal carousel with 14 projects
- ✅ **DSA** - Coding platforms and concepts
- ⏳ **Skills** - Technical skills with ratings (TODO)
- ⏳ **Resumes** - Different resumes for domains (TODO)

## 📝 Content

Everything the site shows is in `content/`, one YAML file per collection. Edit a file and
it shows on reload in dev, and on the next deploy in production. There is no CMS or
database to run.

| File | Shows on |
|---|---|
| `content/projects.yaml` | /projects (middle row, mobile cards) |
| `content/skills.yaml` | /skills; also the outer rows of /projects |
| `content/resumes.yaml` | /resumes |
| `content/dsa-platforms.yaml` | /dsa (middle row) |
| `content/home-messages.yaml` | the typewriter on the home page |
| `content/gleck-notices.yaml` | Gleck's widget, bottom left |
| `content/settings/gleck.yaml` | Gleck's "know more" link |
| `content/background-themes.yaml` | the animated background |

The comments at the top of each file list its fields. Logos, PDFs and other files go in
`public/media/` and are referenced by their site path (`logo: /media/logos/leetcode.png`).

`lib/content.ts` checks every entry when it loads: required fields, allowed values,
number ranges, colours, links, and that each media path exists and is the right kind of
file. A mistake shows as an error naming the file, entry and field (in the dev overlay,
or as a failed build), so a broken logo or link can't reach the live site.

Entries sort by `order` (lowest first); `draft: true` hides one.

### Importing from Strapi

The content was exported from the old Strapi CMS with:

```bash
node scripts/export-strapi.mjs https://your-strapi.example.com   # default: http://localhost:1337
```

It overwrites `content/*.yaml` (not `settings/`) and downloads the media into
`public/media/`, printing every cleanup it makes (links without https://, placeholder
text in link fields, hashed file names).

## 🎯 TODO - Complete Implementation

### Skills Page (`app/skills/page.tsx`)
Create a honeycomb grid showing:
- Technical skills with star ratings
- Work experiences (Digisphere, Xebia)
- Certifications (Google, Oracle)
- Video editing skills (Premiere Pro, After Effects)

### Resumes Page (`app/resumes/page.tsx`)
Create a honeycomb grid with:
- Different resume types (Full Stack, SDE, ML Engineer, etc.)
- Download buttons for each resume
- Star ratings for specialization level
- Feedback hexagon with email link

### Mobile Responsiveness
- Add mobile navigation menu
- Stack hexagons vertically on mobile
- Touch-friendly interactions
- Responsive text sizes

## 🛠️ Technologies

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS
- **Framer Motion** - Smooth animations
- **YAML content files** - checked at build time by `lib/content.ts`

## 🎨 Design System

### Colors
- Background: `#000000` (Pure black)
- Glass: `rgba(255, 255, 255, 0.05-0.15)`
- Text: `#ffffff` with opacity variants
- Accent colors: Project-specific gradients

### Typography
- Font: Inter (Google Fonts)
- Headings: Bold, 32-36px
- Body: Regular, 14-16px
- Small text: 10-12px

### Animations
- Fade in up: 0.4s ease-out
- Hover scale: 1.05 with 0.3s transition
- Carousel: 0.39px per frame

## 🚀 Deployment

```bash
# Build for production
npm run build

# Start production server
npm start
```

Deploy to Vercel, Netlify, or any Node.js hosting platform.

## 📄 License

© 2026 Vatsal Goyal. All rights reserved.
