# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development

```bash
yarn dev        # Start development server with environment setup
yarn serve      # Start production server
```

### Build & Deploy

```bash
yarn build      # Build for production and run post-build scripts
yarn analyze    # Build with bundle analyzer enabled
```

### Code Quality

```bash
yarn lint       # Run ESLint with auto-fix on app, components, layouts, scripts
```

### Installation

```bash
yarn           # Install dependencies (uses Yarn 3.6.1)
```

## Architecture

This is a **Next.js 15.2.4** blog template using the **App Router** with **React Server Components** and **Contentlayer2** for content management.

### Core Technologies

- **Content**: Contentlayer2 processes MDX files with extensive remark/rehype plugins
- **Styling**: Tailwind CSS v4 with custom theming and typography
- **Framework**: Next.js with TypeScript, strict mode enabled
- **Package Manager**: Yarn 3.6.1 with workspace support

### Content Architecture

- **Blog Posts**: `data/blog/*.mdx` - Supports frontmatter, math (KaTeX), code highlighting, citations
- **Authors**: `data/authors/*.mdx` - Author profiles with social links and bio
- **Site Config**: `data/siteMetadata.js` - Global site configuration including analytics, comments, search
- **Tag System**: Auto-generated from blog post tags with counts in `app/tag-data.json`

### Key Directories

- `app/` - Next.js App Router pages with internationalization support (ko/en)
- `components/` - Reusable React components including MDX components
- `layouts/` - Page layout templates (PostLayout, PostSimple, PostBanner, ListLayout)
- `data/` - Content source files and configuration
- `public/static/` - Static assets (images, favicons)

### Content Processing Pipeline

1. **Contentlayer** processes MDX files in `data/blog/` and `data/authors/`
2. **Remark plugins**: GFM, math, code titles, image JSX conversion, GitHub alerts, line breaks
3. **Rehype plugins**: Slug generation, autolink headings, KaTeX math, Prism+ syntax highlighting, citations, minification
4. **Post-build**: Generates tag counts, search index, and runs custom scripts

### Internationalization

- Multi-locale support with `/ko/` and `/en/` routes
- Locale-specific blog post routing and tag pages
- Configured for Korean (`ko-kr`) as primary language

### Third-party Integrations

- **Analytics**: Umami and Google Analytics support
- **Comments**: Giscus integration with GitHub Discussions
- **Search**: Kbar command palette with local search index
- **Math**: KaTeX for mathematical expressions
- **Citations**: Academic citation support via rehype-citation

### Development Notes

- Uses **lint-staged** with Husky for pre-commit hooks
- **Security headers** configured in `next.config.js` with CSP
- **Image optimization** via next/image with remote pattern support
- **Path aliases** configured: `@/components/*`, `@/data/*`, `@/layouts/*`, `@/css/*`
- Content changes trigger automatic tag count and search index regeneration

## 작업 후 반드시 해야할 일

- 빌드를 해서 오류가 있는지 확인한다.
- 어떤 작업을 실시했는지 요약해서 보여준다.
- 수정한 파일 목록을 보여준다.
