-- ============================================================
-- 통합 게시판 권한·쓰기 경로 정리 (콘텐츠 관리 점검 2단계)
-- 적용: 2026-10-05 (MCP apply_migration: security_board_lockdown)
--
-- 발견 (2026-10-05):
--   ums_posts   로그인 회원 누구나 아무 글 UPDATE/DELETE (auth.uid() IS NOT NULL), INSERT WITH CHECK true
--   ums_boards  로그인 회원 누구나 게시판 생성·수정·삭제 (auth_manage_boards)
--   ums_comments 로그인 회원 INSERT 무검증
--   comments(구) INSERT true, 게스트 댓글 누구나 UPDATE — 신규 코드는 ums_comments 사용
--   likes·bookmarks·comments 집계 트리거, increment_post_view 가 posts "뷰"를 UPDATE → 항상 실패
--     (좋아요·북마크·조회수가 한 번도 저장된 적 없음 — 전부 0건)
--   모든 게시판 write_permission='member' — 공지·뉴스룸·Works도 회원 누구나 작성 가능
--
-- 원칙: 쓰기는 서버 API(/api/board/*)만 — 로그인 세션 + 게시판 권한 확인 후 서비스 롤로 기록.
--       브라우저 직접 접근 = 발행글 읽기(기존과 동일) + 본인 글 + 직원 전체.
--       좋아요·북마크 user_id = members.id (데이터 계약 1조)
-- ============================================================

-- 1) ums_posts
DROP POLICY IF EXISTS auth_delete_posts ON public.ums_posts;
DROP POLICY IF EXISTS auth_insert_posts ON public.ums_posts;
DROP POLICY IF EXISTS auth_update_posts ON public.ums_posts;
DROP POLICY IF EXISTS auth_read_posts ON public.ums_posts;
DROP POLICY IF EXISTS ums_posts_member_read ON public.ums_posts;
CREATE POLICY ums_posts_member_read ON public.ums_posts FOR SELECT TO authenticated
    USING (status = 'published' OR author_id = auth_member_id());
DROP POLICY IF EXISTS p1_staff_all ON public.ums_posts;
CREATE POLICY p1_staff_all ON public.ums_posts FOR ALL TO authenticated
    USING (auth_is_staff()) WITH CHECK (auth_is_staff());
-- public_read_posts (anon, status=published) 유지
REVOKE INSERT, UPDATE, DELETE ON public.ums_posts FROM anon;

-- 2) ums_comments
DROP POLICY IF EXISTS auth_insert_comments ON public.ums_comments;
DROP POLICY IF EXISTS auth_read_comments ON public.ums_comments;
DROP POLICY IF EXISTS ums_comments_member_read ON public.ums_comments;
CREATE POLICY ums_comments_member_read ON public.ums_comments FOR SELECT TO authenticated
    USING (status = 'published' OR author_id = auth_member_id());
DROP POLICY IF EXISTS p1_staff_all ON public.ums_comments;
CREATE POLICY p1_staff_all ON public.ums_comments FOR ALL TO authenticated
    USING (auth_is_staff()) WITH CHECK (auth_is_staff());
REVOKE INSERT, UPDATE, DELETE ON public.ums_comments FROM anon;

-- 3) ums_boards — 관리는 직원만 (읽기 정책 유지)
DROP POLICY IF EXISTS auth_manage_boards ON public.ums_boards;
DROP POLICY IF EXISTS p1_staff_all ON public.ums_boards;
CREATE POLICY p1_staff_all ON public.ums_boards FOR ALL TO authenticated
    USING (auth_is_staff()) WITH CHECK (auth_is_staff());
REVOKE INSERT, UPDATE, DELETE ON public.ums_boards FROM anon;

-- 4) 구 comments·attachments — 미사용(0건). 직원 외 접근 차단
DROP POLICY IF EXISTS comments_delete ON public.comments;
DROP POLICY IF EXISTS comments_insert ON public.comments;
DROP POLICY IF EXISTS comments_read ON public.comments;
DROP POLICY IF EXISTS comments_update ON public.comments;
DROP POLICY IF EXISTS attachments_insert ON public.attachments;
DROP POLICY IF EXISTS p1_staff_all ON public.comments;
CREATE POLICY p1_staff_all ON public.comments FOR ALL TO authenticated
    USING (auth_is_staff()) WITH CHECK (auth_is_staff());
DROP POLICY IF EXISTS p1_staff_all ON public.attachments;
CREATE POLICY p1_staff_all ON public.attachments FOR ALL TO authenticated
    USING (auth_is_staff()) WITH CHECK (auth_is_staff());
DROP TRIGGER IF EXISTS trigger_sync_comment_count ON public.comments;
REVOKE ALL ON public.comments FROM anon;
REVOKE INSERT, UPDATE, DELETE ON public.attachments FROM anon;

-- 5) likes·bookmarks — 본인 것만 읽기, 쓰기는 서버. 누가 무엇을 눌렀는지 공개하지 않음
DROP POLICY IF EXISTS likes_delete ON public.likes;
DROP POLICY IF EXISTS likes_insert ON public.likes;
DROP POLICY IF EXISTS likes_read ON public.likes;
DROP POLICY IF EXISTS bookmarks_delete ON public.bookmarks;
DROP POLICY IF EXISTS bookmarks_insert ON public.bookmarks;
DROP POLICY IF EXISTS bookmarks_read ON public.bookmarks;
DROP POLICY IF EXISTS likes_own_read ON public.likes;
CREATE POLICY likes_own_read ON public.likes FOR SELECT TO authenticated USING (user_id = auth_member_id());
DROP POLICY IF EXISTS bookmarks_own_read ON public.bookmarks;
CREATE POLICY bookmarks_own_read ON public.bookmarks FOR SELECT TO authenticated USING (user_id = auth_member_id());
DROP TRIGGER IF EXISTS trigger_sync_like_count ON public.likes;
DROP TRIGGER IF EXISTS trigger_sync_bookmark_count ON public.bookmarks;
REVOKE ALL ON public.likes, public.bookmarks FROM anon;
CREATE UNIQUE INDEX IF NOT EXISTS likes_user_target_uniq ON public.likes (user_id, target_type, target_id);
CREATE UNIQUE INDEX IF NOT EXISTS bookmarks_user_post_uniq ON public.bookmarks (user_id, post_id);

-- 6) 조회수 — 실제 테이블에 기록
CREATE OR REPLACE FUNCTION public.increment_post_view(p_id uuid)
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public
AS $$
    UPDATE public.ums_posts SET view_count = coalesce(view_count, 0) + 1
    WHERE id = p_id AND status = 'published';
$$;

-- 7) 댓글 수 — ums_comments 기준
CREATE OR REPLACE FUNCTION public.sync_ums_comment_count()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE pid uuid := coalesce(NEW.post_id, OLD.post_id);
BEGIN
    UPDATE public.ums_posts
       SET comment_count = (SELECT count(*) FROM public.ums_comments WHERE post_id = pid AND status = 'published')
     WHERE id = pid;
    RETURN NULL;
END $$;
DROP TRIGGER IF EXISTS trigger_sync_ums_comment_count ON public.ums_comments;
CREATE TRIGGER trigger_sync_ums_comment_count AFTER INSERT OR UPDATE OF status OR DELETE ON public.ums_comments
    FOR EACH ROW EXECUTE FUNCTION public.sync_ums_comment_count();

-- 8) 운영 게시판(공지·뉴스·작품·FAQ·채용 등)은 직원만 작성. 커뮤니티형(자유·Q&A·후기 등)은 회원
UPDATE public.ums_boards SET write_permission = 'staff'
 WHERE slug IN ('notice','newsroom','news','works','faq','madzine','gallery','video','event',
                'competition','cases','blog','articles','portfolio')
   AND NOT (slug = 'works' AND site_id = (SELECT id FROM public.ums_sites WHERE slug = 'rook'));
UPDATE public.ums_boards SET write_permission = 'staff'
 WHERE slug = 'recruit' AND site_id = (SELECT id FROM public.ums_sites WHERE slug = 'tenone');
