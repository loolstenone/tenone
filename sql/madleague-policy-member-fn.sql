-- MADLeague 정책의 mad_members 서브쿼리 → SECURITY DEFINER 함수 — 운영 적용 2026-10-06 (migration madleague_policy_member_fn, 롤백 시뮬레이션: anon MADzine 21건 조회 복구)
-- 원인: madleague_rls_lockdown(2026-10-06)으로 anon의 mad_members 권한을 회수하자,
--       mad_members를 서브쿼리로 읽는 public 정책 때문에 anon 조회 전체가 'permission denied for table mad_members'로 실패
--       (MADzine 목록·상세, 수료증 진위 확인, 커뮤니티 등)
-- 해결: 정책은 함수만 호출 — 함수가 auth.uid() 본인 행만 조회 (hero_current_member_id와 같은 패턴)

CREATE OR REPLACE FUNCTION public.mad_current_member_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$ SELECT id FROM public.mad_members WHERE user_id = auth.uid() LIMIT 1 $$;

REVOKE ALL ON FUNCTION public.mad_current_member_id() FROM public;
GRANT EXECUTE ON FUNCTION public.mad_current_member_id() TO anon, authenticated, service_role;

-- mad_articles
DROP POLICY IF EXISTS mad_articles_read_own_draft ON public.mad_articles;
CREATE POLICY mad_articles_read_own_draft ON public.mad_articles FOR SELECT
    USING (author_id = public.mad_current_member_id());

-- mad_article_comments
DROP POLICY IF EXISTS mad_article_comments_insert ON public.mad_article_comments;
CREATE POLICY mad_article_comments_insert ON public.mad_article_comments FOR INSERT
    WITH CHECK (author_id = public.mad_current_member_id());
DROP POLICY IF EXISTS mad_article_comments_delete ON public.mad_article_comments;
CREATE POLICY mad_article_comments_delete ON public.mad_article_comments FOR DELETE
    USING (author_id = public.mad_current_member_id());

-- mad_article_likes
DROP POLICY IF EXISTS mad_article_likes_insert ON public.mad_article_likes;
CREATE POLICY mad_article_likes_insert ON public.mad_article_likes FOR INSERT
    WITH CHECK (member_id = public.mad_current_member_id());
DROP POLICY IF EXISTS mad_article_likes_delete ON public.mad_article_likes;
CREATE POLICY mad_article_likes_delete ON public.mad_article_likes FOR DELETE
    USING (member_id = public.mad_current_member_id());

-- mad_certificates
DROP POLICY IF EXISTS mad_cert_read_own ON public.mad_certificates;
CREATE POLICY mad_cert_read_own ON public.mad_certificates FOR SELECT
    USING (member_id = public.mad_current_member_id());

-- mad_comments
DROP POLICY IF EXISTS mad_comments_read_members ON public.mad_comments;
CREATE POLICY mad_comments_read_members ON public.mad_comments FOR SELECT
    USING (public.mad_current_member_id() IS NOT NULL);
DROP POLICY IF EXISTS mad_comments_insert_own ON public.mad_comments;
CREATE POLICY mad_comments_insert_own ON public.mad_comments FOR INSERT
    WITH CHECK (author_id = public.mad_current_member_id());
DROP POLICY IF EXISTS mad_comments_delete_own ON public.mad_comments;
CREATE POLICY mad_comments_delete_own ON public.mad_comments FOR DELETE
    USING (author_id = public.mad_current_member_id());

-- mad_posts
DROP POLICY IF EXISTS mad_posts_read_members ON public.mad_posts;
CREATE POLICY mad_posts_read_members ON public.mad_posts FOR SELECT
    USING (public.mad_current_member_id() IS NOT NULL);
DROP POLICY IF EXISTS mad_posts_insert_own ON public.mad_posts;
CREATE POLICY mad_posts_insert_own ON public.mad_posts FOR INSERT
    WITH CHECK (author_id = public.mad_current_member_id());
DROP POLICY IF EXISTS mad_posts_update_own ON public.mad_posts;
CREATE POLICY mad_posts_update_own ON public.mad_posts FOR UPDATE
    USING (author_id = public.mad_current_member_id())
    WITH CHECK (author_id = public.mad_current_member_id());
DROP POLICY IF EXISTS mad_posts_delete_own ON public.mad_posts;
CREATE POLICY mad_posts_delete_own ON public.mad_posts FOR DELETE
    USING (author_id = public.mad_current_member_id());
