# CLAUDE.md

@AGENTS.md

The shared rules are in `AGENTS.md` (imported above). Everything below is Claude Code–specific.

## Before you start
- State which domain rules and skills-matrix rows the task touches. If it hits an **Ask first** item in `AGENTS.md`, ask before editing.
- Check `git status` first. Uncommitted listing work may be in progress; don't revert, reformat or stage files you didn't change.
- For listing changes, read `src/domain/listing.ts`, `src/services/listing-draft.service.ts` and `docs/listing-creation.md` first.
- For UI work, load the matching project skill in `.agents/skills/` (maps, marketplace rails, dialog motion, 3D icons, brand language) and follow it.

## Verifying
- Run `npm run typecheck` after every edit batch, `npm run test:listing` after domain/service changes and `npm run build` before declaring done.
- There is no single-test filter: `tests/run-listing-tests.mjs` ignores CLI args and runs `node --test` without `--test-only`. Run the whole suite (it is small).
- UI changes: check light and dark themes at mobile and desktop widths. If you can't run a browser, say the UI was not visually verified.
- Report failures with their output; never describe unverified behavior as working.

## Don'ts specific to this repo
- Don't run `./deploy.sh` or `./update_github_netlify.sh`. They commit and push everything.
- Don't open, print or summarize `.env.local`.
- Don't "fix" the known pricing debt or hard-coded colors as a side effect of another task. Note it and ask.
- Don't rename `annonceslisting` or change `resumePath`. The Flutter app reads them.
- Don't put Airbnb in user-facing copy; the product is Booksa.
