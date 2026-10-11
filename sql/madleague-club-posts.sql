-- MADLeague 동아리 홍보 게시물 (2026-10-11 적용)
-- 사용자 결정: 비공개 "동아리 방"(카페) 폐지 — 동아리별 내부 소통은 자기 SNS·카톡이 이미 있어 의미 없음.
-- 동아리 페이지는 대외 홍보의 장: 회장단(운영진)·직원이 공개 글(소식·사진)을 올리고 누구나 본다.
-- 쓰기는 서버 API(/api/madleague/clubs/{slug}/posts, canEditClubProfile)가 service_role로 — 테이블 정책은 공개 읽기만.
-- 옛 카페 글(mad_posts.club_id)은 0건이라 이관 없음. mad_can_access_club·mad_is_club_officer 함수는 mad_posts 정책이 계속 쓰므로 유지.

CREATE TABLE IF NOT EXISTS public.mad_club_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL DEFAULT 'tenone',
  club_id uuid NOT NULL REFERENCES public.mad_clubs(id) ON DELETE CASCADE,
  author_member_id uuid REFERENCES public.members(id) ON DELETE SET NULL,
  title text NOT NULL,
  content text NOT NULL DEFAULT '',
  media jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_published boolean NOT NULL DEFAULT true,
  is_pinned boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_mad_club_posts_club ON public.mad_club_posts(club_id, is_published, created_at DESC);

ALTER TABLE public.mad_club_posts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS mad_club_posts_public_read ON public.mad_club_posts;
CREATE POLICY mad_club_posts_public_read ON public.mad_club_posts FOR SELECT USING (is_published = true);
DROP POLICY IF EXISTS mad_club_posts_staff_all ON public.mad_club_posts;
CREATE POLICY mad_club_posts_staff_all ON public.mad_club_posts FOR ALL TO authenticated USING (auth_is_staff()) WITH CHECK (auth_is_staff());

GRANT SELECT ON public.mad_club_posts TO anon, authenticated;
GRANT ALL ON public.mad_club_posts TO service_role;
