-- ============================================================
-- 브랜드별 쓰기 권한 정리 (콘텐츠 관리 점검 4단계)
-- 적용: 2026-10-05 (MCP apply_migration: security_brand_writes)
--
-- 발견 (2026-10-05): "service role용" 이라며 roles=public + USING(true) ALL 정책 → 실제로는 비로그인에게 전부 열림
--   (CLAUDE.md 부록 A 금지 패턴 — service_role은 RLS를 우회하므로 이 정책은 필요 없다)
--   badak_community_posts·comments·likes  *_service ALL true → 누구나 글 수정·삭제
--   badak_leader_applications            badak_leader_apps_service ALL true → 바닥장 신청서(개인정보) 공개
--   hero_matching_requests               hero_matching_requests_service ALL true → 매칭 요청 공개
--   badak_meeting_requests               SELECT/UPDATE/INSERT true → 회원 간 만남 요청 공개·조작
--   resumes·career_profiles              로그인 회원 누구나 전체 조회·수정·삭제 (auth.uid() IS NOT NULL / true)
-- 원칙: 쓰기는 각 브랜드 API(서비스 롤)에서 세션 확인 후. 직접 접근 = 공개 콘텐츠 읽기 + 본인 + 직원
-- ============================================================

-- 1) Badak 커뮤니티 — 숨김 아닌 글·댓글만 공개 읽기, 쓰기는 /api/badak/community/*
DROP POLICY IF EXISTS community_posts_service ON public.badak_community_posts;
DROP POLICY IF EXISTS community_posts_insert ON public.badak_community_posts;
DROP POLICY IF EXISTS community_posts_update ON public.badak_community_posts;
DROP POLICY IF EXISTS community_posts_read ON public.badak_community_posts;
CREATE POLICY community_posts_read ON public.badak_community_posts FOR SELECT
    USING (coalesce(is_hidden, false) = false);
DROP POLICY IF EXISTS community_comments_service ON public.badak_community_comments;
DROP POLICY IF EXISTS community_comments_insert ON public.badak_community_comments;
DROP POLICY IF EXISTS community_likes_service ON public.badak_community_likes;
DROP POLICY IF EXISTS community_likes_insert ON public.badak_community_likes;
DROP POLICY IF EXISTS community_likes_delete ON public.badak_community_likes;
DROP POLICY IF EXISTS community_likes_read ON public.badak_community_likes;
CREATE POLICY community_likes_read ON public.badak_community_likes FOR SELECT TO authenticated
    USING (user_id = auth.uid());

-- 2) 신청·요청 테이블 — 본인 + 직원
DROP POLICY IF EXISTS badak_leader_apps_service ON public.badak_leader_applications;
DROP POLICY IF EXISTS hero_matching_requests_service ON public.hero_matching_requests;
DROP POLICY IF EXISTS hero_matching_requests_own_read ON public.hero_matching_requests;
CREATE POLICY hero_matching_requests_own_read ON public.hero_matching_requests FOR SELECT TO authenticated
    USING (member_id = auth_member_id());
DROP POLICY IF EXISTS meeting_requests_insert ON public.badak_meeting_requests;
DROP POLICY IF EXISTS meeting_requests_select ON public.badak_meeting_requests;
DROP POLICY IF EXISTS meeting_requests_update ON public.badak_meeting_requests;

-- 3) HeRo 이력서·커리어 프로필 — 본인 + 직원 ("본인 CRUD"·"관리자 조회" 정책 유지)
DROP POLICY IF EXISTS auth_manage_resumes ON public.resumes;
DROP POLICY IF EXISTS auth_read_resumes ON public.resumes;
DROP POLICY IF EXISTS auth_manage_career ON public.career_profiles;
DROP POLICY IF EXISTS auth_read_career ON public.career_profiles;
DROP POLICY IF EXISTS career_profiles_own ON public.career_profiles;
CREATE POLICY career_profiles_own ON public.career_profiles FOR ALL TO authenticated
    USING (member_id = auth_member_id()) WITH CHECK (member_id = auth_member_id());

-- 4) 직원 전체 + 비로그인 쓰기 회수
DO $$
DECLARE t text;
BEGIN
    FOREACH t IN ARRAY ARRAY['badak_community_posts','badak_community_comments','badak_community_likes',
                             'badak_leader_applications','hero_matching_requests','badak_meeting_requests',
                             'resumes','career_profiles'] LOOP
        EXECUTE format('DROP POLICY IF EXISTS p1_staff_all ON public.%I', t);
        EXECUTE format('CREATE POLICY p1_staff_all ON public.%I FOR ALL TO authenticated USING (auth_is_staff()) WITH CHECK (auth_is_staff())', t);
        EXECUTE format('REVOKE INSERT, UPDATE, DELETE ON public.%I FROM anon', t);
    END LOOP;
END $$;
REVOKE ALL ON public.badak_leader_applications, public.hero_matching_requests, public.badak_meeting_requests,
    public.resumes, public.career_profiles, public.badak_community_likes FROM anon;
