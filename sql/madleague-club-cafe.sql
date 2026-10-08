-- madleague-club-cafe.sql
-- 적용: 2026-10-08 (세션 165) — MCP apply_migration `madleague_club_cafe`
--
-- 동아리 방 = 작은 네이버 카페 (사용자 요청 2026-10-08) — 매드리거 커뮤니티(mad_posts·mad_comments·mad_post_likes)를 동아리 범위로 재사용
--   club_id IS NULL     → 매드리거 전체 커뮤니티 (기존 그대로: 매드리거 누구나)
--   club_id IS NOT NULL → 그 동아리 방 글: 관리자(직원) · 그 동아리 현역·운영진·OB · 담당 멘토만
-- 공지(category notice)는 동아리 운영진·관리자만 작성. 고정·삭제(관리)는 서버 API(운영진·관리자 확인 후 service_role)
-- 댓글은 "보이는 글"에만 (정책 안의 mad_posts 조회에 RLS가 그대로 적용됨)
-- 기존 글 0건 (2026-10-08) — 영향 없음
-- 롤백: 하단 주석

CREATE OR REPLACE FUNCTION public.mad_can_access_club(p_club uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT public.auth_is_staff() OR EXISTS (
    SELECT 1 FROM member_capability_roles r
    JOIN members m ON m.id = r.member_id
    WHERE m.auth_id = auth.uid()
      AND r.brand_id = 'madleague' AND r.capability_key = 'club'
      AND r.context->>'club_id' = p_club::text
      AND (r.valid_until IS NULL OR r.valid_until > now())
  );
$$;

CREATE OR REPLACE FUNCTION public.mad_is_club_officer(p_club uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT public.auth_is_staff() OR EXISTS (
    SELECT 1 FROM member_capability_roles r
    JOIN members m ON m.id = r.member_id
    WHERE m.auth_id = auth.uid()
      AND r.brand_id = 'madleague' AND r.capability_key = 'club' AND r.role = '임원'
      AND r.context->>'club_id' = p_club::text
      AND (r.valid_until IS NULL OR r.valid_until > now())
  );
$$;

REVOKE ALL ON FUNCTION public.mad_can_access_club(uuid), public.mad_is_club_officer(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.mad_can_access_club(uuid), public.mad_is_club_officer(uuid) TO authenticated, service_role;

-- 글 읽기: 전체 커뮤니티 글 = 매드리거 / 동아리 글 = 그 동아리 입장 자격 / 관리자 = 전체
DROP POLICY IF EXISTS mad_posts_read_members ON public.mad_posts;
CREATE POLICY mad_posts_read_members ON public.mad_posts
  FOR SELECT TO authenticated
  USING (
    (club_id IS NULL AND (public.mad_current_member_id() IS NOT NULL OR public.auth_is_staff()))
    OR (club_id IS NOT NULL AND public.mad_can_access_club(club_id))
  );

-- 글 쓰기: 본인 이름으로 · 동아리 글은 입장 자격 · 동아리 공지는 운영진만
DROP POLICY IF EXISTS mad_posts_insert_own ON public.mad_posts;
CREATE POLICY mad_posts_insert_own ON public.mad_posts
  FOR INSERT TO authenticated
  WITH CHECK (
    author_id = public.mad_current_member_id()
    AND (
      club_id IS NULL
      OR (public.mad_can_access_club(club_id) AND (category <> 'notice' OR public.mad_is_club_officer(club_id)))
    )
  );

-- 댓글: 보이는 글에만 읽기·쓰기
DROP POLICY IF EXISTS mad_comments_read_members ON public.mad_comments;
CREATE POLICY mad_comments_read_members ON public.mad_comments
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.mad_posts p WHERE p.id = mad_comments.post_id));

DROP POLICY IF EXISTS mad_comments_insert_own ON public.mad_comments;
CREATE POLICY mad_comments_insert_own ON public.mad_comments
  FOR INSERT TO authenticated
  WITH CHECK (
    author_id = public.mad_current_member_id()
    AND EXISTS (SELECT 1 FROM public.mad_posts p WHERE p.id = mad_comments.post_id)
  );

-- ── 롤백 ──
-- CREATE POLICY mad_posts_read_members ON mad_posts FOR SELECT USING (mad_current_member_id() IS NOT NULL);
-- CREATE POLICY mad_posts_insert_own ON mad_posts FOR INSERT WITH CHECK (author_id = mad_current_member_id());
-- CREATE POLICY mad_comments_read_members ON mad_comments FOR SELECT USING (mad_current_member_id() IS NOT NULL);
-- CREATE POLICY mad_comments_insert_own ON mad_comments FOR INSERT WITH CHECK (author_id = mad_current_member_id());
-- DROP FUNCTION mad_can_access_club(uuid); DROP FUNCTION mad_is_club_officer(uuid);
