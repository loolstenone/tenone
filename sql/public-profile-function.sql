-- 퍼블릭 프로필 조회 함수 (anon key로 접근 가능, RLS 우회)
-- 프로필 visibility에 따라 공개 데이터만 반환
CREATE OR REPLACE FUNCTION get_public_profile(p_handle TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_record RECORD;
    v_result JSON;
BEGIN
    SELECT
        id, name, email, company, bio, avatar_url,
        affiliations, interests_industry, interests_job,
        profile_visibility, role, created_at, handle
    INTO v_record
    FROM members
    WHERE handle = p_handle
    LIMIT 1;

    IF NOT FOUND THEN
        RETURN NULL;
    END IF;

    -- 비공개 프로필: 최소 정보만 반환
    IF v_record.profile_visibility = 'private' THEN
        RETURN json_build_object(
            'handle', v_record.handle,
            'profile_visibility', 'private'
        );
    END IF;

    -- 공개 프로필: 전체 반환
    RETURN row_to_json(v_record);
END;
$$;

-- anon 역할에 실행 권한 부여
GRANT EXECUTE ON FUNCTION get_public_profile(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION get_public_profile(TEXT) TO authenticated;
