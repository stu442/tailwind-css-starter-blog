# Series Feature Task List

## 구현 태스크

- [ ] `contentlayer.config.ts`에 `series?: string`, `seriesOrder?: number` 추가
- [ ] 시리즈 그룹/정렬 유틸 작성
- [ ] `/series` 라우트 추가 (`app/series/page.tsx`)
- [ ] `/series/[slug]` 라우트 추가 (`app/series/[slug]/page.tsx`)
- [ ] 시리즈 slug 미존재 시 404 처리
- [ ] 포스트 상세에 시리즈 링크 노출
- [ ] 시리즈 포스트 이전/다음 계산 로직 추가
- [ ] 비시리즈 포스트 기존 이전/다음 유지
- [ ] 헤더 네비게이션에 `Series` 추가
- [ ] sitemap에 시리즈 경로 포함
- [ ] 페이지 메타데이터(타이틀/설명) 추가
- [ ] 문서(`SPEC.md`, `AGENTS.md`)와 구현 내용 일치 확인

## 콘텐츠 태스크

- [ ] 시리즈로 묶을 대상 포스트 선정
- [ ] 대상 포스트 frontmatter에 `series` 입력
- [ ] 대상 포스트 frontmatter에 `seriesOrder` 입력
- [ ] 시리즈명 표기 규칙(대소문자/공백) 통일

## 배포 전 태스크

- [ ] `yarn lint`
- [ ] `yarn build`
- [ ] 주요 경로 수동 확인 (`/`, `/blog/[slug]`, `/tags`, `/series`, `/series/[slug]`)
