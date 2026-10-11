-- ============================================================
-- MADLeague — mad_post_likes (커뮤니티·동아리 방 게시글 좋아요)
-- 작성일: 2026-04-16 · 2026-10-11 운영 DB 적용 (파일만 있고 테이블이 없어 좋아요 API가 전부 실패하던 상태)
--   정책은 mad_current_member_id() 사용 — 다른 테이블 정책에서 mad_members 서브쿼리 금지 (app/(MADLeague)/CLAUDE.md)
--   카운트 트리거는 SECURITY DEFINER — mad_posts UPDATE 정책이 작성자 본인뿐이라 남의 글 좋아요가 롤백되던 문제
-- ============================================================

CREATE TABLE IF NOT EXISTS mad_post_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id TEXT NOT NULL DEFAULT 'tenone',
  post_id UUID NOT NULL REFERENCES mad_posts(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES mad_members(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(post_id, member_id)
);

CREATE INDEX IF NOT EXISTS idx_mad_post_likes_post ON mad_post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_mad_post_likes_member ON mad_post_likes(member_id);

ALTER TABLE mad_post_likes ENABLE ROW LEVEL SECURITY;

-- 읽기 = 그 글을 볼 수 있는 사람 (mad_posts 정책이 범위를 정함)
DROP POLICY IF EXISTS mad_post_likes_read ON mad_post_likes;
CREATE POLICY mad_post_likes_read ON mad_post_likes FOR SELECT
  USING (EXISTS (SELECT 1 FROM mad_posts p WHERE p.id = mad_post_likes.post_id));

-- 본인 좋아요 추가/삭제 (볼 수 있는 글에만)
DROP POLICY IF EXISTS mad_post_likes_insert ON mad_post_likes;
CREATE POLICY mad_post_likes_insert ON mad_post_likes FOR INSERT
  WITH CHECK (member_id = mad_current_member_id() AND EXISTS (SELECT 1 FROM mad_posts p WHERE p.id = mad_post_likes.post_id));

DROP POLICY IF EXISTS mad_post_likes_delete ON mad_post_likes;
CREATE POLICY mad_post_likes_delete ON mad_post_likes FOR DELETE
  USING (member_id = mad_current_member_id());

GRANT SELECT, INSERT, DELETE ON public.mad_post_likes TO authenticated;
GRANT ALL ON public.mad_post_likes TO service_role;

-- mad_posts.likes_count 자동 동기화
CREATE OR REPLACE FUNCTION mad_sync_post_likes_count()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE mad_posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE mad_posts SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_mad_post_likes_sync ON mad_post_likes;
CREATE TRIGGER trg_mad_post_likes_sync
  AFTER INSERT OR DELETE ON mad_post_likes
  FOR EACH ROW EXECUTE FUNCTION mad_sync_post_likes_count();
