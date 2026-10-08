-- security-get-public-profile.sql
-- 적용: 2026-10-08 (세션 165) — MCP apply_migration `security_get_public_profile`
--
-- 문제 (점검 A6-4): get_public_profile(handle)이 SECURITY DEFINER + anon EXECUTE로
--   members.email·affiliations·role·privacy_settings를 row_to_json 그대로 반환 → handle만 알면 비로그인으로 이메일 조회.
-- 수정: 공개 필드만 반환. 본인이 공개 설정한 항목만 값을 채운다 (서버에서 강제).
--   - email   : privacy_settings.email = true 일 때만 (기본 비공개)
--   - company : privacy_settings.company <> false 일 때만 (기본 공개)
--   - bio     : privacy_settings.bio <> false 일 때만 (기본 공개)
--   - social_links : privacy_settings.socialLinks <> false 일 때만
--   - affiliations·role 제거 (이용 브랜드 목록 = 동의 없는 교차 노출, role = 내부 정보)
--   - privacy_settings는 화면 표시 판단용으로 유지 (값 자체는 민감정보 아님)
-- 본인 판단은 앱에서 members.auth_id = auth.uid() 로 한다 (이메일 비교 제거).

CREATE OR REPLACE FUNCTION public.get_public_profile(p_handle text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
    m RECORD;
    ps jsonb;
BEGIN
    SELECT id, name, email, company, bio, avatar_url,
           interests_industry, interests_job,
           profile_visibility, created_at, handle,
           privacy_settings, social_links
    INTO m
    FROM members
    WHERE handle = p_handle
    LIMIT 1;

    IF NOT FOUND THEN
        RETURN NULL;
    END IF;

    IF m.profile_visibility = 'private' THEN
        RETURN json_build_object('handle', m.handle, 'profile_visibility', 'private');
    END IF;

    ps := COALESCE(m.privacy_settings::jsonb, '{}'::jsonb);

    RETURN json_build_object(
        'id', m.id,
        'name', m.name,
        'handle', m.handle,
        'email', CASE WHEN ps->>'email' = 'true' THEN m.email END,
        'company', CASE WHEN COALESCE(ps->>'company', 'true') <> 'false' THEN m.company END,
        'bio', CASE WHEN COALESCE(ps->>'bio', 'true') <> 'false' THEN m.bio END,
        'avatar_url', m.avatar_url,
        'interests_industry', m.interests_industry,
        'interests_job', m.interests_job,
        'profile_visibility', m.profile_visibility,
        'created_at', m.created_at,
        'privacy_settings', m.privacy_settings,
        'social_links', CASE WHEN COALESCE(ps->>'socialLinks', 'true') <> 'false' THEN m.social_links END
    );
END;
$function$;

-- 공개 프로필은 의도된 공개 RPC — 실행 권한은 유지
REVOKE ALL ON FUNCTION public.get_public_profile(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_profile(text) TO anon, authenticated, service_role;
