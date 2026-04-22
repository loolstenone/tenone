-- ────────────────────────────────────────────────────────────────
-- HeRo Matching Vectors — 응답 → 파생 컬럼 자동 추출
-- Phase 4-1~3 · 2026-04-22
--
-- 목적: Tetrad 매칭 엔진이 읽을 수 있도록 JSONB 응답을 벡터화
--
-- 1. TIH (hero_tih_responses)
--    Section 0: industry/jobFunction → top-level 컬럼
--    Section 2: guardian/pioneer/connector → top-level 컬럼
--    Section 3 q2_a/q2_b: S-Power 2축 → top-level
--    Section 5: risk_avoid → 블랙 플래그 힌트
--
-- 2. JH (hero_jh_responses)
--    12문항 → derived_axes JSONB:
--    { problem_focus: [...], momentum_state: "...", energy_sources: [...], ... }
--
-- 3. JD (hero_jd)
--    derived_vector: 블록 요약 + 경력 범위 + 처우 레인지 파싱
-- ────────────────────────────────────────────────────────────────

-- ─── TIH 파생 컬럼 추가 ──────────────────────────────────────────
ALTER TABLE hero_tih_responses
    ADD COLUMN IF NOT EXISTS derived_industry TEXT,
    ADD COLUMN IF NOT EXISTS derived_job_function TEXT,
    ADD COLUMN IF NOT EXISTS derived_guardian INTEGER,
    ADD COLUMN IF NOT EXISTS derived_pioneer INTEGER,
    ADD COLUMN IF NOT EXISTS derived_connector INTEGER,
    ADD COLUMN IF NOT EXISTS derived_s_power_primary TEXT,
    ADD COLUMN IF NOT EXISTS derived_s_power_secondary TEXT,
    ADD COLUMN IF NOT EXISTS derived_risk_flags JSONB DEFAULT '[]'::jsonb;

CREATE INDEX IF NOT EXISTS hero_tih_industry_idx ON hero_tih_responses(derived_industry) WHERE derived_industry IS NOT NULL;
CREATE INDEX IF NOT EXISTS hero_tih_job_function_idx ON hero_tih_responses(derived_job_function) WHERE derived_job_function IS NOT NULL;

-- TIH 응답 벡터 추출 함수
CREATE OR REPLACE FUNCTION extract_tih_vectors()
RETURNS TRIGGER AS $$
DECLARE
    resp JSONB := NEW.responses;
    risk_flags JSONB := '[]'::jsonb;
BEGIN
    -- Section 0: 포지션 분류
    NEW.derived_industry := NULLIF(resp #>> '{s0,industry}', '');
    NEW.derived_job_function := NULLIF(resp #>> '{s0,jobFunction}', '');

    -- Section 2: 3축 배분
    NEW.derived_guardian := (resp #>> '{s2,guardian}')::INTEGER;
    NEW.derived_pioneer := (resp #>> '{s2,pioneer}')::INTEGER;
    NEW.derived_connector := (resp #>> '{s2,connector}')::INTEGER;

    -- Section 3: S-Power 2축 (가장 필요한 힘)
    NEW.derived_s_power_primary := NULLIF(resp #>> '{s3,q2_a}', '');
    NEW.derived_s_power_secondary := NULLIF(resp #>> '{s3,q2_b}', '');

    -- Section 4: 블랙 컴퍼니 간접 신호
    -- q2 = 'd' (개인 사정 이탈) 또는 'f' (여러 명 거침) → 이탈 리스크
    IF (resp #>> '{s4,q2}') IN ('d', 'f') THEN
        risk_flags := risk_flags || jsonb_build_object('type', 'turnover_risk', 'source', 's4-q2', 'value', resp #>> '{s4,q2}');
    END IF;
    -- q3 = 'd' (상부 판단 기다림) → 의사결정 병목
    IF (resp #>> '{s4,q3}') = 'd' THEN
        risk_flags := risk_flags || jsonb_build_object('type', 'decision_bottleneck', 'source', 's4-q3', 'value', 'd');
    END IF;
    -- q5 = 'c' (책임 소재 먼저 확인) → 비난 문화
    IF (resp #>> '{s4,q5}') = 'c' THEN
        risk_flags := risk_flags || jsonb_build_object('type', 'blame_culture', 'source', 's4-q5', 'value', 'c');
    END IF;

    NEW.derived_risk_flags := risk_flags;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS hero_tih_extract_vectors ON hero_tih_responses;
CREATE TRIGGER hero_tih_extract_vectors
    BEFORE INSERT OR UPDATE OF responses ON hero_tih_responses
    FOR EACH ROW EXECUTE FUNCTION extract_tih_vectors();

-- ─── JH 축 추출 ──────────────────────────────────────────────────
-- derived_axes JSONB 구조:
-- {
--   "problem_focus": ["a","c"],          // jh1 택2
--   "momentum_state": "b",                // jh2
--   "energy_sources": ["a","d","f"],     // jh3 택3
--   "edge": "e",                         // jh4
--   "growth_direction_short": "b",       // jh5
--   "future_self": "a",                  // jh6
--   "preferred_state": "c",              // jh7
--   "contribution_scale": "b",           // jh8
--   "work_style": "c",                   // jh9
--   "motivation": ["b","e"],             // jh10 택2
--   "avoid_traits": ["a","g"],           // jh11 택2
--   "problem_statement": "자유서술"      // jh12
-- }

CREATE OR REPLACE FUNCTION extract_jh_axes()
RETURNS TRIGGER AS $$
DECLARE
    r JSONB := NEW.responses;
    axes JSONB;
BEGIN
    axes := jsonb_build_object(
        'problem_focus',           COALESCE(r -> 'jh1', '[]'::jsonb),
        'momentum_state',          r ->> 'jh2',
        'energy_sources',          COALESCE(r -> 'jh3', '[]'::jsonb),
        'edge',                    r ->> 'jh4',
        'growth_direction_short',  r ->> 'jh5',
        'future_self',             r ->> 'jh6',
        'preferred_state',         r ->> 'jh7',
        'contribution_scale',      r ->> 'jh8',
        'work_style',              r ->> 'jh9',
        'motivation',              COALESCE(r -> 'jh10', '[]'::jsonb),
        'avoid_traits',            COALESCE(r -> 'jh11', '[]'::jsonb),
        'problem_statement',       r ->> 'jh12'
    );
    NEW.derived_axes := axes;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS hero_jh_extract_axes ON hero_jh_responses;
CREATE TRIGGER hero_jh_extract_axes
    BEFORE INSERT OR UPDATE OF responses ON hero_jh_responses
    FOR EACH ROW EXECUTE FUNCTION extract_jh_axes();

-- ─── JD 벡터 추출 ────────────────────────────────────────────────
-- derived_vector JSONB 구조:
-- {
--   "problem_count": 3,               // block3 problems 개수
--   "has_non_jd_work": true,          // JD 외 업무 공개 여부
--   "axis_summary": "...",            // 3축 요약 문자열
--   "competencies": ["...","..."],    // 역량 리스트
--   "has_compensation": true,         // 처우 공개 여부
--   "experience_tier": "mid"          // 경력 티어 파생
-- }

CREATE OR REPLACE FUNCTION extract_jd_vector()
RETURNS TRIGGER AS $$
DECLARE
    b JSONB := NEW.blocks;
    v JSONB;
    exp_tier TEXT;
BEGIN
    -- 경력 티어 단순 파싱
    IF NEW.experience_range IS NULL THEN
        exp_tier := 'any';
    ELSIF NEW.experience_range ~* '(신입|junior|0~|0-|1년|2년)' THEN
        exp_tier := 'junior';
    ELSIF NEW.experience_range ~* '(시니어|senior|10년|10\+)' THEN
        exp_tier := 'senior';
    ELSIF NEW.experience_range ~* '(리드|lead|head|\+)' THEN
        exp_tier := 'lead';
    ELSE
        exp_tier := 'mid';
    END IF;

    v := jsonb_build_object(
        'problem_count',        jsonb_array_length(COALESCE(b -> 'block3_problems', '[]'::jsonb)),
        'has_non_jd_work',      (COALESCE(b ->> 'block4_non_jd', '') <> ''),
        'axis_summary',         b ->> 'block5_axes_summary',
        'competencies',         COALESCE(b -> 'block5_competencies', '[]'::jsonb),
        'has_compensation',     (COALESCE(b ->> 'block7_compensation_range', '') <> ''),
        'has_leader_desc',      (COALESCE(b ->> 'block6_leader', '') <> ''),
        'has_culture_point',    (COALESCE(b ->> 'block7_culture_point', '') <> ''),
        'experience_tier',      exp_tier,
        'employment_type',      NEW.employment_type
    );
    NEW.derived_vector := v;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS hero_jd_extract_vector ON hero_jd;
CREATE TRIGGER hero_jd_extract_vector
    BEFORE INSERT OR UPDATE OF blocks, experience_range, employment_type ON hero_jd
    FOR EACH ROW EXECUTE FUNCTION extract_jd_vector();

-- ─── 기존 행 일괄 재계산 (트리거 배포 시점 기준) ────────────────
UPDATE hero_tih_responses SET responses = responses WHERE responses IS NOT NULL;
UPDATE hero_jh_responses SET responses = responses WHERE responses IS NOT NULL;
UPDATE hero_jd SET blocks = blocks WHERE blocks IS NOT NULL;

COMMENT ON FUNCTION extract_tih_vectors IS 'TIH JSONB 응답 → Section 0/2/3/4 파생 컬럼 자동 추출 (매칭 엔진용)';
COMMENT ON FUNCTION extract_jh_axes IS 'JH JSONB 응답 → 12축 derived_axes (매칭 엔진용)';
COMMENT ON FUNCTION extract_jd_vector IS 'JD blocks → 품질·구조 벡터 (매칭 엔진용 파생)';
