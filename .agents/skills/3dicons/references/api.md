# 3dicons.co catalog and asset delivery

Verified against `https://3dicons.co` on 2026-08-29.

## Public catalog data

The site renders catalog metadata containing these useful fields:

- `metadata.name`, `metadata.slug`, `metadata.tags`, and `metadata.pro`
- `angle`: observed values include `front`, `dynamic`, and `iso`
- `color`: observed values include `color`, `clay`, `gradient`, and `premium`
- `collection.license`: use entries marked `CC0`
- `preview`: a map of rendered pixel size to a public WebP URL

The preview URL shape currently used by the site is:

```text
https://bvconuycpdvgzbvbkijl.supabase.co/storage/v1/object/public/sizes/{slug}/{angle}/{size}/{palette}.webp
```

Example:

```text
https://bvconuycpdvgzbvbkijl.supabase.co/storage/v1/object/public/sizes/fa6099-travel/dynamic/100/color.webp
```

This is a public storage delivery convention observed in the website, not a documented or versioned public API. Keep its origin and path construction centralized so a future upstream change requires one edit.

## Adding an icon

1. Search `https://3dicons.co/explore` and inspect the matching catalog entry.
2. Confirm `metadata.pro` is false and the collection license is `CC0`.
3. Copy the exact `metadata.slug`; spelling in slugs is not always conventional.
4. Verify the desired URL returns HTTP 200 with an image content type.
5. Add the semantic project name and slug to `src/icons/threeDIcons.ts`.
6. Render it with `ThreeDIcon`; do not hard-code the URL in a page.

Use the source website and its current license page as the authority if catalog metadata or usage terms change.

