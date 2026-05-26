-- MADLeap study-room — 스터디 프로그램 테이블
-- 운영진이 Intra UMS에서 직접 입력. 빈 DB일 때는 페이지에 "운영 중 스터디 없음" 표시.

CREATE TABLE IF NOT EXISTS madleap_study_programs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title           TEXT NOT NULL,
    description     TEXT,
    icon_name       TEXT DEFAULT 'BookOpen',
    tags            TEXT[] DEFAULT '{}',
    capacity        INTEGER DEFAULT 0,
    current_count   INTEGER DEFAULT 0,
    schedule        TEXT,
    day_label       TEXT,
    leader_name     TEXT,
    leader_school   TEXT,
    status          TEXT NOT NULL DEFAULT 'recruiting' CHECK (status IN ('recruiting', 'in_progress', 'closed')),
    semester        TEXT,
    curriculum      TEXT[] DEFAULT '{}',
    is_published    BOOLEAN DEFAULT true,
    sort_order      INTEGER DEFAULT 0,
    created_at      TIMESTAMPTZ DEFAULT now(),
    updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_madleap_study_sort ON madleap_study_programs(sort_order DESC, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_madleap_study_status ON madleap_study_programs(status);
CREATE INDEX IF NOT EXISTS idx_madleap_study_published ON madleap_study_programs(is_published) WHERE is_published;

ALTER TABLE madleap_study_programs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "study_programs public read" ON madleap_study_programs;
CREATE POLICY "study_programs public read" ON madleap_study_programs
    FOR SELECT USING (is_published = true);

DROP POLICY IF EXISTS "study_programs service_role write" ON madleap_study_programs;
CREATE POLICY "study_programs service_role write" ON madleap_study_programs
    FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

-- updated_at 자동 갱신
CREATE OR REPLACE FUNCTION update_madleap_study_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_madleap_study_updated_at ON madleap_study_programs;
CREATE TRIGGER trg_madleap_study_updated_at
    BEFORE UPDATE ON madleap_study_programs
    FOR EACH ROW EXECUTE FUNCTION update_madleap_study_updated_at();
