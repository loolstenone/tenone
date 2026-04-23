-- ────────────────────────────────────────────────────────────────
-- HeRo Matching Engine v2 — 벡터 추출 정교화 (Task F · 2026-04-23)
--
-- v1 대비 개선 3가지:
--   1. score_total이 실제 axis 점수를 사용 (v1: 50.0 하드코딩 버그)
--   2. hero_match_candidates_for_jh 실제 축 거리 계산 구현
--   3. JH practical_filters(company_size_ranges) 소프트 매칭 추가
--
-- 가중치:
--   axis_distance   40% — 핵심 컬처핏 (가장 객관적 신호)
--   industry        20% — 포지션 연관성
--   job_function    20% — 역할 연관성
--   practical_fit   20% — 규모·형태 필터 (있을 때만 가산)
-- ────────────────────────────────────────────────────────────────

-- ─── 헬퍼: JH preferred_state → 이상적 축 비율 ─────────────────
-- 'a'(守/지키는) → guardian 중심
-- 'b'(開/여는)  → pioneer 중심
-- 'c'(팀 속)   → connector 중심
-- 'd'(균형)    → 균등
-- NULL/기타     → 패널티 (50점 고정)
CREATE OR REPLACE FUNCTION _hero_jh_target_axes(_preferred_state TEXT)
RETURNS TABLE (t_guardian INT, t_pioneer INT, t_connector INT) AS $$
BEGIN
    RETURN QUERY
    SELECT
        CASE _preferred_state
            WHEN 'a' THEN 60 WHEN 'b' THEN 20 WHEN 'c' THEN 20 WHEN 'd' THEN 33 ELSE NULL
        END::INT,
        CASE _preferred_state
            WHEN 'a' THEN 20 WHEN 'b' THEN 60 WHEN 'c' THEN 20 WHEN 'd' THEN 33 ELSE NULL
        END::INT,
        CASE _preferred_state
            WHEN 'a' THEN 20 WHEN 'b' THEN 20 WHEN 'c' THEN 60 WHEN 'd' THEN 34 ELSE NULL
        END::INT;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ─── 헬퍼: 축 거리 → 0~100 점수 ────────────────────────────────
CREATE OR REPLACE FUNCTION _hero_axis_score(
    actual_g INT, actual_p INT, actual_c INT,
    target_g INT, target_p INT, target_c INT
) RETURNS DOUBLE PRECISION AS $$
BEGIN
    IF target_g IS NULL THEN RETURN 50.0; END IF;
    RETURN 100.0 - LEAST(100.0,
        (ABS(COALESCE(actual_g, 33) - target_g)
         + ABS(COALESCE(actual_p, 33) - target_p)
         + ABS(COALESCE(actual_c, 34) - target_c))::DOUBLE PRECISION / 2.0
    );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ─── 헬퍼: JH practical_filters × 회사 프로필 소프트 매칭 ───────
-- 0 (불일치 없음) ~ 100 (완전 일치)
-- 데이터가 없으면 50 (중립) 반환 — 패널티 없음
CREATE OR REPLACE FUNCTION _hero_practical_fit(
    jh_filters JSONB,
    company_size TEXT   -- hero_companies.company_size (nullable)
) RETURNS DOUBLE PRECISION AS $$
DECLARE
    pref_sizes JSONB;
    size_match BOOLEAN := NULL;
BEGIN
    pref_sizes := jh_filters -> 'company_size_ranges';

    -- company_size 데이터 있을 때만 판단
    IF pref_sizes IS NOT NULL AND jsonb_array_length(pref_sizes) > 0
       AND company_size IS NOT NULL THEN
        -- JH가 선호하는 규모 목록에 기업 규모가 포함되는지 확인
        size_match := pref_sizes ? company_size;
        RETURN CASE WHEN size_match THEN 100.0 ELSE 20.0 END;
    END IF;

    RETURN 50.0;  -- 데이터 없음 → 중립
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ─── TIH 기반 인재 후보 (v2) ─────────────────────────────────────
CREATE OR REPLACE FUNCTION hero_match_candidates_for_tih(_tih_id UUID)
RETURNS TABLE (
    member_id         UUID,
    jh_id             UUID,
    hit_a_result_id   UUID,
    hit_b_result_id   UUID,
    score_industry    INTEGER,
    score_job_function INTEGER,
    score_axis        DOUBLE PRECISION,
    score_practical   DOUBLE PRECISION,
    score_total       DOUBLE PRECISION,
    risk_match        JSONB
) AS $$
DECLARE
    tih RECORD;
BEGIN
    SELECT t.derived_industry, t.derived_job_function,
           t.derived_guardian, t.derived_pioneer, t.derived_connector,
           t.derived_risk_flags
    INTO tih
    FROM hero_tih_responses t
    WHERE t.id = _tih_id;

    IF NOT FOUND THEN RETURN; END IF;

    RETURN QUERY
    WITH candidates AS (
        SELECT
            hp.member_id,
            jh.id                         AS jh_id,
            hp.hit_a_result_id,
            hp.hit_b_result_id,
            jh.derived_axes,
            jh.practical_filters
        FROM hero_jh_responses jh
        LEFT JOIN hero_profiles hp ON hp.member_id = jh.member_id
        WHERE jh.status = 'active'
    ),
    scored AS (
        SELECT
            c.member_id,
            c.jh_id,
            c.hit_a_result_id,
            c.hit_b_result_id,

            -- 산업 매칭: v2는 중립 50 유지 (industry↔JH 직접 매핑 테이블 없음)
            CASE WHEN tih.derived_industry IS NOT NULL THEN 50 ELSE 0 END
                AS score_industry,

            -- 직무 매칭: 동일
            CASE WHEN tih.derived_job_function IS NOT NULL THEN 50 ELSE 0 END
                AS score_job_function,

            -- 축 매칭: JH preferred_state → 이상적 TIH 축 비율 → 실제 거리
            _hero_axis_score(
                tih.derived_guardian, tih.derived_pioneer, tih.derived_connector,
                CASE c.derived_axes ->> 'preferred_state'
                    WHEN 'a' THEN 60 WHEN 'b' THEN 20 WHEN 'c' THEN 20 WHEN 'd' THEN 33 ELSE NULL END,
                CASE c.derived_axes ->> 'preferred_state'
                    WHEN 'a' THEN 20 WHEN 'b' THEN 60 WHEN 'c' THEN 20 WHEN 'd' THEN 33 ELSE NULL END,
                CASE c.derived_axes ->> 'preferred_state'
                    WHEN 'a' THEN 20 WHEN 'b' THEN 20 WHEN 'c' THEN 60 WHEN 'd' THEN 34 ELSE NULL END
            ) AS score_axis,

            -- 실무 필터: JH company_size_ranges (TIH 기업 규모는 미추출 → 중립)
            50.0::DOUBLE PRECISION AS score_practical,

            -- 위험 교차 감지
            jsonb_build_object(
                'tih_flags', COALESCE(tih.derived_risk_flags, '[]'::jsonb),
                'jh_avoid',  COALESCE(c.derived_axes -> 'avoid_traits', '[]'::jsonb),
                'conflict', CASE
                    WHEN tih.derived_risk_flags @> '[{"type":"blame_culture"}]'::jsonb
                         AND c.derived_axes -> 'avoid_traits' ?| ARRAY['a']
                    THEN 'blame_culture ↔ avoid_a'
                    WHEN tih.derived_risk_flags @> '[{"type":"decision_bottleneck"}]'::jsonb
                         AND c.derived_axes -> 'avoid_traits' ?| ARRAY['g']
                    THEN 'decision_bottleneck ↔ avoid_g'
                    WHEN tih.derived_risk_flags @> '[{"type":"turnover_risk"}]'::jsonb
                         AND c.derived_axes -> 'avoid_traits' ?| ARRAY['f']
                    THEN 'turnover_risk ↔ avoid_f'
                    ELSE NULL
                END
            ) AS risk_match

        FROM candidates c
    )
    SELECT
        s.member_id,
        s.jh_id,
        s.hit_a_result_id,
        s.hit_b_result_id,
        s.score_industry,
        s.score_job_function,
        s.score_axis,
        s.score_practical,
        -- v2 핵심 수정: axis 실제 값 사용 (v1은 50.0 하드코딩)
        (s.score_industry    * 0.20
         + s.score_job_function * 0.20
         + s.score_axis         * 0.40
         + s.score_practical    * 0.20
        )::DOUBLE PRECISION AS score_total,
        s.risk_match
    FROM scored s
    ORDER BY score_total DESC;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

COMMENT ON FUNCTION hero_match_candidates_for_tih IS
'TIH 응답 1건 → 매칭 인재 후보 + 점수 (v2: 실제 axis 점수, 가중치 40/20/20/20)';

-- ─── JH 기반 기업/자리 후보 (v2 — 실제 축 매칭 구현) ─────────────
CREATE OR REPLACE FUNCTION hero_match_candidates_for_jh(_jh_id UUID)
RETURNS TABLE (
    tih_id             UUID,
    company_id         UUID,
    company_name       TEXT,
    jd_id              UUID,
    jd_position_title  TEXT,
    score_axis         DOUBLE PRECISION,
    score_practical    DOUBLE PRECISION,
    score_total        DOUBLE PRECISION,
    risk_match         JSONB
) AS $$
DECLARE
    jh RECORD;
BEGIN
    SELECT j.derived_axes, j.practical_filters
    INTO jh
    FROM hero_jh_responses j
    WHERE j.id = _jh_id;

    IF NOT FOUND THEN RETURN; END IF;

    RETURN QUERY
    WITH company_pool AS (
        SELECT
            t.id          AS tih_id,
            t.company_id,
            c.company_name,
            c.company_size,
            t.derived_guardian,
            t.derived_pioneer,
            t.derived_connector,
            t.derived_risk_flags,
            jd.id         AS jd_id,
            jd.position_title
        FROM hero_tih_responses t
        LEFT JOIN hero_companies c  ON c.id = t.company_id
        LEFT JOIN hero_jd jd        ON jd.tih_response_id = t.id
                                    AND jd.status = 'published'
        WHERE t.status IN ('pending', 'reviewing')
    ),
    scored AS (
        SELECT
            cp.tih_id,
            cp.company_id,
            cp.company_name,
            cp.jd_id,
            cp.position_title,

            -- 축 매칭: JH 사람이 원하는 환경 vs 기업의 실제 축
            _hero_axis_score(
                cp.derived_guardian, cp.derived_pioneer, cp.derived_connector,
                CASE jh.derived_axes ->> 'preferred_state'
                    WHEN 'a' THEN 60 WHEN 'b' THEN 20 WHEN 'c' THEN 20 WHEN 'd' THEN 33 ELSE NULL END,
                CASE jh.derived_axes ->> 'preferred_state'
                    WHEN 'a' THEN 20 WHEN 'b' THEN 60 WHEN 'c' THEN 20 WHEN 'd' THEN 33 ELSE NULL END,
                CASE jh.derived_axes ->> 'preferred_state'
                    WHEN 'a' THEN 20 WHEN 'b' THEN 20 WHEN 'c' THEN 60 WHEN 'd' THEN 34 ELSE NULL END
            ) AS score_axis,

            -- 실무 필터: JH company_size_ranges × 기업 실제 규모
            _hero_practical_fit(jh.practical_filters, cp.company_size)
                AS score_practical,

            -- 위험 교차
            jsonb_build_object(
                'tih_flags', COALESCE(cp.derived_risk_flags, '[]'::jsonb),
                'jh_avoid',  COALESCE(jh.derived_axes -> 'avoid_traits', '[]'::jsonb),
                'conflict', CASE
                    WHEN cp.derived_risk_flags @> '[{"type":"blame_culture"}]'::jsonb
                         AND jh.derived_axes -> 'avoid_traits' ?| ARRAY['a']
                    THEN 'blame_culture ↔ avoid_a'
                    WHEN cp.derived_risk_flags @> '[{"type":"decision_bottleneck"}]'::jsonb
                         AND jh.derived_axes -> 'avoid_traits' ?| ARRAY['g']
                    THEN 'decision_bottleneck ↔ avoid_g'
                    WHEN cp.derived_risk_flags @> '[{"type":"turnover_risk"}]'::jsonb
                         AND jh.derived_axes -> 'avoid_traits' ?| ARRAY['f']
                    THEN 'turnover_risk ↔ avoid_f'
                    ELSE NULL
                END
            ) AS risk_match

        FROM company_pool cp
    )
    SELECT
        s.tih_id,
        s.company_id,
        s.company_name,
        s.jd_id,
        s.position_title,
        s.score_axis,
        s.score_practical,
        -- 가중치: axis 60%, practical_fit 40% (industry/job_fn은 JH에 직접 필드 없음)
        (s.score_axis * 0.60 + s.score_practical * 0.40)::DOUBLE PRECISION AS score_total,
        s.risk_match
    FROM scored s
    ORDER BY score_total DESC;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

COMMENT ON FUNCTION hero_match_candidates_for_jh IS
'JH 응답 1건 → 매칭 기업/자리 후보 + 점수 (v2: 실제 axis 거리 + practical_fit, 60/40 가중치)';
