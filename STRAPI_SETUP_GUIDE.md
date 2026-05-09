# Strapi Setup Guide for Projects Page

## Overview

The Projects page displays **3 rows** of hexagons:
- **Top Row**: Skills (managed in Strapi with `type: 'top'`)
- **Middle Row**: Projects (main content)
- **Bottom Row**: Skills (managed in Strapi with `type: 'bottom'`)

---

## Skills Content Type

### Required Fields

Create a **Skills** collection type in Strapi with these fields:

| Field Name | Type | Required | Description |
|------------|------|----------|-------------|
| `name` | Text | ✅ Yes | Skill name (e.g., "React", "Node.js") |
| `description` | Text | ✅ Yes | Short description (e.g., "Component-based UI") |
| `icon` | Text | ✅ Yes | Emoji icon (e.g., "⚛️", "🟢") |
| `color` | Text | ✅ Yes | Hex color code (e.g., "#61dafb") |
| `category` | Enumeration | ❌ No | Skill level: `expert`, `proficient`, `intermediate`, `beginner` |
| `type` | Enumeration | ✅ Yes | Row placement: `top`, `bottom` |
| `order` | Number | ✅ Yes | Display order (0, 1, 2, ...) |

### Type Field Values

The `type` field determines which row the skill appears in:
- **`top`** or **`topRow`** → Top row of projects page
- **`bottom`** or **`bottomRow`** → Bottom row of projects page

### Example Skills

**Top Row Skills:**
```json
{
  "name": "React",
  "description": "Component-based UI",
  "icon": "⚛️",
  "color": "#61dafb",
  "category": "expert",
  "type": "top",
  "order": 0
}
```

```json
{
  "name": "Node.js",
  "description": "Server-side JavaScript",
  "icon": "🟢",
  "color": "#339933",
  "category": "proficient",
  "type": "top",
  "order": 1
}
```

**Bottom Row Skills:**
```json
{
  "name": "Docker",
  "description": "Containerization",
  "icon": "🐳",
  "color": "#2496ed",
  "category": "intermediate",
  "type": "bottom",
  "order": 0
}
```

```json
{
  "name": "Kubernetes",
  "description": "Container orchestration",
  "icon": "☸️",
  "color": "#326ce5",
  "category": "beginner",
  "type": "bottom",
  "order": 1
}
```

---

## Projects Content Type

### Required Fields

The **Projects** collection type should have:

| Field Name | Type | Required | Description |
|------------|------|----------|-------------|
| `title` | Text | ✅ Yes | Project name |
| `tech` | Text | ✅ Yes | Tech stack (e.g., "MERN Stack") |
| `description` | Text | ✅ Yes | Project description |
| `icon` | Text | ❌ No | Emoji icon (e.g., "💼") |
| `logo` | Media | ❌ No | Project logo image |
| `color` | Text | ✅ Yes | Hex color code |
| `github` | Text | ❌ No | GitHub URL or status |
| `visit` | Text | ❌ No | Live site URL or status |
| `order` | Number | ✅ Yes | Display order |

### GitHub/Visit Field Values

Special values that hide buttons:
- `"Coming Soon"`
- `"In Development"`
- `"Private"`
- `"Available on request"`
- `"Will be deployed soon"`
- `null` or empty

Any other value will show as a clickable link.

---

## API Endpoints

### Fetch Skills
```
GET /api/skills?sort=order:asc&populate=*
```

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "name": "React",
      "description": "Component-based UI",
      "icon": "⚛️",
      "color": "#61dafb",
      "category": "expert",
      "type": "top",
      "order": 0
    },
    ...
  ]
}
```

### Fetch Projects
```
GET /api/projects?sort=order:asc&populate=logo
```

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "title": "Job Nest",
      "tech": "MERN Stack",
      "description": "Job platform",
      "icon": "💼",
      "logo": {
        "url": "/uploads/jobnest_logo.png"
      },
      "color": "#667eea",
      "github": "https://github.com/...",
      "visit": "https://jobnest.com",
      "order": 0
    },
    ...
  ]
}
```

---

## Frontend Logic

### How Skills Are Separated

In `app/projects/page.tsx`:

```typescript
const allSkills = await getSkills();

// Separate by 'type' field
topRowSkills = allSkills.filter(skill => 
  skill.type === 'top' || skill.type === 'topRow'
);

bottomRowSkills = allSkills.filter(skill => 
  skill.type === 'bottom' || skill.type === 'bottomRow'
);

// Fallback: if no type specified, split evenly
if (topRowSkills.length === 0 && bottomRowSkills.length === 0) {
  const mid = Math.ceil(allSkills.length / 2);
  topRowSkills = allSkills.slice(0, mid);
  bottomRowSkills = allSkills.slice(mid);
}
```

### Carousel Display

- **14 columns** per set
- **3 sets** duplicated for infinite scroll
- Skills cycle through: `skills[col % skills.length]`
- If you have 14 skills, each appears once per set
- If you have 7 skills, each appears twice per set

---

## Recommended Setup

### Minimum Skills

- **Top Row**: At least 7-14 skills
- **Bottom Row**: At least 7-14 skills

### Optimal Skills

- **Top Row**: 14 skills (one per column)
- **Bottom Row**: 14 skills (one per column)

This ensures no repetition within a single set.

### Example Distribution

**Top Row (Frontend & Languages):**
1. React
2. Vue.js
3. Angular
4. TypeScript
5. JavaScript
6. HTML/CSS
7. Tailwind CSS
8. Next.js
9. Svelte
10. Redux
11. GraphQL
12. REST API
13. Webpack
14. Vite

**Bottom Row (Backend & DevOps):**
1. Node.js
2. Python
3. Django
4. Flask
5. MongoDB
6. PostgreSQL
7. Redis
8. Docker
9. Kubernetes
10. AWS
11. Azure
12. CI/CD
13. Nginx
14. Linux

---

## Color Palette Suggestions

### Frontend Technologies
- React: `#61dafb`
- Vue: `#42b883`
- Angular: `#dd0031`
- TypeScript: `#3178c6`
- JavaScript: `#f7df1e`

### Backend Technologies
- Node.js: `#339933`
- Python: `#3776ab`
- Django: `#092e20`
- MongoDB: `#47a248`
- PostgreSQL: `#336791`

### DevOps & Tools
- Docker: `#2496ed`
- Kubernetes: `#326ce5`
- AWS: `#ff9900`
- Git: `#f05032`
- Linux: `#fcc624`

---

## Icon Suggestions

### Programming Languages
- JavaScript: ⚡
- TypeScript: 📘
- Python: 🐍
- Java: ☕
- Go: 🐹
- Rust: 🦀
- Swift: 🍎
- Kotlin: 🤖

### Frontend Frameworks
- React: ⚛️
- Vue: 💚
- Angular: 🅰️
- Svelte: 🔥

### Backend & Databases
- Node.js: 🟢
- MongoDB: 🍃
- PostgreSQL: 🐘
- Redis: 🔴
- MySQL: 🐬

### DevOps & Cloud
- Docker: 🐳
- Kubernetes: ☸️
- AWS: ☁️
- Azure: ☁️
- Linux: 🐧
- Nginx: 🌐

### Tools
- Git: 📦
- VS Code: 💻
- Webpack: 📦
- Jest: 🃏
- Firebase: 🔥

---

## Testing Your Setup

### 1. Check API Response
```bash
curl http://localhost:1337/api/skills?sort=order:asc
```

### 2. Verify Type Field
Ensure skills have `type: 'top'` or `type: 'bottom'`

### 3. Check Order
Skills should be ordered: 0, 1, 2, 3, ...

### 4. Test Frontend
```bash
npm run dev
```

Navigate to `/projects` and verify:
- ✅ 3 rows visible
- ✅ Top row shows different skills than bottom row
- ✅ Middle row shows projects
- ✅ All hexagons have proper icons and colors

---

## Troubleshooting

### Issue: Only 2 rows visible
**Cause:** Skills might not have `type` field set  
**Fix:** Add `type: 'top'` or `type: 'bottom'` to all skills

### Issue: Same skills in top and bottom rows
**Cause:** All skills have same `type` value  
**Fix:** Split skills - half with `type: 'top'`, half with `type: 'bottom'`

### Issue: Skills not appearing
**Cause:** Strapi might be down or API error  
**Fix:** Check console for errors, verify Strapi is running on port 1337

### Issue: Hexagons not visible
**Cause:** Missing icon or color field  
**Fix:** Ensure all skills have `icon` and `color` fields populated

---

## Migration from Old System

If you have existing skills without `type` field:

1. **Open Strapi Admin**
2. **Go to Skills collection**
3. **Add `type` field** (Enumeration: `top`, `bottom`)
4. **Edit each skill** and set appropriate type
5. **Save and publish**

Or use Strapi API:

```javascript
// Update skill to top row
PUT /api/skills/1
{
  "data": {
    "type": "top"
  }
}

// Update skill to bottom row
PUT /api/skills/2
{
  "data": {
    "type": "bottom"
  }
}
```

---

## Summary

✅ **Skills need `type` field** with values `'top'` or `'bottom'`  
✅ **Top row** displays skills with `type: 'top'`  
✅ **Bottom row** displays skills with `type: 'bottom'`  
✅ **Middle row** displays projects  
✅ **Minimum 7-14 skills** per row recommended  
✅ **Order field** controls display sequence  
✅ **Icon and color** fields are required for visual display  

---

*Last Updated: 2026-05-09*
