-- 적용: 2026-10-11 (MCP apply_migration mindle_sources_last_error)
-- 소스별 마지막 성공·실패 — error_count 누적치로는 "지금 죽어 있는 소스"를 알 수 없었다.
-- trend-crawl Edge Function이 성공 시 last_success_at·last_error=NULL, 실패 시 last_error·last_error_at 기록.
-- 인트라 Whole See › 크롤링: last_error_at > last_success_at 인 소스 = 현재 실패 중 (언제부터인지 표시)
ALTER TABLE public.mindle_sources ADD COLUMN IF NOT EXISTS last_success_at timestamptz;
ALTER TABLE public.mindle_sources ADD COLUMN IF NOT EXISTS last_error text;
ALTER TABLE public.mindle_sources ADD COLUMN IF NOT EXISTS last_error_at timestamptz;
COMMENT ON COLUMN public.mindle_sources.last_error IS 'trend-crawl 마지막 실패 원인 (HTTP 상태·타임아웃 등). 성공하면 NULL';
UPDATE public.mindle_sources SET last_success_at = last_crawled_at WHERE last_success_at IS NULL AND last_crawled_at IS NOT NULL;
