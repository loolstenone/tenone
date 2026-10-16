-- 사이트별 검색 노출 설정 (2026-10-16) — 인트라 › 사이트 설정 › 검색 노출·인공지능 최적화
-- 적용: 2026-10-16 apply_migration site_seo_settings
--
-- robots_extra    : robots.txt에 덧붙일 규칙 (예: AI 크롤러 허용/차단). 공통 규칙·사이트맵 줄은 코드가 만든다 (lib/site-seo.ts)
-- sitemap_exclude : 사이트맵에서 뺄 경로 (접두사 일치, 예: /madleague/pt)
-- llms_txt        : 그 도메인의 /llms.txt 본문 (비우면 404)
-- json_ld         : 그 브랜드 화면에 넣을 구조화 데이터(JSON-LD) — 브랜드 레이아웃의 <SiteJsonLd>가 그린다
-- 기존 데이터 변경 없음 · 재실행 가능
ALTER TABLE public.ums_sites ADD COLUMN IF NOT EXISTS robots_extra text;
ALTER TABLE public.ums_sites ADD COLUMN IF NOT EXISTS sitemap_exclude text[] NOT NULL DEFAULT '{}';
ALTER TABLE public.ums_sites ADD COLUMN IF NOT EXISTS llms_txt text;
ALTER TABLE public.ums_sites ADD COLUMN IF NOT EXISTS json_ld text;
