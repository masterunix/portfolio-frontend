# Strapi Navigation Items Schema

This document describes the Strapi collection type needed for managing home page navigation items.

## Collection Type: `navigation-items`

### Fields

| Field Name | Type | Required | Description | Example |
|------------|------|----------|-------------|---------|
| `title` | Text (Short) | Yes | Navigation item title | "Github" |
| `description` | Text (Short) | Yes | Brief description | "View my code repositories" |
| `color` | Text (Short) | Yes | Hex color code | "#333333" |
| `href` | Text (Short) | Yes | URL or path | "https://github.com/masterunix" |
| `external` | Boolean | Yes | Opens in new tab if true | true |
| `gridPosition` | Text (Short) | Yes | Grid position (row-col) | "1-2" |
| `iconName` | Text (Short) | No | Icon identifier (see list below) | "github" |
| `icon` | Media (Single) | No | Custom icon image (PNG/SVG) | Upload file |
| `order` | Number (Integer) | Yes | Display order | 1 |

### Icon Priority

The system uses icons in this priority order:
1. **Custom Image** (`icon` field) - If you upload an image, it will be used
2. **Icon Name** (`iconName` field) - If you specify an icon name, it will use the built-in SVG
3. **Fallback** - Uses the hardcoded icon for that grid position

### Available Icon Names

You can use these icon names in the `iconName` field:

| Icon Name | Description | Visual |
|-----------|-------------|--------|
| `github` | GitHub logo | GitHub icon |
| `linkedin` | LinkedIn logo | LinkedIn icon |
| `star` | Star/sparkle icon | ⭐ |
| `document` | Document/file icon | 📄 |
| `target` | Target/bullseye icon | 🎯 |
| `chart` | Bar chart icon | 📊 |
| `mail` | Email/envelope icon | ✉️ |

### Grid Positions

The home page uses a 4×8 hexagonal grid. Available positions for navigation items:

```
Row 0: 0-1, 0-2, 0-3, 0-4, 0-5, 0-6
Row 1: 1-0, 1-1, 1-2, 1-3, 1-4, 1-5, 1-6
Row 2: 2-1, 2-2, 2-3, 2-4, 2-5, 2-6
Row 3: 3-0, 3-1, 3-2, 3-3, 3-4, 3-5
```

**Default navigation positions** (from old portfolio):
- `1-2` - Github (iconName: "github")
- `1-3` - Live Projects (iconName: "star")
- `1-4` - LinkedIn (iconName: "linkedin")
- `2-2` - Explore Resumes (iconName: "document")
- `2-3` - Experience & Skills (iconName: "target")
- `2-4` - DSA Stats (iconName: "chart")
- `2-5` - Mail Me! (iconName: "mail")

### Example Entry (Using Icon Name)

```json
{
  "title": "Github",
  "description": "View my code repositories",
  "color": "#333333",
  "href": "https://github.com/masterunix",
  "external": true,
  "gridPosition": "1-2",
  "iconName": "github",
  "order": 1
}
```

### Example Entry (Using Custom Image)

```json
{
  "title": "Portfolio",
  "description": "View my work",
  "color": "#667eea",
  "href": "/projects",
  "external": false,
  "gridPosition": "1-3",
  "icon": {
    "url": "/uploads/custom_icon.png"
  },
  "order": 2
}
```

## Custom Icon Guidelines (if uploading images)

### Recommended Icon Specifications
- **Format**: PNG or SVG
- **Size**: 28×28px to 56×56px (will be scaled to 28×28px)
- **Background**: Transparent
- **Color**: White or light colors (displayed on gradient background)

## API Endpoint

The frontend fetches navigation items from:
```
GET /api/navigation-items?sort=order:asc&populate=icon
```

## Fallback Behavior

If Strapi is unavailable or returns no data:
1. The system uses hardcoded navigation from `/lib/constants.tsx`
2. Console warning is logged
3. All default navigation items are displayed

## Setup Instructions

1. **Create Collection Type** in Strapi:
   - Go to Content-Type Builder
   - Create new Collection Type: `navigation-items`
   - Add all fields listed above
   - Save and restart Strapi

2. **Add Navigation Items**:
   - Go to Content Manager → Navigation Items
   - Create entries for each navigation item
   - Use `iconName` field with one of the available icon names (easiest)
   - OR upload custom icon images
   - Set grid positions carefully to avoid overlaps

3. **Publish Items**:
   - Ensure all items are published (not draft)
   - Items will appear immediately on the home page

## Quick Start Example

To recreate the default navigation in Strapi, create these 7 entries:

1. **Github**: gridPosition="1-2", iconName="github", color="#333333"
2. **Live Projects**: gridPosition="1-3", iconName="star", color="#667eea"
3. **LinkedIn**: gridPosition="1-4", iconName="linkedin", color="#0077b5"
4. **Resumes**: gridPosition="2-2", iconName="document", color="#34a853"
5. **Skills**: gridPosition="2-3", iconName="target", color="#ff6b6b"
6. **DSA Stats**: gridPosition="2-4", iconName="chart", color="#4ecdc4"
7. **Mail**: gridPosition="2-5", iconName="mail", color="#feca57"

## Notes

- Grid positions must be unique (no two items on same position)
- Invalid grid positions will be ignored
- External links open in new tab, internal links use Next.js routing
- Colors should be valid hex codes (e.g., "#667eea")
- Order field determines the sequence in Strapi admin, not grid position
- Icon names are case-sensitive (use lowercase)
