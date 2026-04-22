-- ────────────────────────────────────────────────────────────────
-- HeRo Matching Vectors — 정제 (Task F · 2026-04-22)
--
-- 기존 트리거의 누락/약점 3가지를 보강:
--   1. TIH Section 5 `s5.q1` (피하고 싶은 유형) → risk_flags에 avoid_trait 추가
--      — 기존: docstring에는 있으나 코드가 빠뜨림
--   2. JD experience_tier — 한국어 경력 표기 변형 대응 확장
--      — "3~5년", "5년 이상", "경력 3년", "무관" 등
--   3. JH `problem_statement` → 길이/존재 여부 파생
--      — AI 큐레이션 Stage 3 가중치 산출에 사용
-- ────────────────────────────────────────────────────────────────

-- ─── TIH 벡터 추출 함수 (REPLACE) ────────────────────────────────
CREATE OR REPLACE FUNCTION extract_tih_vectors()
RETURNS TRIGGER AS $$
DECLARE
    resp JSONB := NEW.responses;
    risk_flags JSONB := '[]'::jsonb;
    s5_q1 TEXT;
    avoid_label TEXT;
BEGIN
    -- Section 0: 포지션 분류
    NEW.derived_industry := NULLIF(resp #>> '{s0,industry}', '');
    NEW.derived_job_function := NULLIF(resp #>> '{s0,jobFunction}', '');

    -- Section 2: 3축 배분
    NEW.derived_guardian := (resp #>> '{s2,guardian}')::INTEGER;
    NEW.derived_pioneer := (resp #>> '{s2,pioneer}')::INTEGER;
    NEW.derived_connector := (resp #>> '{s2,connector}')::INTEGER;

    -- Section 3: S-Power 2축
    NEW.derived_s_power_primary := NULLIF(resp #>> '{s3,q2_a}', '');
    NEW.derived_s_power_secondary := NULLIF(resp #>> '{s3,q2_b}', '');

    -- Section 4: 블랙 컴퍼니 간접 신호
    IF (resp #>> '{s4,q2}') IN ('d', 'f') THEN
        risk_flags := risk_flags || jsonb_build_object('type', 'turnover_risk', 'source', 's4-q2', 'value', resp #>> '{s4,q2}');
    END IF;
    IF (resp #>> '{s4,q3}') = 'd' THEN
        risk_flags := risk_flags || jsonb_build_object('type', 'decision_bottleneck', 'source', 's4-q3', 'value', 'd');
    END IF;
    IF (resp #>> '{s4,q5}') = 'c' THEN
        risk_flags := risk_flags || jsonb_build_object('type', 'blame_culture', 'source', 's4-q5', 'value', 'c');
    END IF;

    -- Section 5: 피하고 싶은 유형 (NEW)
    --   a=팀워크보다 개인 방식 고집 · b=의존 · c=관계 파괴 · d=책임 회피
    --   기업이 피하고 싶은 유형 → 매칭 엔진이 후보 인재 edge·motivation과 교차
    s5_q1 := NULLIF(resp #>> '{s5,q1}', '');
    IF s5_q1 IS NOT NULL THEN
        avoid_label := CASE s5_q1
            WHEN 'a' THEN 'individualist'
            WHEN 'b' THEN 'dependent'
            WHEN 'c' THEN 'relationship_destroyer'
            WHEN 'd' THEN 'responsibility_avoider'
            ELSE s5_q1
        END;
        risk_flags := risk_flags || jsonb_build_object(
            'type', 'avoid_trait',
            'source', 's5-q1',
            'value', s5_q1,
            'label', avoid_label
        );
    END IF;

    NEW.derived_risk_flags := risk_flags;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ─── JD 벡터 추출 함수 (REPLACE — experience_tier 확장) ──────────
CREATE OR REPLACE FUNCTION extract_jd_vector()
RETURNS TRIGGER AS $$
DECLARE
    b JSONB := NEW.blocks;
    v JSONB;
    exp_tier TEXT;
    exp_raw TEXT := COALESCE(NEW.experience_range, '');
BEGIN
    -- 경력 티어 파싱 (한국어 변형 확장)
    IF exp_raw = '' OR exp_raw ~* '(무관|any|any-level|제한없음|anyone)' THEN
        exp_tier := 'any';
    ELSIF exp_raw ~* '(신입|junior|0~|0-|^0년|1년|2년차?|경력\s*1|경력\s*2)' THEN
        exp_tier := 'junior';
    ELSIF exp_raw ~* '(리드|lead|head|head\s*of|팀장|팀\s*리드)' THEN
        exp_tier := 'lead';
    ELSIF exp_raw ~* '(시니어|senior|10년|10\+|10년\s*이상|경력\s*10|15년)' THEN
        exp_tier := 'senior';
    ELSIF exp_raw ~* '(3년|4년|5년|6년|7년|8년|9년|3~|4~|5~|경력\s*[3-9])' THEN
        exp_tier := 'mid';
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
        'experience_raw',       exp_raw,
        'employment_type',      NEW.employment_type
    );
    NEW.derived_vector := v;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ─── JH 축 추출 함수 (REPLACE — problem_statement 파생 추가) ─────
CREATE OR REPLACE FUNCTION extract_jh_axes()
RETURNS TRIGGER AS $$
DECLARE
    r JSONB := NEW.responses;
    axes JSONB;
    stmt TEXT;
    stmt_len INTEGER;
BEGIN
    stmt := COALESCE(r ->> 'jh12', '');
    stmt_len := char_length(stmt);

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
        'problem_statement',       stmt,
        'has_problem_statement',   (stmt_len > 10),
        'problem_statement_length', stmt_len
    );
    NEW.derived_axes := axes;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ─── 기존 행 일괄 재계산 ────────────────────────────────────────
UPDATE hero_tih_responses SET responses = responses WHERE responses IS NOT NULL;
UPDATE hero_jh_responses SET responses = responses WHERE responses IS NOT NULL;
UPDATE hero_jd SET blocks = blocks WHERE blocks IS NOT NULL;

COMMENT ON FUNCTION extract_tih_vectors IS 'TIH JSONB 응답 → 파생 컬럼 (Section 0/2/3/4/5 포함, v2: s5 avoid_trait 추가)';
COMMENT ON FUNCTION extract_jd_vector IS 'JD blocks → 벡터 (v2: 한국어 경력 표기 확장 + experience_raw 보존)';
COMMENT ON FUNCTION extract_jh_axes IS 'JH JSONB → 12축 derived_axes (v2: problem_statement 길이/존재 파생)';
