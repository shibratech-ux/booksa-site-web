---
name: lucide-icons
description: Use lucide-react for every functional UI icon in this project. Use when adding, replacing, or reviewing icons in buttons, navigation, inputs, lists, status rows, or any other interface glyph; do not import Fluent, react-icons, or Heroicons.
---

# Lucide Icons

All functional icons come from `lucide-react` (pinned in `package.json`). Decorative 3D artwork is the only exception and goes through the `3dicons` skill and `ThreeDIcon`.

## Project conventions

- Import named icons directly: `import { Search, X } from 'lucide-react';`. Do not add `@fluentui/react-icons`, `react-icons`, or `@heroicons/react` imports.
- Use the Lucide light weight everywhere: `strokeWidth={1.5}`. The global `.lucide` rule in `src/index.css` supplies this default; do not make active, selected, or destructive icons heavier.
- The base icon size is small: `h-4 w-4` (16px, `var(--icon-small)`). Use `h-5 w-5` for standard controls and increase the size only when the icon is the main illustration or an established component size requires it.
- If an icon name clashes with a local identifier (a component, type, or DOM global such as `Image` or `Menu`), import the `…Icon` alias instead: `import { MenuIcon } from 'lucide-react';`.
- Size with Tailwind classes (`h-5 w-5`) or `size`. An icon that should scale with text needs `size="1em"`.
- Color comes from `currentColor`; set it with theme tokens such as `text-[var(--color-text-secondary)]`, never hex values.
- For a solid variant (saved heart, rating star, filled pin), keep the outline icon and add `fill="currentColor"`; toggle the fill for on/off states.
- Do not vary stroke weight. If an explicit value is needed, use `strokeWidth={1.5}`.
- Type icon props as `LucideIcon`: `import type { LucideIcon } from 'lucide-react';`.
- Decorative icons next to visible text get `aria-hidden="true"`. Icon-only buttons need an `aria-label` on the button.
- Check that a name exists in the installed version before using it; for example `ShieldUser` is not in 0.453.

## Shared back navigation

Use `BackButton` from `@/components/ui/BackButton` for icon-only back buttons. It composes `IconButton` with a circular 44px touch target and Lucide `ArrowLeft` at 20px with 1.5 stroke.

```tsx
<BackButton onClick={onBack} label={t('accessibilityFeatures.back')} className="-ml-3" />
```

- Pass a translated, destination-specific `label`; the arrow is decorative.
- Keep navigation in the caller's `onClick`: editor sub-pages often return through local state, so the component does not call browser history automatically.
- The default `plain` variant matches Accessibility features and Amenities. Use `muted` for a filled surface (House rules), or `outlined` for a bordered control.
- Pass `disabled` while saving and preserve the caller's focus restoration when returning to the previous page.
- Use `className` for positioning. Keep the shared icon, circular shape and touch-target dimensions in the component.
- Keep back controls with visible text or custom composite layouts separate unless their design is also being updated.

## Validate

- Search `src/` for `@fluentui/react-icons`, `react-icons`, and `@heroicons/react`; there must be no matches.
- Search rendered TSX for hand-authored `<svg>`, emoji/symbol glyphs used as controls, and raster images used as interface icons; replace them with Lucide. Brand logos and decorative imagery are not interface icons.
- Run `npm run typecheck` after icon changes and `npm run build` when shared components change.
