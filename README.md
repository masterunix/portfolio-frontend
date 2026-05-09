# Portfolio Frontend - Next.js with Glassmorphism

This is a modern portfolio website built with Next.js 15, featuring glassmorphism design and Apple's liquid glass UI aesthetic.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ or 20+
- npm or yarn
- Strapi backend running on `http://localhost:1337`

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
├── lib/
│   └── api.ts                # Strapi API utilities
└── public/                   # Static assets
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

## 🔗 Strapi Integration

The frontend fetches data from Strapi CMS:

- **Projects** - `/api/projects`
- **Skills** - `/api/skills`
- **Experiences** - `/api/experiences`
- **Certifications** - `/api/certifications`
- **Resumes** - `/api/resumes`
- **DSA Platforms** - `/api/dsa-platforms`

### Fallback Data
If Strapi is not running, the app uses static fallback data to ensure the site remains functional.

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
- **Strapi** - Headless CMS backend

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

## 📝 Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_STRAPI_URL=http://localhost:1337
```

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
