-- ============================================================
-- 프로필 체계 P2 보완 — 브랜드 공개 프로필 신고 (2026-10-16, 세션 178)
-- 적용: 2026-10-16 apply_migration profile_p2b_report_scope
--
-- 신고 대상 = 그 범위(scope)에서 공개된 프로필: 'universe'면 유니버스 공개, 브랜드면 그 브랜드 공개 설정
-- brand_id는 scope와 같게 (유니버스 = tenone)
-- ============================================================

CREATE OR REPLACE FUNCTION public.member_scope_profile_is_public(p_member_id uuid, p_scope text)
 RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $function$
    SELECT CASE WHEN p_scope = 'universe' THEN member_profile_is_public(p_member_id)
           ELSE EXISTS (SELECT 1 FROM member_brand_profile_settings s
                        WHERE s.member_id = p_member_id AND s.brand_id = p_scope AND s.is_public) END;
$function$;
REVOKE ALL ON FUNCTION public.member_scope_profile_is_public(uuid, text) FROM public;
GRANT EXECUTE ON FUNCTION public.member_scope_profile_is_public(uuid, text) TO anon, authenticated, service_role;

DROP POLICY IF EXISTS profile_reports_insert ON public.profile_reports;
CREATE POLICY profile_reports_insert ON public.profile_reports FOR INSERT TO authenticated WITH CHECK (
    reporter_member_id = (SELECT id FROM members WHERE auth_id = auth.uid())
    AND reporter_member_id <> target_member_id
    AND status = 'pending' AND handled_by IS NULL
    AND brand_id = CASE WHEN scope = 'universe' THEN 'tenone' ELSE scope END
    AND member_scope_profile_is_public(target_member_id, scope)
);
