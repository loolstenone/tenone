-- ============================================================
-- HeRo 기업 서비스 신청 — 팀 진단 · 인재 풀 리포트 · 헤드헌팅 (2026-10-13 적용, MCP apply_migration)
-- 옛 hero_business_inquiries(코드 미사용 기업 문의)를 확장해 신청 접수함으로 쓴다.
-- 처리: 인트라 /intra/hero/business-requests · Action Hub 'hero_business_requests'
-- 헤드헌팅은 유료직업소개사업 등록 전제 (2026-10-13 사용자 결정)
-- ============================================================
ALTER TABLE public.hero_business_inquiries
    ADD COLUMN IF NOT EXISTS service    text,
    ADD COLUMN IF NOT EXISTS detail     jsonb NOT NULL DEFAULT '{}'::jsonb,
    ADD COLUMN IF NOT EXISTS admin_note text,
    ADD COLUMN IF NOT EXISTS handled_at timestamptz,
    ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now(),
    ADD COLUMN IF NOT EXISTS tenant_id  text NOT NULL DEFAULT 'tenone';
ALTER TABLE public.hero_business_inquiries DROP CONSTRAINT IF EXISTS hero_business_inquiries_service_check;
ALTER TABLE public.hero_business_inquiries ADD CONSTRAINT hero_business_inquiries_service_check
    CHECK (service IS NULL OR service IN ('team_diagnosis', 'talent_report', 'headhunting'));
CREATE INDEX IF NOT EXISTS hero_business_inquiries_status_idx ON public.hero_business_inquiries (service, status, created_at DESC);

-- RLS(기존): '관리자 전체' · '본인 조회'. 쓰기는 서버 API(service_role)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.hero_business_inquiries TO authenticated;
GRANT ALL ON public.hero_business_inquiries TO service_role;
