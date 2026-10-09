-- certificate-claim.sql
-- 적용: 2026-10-09 (세션 166) — MCP apply_migration `member_brand_joins_origin_certificate`
--
-- 경쟁 PT 인증서 받기 = 로그인 유도 (사용자 결정: "인증서 발급은 로그인하게 하는 미끼")
--   수료증 관리 대장 인증서(program_certificates, member_id NULL)를 본인 확인 후 로그인 계정에 연결(member_id 설정)
--   연결할 때 MADLeague 이용 동의를 member_brand_joins에 origin 'certificate'로 기록 (헌법 원칙 1 · 데이터 계약 4조)
-- 롤백: origin_check에서 'certificate' 제거 (해당 행이 없을 때)

ALTER TABLE public.member_brand_joins DROP CONSTRAINT IF EXISTS member_brand_joins_origin_check;
ALTER TABLE public.member_brand_joins ADD CONSTRAINT member_brand_joins_origin_check
  CHECK (origin = ANY (ARRAY['signup','sso_auto','admin','program','first_visit','application','certificate']));
