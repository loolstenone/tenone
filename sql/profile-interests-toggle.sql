-- 공개 프로필: 관심 분야(직무·산업)도 본인이 끌 수 있게 (2026-10-16 사용자 지시)
-- 적용: 2026-10-16 apply_migration profile_interests_toggle
-- privacy_settings.interests = false 이면 interests_industry·interests_job을 내보내지 않는다 (끄지 않으면 보임 — 소개·소속과 같은 규칙)
-- 데이터 변경 없음 · 재실행 가능 · 나머지는 sql/profile-p1-core.sql 정의 그대로
CREATE OR REPLACE FUNCTION public.profile_public_payload(p_member_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE m RECORD; ps jsonb; shown jsonb; show_interests boolean;
BEGIN
    SELECT id, name, email, company, bio, avatar_url, interests_industry, interests_job,
           profile_visibility, profile_searchable, created_at, handle, privacy_settings, social_links
    INTO m FROM members WHERE id = p_member_id;
    IF NOT FOUND THEN RETURN NULL; END IF;
    ps := COALESCE(m.privacy_settings::jsonb, '{}'::jsonb);
    SELECT COALESCE(jsonb_object_agg(key, true), '{}'::jsonb) INTO shown
    FROM jsonb_each(ps) WHERE value = 'true'::jsonb AND key <> 'phone';
    show_interests := COALESCE(ps->>'interests', 'true') <> 'false';
    RETURN jsonb_build_object(
        'id', m.id, 'name', m.name, 'handle', m.handle,
        'email', CASE WHEN ps->>'email' = 'true' THEN m.email END,
        'company', CASE WHEN COALESCE(ps->>'company', 'true') <> 'false' THEN m.company END,
        'bio', CASE WHEN COALESCE(ps->>'bio', 'true') <> 'false' THEN m.bio END,
        'avatar_url', m.avatar_url,
        'interests_industry', CASE WHEN show_interests THEN m.interests_industry END,
        'interests_job', CASE WHEN show_interests THEN m.interests_job END,
        'profile_visibility', m.profile_visibility,
        'searchable', m.profile_visibility = 'public' AND m.profile_searchable,
        'created_at', m.created_at, 'privacy_settings', shown,
        'social_links', CASE WHEN COALESCE(ps->>'socialLinks', 'true') <> 'false' THEN m.social_links END);
END;
$function$;
REVOKE ALL ON FUNCTION public.profile_public_payload(uuid) FROM public, anon, authenticated;
