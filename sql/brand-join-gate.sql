-- brand-join-gate.sql
-- 적용: 2026-10-08 (세션 165) — MCP apply_migration `brand_join_gate`
--
-- 브랜드 첫 진입 동의 (components/BrandJoinGate.tsx · lib/brand-join.ts) — 헌법 원칙 1 · 데이터 계약 4조
-- member_brand_joins.origin 허용 값 추가:
--   first_visit — One ID 회원이 브랜드를 처음 이용하며 동의 (SSO로 넘어온 경우 포함)
--   application — 승인 멤버십 (trg_approve_membership_fn이 이미 이 값으로 INSERT하는데 체크 제약에 없어 승인 시 실패하던 잠재 오류 수정)
-- 롤백: 원래 제약 (signup, sso_auto, admin, program) — 단 first_visit·application 행이 있으면 먼저 정리

ALTER TABLE public.member_brand_joins DROP CONSTRAINT IF EXISTS member_brand_joins_origin_check;
ALTER TABLE public.member_brand_joins ADD CONSTRAINT member_brand_joins_origin_check
  CHECK (origin = ANY (ARRAY['signup', 'sso_auto', 'admin', 'program', 'first_visit', 'application']));
