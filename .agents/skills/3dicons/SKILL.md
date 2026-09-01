---
name: 3dicons
description: Find and integrate 3D icon assets from 3dicons.co into this project. Use when adding, replacing, or reviewing decorative 3D icons; do not replace compact functional controls with raster icons unless the user asks.
---

# 3dicons

Use the live 3dicons.co catalog to select a semantically appropriate icon and integrate it through the project's shared `ThreeDIcon` component and registry.

## Project conventions

- Use 3D icons for decorative navigation, feature, category, and empty-state artwork. Keep the existing Fluent, Lucide, or React Icons glyphs for small functional controls where crisp strokes and `currentColor` are important.
- Prefer catalog variants whose metadata is `pro: false` and whose collection is licensed `CC0`. Do not infer that a Pro asset is included merely because its preview is publicly readable.
- Add every icon slug to `src/icons/threeDIcons.ts`; do not scatter Supabase URLs across components.
- Use an available rendered size at or just above the displayed CSS size. The catalog currently exposes 20, 60, 100, 200, 400, and 500 pixel WebP previews.
- Give decorative icons empty alt text and `aria-hidden="true"`. If the icon communicates information that adjacent text does not, give it meaningful alt text instead.
- Preserve a usable fallback for network or upstream failures.

For the observed catalog fields, URL shape, verification procedure, and source caveat, read [references/api.md](references/api.md).

