-- ============================================================
-- 프로필 체계 P2 — 브랜드 My Profile (2026-10-16, 세션 178)
-- 적용: 2026-10-16 apply_migration profile_p2_brand (사용자 "P2 진행")
--
-- 브랜드 도메인/@핸들 (예: www.madleague.net/@핸들) = 그 브랜드의 공개 프로필
--   공통 정보: 본인이 고른 항목만 (show_fields — 사진·소개 기본 표시, 소속·SNS 기본 숨김)
--   브랜드 활동: 브랜드가 자기 데이터로 만드는 섹션 함수 (madleague_profile_section — 데이터 계약 3: 그 브랜드 테이블은 그 브랜드 함수만 읽는다)
--   유니버스 활동: 본인이 고른 브랜드(include_brands)의 활동 역할만 — 코어 member_capability_roles에서 브랜드·역할·연도만 (계약 4·제18조)
--   유니버스 프로필 링크는 응답에 넣지 않는다 (본인 화면에만 — 헌법 원칙 7)
-- 공개 조건 = member_brand_profile_settings.is_public + 만 14세 이상 + 운영 숨김 아님 (P1 트리거)
-- 비공개여도 그 브랜드 범위(scope=브랜드) 공유 링크로 열 수 있다
-- 테스트 데이터(context.demo=true)는 공개 프로필에 나오지 않는다
-- 재실행 가능
-- ============================================================

-- 1. MADLeague 섹션 (MADLeague 소유) --------------------------------
CREATE OR REPLACE FUNCTION public.madleague_profile_section(p_member_id uuid)
 RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $function$
    SELECT jsonb_build_object(
        -- 활동 역할: 현역·임원·OB·멘토 (동아리·연도·직책만)
        'roles', COALESCE((
            SELECT jsonb_agg(jsonb_build_object(
                'role', r.role,
                'position', r.context->>'position',
                'year', r.context->>'year',
                'club', CASE WHEN c.id IS NOT NULL THEN jsonb_build_object('name', c.name, 'slug', c.slug) END,
                'active', r.valid_until IS NULL
            ) ORDER BY (r.valid_until IS NULL) DESC, r.context->>'year' DESC NULLS LAST, r.valid_from DESC)
            FROM member_capability_roles r
            LEFT JOIN mad_clubs c ON c.id::text = r.context->>'club_id'
            WHERE r.member_id = p_member_id AND r.brand_id = 'madleague' AND r.capability_key = 'club'
              AND COALESCE(r.context->>'demo', 'false') <> 'true'
        ), '[]'::jsonb),
        -- 인증서: 종류·결과·회차·팀·발급일·코드만 (생년월일·대학·전공 제외 — 진위 확인은 코드로)
        'certificates', COALESCE((
            SELECT jsonb_agg(jsonb_build_object(
                'type', pc.type,
                'result', pc.result,
                'title', COALESCE(pc.snapshot->>'round_title', pc.snapshot->>'title', pc.note),
                'team', pc.snapshot->>'team_name',
                'issued_at', (pc.issued_at AT TIME ZONE 'Asia/Seoul')::date,
                'code', pc.code
            ) ORDER BY pc.issued_at DESC)
            FROM program_certificates pc
            WHERE pc.member_id = p_member_id AND pc.brand_id = 'madleague' AND pc.revoked_at IS NULL
        ), '[]'::jsonb),
        -- 매드리거 소개·관심 기술: 포트폴리오 공개에 동의한 경우만 (mad_members.portfolio_public)
        'madleaguer', (
            SELECT jsonb_build_object('bio', mm.bio, 'skill_tags', mm.skill_tags)
            FROM mad_members mm
            WHERE mm.member_id = p_member_id AND mm.portfolio_public = true
            LIMIT 1
        )
    );
$function$;
REVOKE ALL ON FUNCTION public.madleague_profile_section(uuid) FROM public, anon, authenticated;

-- 2. 브랜드 섹션 등록 (브랜드 프로필을 여는 브랜드만) --------------------
CREATE OR REPLACE FUNCTION public.brand_profile_section(p_member_id uuid, p_brand text)
 RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $function$
BEGIN
    RETURN CASE p_brand
        WHEN 'madleague' THEN madleague_profile_section(p_member_id)
        ELSE NULL
    END;
END;
$function$;
REVOKE ALL ON FUNCTION public.brand_profile_section(uuid, text) FROM public, anon, authenticated;

CREATE OR REPLACE FUNCTION public.brand_profile_enabled(p_brand text)
 RETURNS boolean LANGUAGE sql IMMUTABLE
AS $function$ SELECT p_brand IN ('madleague'); $function$;

-- 3. 브랜드 공개 정보 = 한 곳 -----------------------------------------
CREATE OR REPLACE FUNCTION public.brand_profile_payload(p_member_id uuid, p_brand text)
 RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE m RECORD; s RECORD; f jsonb; universe jsonb;
BEGIN
    SELECT id, name, handle, avatar_url, bio, company, social_links INTO m FROM members WHERE id = p_member_id;
    IF NOT FOUND THEN RETURN NULL; END IF;
    SELECT is_public, searchable, show_fields, include_brands INTO s
    FROM member_brand_profile_settings WHERE member_id = p_member_id AND brand_id = p_brand;
    f := COALESCE(s.show_fields, '{}'::jsonb);

    -- 유니버스 활동: 본인이 고른 브랜드만, 브랜드·기능·역할·연도·진행 여부만
    SELECT COALESCE(jsonb_agg(jsonb_build_object('brand_id', b.brand_id, 'brand_name', b.brand_name, 'items', b.items)
                              ORDER BY b.brand_name), '[]'::jsonb)
    INTO universe
    FROM (
        SELECT r.brand_id, COALESCE(u.name, r.brand_id) AS brand_name,
               jsonb_agg(jsonb_build_object('capability', r.capability_key, 'role', r.role,
                                            'year', r.context->>'year', 'active', r.valid_until IS NULL)
                         ORDER BY (r.valid_until IS NULL) DESC, r.valid_from DESC) AS items
        FROM member_capability_roles r
        LEFT JOIN ums_sites u ON u.slug = r.brand_id
        WHERE r.member_id = p_member_id
          AND r.brand_id = ANY (COALESCE(s.include_brands, '{}'))
          AND r.brand_id <> p_brand
          AND COALESCE(r.context->>'demo', 'false') <> 'true'
        GROUP BY r.brand_id, u.name
    ) b;

    RETURN jsonb_build_object(
        'id', m.id,
        'name', m.name,
        'handle', m.handle,
        'brand', p_brand,
        'avatar_url', CASE WHEN COALESCE(f->>'avatar', 'true') <> 'false' THEN m.avatar_url END,
        'bio', CASE WHEN COALESCE(f->>'bio', 'true') <> 'false' THEN m.bio END,
        'company', CASE WHEN f->>'company' = 'true' THEN m.company END,
        'social_links', CASE WHEN f->>'socialLinks' = 'true' THEN m.social_links END,
        'profile_visibility', CASE WHEN COALESCE(s.is_public, false) THEN 'public' ELSE 'private' END,
        'searchable', COALESCE(s.is_public, false) AND COALESCE(s.searchable, false),
        'section', brand_profile_section(m.id, p_brand),
        'universe', universe
    );
END;
$function$;
REVOKE ALL ON FUNCTION public.brand_profile_payload(uuid, text) FROM public, anon, authenticated;

-- 4. 브랜드 공개 프로필 조회 ------------------------------------------
CREATE OR REPLACE FUNCTION public.get_brand_profile(p_handle text, p_brand text, p_share text DEFAULT NULL)
 RETURNS json LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE m RECORD; pub boolean; link_id uuid; moved text;
BEGIN
    IF NOT brand_profile_enabled(p_brand) THEN RETURN NULL; END IF;

    SELECT id, handle, profile_blocked_at, consent INTO m FROM members WHERE handle = lower(p_handle) LIMIT 1;
    IF NOT FOUND THEN
        SELECT cur.handle INTO moved
        FROM member_handle_history h
        JOIN members cur ON cur.id = h.member_id
        JOIN member_brand_profile_settings st ON st.member_id = cur.id AND st.brand_id = p_brand AND st.is_public
        WHERE h.handle = lower(p_handle) AND h.changed_at > now() - interval '30 days' AND cur.handle IS NOT NULL
        ORDER BY h.changed_at DESC LIMIT 1;
        IF moved IS NOT NULL THEN RETURN json_build_object('moved_to', moved); END IF;
        RETURN NULL;
    END IF;

    IF NOT member_can_be_public(m.consent, m.profile_blocked_at) THEN
        RETURN json_build_object('handle', m.handle, 'profile_visibility', 'private');
    END IF;

    IF p_share IS NOT NULL AND length(p_share) = 64 THEN
        UPDATE profile_share_links SET view_count = view_count + 1, last_viewed_at = now()
        WHERE token_hash = encode(sha256(convert_to(p_share, 'UTF8')), 'hex')
          AND member_id = m.id AND scope = p_brand AND revoked_at IS NULL AND expires_at > now()
        RETURNING id INTO link_id;
        IF link_id IS NOT NULL THEN
            RETURN (brand_profile_payload(m.id, p_brand) || jsonb_build_object('via_share', true, 'searchable', false))::json;
        END IF;
    END IF;

    SELECT is_public INTO pub FROM member_brand_profile_settings WHERE member_id = m.id AND brand_id = p_brand;
    IF NOT COALESCE(pub, false) THEN
        RETURN json_build_object('handle', m.handle, 'profile_visibility', 'private');
    END IF;
    RETURN brand_profile_payload(m.id, p_brand)::json;
END;
$function$;
REVOKE ALL ON FUNCTION public.get_brand_profile(text, text, text) FROM public;
GRANT EXECUTE ON FUNCTION public.get_brand_profile(text, text, text) TO anon, authenticated, service_role;

-- 본인 미리보기
CREATE OR REPLACE FUNCTION public.preview_my_brand_profile(p_brand text)
 RETURNS json LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $function$
    SELECT CASE WHEN brand_profile_enabled(p_brand) THEN brand_profile_payload(id, p_brand)::json END
    FROM members WHERE auth_id = auth.uid();
$function$;
REVOKE ALL ON FUNCTION public.preview_my_brand_profile(text) FROM public;
GRANT EXECUTE ON FUNCTION public.preview_my_brand_profile(text) TO authenticated;

-- 포함할 수 있는 유니버스 브랜드 목록 (본인 활동 역할이 있는 브랜드)
CREATE OR REPLACE FUNCTION public.my_activity_brands()
 RETURNS TABLE(brand_id text, brand_name text, roles integer) LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $function$
    SELECT r.brand_id, COALESCE(u.name, r.brand_id), count(*)::int
    FROM member_capability_roles r
    LEFT JOIN ums_sites u ON u.slug = r.brand_id
    WHERE r.member_id = (SELECT id FROM members WHERE auth_id = auth.uid())
      AND COALESCE(r.context->>'demo', 'false') <> 'true'
    GROUP BY r.brand_id, u.name
    ORDER BY 2;
$function$;
REVOKE ALL ON FUNCTION public.my_activity_brands() FROM public;
GRANT EXECUTE ON FUNCTION public.my_activity_brands() TO authenticated;

-- 5. 브랜드만 탈퇴하면 그 브랜드 공개 설정 삭제 + 다른 브랜드 프로필의 포함 목록에서 제거 ----
CREATE OR REPLACE FUNCTION public.cleanup_brand_profile_on_withdrawal()
 RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
BEGIN
    IF NEW.withdrawn_at IS NOT NULL AND OLD.withdrawn_at IS NULL THEN
        DELETE FROM member_brand_profile_settings WHERE member_id = NEW.member_id AND brand_id = NEW.brand_id;
        UPDATE member_brand_profile_settings
        SET include_brands = array_remove(include_brands, NEW.brand_id)
        WHERE member_id = NEW.member_id AND NEW.brand_id = ANY (include_brands);
        UPDATE profile_share_links SET revoked_at = now()
        WHERE member_id = NEW.member_id AND scope = NEW.brand_id AND revoked_at IS NULL;
    END IF;
    RETURN NULL;
END;
$function$;
DROP TRIGGER IF EXISTS trg_cleanup_brand_profile_on_withdrawal ON public.member_brand_joins;
CREATE TRIGGER trg_cleanup_brand_profile_on_withdrawal
    AFTER UPDATE OF withdrawn_at ON public.member_brand_joins
    FOR EACH ROW EXECUTE FUNCTION public.cleanup_brand_profile_on_withdrawal();

-- 6. 브랜드 공개는 그 브랜드에 가입한 회원만 (계정 하나·서비스 독립 — 헌법 원칙 1) ----
CREATE OR REPLACE FUNCTION public.guard_brand_profile_settings()
 RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE m RECORD;
BEGIN
    SELECT consent, profile_blocked_at INTO m FROM members WHERE id = NEW.member_id;
    IF NOT brand_profile_enabled(NEW.brand_id) THEN
        RAISE EXCEPTION '이 서비스는 아직 브랜드 프로필을 열지 않았습니다' USING ERRCODE = 'check_violation';
    END IF;
    IF NEW.is_public AND NOT member_can_be_public(m.consent, m.profile_blocked_at) THEN
        RAISE EXCEPTION '프로필을 공개하려면 만 14세 이상 확인이 필요합니다' USING ERRCODE = 'check_violation';
    END IF;
    IF NEW.is_public AND NOT EXISTS (
        SELECT 1 FROM member_brand_joins j
        WHERE j.member_id = NEW.member_id AND j.brand_id = NEW.brand_id AND j.withdrawn_at IS NULL
    ) THEN
        RAISE EXCEPTION '이 서비스에 가입한 뒤 공개할 수 있습니다' USING ERRCODE = 'check_violation';
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
