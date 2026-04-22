-- ────────────────────────────────────────────────────────────────
-- HeRo Matching Tetrad: JD · JH 인프라
-- Phase 2-1 · 2026-04-22
--
-- JD (Job Description) — 기업이 작성하는 자리의 서술 (7블록)
-- JH (Job Hope)        — 개인이 작성하는 자리의 바람 (12문항)
--
-- 설계 단일 진실 소스: docs/HeRo_Matching_Tetrad_v1.md
-- ────────────────────────────────────────────────────────────────

-- ─── JD : Job Description ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS hero_jd (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID NOT NULL REFERENCES hero_companies(id) ON DELETE CASCADE,
    tih_response_id UUID REFERENCES hero_tih_responses(id) ON DELETE SET NULL,
    author_member_id UUID REFERENCES members(id) ON DELETE SET NULL,

    -- 블록 1: 타이틀
    position_title TEXT NOT NULL,
    summary TEXT,

    -- 블록 2~7: 서사형 블록 (JSONB 유연 스키마)
    -- block2: "우리는 지금" · block3: "풀어야 하는 문제" · block4: "실제 하게 되는 일"
    -- block5: "어울리는 사람" · block6: "함께 일할 사람들" · block7: "조건과 환경"
    blocks JSONB NOT NULL DEFAULT '{}'::jsonb,

    -- 상태
    status TEXT NOT NULL DEFAULT 'draft'
        CHECK (status IN ('draft', 'published', 'archived')),

    -- 파생 벡터 (Phase 4 매칭 엔진에서 계산)
    derived_vector JSONB DEFAULT '{}'::jsonb,

    -- 기간·경력
    employment_type TEXT,                         -- full_time / contract / freelance
    experience_range TEXT,                        -- "3~5년", "10년+"

    tenant_id TEXT DEFAULT 'tenone',
    published_at TIMESTAMPTZ,
    archived_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE hero_jd IS 'JD 7블록 · 기업 작성 · TIH와 함께 매칭 입력';
COMMENT ON COLUMN hero_jd.blocks IS '{
  "block2_now": "...",
  "block3_problems": ["...", "..."],
  "block4_work_6m": "...",
  "block4_work_mid": "...",
  "block4_non_jd": "...",
  "block5_axes_summary": "...",
  "block5_competencies": ["..."],
  "block5_experience_texture": "...",
  "block6_leader": "...",
  "block6_team": "...",
  "block6_interface": "...",
  "block7_employment": "...",
  "block7_location": "...",
  "block7_compensation_range": "...",
  "block7_culture_point": "..."
}';

CREATE INDEX IF NOT EXISTS hero_jd_company_idx ON hero_jd(company_id);
CREATE INDEX IF NOT EXISTS hero_jd_status_idx ON hero_jd(status);
CREATE INDEX IF NOT EXISTS hero_jd_tih_idx ON hero_jd(tih_response_id) WHERE tih_response_id IS NOT NULL;

-- ─── JH : Job Hope ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS hero_jh_responses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,

    -- 12문항 + 자유서술 1 (응답 구조는 JSONB 유연)
    -- {
    --   "jh1": ["a","c"],         // 택2
    --   "jh2": "b",
    --   "jh3": ["a","d","f"],     // 택3
    --   "jh4": "e",
    --   "jh5": "b",
    --   "jh6": "a",
    --   "jh7": "c",
    --   "jh8": "b",
    --   "jh9": "c",
    --   "jh10": ["b","e"],        // 택2
    --   "jh11": ["a","g"],        // 택2
    --   "jh12": "자유서술..."
    -- }
    responses JSONB NOT NULL DEFAULT '{}'::jsonb,

    -- 실무 매칭 필드 (JH와 분리된 별도 영역, Tetrad 문서 참조)
    practical_filters JSONB DEFAULT '{}'::jsonb,
    -- {
    --   "company_size_ranges": ["small","medium"],
    --   "company_stages": ["seed","growth"],
    --   "work_mode": "hybrid",           // remote / hybrid / onsite / any
    --   "locations": ["서울","경기"],
    --   "compensation_floor": 60000000,
    --   "compensation_floor_public": false,
    --   "excluded_industries": ["담배","도박"]
    -- }

    -- 파생 좌표 (Phase 4에서 계산)
    derived_axes JSONB DEFAULT '{}'::jsonb,

    status TEXT NOT NULL DEFAULT 'active'
        CHECK (status IN ('draft', 'active', 'paused', 'archived')),

    tenant_id TEXT DEFAULT 'tenone',
    submitted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),

    UNIQUE (member_id)
);

COMMENT ON TABLE hero_jh_responses IS 'JH 12문항 · 개인 작성 · HIT과 함께 매칭 입력';
CREATE INDEX IF NOT EXISTS hero_jh_responses_status_idx ON hero_jh_responses(status) WHERE status = 'active';

-- ─── updated_at 자동 갱신 ────────────────────────────────────────
CREATE OR REPLACE FUNCTION hero_touch_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at := now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS hero_jd_updated ON hero_jd;
CREATE TRIGGER hero_jd_updated
    BEFORE UPDATE ON hero_jd
    FOR EACH ROW EXECUTE FUNCTION hero_touch_updated_at();

DROP TRIGGER IF EXISTS hero_jh_updated ON hero_jh_responses;
CREATE TRIGGER hero_jh_updated
    BEFORE UPDATE ON hero_jh_responses
    FOR EACH ROW EXECUTE FUNCTION hero_touch_updated_at();

-- ─── RLS 정책 ────────────────────────────────────────────────────

ALTER TABLE hero_jd ENABLE ROW LEVEL SECURITY;

-- 같은 기업 담당자만 열람 가능
DROP POLICY IF EXISTS hero_jd_company_read ON hero_jd;
CREATE POLICY hero_jd_company_read ON hero_jd
    FOR SELECT TO authenticated
    USING (
        company_id IN (
            SELECT company_id FROM hero_company_members
            WHERE member_id = auth.uid() AND status = 'active'
        )
    );

DROP POLICY IF EXISTS hero_jd_service_all ON hero_jd;
CREATE POLICY hero_jd_service_all ON hero_jd
    FOR ALL TO service_role
    USING (true) WITH CHECK (true);

ALTER TABLE hero_jh_responses ENABLE ROW LEVEL SECURITY;

-- 본인만 자기 JH 조회·수정
DROP POLICY IF EXISTS hero_jh_owner ON hero_jh_responses;
CREATE POLICY hero_jh_owner ON hero_jh_responses
    FOR ALL TO authenticated
    USING (member_id = auth.uid())
    WITH CHECK (member_id = auth.uid());

DROP POLICY IF EXISTS hero_jh_service_all ON hero_jh_responses;
CREATE POLICY hero_jh_service_all ON hero_jh_responses
    FOR ALL TO service_role
    USING (true) WITH CHECK (true);
