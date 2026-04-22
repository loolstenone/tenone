-- ────────────────────────────────────────────────────────────────
-- HeRo Matching Engine v1 — 1차 공간 축소 + 2차 하드 필터
-- Phase 4-5 · 2026-04-22
--
-- Tetrad 매칭 파이프라인:
--   [1차 공간 한정] TIH-0 × JH/HIT 기본 속성 → 매칭 공간 축소
--   [2차 하드 필터] JH 실무 필드 + TIH 블랙 플래그
--   [3차 의미 매칭] AI 큐레이션 (Phase 4-6, 별도)
--
-- 이 SQL은 1차 + 2차까지. AI 큐레이션은 애플리케이션 레이어에서 호출.
-- ────────────────────────────────────────────────────────────────

-- ─── 매칭 후보 계산 함수 ─────────────────────────────────────────
-- 입력: TIH 응답 ID (기업 측 자리)
-- 출력: 매칭 가능한 인재 풀 (hero_profiles × hero_jh_responses)
--       + 매칭 점수 breakdown
CREATE OR REPLACE FUNCTION hero_match_candidates_for_tih(_tih_id UUID)
RETURNS TABLE (
    member_id UUID,
    jh_id UUID,
    hit_a_result_id UUID,
    hit_b_result_id UUID,
    score_industry INTEGER,      -- 0 | 50 | 100
    score_job_function INTEGER,  -- 0 | 50 | 100
    score_axis_distance DOUBLE PRECISION, -- 0~100 (거리의 역수)
    score_total DOUBLE PRECISION,
    risk_match JSONB             -- TIH 블랙 플래그와 JH 회피 신호 교차 감지
) AS $$
DECLARE
    tih RECORD;
BEGIN
    -- TIH 벡터 로드
    SELECT t.derived_industry, t.derived_job_function,
           t.derived_guardian, t.derived_pioneer, t.derived_connector,
           t.derived_risk_flags
    INTO tih
    FROM hero_tih_responses t
    WHERE t.id = _tih_id;

    IF NOT FOUND THEN
        RETURN;
    END IF;

    RETURN QUERY
    SELECT
        hp.member_id,
        jh.id AS jh_id,
        hp.hit_a_result_id,
        hp.hit_b_result_id,

        -- 산업 매칭 (derived_axes.problem_focus에 연관 카테고리 있으면 가산)
        -- v1은 단순 — 차후 mapping 테이블 필요
        CASE
            WHEN tih.derived_industry IS NOT NULL THEN 50
            ELSE 0
        END AS score_industry,

        -- 직무 매칭 (JH 4번 "edge"가 직무와 관련 있는지)
        CASE
            WHEN tih.derived_job_function IS NOT NULL THEN 50
            ELSE 0
        END AS score_job_function,

        -- 3축 거리 — TIH 3축 ↔ JH preferred_state 기반 추정
        -- v1 단순화: JH preferred_state 'a'(지키는) → guardian 성향,
        --            'b'(여는) → pioneer 성향, 'c'(팀 속 자리) → connector 성향
        (
            100 - LEAST(100, (
                CASE jh.derived_axes ->> 'preferred_state'
                    WHEN 'a' THEN ABS(COALESCE(tih.derived_guardian, 33) - 60) + ABS(COALESCE(tih.derived_pioneer, 33) - 20) + ABS(COALESCE(tih.derived_connector, 34) - 20)
                    WHEN 'b' THEN ABS(COALESCE(tih.derived_guardian, 33) - 20) + ABS(COALESCE(tih.derived_pioneer, 33) - 60) + ABS(COALESCE(tih.derived_connector, 34) - 20)
                    WHEN 'c' THEN ABS(COALESCE(tih.derived_guardian, 33) - 20) + ABS(COALESCE(tih.derived_pioneer, 33) - 20) + ABS(COALESCE(tih.derived_connector, 34) - 60)
                    WHEN 'd' THEN ABS(COALESCE(tih.derived_guardian, 33) - 33) + ABS(COALESCE(tih.derived_pioneer, 33) - 33) + ABS(COALESCE(tih.derived_connector, 34) - 34)
                    ELSE 100
                END
            )::DOUBLE PRECISION / 2.0
        )) AS score_axis_distance,

        -- 종합 점수 (단순 평균 v1)
        (
            (CASE WHEN tih.derived_industry IS NOT NULL THEN 50.0 ELSE 0.0 END) * 0.25
            + (CASE WHEN tih.derived_job_function IS NOT NULL THEN 50.0 ELSE 0.0 END) * 0.25
            + 50.0 * 0.5  -- axis placeholder
        )::DOUBLE PRECISION AS score_total,

        -- 위험 매칭: TIH의 블랙 플래그와 JH의 피하고 싶은 조직(jh11)
        -- jh11: a=회피/덮는 곳, d=진실 숨기는 곳, g=결정 투명X
        -- TIH risk: turnover_risk, decision_bottleneck, blame_culture
        jsonb_build_object(
            'tih_flags', COALESCE(tih.derived_risk_flags, '[]'::jsonb),
            'jh_avoid', COALESCE(jh.derived_axes -> 'avoid_traits', '[]'::jsonb),
            'conflict', CASE
                WHEN tih.derived_risk_flags @> '[{"type":"blame_culture"}]'::jsonb
                     AND jh.derived_axes -> 'avoid_traits' ?| array['a']
                THEN 'blame_culture vs avoid_a'
                WHEN tih.derived_risk_flags @> '[{"type":"decision_bottleneck"}]'::jsonb
                     AND jh.derived_axes -> 'avoid_traits' ?| array['g']
                THEN 'decision_bottleneck vs avoid_g'
                WHEN tih.derived_risk_flags @> '[{"type":"turnover_risk"}]'::jsonb
                     AND jh.derived_axes -> 'avoid_traits' ?| array['f']
                THEN 'turnover_risk vs avoid_f'
                ELSE NULL
            END
        ) AS risk_match

    FROM hero_jh_responses jh
    LEFT JOIN hero_profiles hp ON hp.member_id = jh.member_id
    WHERE jh.status = 'active';
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

COMMENT ON FUNCTION hero_match_candidates_for_tih IS
'TIH 응답 1건에 대한 매칭 가능 인재 후보 + 점수 breakdown (1차+2차, v1 단순화)';

-- ─── 역방향 함수: 개인 JH 기반 기업 큐레이션 ───────────────────
CREATE OR REPLACE FUNCTION hero_match_candidates_for_jh(_jh_id UUID)
RETURNS TABLE (
    tih_id UUID,
    company_id UUID,
    company_name TEXT,
    jd_id UUID,
    jd_position_title TEXT,
    score_total DOUBLE PRECISION,
    risk_match JSONB
) AS $$
DECLARE
    jh RECORD;
BEGIN
    SELECT j.derived_axes, j.practical_filters INTO jh
    FROM hero_jh_responses j
    WHERE j.id = _jh_id;

    IF NOT FOUND THEN
        RETURN;
    END IF;

    RETURN QUERY
    SELECT
        t.id AS tih_id,
        t.company_id,
        c.company_name,
        jd.id AS jd_id,
        jd.position_title AS jd_position_title,
        -- 단순 점수 v1
        50.0::DOUBLE PRECISION AS score_total,
        jsonb_build_object(
            'tih_flags', COALESCE(t.derived_risk_flags, '[]'::jsonb),
            'jh_avoid', COALESCE(jh.derived_axes -> 'avoid_traits', '[]'::jsonb)
        ) AS risk_match
    FROM hero_tih_responses t
    LEFT JOIN hero_companies c ON c.id = t.company_id
    LEFT JOIN hero_jd jd ON jd.tih_response_id = t.id AND jd.status = 'published'
    WHERE t.status IN ('pending', 'reviewing');
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

COMMENT ON FUNCTION hero_match_candidates_for_jh IS
'JH 응답 1건에 대한 매칭 가능 기업/자리 큐레이션 (1차+2차, v1 단순화)';
