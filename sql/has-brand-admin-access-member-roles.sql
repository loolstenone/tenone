-- ═══════════════════════════════════════════════════════════════
-- has_brand_admin_access() → member_roles 기준 (2026-10-10, 승인 후 적용)
--   데이터 계약 2조 "권한은 한 곳에서": members.intra_access·brand_access(옛 권한 컬럼) 대신 member_roles(role=브랜드 slug, context='brand')
--   영향 0 확인: 현재 brand_access 보유자 = Cheonil Jeon 1명, member_roles brand 8개와 완전히 같음
--   사용처: brand_membership_applications 정책 bma_intra_admin
--   롤백: 아래 옛 본문으로 다시 CREATE OR REPLACE
--     SELECT EXISTS (SELECT 1 FROM members WHERE auth_id = auth.uid() AND intra_access = true AND p_brand_id = ANY(brand_access));
-- ═══════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.has_brand_admin_access(p_brand_id text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $function$
  SELECT public.auth_is_super_admin() OR EXISTS (
    SELECT 1
    FROM member_roles r
    JOIN members m ON m.id = r.member_id
    WHERE m.auth_id = auth.uid()
      AND r.context = 'brand'
      AND r.role = p_brand_id
      AND r.is_active
      AND (r.expires_at IS NULL OR r.expires_at > now())
  );
$function$;
