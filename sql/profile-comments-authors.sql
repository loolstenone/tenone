-- 방명록 작성자 표시 (2026-10-16 적용)
-- 문제: 방명록이 작성자를 members에서 직접 조인 → members RLS(본인·직원만)에 막혀
--       다른 사람이 보면 작성자가 비고 "탈퇴한 사용자"로 나왔다.
-- 해결: 보이는 방명록 글의 작성자 이름·사진만 돌려주는 함수. 연락처는 돌려주지 않는다.
--       핸들(공개 주소)은 작성자 프로필이 공개일 때만.

CREATE OR REPLACE FUNCTION public.profile_comment_authors(p_target uuid)
RETURNS TABLE (comment_id uuid, author_id uuid, name text, handle text, avatar_url text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
    WITH viewer AS (SELECT id FROM members WHERE auth_id = auth.uid())
    SELECT c.id, m.id, m.name,
           CASE WHEN member_profile_is_public(m.id) THEN m.handle END,
           m.avatar_url
    FROM profile_comments c
    JOIN members m ON m.id = c.author_member_id
    WHERE c.target_member_id = p_target
      AND (
          -- profile_comments RLS(public_read·hidden_read)와 같은 조건
          (c.is_hidden = false AND member_profile_is_public(c.target_member_id))
          OR c.target_member_id IN (SELECT id FROM viewer)
          OR c.author_member_id IN (SELECT id FROM viewer)
      );
$$;

REVOKE ALL ON FUNCTION public.profile_comment_authors(uuid) FROM public;
GRANT EXECUTE ON FUNCTION public.profile_comment_authors(uuid) TO anon, authenticated, service_role;
