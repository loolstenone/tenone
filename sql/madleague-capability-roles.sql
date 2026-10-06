-- MADLeague 활동 역할 → member_capability_roles 이관 — 운영 적용 2026-10-06 (migration madleague_capability_roles, 이관 1건·롤백 시뮬레이션 검증)
-- §1.6: member_roles는 권한 전용. 회원 활동 역할(현역·회장·멘토·과제기업)은 §1.3.1 capability 모델
-- 매핑 (2026-10-06 사용자 결정):
--   approved_member → (club, 현역) · leader → (club, 임원, {position:회장}) · mentor → (club, 멘토) · corporate → (showcase, host, {type:corporate})
-- 코드: lib/madleague-roles.ts (getMadAccess · grantMadCapabilityRole)

-- 1) club capability에 '멘토' 역할 추가 (키·기존 역할 불변)
UPDATE public.capabilities
SET built_in_roles = array_append(built_in_roles, '멘토')
WHERE key = 'club' AND NOT ('멘토' = ANY(built_in_roles));

-- 2) 기존 member_roles(context='brand:madleague') 활동 역할 → capability 행 (이력 보존)
INSERT INTO public.member_capability_roles (member_id, brand_id, capability_key, role, context, valid_from)
SELECT mr.member_id, 'madleague',
       CASE mr.role WHEN 'corporate' THEN 'showcase' ELSE 'club' END,
       CASE mr.role WHEN 'approved_member' THEN '현역' WHEN 'leader' THEN '임원' WHEN 'mentor' THEN '멘토' WHEN 'corporate' THEN 'host' END,
       CASE mr.role WHEN 'leader' THEN '{"position":"회장"}'::jsonb
                    WHEN 'corporate' THEN '{"type":"corporate"}'::jsonb
                    ELSE '{}'::jsonb END
         || jsonb_build_object('migrated_from', 'member_roles'),
       COALESCE(mr.granted_at, now())
FROM public.member_roles mr
WHERE mr.context = 'brand:madleague'
  AND mr.is_active
  AND mr.role IN ('approved_member', 'leader', 'mentor', 'corporate')
  AND NOT EXISTS (
      SELECT 1 FROM public.member_capability_roles c
      WHERE c.member_id = mr.member_id AND c.brand_id = 'madleague' AND c.valid_until IS NULL
        AND c.role = CASE mr.role WHEN 'approved_member' THEN '현역' WHEN 'leader' THEN '임원' WHEN 'mentor' THEN '멘토' WHEN 'corporate' THEN 'host' END
  );

-- 3) 이관한 member_roles 행 비활성 (삭제하지 않음 — 이력)
UPDATE public.member_roles
SET is_active = false
WHERE context = 'brand:madleague' AND is_active AND role IN ('approved_member', 'leader', 'mentor', 'corporate');
