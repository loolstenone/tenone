-- 게시판 분류: 관리자 작성 / 회원 작성 + 공개 범위 실제 적용
-- 적용일: 2026-10-05 (Supabase MCP apply_migration: board_classification)
-- 재실행 가능

-- 1) 게시판 분류 정리
-- tenone/free = 인트라 사내 자유게시판(/intra/comm/free) → 직원 작성·직원 공개
UPDATE ums_boards b SET write_permission = 'staff', visibility = 'staff'
FROM ums_sites s WHERE s.id = b.site_id AND s.slug = 'tenone' AND b.slug = 'free';

-- badak/jobs = 채용정보 → 직업정보제공사업 신고 전까지 운영진만 작성 (직업안정법)
UPDATE ums_boards b SET write_permission = 'staff'
FROM ums_sites s WHERE s.id = b.site_id AND s.slug = 'badak' AND b.slug = 'jobs';

-- madleague/notice = 공개 공지
UPDATE ums_boards b SET visibility = 'public'
FROM ums_sites s WHERE s.id = b.site_id AND s.slug = 'madleague' AND b.slug = 'notice';

-- 2) 공개 게시판 판정 함수 (RLS 재귀 방지용 SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.ums_board_is_public(p_board_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM ums_boards WHERE id = p_board_id AND visibility = 'public');
$$;
REVOKE ALL ON FUNCTION public.ums_board_is_public(uuid) FROM public;
GRANT EXECUTE ON FUNCTION public.ums_board_is_public(uuid) TO anon, authenticated, service_role;

CREATE OR REPLACE FUNCTION public.ums_post_is_public(p_post_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM ums_posts p JOIN ums_boards b ON b.id = p.board_id
    WHERE p.id = p_post_id AND p.status = 'published' AND b.visibility = 'public'
  );
$$;
REVOKE ALL ON FUNCTION public.ums_post_is_public(uuid) FROM public;
GRANT EXECUTE ON FUNCTION public.ums_post_is_public(uuid) TO anon, authenticated, service_role;

-- 3) 읽기 정책: 공개 게시판의 발행글만 (직원은 p1_staff_all)
DROP POLICY IF EXISTS public_read_posts ON ums_posts;
CREATE POLICY public_read_posts ON ums_posts FOR SELECT TO anon
  USING (status = 'published' AND ums_board_is_public(board_id));

DROP POLICY IF EXISTS ums_posts_member_read ON ums_posts;
CREATE POLICY ums_posts_member_read ON ums_posts FOR SELECT TO authenticated
  USING ((status = 'published' AND ums_board_is_public(board_id)) OR author_id = auth_member_id());

DROP POLICY IF EXISTS public_read_comments ON ums_comments;
CREATE POLICY public_read_comments ON ums_comments FOR SELECT TO anon
  USING (status::text = 'published' AND ums_post_is_public(post_id));

DROP POLICY IF EXISTS ums_comments_member_read ON ums_comments;
CREATE POLICY ums_comments_member_read ON ums_comments FOR SELECT TO authenticated
  USING ((status::text = 'published' AND ums_post_is_public(post_id)) OR author_id = auth_member_id());
