---
name: booksa-marketplace-rails
description: Keep Booksa horizontal listing, experience, and service rails visually consistent. Use when creating or changing marketplace cards, image sizing, rail spacing, or responsive rail containers.
---

# Booksa Marketplace Rails

Use the shared sizing rules in `src/index.css` instead of adding per-page width utilities.

## Shared geometry

- Apply `marketplace-reference-container` to the main content container on the Homes, Experiences, and Services marketplace pages.
- Apply `marketplace-reference-card` to every content card and its optional “Tout voir” card.
- The current card/image width is `151.936383744px` by default and `209.615936832px` from 640px.
- From 1024px, use `calc(((100% - 60px) / 6) * 0.9847728576)`.
- From 1380px, use `calc(((100% - 72px) / 7) * 0.9847728576)`.
- Keep marketplace image tiles at `aspect-ratio: 1.04 / 1` and horizontal rail gaps at `12px`.

When resizing these cards by a percentage, update the four declarations on `.marketplace-reference-card` once. Do not duplicate the resulting values in HomePage or ExploreRail utility classes.

## Shared typography

Use these values consistently in Homes, Experiences, and Services rails:

- Card title: `12px`, increasing to `13px` from 640px; weight `600`; line-height `15px`, increasing to `17px`.
- Card subtitle and pricing metadata: `12px`; weight `600`; line-height `15px`.
- Rail section title: `18px`, increasing to `20px` from 640px; weight `600`; letter-spacing `-0.025em`.
- Rail section subtitle: `11.76px`, increasing to `13px` from 640px.

## Validate

Check the Homes, Experiences, and Services rails, then run the TypeScript check and production build.
