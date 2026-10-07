-- MADLeague mad_members 복사 컬럼 삭제 — 2단계 (사용자 승인 2026-10-06, 세션 160)
-- A (1~3) 즉시 적용 가능 / B (4~5)는 member/link API 삭제 코드 배포 후에만
--   (배포 전 실행 시 운영 중인 옛 /api/madleague/member/link 가 mad_members.email 을 읽다 실패)
-- 계정 미연결 옛 행: 2026-10-06 기준 테스트 행 1건뿐 (2026-04-15 생성) → 삭제
-- 적용: A = 2026-10-07 `madleague_members_drop_prep` / B = 2026-10-07 `madleague_members_drop_copied_columns`
--   (B 사전 점검: 함수·뷰·정책 의존성 0, 코드 참조 0, 롤백 시뮬레이션 통과)

-- ===== A =====
-- 1) 계정 미연결 테스트 행 정리 (member_id·user_id 모두 없음 = 이름이 사라지면 식별 불가)
DELETE FROM public.mad_members WHERE member_id IS NULL AND user_id IS NULL;

-- 2) 이메일 매칭 연결 함수 폐기 (계정 기준 연결로 대체, 호출 코드 삭제됨)
DROP FUNCTION IF EXISTS public.mad_link_member_to_user(uuid, text);

-- 3) 수료증 대상 함수: 이름은 공통 프로필(members)에서. 서버(service_role) 전용으로 실행 권한 제한
--    (기존: anon 실행 가능 → 임의 member id로 이름·대학 조회 가능했음)
CREATE OR REPLACE FUNCTION public.mad_eligible_certificates(p_member_id uuid)
 RETURNS TABLE(cert_type text, cert_title text, cert_details jsonb, already_issued boolean)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
DECLARE
  v_member RECORD;
BEGIN
  SELECT m.id, m.club_id, m.university, m.activity_years,
         p.name AS member_name, c.name AS club_name, c.slug AS club_slug
    INTO v_member
    FROM mad_members m
    LEFT JOIN members p ON p.id = m.member_id
    LEFT JOIN mad_clubs c ON c.id = m.club_id
   WHERE m.id = p_member_id;

  IF v_member IS NULL THEN RETURN; END IF;

  -- 1. 활동인증서 (activity_years 각각)
  FOR cert_type, cert_title, cert_details IN
    SELECT
      'activity'::TEXT,
      ('활동인증서 · ' || y::TEXT)::TEXT,
      jsonb_build_object(
        'member_name', v_member.member_name,
        'club_name', v_member.club_name,
        'year', y,
        'university', v_member.university
      )
    FROM unnest(v_member.activity_years) AS y
  LOOP
    already_issued := EXISTS (
      SELECT 1 FROM mad_certificates
      WHERE member_id = p_member_id AND type = 'activity'
        AND (details->>'year')::INT = (cert_details->>'year')::INT
    );
    RETURN NEXT;
  END LOOP;

  -- 2. 경쟁PT 참여 확인서 (member_ids는 Phase 2의 mad_competition_teams에서 — 현재는 생략)

  -- 3. 수상 확인서 (member가 속한 club이 상을 받은 경우)
  FOR cert_type, cert_title, cert_details IN
    SELECT
      CASE WHEN r.is_crown THEN 'crown' ELSE 'award' END::TEXT,
      ((comp.year::TEXT || ' ' || COALESCE(comp.client_name, comp.title) || ' ') ||
       CASE WHEN r.is_crown THEN 'MAD Crown' ELSE COALESCE(r.award_name, ((r.rank::TEXT) || '위')) END)::TEXT,
      jsonb_build_object(
        'member_name', v_member.member_name,
        'club_name', v_member.club_name,
        'year', comp.year,
        'client', comp.client_name,
        'team_name', r.team_name,
        'rank', r.rank,
        'award_name', r.award_name,
        'is_crown', r.is_crown
      )
    FROM mad_competition_results r
    JOIN mad_competitions comp ON comp.id = r.competition_id
    WHERE r.club_id = v_member.club_id
      AND comp.year = ANY(v_member.activity_years)
  LOOP
    already_issued := EXISTS (
      SELECT 1 FROM mad_certificates
      WHERE member_id = p_member_id
        AND type = cert_type
        AND (details->>'team_name') = (cert_details->>'team_name')
        AND (details->>'year')::INT = (cert_details->>'year')::INT
    );
    RETURN NEXT;
  END LOOP;
END;
$function$;

REVOKE EXECUTE ON FUNCTION public.mad_eligible_certificates(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.mad_eligible_certificates(uuid) TO service_role;

-- ===== B (코드 배포 후) =====
-- 4) 컬럼 권한 정리 (phone·avatar_url은 더 이상 본인 수정 대상 아님)
REVOKE UPDATE (phone, avatar_url) ON public.mad_members FROM authenticated;

-- 5) 복사 컬럼 삭제
ALTER TABLE public.mad_members
    DROP COLUMN IF EXISTS name,
    DROP COLUMN IF EXISTS email,
    DROP COLUMN IF EXISTS phone,
    DROP COLUMN IF EXISTS avatar_url;
