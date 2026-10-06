-- MADzine 카테고리 8종 (기존 madleague.net과 동일) — 2026-10-06 사용자 결정 · 운영 적용 (migration madzine_categories) · 콘텐츠 21건·이미지 85장 이전 완료
-- 커버 cover · 인터뷰 interview · 케이스 case · 리포트 report · 스토리 story · HeRo hero · 시리즈 series · 동아리 news
-- 코드 SSOT: lib/madzine-categories.ts
--
-- 콘텐츠 이전: madleague.net/59 (아임웹) 게시물 21건 → mad_articles (slug = 'mz-{아임웹 idx}')
--   이미지 85장 → Storage mad-community/madzine/{idx}/ (cdn.imweb.me에서 복사)
--   실행: scripts/madzine-import.mjs (service_role, 멱등 — slug 기준 upsert)

ALTER TABLE public.mad_articles DROP CONSTRAINT IF EXISTS mad_articles_category_check;
ALTER TABLE public.mad_articles ADD CONSTRAINT mad_articles_category_check
    CHECK (category = ANY (ARRAY['cover', 'interview', 'case', 'report', 'story', 'hero', 'series', 'news']));
