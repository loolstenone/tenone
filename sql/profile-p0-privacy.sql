-- ============================================================
-- 프로필 체계 P0 — 공개 프로필 개인정보 정리 (2026-10-16, 세션 178)
-- 적용: 2026-10-16 apply_migration profile_p0_privacy (사용자 승인)
--
-- 1. 공개 프로필 기본값 = 비공개 (본인이 켜야 공개 — 개인정보보호법 제15·17조)
--    기존 회원도 전원 비공개로 시작 (사용자 결정 2026-10-16)
-- 2. get_public_profile: privacy_settings 원본을 내보내지 않는다.
--    본인이 켠(true) 공개 항목 키만 돌려준다. 다른 브랜드 섹션은 켠 것만 (계약 4·제18조)
-- 3. 핸들 예약어 = 유니버스 공통 한 곳 (universe_reserved_handles) + members 트리거
-- 4. 방명록: 비공개 프로필의 방명록은 읽기·쓰기 불가 (본인·작성자 제외)
-- 재실행 가능
-- ============================================================

-- 1. 기본 비공개 -------------------------------------------------
ALTER TABLE public.members ALTER COLUMN profile_visibility SET DEFAULT 'private';
UPDATE public.members SET profile_visibility = 'private' WHERE profile_visibility IS DISTINCT FROM 'private';

-- 1-1. 다른 브랜드 섹션 공개는 본인이 켤 때만 (계약 4 — 브랜드 간 노출 별도 동의)
--      기존 기본값이 hero·badak·madleague·madleap·youinone = true 였다 (본인 선택 아님) → false
--      hero_badge_public 등 본인이 직접 켠 다른 키는 건드리지 않는다
ALTER TABLE public.members ALTER COLUMN privacy_settings
    SET DEFAULT '{"email": false, "phone": false, "company": true, "bio": true}'::jsonb;
UPDATE public.members
SET privacy_settings = privacy_settings
    || '{"hero": false, "badak": false, "madleague": false, "madleap": false, "youinone": false}'::jsonb
WHERE privacy_settings ?| array['hero','badak','madleague','madleap','youinone'];

-- 2. 공개 프로필 함수 ---------------------------------------------
CREATE OR REPLACE FUNCTION public.get_public_profile(p_handle text)
 RETURNS json
 LANGUAGE plpgsql
 STABLE
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    m RECORD;
    ps jsonb;
    shown jsonb;
BEGIN
    SELECT id, name, email, company, bio, avatar_url,
           interests_industry, interests_job,
           profile_visibility, created_at, handle,
           privacy_settings, social_links
    INTO m
    FROM members
    WHERE handle = lower(p_handle)
    LIMIT 1;

    IF NOT FOUND THEN
        RETURN NULL;
    END IF;

    IF m.profile_visibility IS DISTINCT FROM 'public' THEN
        RETURN json_build_object('handle', m.handle, 'profile_visibility', 'private');
    END IF;

    ps := COALESCE(m.privacy_settings::jsonb, '{}'::jsonb);

    -- 본인이 true로 켠 항목만 (연락처는 공개 대상 아님)
    SELECT COALESCE(jsonb_object_agg(key, true), '{}'::jsonb) INTO shown
    FROM jsonb_each(ps)
    WHERE value = 'true'::jsonb AND key <> 'phone';

    RETURN json_build_object(
        'id', m.id,                      -- 방명록 대상 키 (profile_comments.target_member_id)
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
        'privacy_settings', shown,
        'social_links', CASE WHEN COALESCE(ps->>'socialLinks', 'true') <> 'false' THEN m.social_links END
    );
END;
$function$;

REVOKE ALL ON FUNCTION public.get_public_profile(text) FROM public;
GRANT EXECUTE ON FUNCTION public.get_public_profile(text) TO anon, authenticated, service_role;

-- 3. 핸들 예약어 --------------------------------------------------
CREATE TABLE IF NOT EXISTS public.universe_reserved_handles (
    handle     text PRIMARY KEY,
    reason     text,
    brand_id   text,                     -- 브랜드 이름 예약이면 해당 slug
    tenant_id  text NOT NULL DEFAULT 'tenone',
    created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.universe_reserved_handles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS reserved_handles_read ON public.universe_reserved_handles;
CREATE POLICY reserved_handles_read ON public.universe_reserved_handles
    FOR SELECT TO anon, authenticated USING (true);   -- 핸들 사용 가능 여부 확인용 (비밀 아님)
DROP POLICY IF EXISTS reserved_handles_staff_write ON public.universe_reserved_handles;
CREATE POLICY reserved_handles_staff_write ON public.universe_reserved_handles
    FOR ALL TO authenticated USING (auth_is_staff()) WITH CHECK (auth_is_staff());

-- MyVerse 예약어 + 브랜드 slug + 유니버스 경로
INSERT INTO public.universe_reserved_handles(handle, reason)
SELECT handle, COALESCE(reason, 'myverse') FROM public.myverse_reserved_handles
ON CONFLICT (handle) DO NOTHING;

INSERT INTO public.universe_reserved_handles(handle, reason, brand_id)
SELECT slug, 'brand', slug FROM public.ums_sites WHERE slug ~ '^[a-z0-9_]{3,20}$'
ON CONFLICT (handle) DO NOTHING;

INSERT INTO public.universe_reserved_handles(handle, reason) VALUES
    ('profile','route'),('oauth','route'),('onboarding','route'),('invite','route'),
    ('unsubscribe','route'),('apply','route'),('about','route'),('brands','route'),
    ('history','route'),('universe','route'),('sitemap','route'),('robots','route'),
    ('favicon','route'),('icon','route'),('my','route'),('staff','official'),
    ('official','official'),('operator','official'),('master','official'),
    ('root','system'),('null','system'),('undefined','system'),('anonymous','system'),
    ('ten_one','official'),('tenone_official','official'),('notice','official'),('news','route')
ON CONFLICT (handle) DO NOTHING;

GRANT SELECT ON public.universe_reserved_handles TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.universe_reserved_handles TO authenticated;
GRANT ALL ON public.universe_reserved_handles TO service_role;

CREATE OR REPLACE FUNCTION public.guard_member_handle()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    IF NEW.handle IS NOT NULL
       AND (TG_OP = 'INSERT' OR NEW.handle IS DISTINCT FROM OLD.handle)
       AND EXISTS (SELECT 1 FROM universe_reserved_handles r WHERE r.handle = lower(NEW.handle)) THEN
        RAISE EXCEPTION '사용할 수 없는 핸들입니다: %', NEW.handle USING ERRCODE = 'check_violation';
    END IF;
    RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS trg_guard_member_handle ON public.members;
CREATE TRIGGER trg_guard_member_handle
    BEFORE INSERT OR UPDATE OF handle ON public.members
    FOR EACH ROW EXECUTE FUNCTION public.guard_member_handle();

-- 4. 방명록 — 비공개 프로필 보호 ----------------------------------
CREATE OR REPLACE FUNCTION public.member_profile_is_public(p_member_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
    SELECT EXISTS (SELECT 1 FROM members WHERE id = p_member_id AND profile_visibility = 'public');
$function$;
REVOKE ALL ON FUNCTION public.member_profile_is_public(uuid) FROM public;
GRANT EXECUTE ON FUNCTION public.member_profile_is_public(uuid) TO anon, authenticated, service_role;

DROP POLICY IF EXISTS public_read ON public.profile_comments;
CREATE POLICY public_read ON public.profile_comments
    FOR SELECT USING (
        is_hidden = false
        AND (
            member_profile_is_public(target_member_id)
            OR auth.uid() = (SELECT members.auth_id FROM members WHERE members.id = profile_comments.target_member_id)
            OR auth.uid() = (SELECT members.auth_id FROM members WHERE members.id = profile_comments.author_member_id)
        )
    );

DROP POLICY IF EXISTS authenticated_insert ON public.profile_comments;
CREATE POLICY authenticated_insert ON public.profile_comments
    FOR INSERT WITH CHECK (
        auth.uid() IS NOT NULL
        AND author_member_id = (SELECT members.id FROM members WHERE members.auth_id = auth.uid())
        AND member_profile_is_public(target_member_id)
    );
