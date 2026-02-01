# Repository Guidelines

## Project Structure & Module Organization

- `app/` contains App Router routes/layouts; mark client-only modules with `'use client'`.
- `components/` houses shared UI and icons; co-locate related hooks or styles with the component.
- `layouts/` defines blog/page shells, while `lib/` centralizes analytics, markdown, and config helpers.
- `data/` stores Contentlayer sources (posts in `data/blog`, authors in `data/authors`, metadata); edits regenerate types automatically.
- `css/` holds Tailwind entrypoints and tokens, and `public/` serves static assets.
- `scripts/` runs automation like `postbuild.mjs` (RSS/OpenGraph) plus newsletter tooling alongside `emails/` templates.

## Build, Test, and Development Commands

- `yarn dev` runs the Next.js dev server with hot reload and Contentlayer watch.
- `yarn build` compiles the production bundle then executes `scripts/postbuild.mjs` for feeds and metadata.
- `yarn serve` hosts the compiled build locally for pre-deploy smoke tests.
- `yarn lint` applies ESLint auto-fixes across app, components, layouts, lib, and scripts.
- `yarn analyze` opens bundle stats for performance budgeting.
- `yarn newsletter:preview` starts the React Email preview server during template work.

## Newsletter Sending (Manual)

- Requires `.env`/`.env.local` with `RESEND_API_KEY`, `RESEND_AUDIENCE_ID`.
- Test send (single recipient): `yarn newsletter:send <slug|title> --test you@example.com`.
- Full send (all active subscribers): `yarn newsletter:send <slug|title>`.
- Optional note (shown under greeting): `--note "추가 문구"`.
- Send delay (ms) between recipients: `--delay 1000` (default 1000ms).

## Coding Style & Naming Conventions

- Keep React/TypeScript components in PascalCase files; name hooks and utilities in camelCase.
- Honor Prettier defaults: 2-space indent, no semicolons, single quotes, 100-char width, Tailwind sorting via `prettier-plugin-tailwindcss`.
- Prefer typed props and pure functions; resolve ESLint warnings locally before PRs.
- Order Tailwind utility classes from layout → spacing → typography for quick scanning.

## Testing Guidelines

- No automated unit suite yet; gate each change with `yarn lint` and confirm `yarn build` succeeds.
- Manually spot-check core routes (`/`, `/blog/[slug]`, `/tags`) plus light/dark theme toggles in dev or `yarn serve`.
- After content edits, confirm `public/rss.xml` and sitemap artifacts refresh from the postbuild step.
- When updating newsletters, validate the markup with `yarn newsletter:preview` before merge.

## Commit & Pull Request Guidelines

- Follow the repo pattern of lowercase prefixes (`add:`, `fix:`, `chore:`, `docs:`) plus a concise description.
- Keep commits scoped; add generated artifacts only when required for the change.
- PRs need a summary, linked issues, test notes, and UI screenshots whenever visuals shift.
- Rebase onto `main` and ensure Contentlayer output is current before requesting review.

## Content & Configuration Notes

- Add posts as MDX in `data/blog` with frontmatter (`title`, `date`, `summary`, `tags`); start `yarn dev` once to regenerate typing.
- Load analytics and newsletter keys through `.env.local`; call out new env vars in the PR description.

## 명령

- 대답은 한국어로 한다.
