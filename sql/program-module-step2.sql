-- 코어 프로그램 모듈 2단계 — 사이트 팀 구성·초대 링크·참가 동의 (2026-10-08 적용, migration program_module_step2)
-- 프로그램 참가 동의 = member_brand_joins(주인 브랜드) · origin 'program' 추가 (기존 signup·sso_auto·admin 유지)
ALTER TABLE public.member_brand_joins DROP CONSTRAINT IF EXISTS member_brand_joins_origin_check;
ALTER TABLE public.member_brand_joins ADD CONSTRAINT member_brand_joins_origin_check
    CHECK (origin = ANY (ARRAY['signup'::text, 'sso_auto'::text, 'admin'::text, 'program'::text]));
