# Series 작성 가이드

## 목적
- 포스트를 시리즈로 묶어 연재 순서대로 노출한다.
- `/series`와 `/series/[slug]`에서 시리즈 탐색이 가능하다.

## 1) 포스트에 넣을 frontmatter
시리즈로 묶을 글에는 아래 2개를 추가한다.

- `series`: 시리즈 이름 (문자열)
- `seriesOrder`: 시리즈 내 순서 (숫자)

예시:

```mdx
---
title: '예시 글'
date: '2026-02-14'
tags: ['example']
series: 'Stoic Developer'
seriesOrder: 1
---
```

## 2) 작성 규칙 (중요)
- 같은 시리즈 글은 `series` 값을 정확히 동일하게 쓴다.
- `seriesOrder`는 1, 2, 3...처럼 중복 없이 증가시키는 것을 권장한다.
- `seriesOrder`가 없으면 시리즈 내 뒤쪽으로 밀릴 수 있다.

## 3) 노출 위치
- 헤더 메뉴: `Series`
- 시리즈 목록: `/series`
- 시리즈 상세: `/series/[slug]`
- 포스트 상세: 시리즈 링크 + 시리즈 내부 이전/다음 링크

## 4) 새 시리즈 만드는 순서
1. 첫 글에 `series`, `seriesOrder: 1` 추가
2. 다음 글들에 같은 `series`와 `seriesOrder: 2, 3...` 추가
3. `yarn dev`로 확인 후 `/series`에서 노출 체크

## 5) 빠른 점검 체크리스트
- `/series`에 시리즈가 보인다.
- `/series/<slug>`에서 글 순서가 의도대로 보인다.
- 시리즈 글 상세에서 이전/다음이 시리즈 기준으로 이동한다.
- 비시리즈 글은 기존 이전/다음 동작을 유지한다.

## 6) 문제 해결
- 시리즈가 안 보일 때:
  - `series` 철자/공백이 기존 글과 다른지 확인
  - `draft: true` 여부 확인
- 순서가 이상할 때:
  - `seriesOrder` 값 중복/누락 확인

## 참고 문서
- 상세 스펙: `.specify/01-series-publishing/SPEC.md`
- 작업 계획: `.specify/01-series-publishing/plan.md`
- 작업 목록: `.specify/01-series-publishing/task.md`
- 테스트 케이스: `.specify/01-series-publishing/test.md`
