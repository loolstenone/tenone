-- service-links.sql
-- 적용: 2026-10-09 (세션 166) — MCP apply_migration `service_links`
--
-- 서비스 간 연계 동의 (코어) — 헌법 원칙 7 · 데이터 계약 3·4조 · 개인정보보호법 제18조 제2항 제1호
-- 텐원은 하나의 회사, 서비스만 다르다. 한 서비스의 데이터를 다른 서비스에서 쓰려면 서비스별 별도 동의가 필요하다.
--   예) MADLeague 경쟁 PT·활동 인증서 → HeRo 커리어 프로필
--
-- 규칙
--   - scope = 코드 레지스트리 키 (lib/service-links.ts SERVICE_LINKS). 이름은 불변 약속 — 바꾸지 않는다
--   - 동의 = 행 INSERT, 철회 = revoked_at 설정. 행을 지우거나 되살리지 않는다 (이력 보존, 재동의 = 새 행)
--   - 쓰기는 서버 API(service_role)만. 회원은 본인 행 조회, 직원은 전체 조회
--   - 읽는 쪽 서비스는 다른 서비스 데이터를 읽기 전에 반드시 활성 연계(hasServiceLink)를 확인한다
--   - 서비스 탈퇴(member_brand_withdrawals) 시 그 서비스가 낀 연계를 자동 철회, 계정 전체 탈퇴면 전부 철회
-- 롤백: DROP TRIGGER trg_revoke_service_links_on_withdrawal ON member_brand_withdrawals;
--       DROP FUNCTION revoke_service_links_on_withdrawal(); DROP TABLE member_service_links;

CREATE TABLE IF NOT EXISTS public.member_service_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL DEFAULT 'tenone',
  member_id uuid NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  scope text NOT NULL,
  source_brand text NOT NULL REFERENCES public.ums_sites(slug),
  target_brand text NOT NULL REFERENCES public.ums_sites(slug),
  consent_version text NOT NULL,
  granted_at timestamptz NOT NULL DEFAULT now(),
  revoked_at timestamptz,
  revoke_reason text CHECK (revoke_reason IS NULL OR revoke_reason IN ('member', 'brand_withdrawal', 'account_withdrawal', 'admin')),
  CHECK (source_brand <> target_brand),
  CHECK (revoked_at IS NULL OR revoked_at >= granted_at)
);

-- 활성 연계는 회원·scope당 하나
CREATE UNIQUE INDEX IF NOT EXISTS member_service_links_active_uq
  ON public.member_service_links (member_id, scope) WHERE revoked_at IS NULL;
CREATE INDEX IF NOT EXISTS member_service_links_member_idx ON public.member_service_links (member_id);

ALTER TABLE public.member_service_links ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS member_service_links_select_own ON public.member_service_links;
CREATE POLICY member_service_links_select_own ON public.member_service_links
  FOR SELECT TO authenticated
  USING (member_id IN (SELECT m.id FROM public.members m WHERE m.auth_id = auth.uid()) OR public.auth_is_staff());
-- INSERT·UPDATE·DELETE 정책 없음 → 서버 API(service_role)만 쓴다

-- 서비스 탈퇴 시 연계 자동 철회 — 탈퇴 기록 INSERT가 RLS에 막히지 않도록 SECURITY DEFINER (부록 A: 세션 156 사고)
CREATE OR REPLACE FUNCTION public.revoke_service_links_on_withdrawal()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.scope = 'account' THEN
    UPDATE public.member_service_links
       SET revoked_at = now(), revoke_reason = 'account_withdrawal'
     WHERE member_id = NEW.member_id AND revoked_at IS NULL;
  ELSE
    UPDATE public.member_service_links
       SET revoked_at = now(), revoke_reason = 'brand_withdrawal'
     WHERE member_id = NEW.member_id AND revoked_at IS NULL
       AND (source_brand = NEW.brand_id OR target_brand = NEW.brand_id);
  END IF;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.revoke_service_links_on_withdrawal() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS trg_revoke_service_links_on_withdrawal ON public.member_brand_withdrawals;
CREATE TRIGGER trg_revoke_service_links_on_withdrawal
  AFTER INSERT ON public.member_brand_withdrawals
  FOR EACH ROW EXECUTE FUNCTION public.revoke_service_links_on_withdrawal();

-- GRANT (부록 D) — 쓰기는 service_role만. authenticated는 본인 조회(RLS)뿐, anon은 없음
REVOKE ALL ON public.member_service_links FROM anon;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER ON public.member_service_links FROM authenticated; -- 기본 권한으로 붙는 쓰기 제거
GRANT SELECT ON public.member_service_links TO authenticated;
GRANT ALL ON public.member_service_links TO service_role;
