---
name: booksa-brand-language
description: Keep user-facing product copy branded as Booksa. Use when creating, editing, reviewing, or migrating rendered UI text, page metadata, accessibility labels, notifications, emails, or other customer-visible content in this project.
---

# Booksa Brand Language

Use `Booksa` as the product name in all user-facing content.

## Branding convention

- Replace `Airbnb` with `Booksa` when it appears as rendered product copy, including text inside JSX or HTML tags, attributes such as `title`, `alt`, and `aria-label`, page metadata, notifications, and transactional messages.
- Match the exact capitalization `Booksa`.
- When adapting reference UI or copy inspired by another marketplace, rewrite product references as Booksa rather than carrying the other brand into the application.
- Do not rename third-party package names, API identifiers, URLs, compatibility references, or legally required attribution solely because they contain `airbnb`; those are technical or external identifiers rather than Booksa product copy.

## Validate

- Search case-insensitively for `airbnb` after changing user-facing copy and review every remaining match in context.
- Run the relevant typecheck or build when the copy change touches executable source files.
