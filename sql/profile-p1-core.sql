-- ============================================================
-- 프로필 체계 P1 — 공통 뼈대 (2026-10-16, 세션 178)
-- 적용: 2026-10-16 apply_migration profile_p1_core (사용자 "다음 단계 진행")
--
-- A. members: 검색 노출(profile_searchable) · 운영 숨김(profile_blocked_at, 직원만) · 핸들 변경 시각
-- B. 공개 조건: 만 14세 이상 동의(consent.age_14_plus) + 운영 숨김 아님 (개인정보보호법 제22조의2)
-- C. 핸들 변경 규칙: 옛 핸들 90일 잠금(사칭 방지) · 30일 새 주소 연결 · 7일에 한 번 (자동 핸들 u_xxxxxxxx는 자유)
-- D. 기한 있는 공유 링크 (토큰은 해시만 저장, 최대 30일, 10개, 언제든 회수)
-- E. 방문 수 — 하루 단위 집계만 (누가 봤는지 남기지 않음, 계약 4)
-- F. 신고 → 직원 처리 (Action Hub)
-- G. 브랜드별 공개 설정 (P2 My Profile용, 유니버스 섹션 포함은 브랜드마다 동의 시각 기록 — 계약 4·제18조)
-- H. 공개 정보 = 한 함수(profile_public_payload)에서만 만든다 — 공개 화면·공유 화면·본인 미리보기 동일
-- I. 핸들 로그인 폐지(2026-10-16) → get_email_by_handle 삭제
-- 재실행 가능
-- ============================================================

-- A. members 컬럼 -------------------------------------------------
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS profile_searchable boolean NOT NULL DEFAULT false;
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS profile_blocked_at timestamptz;
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS handle_changed_at timestamptz;

-- 운영 숨김은 직원만 — 기존 권한 컬럼 보호 트리거에 추가
CREATE OR REPLACE FUNCTION public.protect_member_privileged_columns()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF coalesce(auth.role(), '') NOT IN ('authenticated', 'anon') THEN
    RETURN NEW;
  END IF;

  IF public.auth_is_staff() OR EXISTS (
    SELECT 1
    FROM member_roles r
    JOIN members m ON m.id = r.member_id
    WHERE m.auth_id = auth.uid()
      AND r.is_active
      AND r.role IN ('staff', 'manager', 'admin', 'super_admin', 'superadmin')
  ) THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
    NEW.auth_id            := auth.uid();
    NEW.email              := coalesce(auth.jwt() ->> 'email', NEW.email);
    NEW.account_type       := 'member';
    NEW.role               := 'Viewer';
    NEW.roles              := ARRAY['member']::text[];
    NEW.intra_access       := false;
    NEW.module_access      := '{}'::text[];
    NEW.system_access      := '{}'::text[];
    NEW.brand_access       := '{}'::text[];
    NEW.brand_roles        := '{}'::jsonb;
    NEW.tenant_id          := 'tenone';
    NEW.membership_tier    := 'free';
    NEW.is_active          := true;
    NEW.deleted_at         := NULL;
    NEW.stripe_customer_id := NULL;
    NEW.profile_blocked_at := NULL;
  ELSE
    NEW.auth_id            := OLD.auth_id;
    NEW.email              := OLD.email;
    NEW.account_type       := OLD.account_type;
    NEW.role               := OLD.role;
    NEW.roles              := OLD.roles;
    NEW.intra_access       := OLD.intra_access;
    NEW.module_access      := OLD.module_access;
    NEW.system_access      := OLD.system_access;
    NEW.brand_access       := OLD.brand_access;
    NEW.brand_roles        := OLD.brand_roles;
    NEW.tenant_id          := OLD.tenant_id;
    NEW.membership_tier    := OLD.membership_tier;
    NEW.is_active          := OLD.is_active;
    NEW.deleted_at         := OLD.deleted_at;
    NEW.stripe_customer_id := OLD.stripe_customer_id;
    NEW.profile_blocked_at := OLD.profile_blocked_at;
  END IF;

  RETURN NEW;
END;
$function$;

-- B. 공개 조건 ----------------------------------------------------
CREATE OR REPLACE FUNCTION public.member_can_be_public(p_consent jsonb, p_blocked_at timestamptz)
 RETURNS boolean LANGUAGE sql IMMUTABLE
AS $function$
    SELECT p_blocked_at IS NULL AND COALESCE(p_consent->>'age_14_plus', 'false') = 'true';
$function$;

CREATE OR REPLACE FUNCTION public.guard_member_profile_public()
 RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
BEGIN
    -- 운영 숨김이면 항상 비공개·검색 제외
    IF NEW.profile_blocked_at IS NOT NULL THEN
        NEW.profile_visibility := 'private';
        NEW.profile_searchable := false;
        RETURN NEW;
    END IF;
    IF NEW.profile_visibility = 'public'
       AND (TG_OP = 'INSERT' OR OLD.profile_visibility IS DISTINCT FROM 'public')
       AND NOT member_can_be_public(NEW.consent, NEW.profile_blocked_at) THEN
        RAISE EXCEPTION '프로필을 공개하려면 만 14세 이상 확인이 필요합니다' USING ERRCODE = 'check_violation';
    END IF;
    IF NEW.profile_visibility IS DISTINCT FROM 'public' THEN
        NEW.profile_searchable := false;      -- 비공개면 검색 노출도 끔
    END IF;
    RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS trg_guard_member_profile_public ON public.members;
CREATE TRIGGER trg_guard_member_profile_public
    BEFORE INSERT OR UPDATE OF profile_visibility, profile_searchable, profile_blocked_at, consent ON public.members
    FOR EACH ROW EXECUTE FUNCTION public.guard_member_profile_public();

-- C. 핸들 변경 규칙 -----------------------------------------------
CREATE TABLE IF NOT EXISTS public.member_handle_history (
    id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id  uuid NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
    handle     text NOT NULL,
    changed_at timestamptz NOT NULL DEFAULT now(),
    tenant_id  text NOT NULL DEFAULT 'tenone'
);
CREATE INDEX IF NOT EXISTS idx_member_handle_history_handle ON public.member_handle_history(handle, changed_at DESC);
ALTER TABLE public.member_handle_history ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS handle_history_own ON public.member_handle_history;
CREATE POLICY handle_history_own ON public.member_handle_history FOR SELECT TO authenticated
    USING (member_id = (SELECT id FROM members WHERE auth_id = auth.uid()) OR auth_is_staff());
GRANT SELECT ON public.member_handle_history TO authenticated;
GRANT ALL ON public.member_handle_history TO service_role;

CREATE OR REPLACE FUNCTION public.guard_member_handle()
 RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE
    is_user boolean := coalesce(auth.role(), '') IN ('authenticated', 'anon') AND NOT public.auth_is_staff();
BEGIN
    IF NEW.handle IS NULL OR (TG_OP = 'UPDATE' AND NEW.handle IS NOT DISTINCT FROM OLD.handle) THEN
        RETURN NEW;
    END IF;
    NEW.handle := lower(NEW.handle);

    IF EXISTS (SELECT 1 FROM universe_reserved_handles r WHERE r.handle = NEW.handle) THEN
        RAISE EXCEPTION '사용할 수 없는 핸들입니다: %', NEW.handle USING ERRCODE = 'check_violation';
    END IF;

    -- 다른 사람이 90일 안에 쓰던 핸들은 잠금 (옛 주소로 남 행세 방지)
    IF EXISTS (SELECT 1 FROM member_handle_history h
               WHERE h.handle = NEW.handle AND h.member_id <> NEW.id
                 AND h.changed_at > now() - interval '90 days') THEN
        RAISE EXCEPTION '최근에 다른 회원이 쓰던 핸들이라 90일 동안 쓸 수 없습니다' USING ERRCODE = 'check_violation';
    END IF;

    -- 7일에 한 번 (처음 정하는 핸들·자동 핸들 u_xxxxxxxx에서 바꾸는 것은 자유)
    IF TG_OP = 'UPDATE' AND is_user
       AND OLD.handle IS NOT NULL AND OLD.handle !~ '^u_[a-z0-9]{8,10}$'
       AND OLD.handle_changed_at IS NOT NULL AND OLD.handle_changed_at > now() - interval '7 days' THEN
        RAISE EXCEPTION '핸들은 7일에 한 번 바꿀 수 있습니다' USING ERRCODE = 'check_violation';
    END IF;

    IF TG_OP = 'UPDATE' THEN
        NEW.handle_changed_at := now();
    END IF;
    RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.record_member_handle_change()
 RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
BEGIN
    IF OLD.handle IS NOT NULL AND NEW.handle IS DISTINCT FROM OLD.handle THEN
        INSERT INTO member_handle_history(member_id, handle) VALUES (OLD.id, OLD.handle);
    END IF;
    RETURN NULL;
END;
$function$;

DROP TRIGGER IF EXISTS trg_record_member_handle_change ON public.members;
CREATE TRIGGER trg_record_member_handle_change
    AFTER UPDATE OF handle ON public.members
    FOR EACH ROW EXECUTE FUNCTION public.record_member_handle_change();

-- D. 공유 링크 ----------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profile_share_links (
    id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id      uuid NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
    scope          text NOT NULL DEFAULT 'universe',      -- 'universe' 또는 브랜드 slug
    token_hash     text NOT NULL UNIQUE,                  -- sha256(토큰) — 원문은 만들 때 한 번만 본인에게
    label          text CHECK (label IS NULL OR char_length(label) <= 40),
    expires_at     timestamptz NOT NULL,
    revoked_at     timestamptz,
    view_count     integer NOT NULL DEFAULT 0,
    last_viewed_at timestamptz,
    created_at     timestamptz NOT NULL DEFAULT now(),
    tenant_id      text NOT NULL DEFAULT 'tenone'
);
CREATE INDEX IF NOT EXISTS idx_profile_share_links_member ON public.profile_share_links(member_id, created_at DESC);
ALTER TABLE public.profile_share_links ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS share_links_own_read ON public.profile_share_links;
CREATE POLICY share_links_own_read ON public.profile_share_links FOR SELECT TO authenticated
    USING (member_id = (SELECT id FROM members WHERE auth_id = auth.uid()));
-- 만들기·회수는 아래 함수로만 (토큰 원문을 클라이언트가 정하지 않게)
GRANT SELECT ON public.profile_share_links TO authenticated;
GRANT ALL ON public.profile_share_links TO service_role;

CREATE OR REPLACE FUNCTION public.create_profile_share_link(p_days integer, p_label text DEFAULT NULL, p_scope text DEFAULT 'universe')
 RETURNS json LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE
    me members%ROWTYPE;
    tok text;
    row_id uuid;
    exp timestamptz;
BEGIN
    SELECT * INTO me FROM members WHERE auth_id = auth.uid();
    IF NOT FOUND THEN RAISE EXCEPTION '로그인이 필요합니다' USING ERRCODE = '42501'; END IF;
    IF NOT member_can_be_public(me.consent, me.profile_blocked_at) THEN
        RAISE EXCEPTION '공유 링크를 만들려면 만 14세 이상 확인이 필요합니다' USING ERRCODE = 'check_violation';
    END IF;
    IF me.handle IS NULL THEN RAISE EXCEPTION '핸들을 먼저 정해 주세요' USING ERRCODE = 'check_violation'; END IF;
    IF p_days NOT IN (1, 7, 30) THEN RAISE EXCEPTION '기한은 1·7·30일 중에서 고릅니다' USING ERRCODE = 'check_violation'; END IF;
    IF p_scope <> 'universe' AND NOT EXISTS (SELECT 1 FROM ums_sites WHERE slug = p_scope) THEN
        RAISE EXCEPTION '알 수 없는 서비스입니다' USING ERRCODE = 'check_violation';
    END IF;
    IF (SELECT count(*) FROM profile_share_links
        WHERE member_id = me.id AND revoked_at IS NULL AND expires_at > now()) >= 10 THEN
        RAISE EXCEPTION '사용 중인 공유 링크는 10개까지입니다' USING ERRCODE = 'check_violation';
    END IF;

    tok := replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', '');
    exp := now() + make_interval(days => p_days);
    INSERT INTO profile_share_links(member_id, scope, token_hash, label, expires_at)
    VALUES (me.id, p_scope, encode(sha256(convert_to(tok, 'UTF8')), 'hex'), NULLIF(trim(p_label), ''), exp)
    RETURNING id INTO row_id;

    RETURN json_build_object('id', row_id, 'token', tok, 'handle', me.handle, 'scope', p_scope, 'expires_at', exp);
END;
$function$;

CREATE OR REPLACE FUNCTION public.revoke_profile_share_link(p_id uuid)
 RETURNS boolean LANGUAGE sql SECURITY DEFINER SET search_path TO 'public'
AS $function$
    UPDATE profile_share_links SET revoked_at = now()
    WHERE id = p_id AND revoked_at IS NULL
      AND member_id = (SELECT id FROM members WHERE auth_id = auth.uid())
    RETURNING true;
$function$;

REVOKE ALL ON FUNCTION public.create_profile_share_link(integer, text, text) FROM public;
REVOKE ALL ON FUNCTION public.revoke_profile_share_link(uuid) FROM public;
GRANT EXECUTE ON FUNCTION public.create_profile_share_link(integer, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.revoke_profile_share_link(uuid) TO authenticated;

-- H. 공개 정보 = 한 곳 --------------------------------------------
CREATE OR REPLACE FUNCTION public.profile_public_payload(p_member_id uuid)
 RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE m RECORD; ps jsonb; shown jsonb;
BEGIN
    SELECT id, name, email, company, bio, avatar_url, interests_industry, interests_job,
           profile_visibility, profile_searchable, created_at, handle, privacy_settings, social_links
    INTO m FROM members WHERE id = p_member_id;
    IF NOT FOUND THEN RETURN NULL; END IF;

    ps := COALESCE(m.privacy_settings::jsonb, '{}'::jsonb);
    -- 본인이 true로 켠 항목만 (연락처는 공개 대상 아님)
    SELECT COALESCE(jsonb_object_agg(key, true), '{}'::jsonb) INTO shown
    FROM jsonb_each(ps) WHERE value = 'true'::jsonb AND key <> 'phone';

    RETURN jsonb_build_object(
        'id', m.id,                      -- 방명록 대상 키
        'name', m.name,
        'handle', m.handle,
        'email', CASE WHEN ps->>'email' = 'true' THEN m.email END,
        'company', CASE WHEN COALESCE(ps->>'company', 'true') <> 'false' THEN m.company END,
        'bio', CASE WHEN COALESCE(ps->>'bio', 'true') <> 'false' THEN m.bio END,
        'avatar_url', m.avatar_url,
        'interests_industry', m.interests_industry,
        'interests_job', m.interests_job,
        'profile_visibility', m.profile_visibility,
        'searchable', m.profile_visibility = 'public' AND m.profile_searchable,
        'created_at', m.created_at,
        'privacy_settings', shown,
        'social_links', CASE WHEN COALESCE(ps->>'socialLinks', 'true') <> 'false' THEN m.social_links END
    );
END;
$function$;
REVOKE ALL ON FUNCTION public.profile_public_payload(uuid) FROM public, anon, authenticated;

-- 공개 프로필 조회: 공개면 그대로 · 비공개면 유효한 공유 링크가 있을 때만 · 없으면 30일 내 옛 핸들 → 새 주소
DROP FUNCTION IF EXISTS public.get_public_profile(text);
CREATE OR REPLACE FUNCTION public.get_public_profile(p_handle text, p_share text DEFAULT NULL)
 RETURNS json LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE
    m RECORD;
    link_id uuid;
    moved text;
BEGIN
    SELECT id, handle, profile_visibility, profile_blocked_at, consent INTO m
    FROM members WHERE handle = lower(p_handle) LIMIT 1;

    IF NOT FOUND THEN
        SELECT cur.handle INTO moved
        FROM member_handle_history h JOIN members cur ON cur.id = h.member_id
        WHERE h.handle = lower(p_handle) AND h.changed_at > now() - interval '30 days'
          AND cur.handle IS NOT NULL AND cur.profile_visibility = 'public'
        ORDER BY h.changed_at DESC LIMIT 1;
        IF moved IS NOT NULL THEN RETURN json_build_object('moved_to', moved); END IF;
        RETURN NULL;
    END IF;

    IF NOT member_can_be_public(m.consent, m.profile_blocked_at) THEN
        RETURN json_build_object('handle', m.handle, 'profile_visibility', 'private');
    END IF;

    IF p_share IS NOT NULL AND length(p_share) = 64 THEN
        UPDATE profile_share_links
        SET view_count = view_count + 1, last_viewed_at = now()
        WHERE token_hash = encode(sha256(convert_to(p_share, 'UTF8')), 'hex')
          AND member_id = m.id AND scope = 'universe'
          AND revoked_at IS NULL AND expires_at > now()
        RETURNING id INTO link_id;
        IF link_id IS NOT NULL THEN
            RETURN (profile_public_payload(m.id) || jsonb_build_object('via_share', true, 'searchable', false))::json;
        END IF;
    END IF;

    IF m.profile_visibility IS DISTINCT FROM 'public' THEN
        RETURN json_build_object('handle', m.handle, 'profile_visibility', 'private');
    END IF;
    RETURN profile_public_payload(m.id)::json;
END;
$function$;
REVOKE ALL ON FUNCTION public.get_public_profile(text, text) FROM public;
GRANT EXECUTE ON FUNCTION public.get_public_profile(text, text) TO anon, authenticated, service_role;

-- 본인 미리보기 (다른 사람에게 보이는 화면 그대로)
CREATE OR REPLACE FUNCTION public.preview_my_public_profile()
 RETURNS json LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $function$
    SELECT profile_public_payload(id)::json FROM members WHERE auth_id = auth.uid();
$function$;
REVOKE ALL ON FUNCTION public.preview_my_public_profile() FROM public;
GRANT EXECUTE ON FUNCTION public.preview_my_public_profile() TO authenticated;

-- E. 방문 수 (하루 집계) ------------------------------------------
CREATE TABLE IF NOT EXISTS public.profile_view_daily (
    member_id uuid NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
    scope     text NOT NULL DEFAULT 'universe',
    day       date NOT NULL DEFAULT (now() AT TIME ZONE 'Asia/Seoul')::date,
    views     integer NOT NULL DEFAULT 0,
    tenant_id text NOT NULL DEFAULT 'tenone',
    PRIMARY KEY (member_id, scope, day)
);
ALTER TABLE public.profile_view_daily ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS profile_views_own ON public.profile_view_daily;
CREATE POLICY profile_views_own ON public.profile_view_daily FOR SELECT TO authenticated
    USING (member_id = (SELECT id FROM members WHERE auth_id = auth.uid()) OR auth_is_staff());
GRANT SELECT ON public.profile_view_daily TO authenticated;
GRANT ALL ON public.profile_view_daily TO service_role;

-- 서버(페이지 렌더)에서만 호출 — 같은 사람의 새로고침은 쿠키로 하루 1회 (앱에서)
CREATE OR REPLACE FUNCTION public.record_profile_view(p_member_id uuid, p_scope text DEFAULT 'universe')
 RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path TO 'public'
AS $function$
    INSERT INTO profile_view_daily(member_id, scope, day, views)
    VALUES (p_member_id, p_scope, (now() AT TIME ZONE 'Asia/Seoul')::date, 1)
    ON CONFLICT (member_id, scope, day) DO UPDATE SET views = profile_view_daily.views + 1;
$function$;
REVOKE ALL ON FUNCTION public.record_profile_view(uuid, text) FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.record_profile_view(uuid, text) TO service_role;

-- F. 신고 ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profile_reports (
    id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    target_member_id   uuid NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
    scope              text NOT NULL DEFAULT 'universe',
    brand_id           text NOT NULL DEFAULT 'tenone',
    reason             text NOT NULL CHECK (reason IN ('impersonation', 'privacy', 'abuse', 'spam', 'other')),
    detail             text CHECK (detail IS NULL OR char_length(detail) <= 1000),
    reporter_member_id uuid NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
    status             text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'hidden', 'dismissed')),
    handled_by         uuid REFERENCES public.members(id),
    handled_at         timestamptz,
    handled_note       text,
    created_at         timestamptz NOT NULL DEFAULT now(),
    tenant_id          text NOT NULL DEFAULT 'tenone'
);
CREATE UNIQUE INDEX IF NOT EXISTS uq_profile_reports_pending
    ON public.profile_reports(target_member_id, reporter_member_id, scope) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_profile_reports_status ON public.profile_reports(status, created_at DESC);
ALTER TABLE public.profile_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS profile_reports_insert ON public.profile_reports;
CREATE POLICY profile_reports_insert ON public.profile_reports FOR INSERT TO authenticated WITH CHECK (
    reporter_member_id = (SELECT id FROM members WHERE auth_id = auth.uid())
    AND reporter_member_id <> target_member_id
    AND status = 'pending' AND handled_by IS NULL
    AND member_profile_is_public(target_member_id)
);
DROP POLICY IF EXISTS profile_reports_read ON public.profile_reports;
CREATE POLICY profile_reports_read ON public.profile_reports FOR SELECT TO authenticated USING (
    reporter_member_id = (SELECT id FROM members WHERE auth_id = auth.uid()) OR auth_is_staff()
);
DROP POLICY IF EXISTS profile_reports_staff_update ON public.profile_reports;
CREATE POLICY profile_reports_staff_update ON public.profile_reports FOR UPDATE TO authenticated
    USING (auth_is_staff()) WITH CHECK (auth_is_staff());
GRANT SELECT, INSERT, UPDATE ON public.profile_reports TO authenticated;
GRANT ALL ON public.profile_reports TO service_role;

-- G. 브랜드별 공개 설정 (P2) --------------------------------------
CREATE TABLE IF NOT EXISTS public.member_brand_profile_settings (
    member_id          uuid NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
    brand_id           text NOT NULL REFERENCES public.ums_sites(slug) ON UPDATE CASCADE,
    is_public          boolean NOT NULL DEFAULT false,
    searchable         boolean NOT NULL DEFAULT false,
    show_fields        jsonb NOT NULL DEFAULT '{}'::jsonb,      -- 공통 항목 중 이 브랜드 화면에 보일 것 {bio:true, company:true …}
    include_brands     text[] NOT NULL DEFAULT '{}',            -- 함께 보여 줄 다른 브랜드 활동
    include_consent_at timestamptz,                             -- 위 목록에 동의한 시각 (목록이 바뀌면 갱신)
    updated_at         timestamptz NOT NULL DEFAULT now(),
    tenant_id          text NOT NULL DEFAULT 'tenone',
    PRIMARY KEY (member_id, brand_id)
);
ALTER TABLE public.member_brand_profile_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS brand_profile_settings_own ON public.member_brand_profile_settings;
CREATE POLICY brand_profile_settings_own ON public.member_brand_profile_settings FOR ALL TO authenticated
    USING (member_id = (SELECT id FROM members WHERE auth_id = auth.uid()))
    WITH CHECK (member_id = (SELECT id FROM members WHERE auth_id = auth.uid()));
DROP POLICY IF EXISTS brand_profile_settings_staff_read ON public.member_brand_profile_settings;
CREATE POLICY brand_profile_settings_staff_read ON public.member_brand_profile_settings FOR SELECT TO authenticated
    USING (auth_is_staff());
GRANT SELECT, INSERT, UPDATE, DELETE ON public.member_brand_profile_settings TO authenticated;
GRANT ALL ON public.member_brand_profile_settings TO service_role;

CREATE OR REPLACE FUNCTION public.guard_brand_profile_settings()
 RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE m RECORD;
BEGIN
    SELECT consent, profile_blocked_at INTO m FROM members WHERE id = NEW.member_id;
    IF NEW.is_public AND NOT member_can_be_public(m.consent, m.profile_blocked_at) THEN
        RAISE EXCEPTION '프로필을 공개하려면 만 14세 이상 확인이 필요합니다' USING ERRCODE = 'check_violation';
    END IF;
    IF NOT NEW.is_public THEN NEW.searchable := false; END IF;
    NEW.include_brands := ARRAY(SELECT DISTINCT b FROM unnest(NEW.include_brands) b WHERE b <> NEW.brand_id);
    IF TG_OP = 'INSERT' OR NEW.include_brands IS DISTINCT FROM OLD.include_brands THEN
        NEW.include_consent_at := CASE WHEN cardinality(NEW.include_brands) > 0 THEN now() END;
    END IF;
    NEW.updated_at := now();
    RETURN NEW;
END;
$function$;
DROP TRIGGER IF EXISTS trg_guard_brand_profile_settings ON public.member_brand_profile_settings;
CREATE TRIGGER trg_guard_brand_profile_settings
    BEFORE INSERT OR UPDATE ON public.member_brand_profile_settings
    FOR EACH ROW EXECUTE FUNCTION public.guard_brand_profile_settings();

-- 운영 숨김이면 브랜드 공개도 내림
CREATE OR REPLACE FUNCTION public.cascade_member_profile_block()
 RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
BEGIN
    IF NEW.profile_blocked_at IS NOT NULL AND OLD.profile_blocked_at IS NULL THEN
        UPDATE member_brand_profile_settings SET is_public = false WHERE member_id = NEW.id AND is_public;
        UPDATE profile_share_links SET revoked_at = now() WHERE member_id = NEW.id AND revoked_at IS NULL;
    END IF;
    RETURN NULL;
END;
$function$;
DROP TRIGGER IF EXISTS trg_cascade_member_profile_block ON public.members;
CREATE TRIGGER trg_cascade_member_profile_block
    AFTER UPDATE OF profile_blocked_at ON public.members
    FOR EACH ROW EXECUTE FUNCTION public.cascade_member_profile_block();

-- I. 핸들 로그인 폐지 ---------------------------------------------
DROP FUNCTION IF EXISTS public.get_email_by_handle(text);
