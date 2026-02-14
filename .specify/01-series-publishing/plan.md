# Series Feature Plan

## 목표
- 블로그에 시리즈 발행/탐색 기능을 도입한다.
- 기존 비시리즈 포스트 동작은 유지한다.

## 단계별 실행 계획

1. 스키마 확장
- `contentlayer.config.ts`의 `Blog` 필드에 `series`, `seriesOrder` 추가
- 타입 생성/빌드 시 하위 호환 유지 확인

2. 시리즈 데이터 유틸 설계
- `allBlogs` 기반 시리즈 그룹 집계 로직 추가
- slug 자동 생성 규칙 통일
- 시리즈 내부 정렬(`seriesOrder` -> `date`) 적용

3. 라우트 구현
- `app/series/page.tsx` 구현 (시리즈 인덱스)
- `app/series/[slug]/page.tsx` 구현 (시리즈 상세)
- 존재하지 않는 slug는 404 처리

4. 포스트 상세 연동
- 시리즈 포스트에서 시리즈 링크 노출
- 시리즈 포스트는 시리즈 기준 이전/다음 적용
- 비시리즈 포스트는 기존 전역 이전/다음 유지

5. 네비게이션/SEO 반영
- `data/headerNavLinks.ts`에 `/series` 추가
- sitemap/metadata에 `/series`, `/series/[slug]` 반영

6. 문서/검증
- `SPEC.md`와 구현 내용 동기화
- lint/build/수동 점검 완료

## 완료 기준
- `/series`, `/series/[slug]` 정상 동작
- 시리즈 포스트 상세 내 링크/이전·다음 정상 동작
- 기존 비시리즈 포스트 동작 회귀 없음
