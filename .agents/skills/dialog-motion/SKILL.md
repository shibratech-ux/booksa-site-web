---
name: dialog-motion
description: Build or refine animated React dialog boxes in this project using Framer Motion and the existing theme tokens. Use when creating modal dialogs, contextual action menus, confirmation boxes, trash-action menus, or when a user asks to add or adjust a dialog's entrance and exit animation.
---

# Dialog Motion

Keep project dialogs visually consistent, accessible, and responsive.

## Build the dialog

- Use `AnimatePresence` to retain exit animations when the dialog unmounts.
- Use a fixed, full-screen wrapper with a project-appropriate `z-index` and a subtle overlay.
- Close on backdrop click only when `event.target === event.currentTarget`.
- Add `role="dialog"`, `aria-modal="true"`, and an accessible label or labelled title.
- Disable dismissal and actions while a destructive operation is running.
- Use the existing CSS theme variables for surfaces, muted states, text, borders, and shadows.

## Animate vertically

For compact contextual dialogs such as the photo trash-action menu, use a visible upward entrance and downward exit:

```tsx
<motion.div
  initial={{ opacity: 0, scale: 0.97, y: 34 }}
  animate={{ opacity: 1, scale: 1, y: 0 }}
  exit={{ opacity: 0, scale: 0.98, y: 22 }}
  transition={{ type: 'spring', stiffness: 360, damping: 28, mass: 0.8 }}
>
  {children}
</motion.div>
```

Keep the movement short enough to feel responsive. Preserve the fade and subtle scale so the vertical motion does not feel abrupt. Use a smaller `y` distance for large dialogs and a slightly larger distance for compact menus.

## Validate

- Verify opening, closing, backdrop click, and Escape behavior.
- Verify focus styling and accessible names for every action.
- Confirm destructive actions cannot run twice while loading.
- Run `npm run typecheck` after implementation and `npm run build` when the dialog changes application behavior.
