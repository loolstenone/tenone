-- ────────────────────────────────────────────────────────────────
-- HeRo: hit_{a..f}_results → hero_profiles 자동 동기화 트리거
-- Phase 0-3 · 2026-04-22
--
-- 목적: HIT 검사 완료 시 hero_profiles에 해당 member의 row를
--       자동 생성·갱신하여 매칭 엔진의 통합 프로필 보장
--
-- 원칙:
--   1. member_id가 NULL인 경우 건너뜀 (비회원 검사 허용 funnel)
--   2. hero_profiles는 member_id PK (1:1 확장)
--   3. 새 hit_X_result가 들어오면 hero_profiles.hit_X_result_id 업데이트
--   4. 기존 row가 없으면 신규 생성
--   5. 재검사 시 최신 결과 id로 덮어쓰기
-- ────────────────────────────────────────────────────────────────

-- 공통 트리거 함수: TG_TABLE_NAME으로 a/b/c/d/e/f 자동 분기
CREATE OR REPLACE FUNCTION sync_hero_profile_from_hit_result()
RETURNS TRIGGER AS $$
DECLARE
    result_column TEXT;
BEGIN
    -- member_id 없으면 건너뜀 (비회원 검사)
    IF NEW.member_id IS NULL THEN
        RETURN NEW;
    END IF;

    -- 테이블명에서 타입 추출 (hit_a_results → hit_a_result_id)
    result_column := REPLACE(TG_TABLE_NAME, '_results', '_result_id');

    -- hero_profiles upsert
    EXECUTE format(
        'INSERT INTO hero_profiles (member_id, %I, tenant_id, created_at, updated_at)
         VALUES ($1, $2, ''tenone'', now(), now())
         ON CONFLICT (member_id) DO UPDATE SET
            %I = EXCLUDED.%I,
            updated_at = now()',
        result_column, result_column, result_column
    ) USING NEW.member_id, NEW.id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION sync_hero_profile_from_hit_result IS
'HIT 검사 결과 INSERT/UPDATE 시 hero_profiles에 member_id 기반 upsert. 비회원(member_id IS NULL)은 건너뜀.';

-- ────────────────────────────────────────────────────────────────
-- 6개 테이블에 트리거 부착
-- ────────────────────────────────────────────────────────────────

-- HIT A
DROP TRIGGER IF EXISTS sync_hero_profile_hit_a ON hit_a_results;
CREATE TRIGGER sync_hero_profile_hit_a
    AFTER INSERT OR UPDATE OF member_id ON hit_a_results
    FOR EACH ROW EXECUTE FUNCTION sync_hero_profile_from_hit_result();

-- HIT B
DROP TRIGGER IF EXISTS sync_hero_profile_hit_b ON hit_b_results;
CREATE TRIGGER sync_hero_profile_hit_b
    AFTER INSERT OR UPDATE OF member_id ON hit_b_results
    FOR EACH ROW EXECUTE FUNCTION sync_hero_profile_from_hit_result();

-- HIT C
DROP TRIGGER IF EXISTS sync_hero_profile_hit_c ON hit_c_results;
CREATE TRIGGER sync_hero_profile_hit_c
    AFTER INSERT OR UPDATE OF member_id ON hit_c_results
    FOR EACH ROW EXECUTE FUNCTION sync_hero_profile_from_hit_result();

-- HIT D
DROP TRIGGER IF EXISTS sync_hero_profile_hit_d ON hit_d_results;
CREATE TRIGGER sync_hero_profile_hit_d
    AFTER INSERT OR UPDATE OF member_id ON hit_d_results
    FOR EACH ROW EXECUTE FUNCTION sync_hero_profile_from_hit_result();

-- HIT E
DROP TRIGGER IF EXISTS sync_hero_profile_hit_e ON hit_e_results;
CREATE TRIGGER sync_hero_profile_hit_e
    AFTER INSERT OR UPDATE OF member_id ON hit_e_results
    FOR EACH ROW EXECUTE FUNCTION sync_hero_profile_from_hit_result();

-- HIT F
DROP TRIGGER IF EXISTS sync_hero_profile_hit_f ON hit_f_results;
CREATE TRIGGER sync_hero_profile_hit_f
    AFTER INSERT OR UPDATE OF member_id ON hit_f_results
    FOR EACH ROW EXECUTE FUNCTION sync_hero_profile_from_hit_result();

-- ────────────────────────────────────────────────────────────────
-- 과거 데이터 백필 (member_id가 있는 기존 결과만)
-- 현재 hit_a_results 6건·hit_b_results 3건은 전부 member_id NULL이므로
-- 이 백필은 no-op. 향후 link-member API 호출 시 자동 실행됨.
-- ────────────────────────────────────────────────────────────────

-- HIT A 백필
INSERT INTO hero_profiles (member_id, hit_a_result_id, tenant_id, created_at, updated_at)
SELECT DISTINCT ON (member_id) member_id, id, 'tenone', now(), now()
FROM hit_a_results
WHERE member_id IS NOT NULL
ORDER BY member_id, created_at DESC
ON CONFLICT (member_id) DO UPDATE SET
    hit_a_result_id = EXCLUDED.hit_a_result_id,
    updated_at = now();

-- HIT B 백필
INSERT INTO hero_profiles (member_id, hit_b_result_id, tenant_id, created_at, updated_at)
SELECT DISTINCT ON (member_id) member_id, id, 'tenone', now(), now()
FROM hit_b_results
WHERE member_id IS NOT NULL
ORDER BY member_id, created_at DESC
ON CONFLICT (member_id) DO UPDATE SET
    hit_b_result_id = EXCLUDED.hit_b_result_id,
    updated_at = now();

-- HIT C 백필
INSERT INTO hero_profiles (member_id, hit_c_result_id, tenant_id, created_at, updated_at)
SELECT DISTINCT ON (member_id) member_id, id, 'tenone', now(), now()
FROM hit_c_results
WHERE member_id IS NOT NULL
ORDER BY member_id, created_at DESC
ON CONFLICT (member_id) DO UPDATE SET
    hit_c_result_id = EXCLUDED.hit_c_result_id,
    updated_at = now();

-- HIT D 백필
INSERT INTO hero_profiles (member_id, hit_d_result_id, tenant_id, created_at, updated_at)
SELECT DISTINCT ON (member_id) member_id, id, 'tenone', now(), now()
FROM hit_d_results
WHERE member_id IS NOT NULL
ORDER BY member_id, created_at DESC
ON CONFLICT (member_id) DO UPDATE SET
    hit_d_result_id = EXCLUDED.hit_d_result_id,
    updated_at = now();

-- HIT E 백필
INSERT INTO hero_profiles (member_id, hit_e_result_id, tenant_id, created_at, updated_at)
SELECT DISTINCT ON (member_id) member_id, id, 'tenone', now(), now()
FROM hit_e_results
WHERE member_id IS NOT NULL
ORDER BY member_id, created_at DESC
ON CONFLICT (member_id) DO UPDATE SET
    hit_e_result_id = EXCLUDED.hit_e_result_id,
    updated_at = now();

-- HIT F 백필
INSERT INTO hero_profiles (member_id, hit_f_result_id, tenant_id, created_at, updated_at)
SELECT DISTINCT ON (member_id) member_id, id, 'tenone', now(), now()
FROM hit_f_results
WHERE member_id IS NOT NULL
ORDER BY member_id, created_at DESC
ON CONFLICT (member_id) DO UPDATE SET
    hit_f_result_id = EXCLUDED.hit_f_result_id,
    updated_at = now();

-- ────────────────────────────────────────────────────────────────
-- 검증 쿼리 (적용 후 수동 실행)
-- ────────────────────────────────────────────────────────────────
-- SELECT COUNT(*) AS hero_profiles_count FROM hero_profiles;
-- SELECT member_id, hit_a_result_id, hit_b_result_id FROM hero_profiles LIMIT 10;
