-- ────────────────────────────────────────────────────────────────
-- HeRo Matching Engine v3 — HIT B 결과 통합 (2026-04-23)
--
-- v2 대비 개선:
--   1. hero_match_candidates_for_tih: readiness_grade 가중치 추가
--      출력에 holland_code, readiness_grade, competency_track 포함
--   2. hero_match_candidates_for_jh: 동일 출력 확장 (점수 구조 유지)
--
-- 가중치 (for_tih):
--   axis_distance   35% (v2: 40%)
--   readiness       20% (신규 — HIT B readiness_grade)
--   industry        15% (v2: 20%)
--   job_function    15% (v2: 20%)
--   practical_fit   15% (v2: 20%)
--
-- readiness 점수 변환: A=100, B=75, C=50, D=25, NULL=50(중립)
-- ────────────────────────────────────────────────────────────────

-- ─── 기존 함수 제거 (반환 타입 변경 시 DROP 필요) ─────────────────
DROP FUNCTION IF EXISTS hero_match_candidates_for_tih(UUID);
DROP FUNCTION IF EXISTS hero_match_candidates_for_jh(UUID);

-- ─── 헬퍼: readiness_grade → 점수 ───────────────────────────────
CREATE OR REPLACE FUNCTION _hero_readiness_score(_grade TEXT)
RETURNS DOUBLE PRECISION AS $$
BEGIN
    RETURN CASE _grade
        WHEN 'A' THEN 100.0
        WHEN 'B' THEN 75.0
        WHEN 'C' THEN 50.0
        WHEN 'D' THEN 25.0
        ELSE 50.0  -- NULL / 미검사 → 중립
    END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ─── TIH 기반 인재 후보 (v3) ─────────────────────────────────────
CREATE OR REPLACE FUNCTION hero_match_candidates_for_tih(_tih_id UUID)
RETURNS TABLE (
    member_id           UUID,
    jh_id               UUID,
    hit_a_result_id     UUID,
    hit_b_result_id     UUID,
    holland_code        TEXT,
    readiness_grade     TEXT,
    competency_track    TEXT,
    score_industry      INTEGER,
    score_job_function  INTEGER,
    score_axis          DOUBLE PRECISION,
    score_readiness     DOUBLE PRECISION,
    score_practical     DOUBLE PRECISION,
    score_total         DOUBLE PRECISION,
    risk_match          JSONB
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
            jh.id                               AS jh_id,
            hp.hit_a_result_id,
            hp.hit_b_result_id,
            hb.holland_code,
            hb.readiness_grade,
            hb.competency_track,
            jh.derived_axes,
            jh.practical_filters
        FROM hero_jh_responses jh
        LEFT JOIN hero_profiles hp  ON hp.member_id = jh.member_id
        LEFT JOIN hit_b_results hb  ON hb.id = hp.hit_b_result_id
        WHERE jh.status = 'active'
    ),
    scored AS (
        SELECT
            c.member_id,
            c.jh_id,
            c.hit_a_result_id,
            c.hit_b_result_id,
            c.holland_code,
            c.readiness_grade,
            c.competency_track,

            CASE WHEN tih.derived_industry IS NOT NULL THEN 50 ELSE 0 END
                AS score_industry,

            CASE WHEN tih.derived_job_function IS NOT NULL THEN 50 ELSE 0 END
                AS score_job_function,

            _hero_axis_score(
                tih.derived_guardian, tih.derived_pioneer, tih.derived_connector,
                CASE c.derived_axes ->> 'preferred_state'
                    WHEN 'a' THEN 60 WHEN 'b' THEN 20 WHEN 'c' THEN 20 WHEN 'd' THEN 33 ELSE NULL END,
                CASE c.derived_axes ->> 'preferred_state'
                    WHEN 'a' THEN 20 WHEN 'b' THEN 60 WHEN 'c' THEN 20 WHEN 'd' THEN 33 ELSE NULL END,
                CASE c.derived_axes ->> 'preferred_state'
                    WHEN 'a' THEN 20 WHEN 'b' THEN 20 WHEN 'c' THEN 60 WHEN 'd' THEN 34 ELSE NULL END
            ) AS score_axis,

            _hero_readiness_score(c.readiness_grade) AS score_readiness,

            50.0::DOUBLE PRECISION AS score_practical,

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
        s.holland_code,
        s.readiness_grade,
        s.competency_track,
        s.score_industry,
        s.score_job_function,
        s.score_axis,
        s.score_readiness,
        s.score_practical,
        -- v3: readiness 20% 추가, 나머지 비율 조정
        (s.score_industry      * 0.15
         + s.score_job_function * 0.15
         + s.score_axis         * 0.35
         + s.score_readiness    * 0.20
         + s.score_practical    * 0.15
        )::DOUBLE PRECISION AS score_total,
        s.risk_match
    FROM scored s
    ORDER BY score_total DESC;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

COMMENT ON FUNCTION hero_match_candidates_for_tih IS
'TIH 응답 1건 → 매칭 인재 후보 + 점수 (v3: readiness 20% 추가, 가중치 35/20/15/15/15)';

-- ─── JH 기반 기업/자리 후보 (v3 — 구조 동일, HIT B 출력만 추가) ──
-- JH 사람이 공고를 찾을 때는 JD에 required_holland/track 필드가 없어
-- holland_code/competency_track 점수화는 미구현 (JD 확장 시 v4에서 추가)
-- score 구조는 v2와 동일하되, 함수 시그니처 통일을 위해 v3으로 재정의
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

            _hero_axis_score(
                cp.derived_guardian, cp.derived_pioneer, cp.derived_connector,
                CASE jh.derived_axes ->> 'preferred_state'
                    WHEN 'a' THEN 60 WHEN 'b' THEN 20 WHEN 'c' THEN 20 WHEN 'd' THEN 33 ELSE NULL END,
                CASE jh.derived_axes ->> 'preferred_state'
                    WHEN 'a' THEN 20 WHEN 'b' THEN 60 WHEN 'c' THEN 20 WHEN 'd' THEN 33 ELSE NULL END,
                CASE jh.derived_axes ->> 'preferred_state'
                    WHEN 'a' THEN 20 WHEN 'b' THEN 20 WHEN 'c' THEN 60 WHEN 'd' THEN 34 ELSE NULL END
            ) AS score_axis,

            _hero_practical_fit(jh.practical_filters, cp.company_size)
                AS score_practical,

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
        (s.score_axis * 0.60 + s.score_practical * 0.40)::DOUBLE PRECISION AS score_total,
        s.risk_match
    FROM scored s
    ORDER BY score_total DESC;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

COMMENT ON FUNCTION hero_match_candidates_for_jh IS
'JH 응답 1건 → 매칭 기업/자리 후보 + 점수 (v3: 함수 구조 v2와 동일, 60/40 가중치)';
