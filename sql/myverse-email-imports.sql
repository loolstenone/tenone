-- Gmail 임포트 캐시 — 5축 공통 컬럼 패턴 따름
-- 메일 본문은 보관하지 않고, 메타·요약·라우팅 결과만 저장

CREATE TABLE IF NOT EXISTS myverse_email_imports (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id         UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    provider          TEXT NOT NULL DEFAULT 'gmail',  -- gmail|outlook|imap…

    -- 메일 식별
    external_id       TEXT NOT NULL,           -- gmail message id
    thread_id         TEXT,                    -- gmail thread id
    sender_email      TEXT,
    sender_name       TEXT,
    subject           TEXT,
    snippet           TEXT,                    -- gmail snippet (200자 이내)
    received_at       TIMESTAMPTZ NOT NULL,
    labels            TEXT[] DEFAULT ARRAY[]::TEXT[],

    -- 라우팅 결과 (Triage)
    triage_state      TEXT NOT NULL DEFAULT 'inbox' CHECK (triage_state IN ('inbox', 'task', 'event', 'note', 'archive', 'discard')),
    converted_task_id UUID,                    -- triage → task일 때
    converted_event_id UUID,                   -- triage → event일 때

    -- AI 분류 (선택)
    auto_category     TEXT,                    -- receipt|invoice|invite|newsletter|personal|work
    auto_amount       NUMERIC,                 -- 영수증 자동 파싱 시 금액

    -- 5축 메타데이터
    time_axis         JSONB DEFAULT '{}'::JSONB,
    geo_axis          JSONB DEFAULT '{}'::JSONB,
    people_axis       UUID[] DEFAULT ARRAY[]::UUID[],
    content_axis      TEXT,
    context_axis      JSONB DEFAULT '{}'::JSONB,

    -- 공개 범위
    visibility        TEXT NOT NULL DEFAULT 'private' CHECK (visibility IN ('private', 'friends', 'public')),

    fetched_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE (member_id, provider, external_id)
);

CREATE INDEX IF NOT EXISTS idx_email_imports_member ON myverse_email_imports(member_id);
CREATE INDEX IF NOT EXISTS idx_email_imports_state  ON myverse_email_imports(member_id, triage_state);
CREATE INDEX IF NOT EXISTS idx_email_imports_recv   ON myverse_email_imports(member_id, received_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_imports_category ON myverse_email_imports(member_id, auto_category);

-- updated_at 트리거
CREATE OR REPLACE FUNCTION myverse_email_imports_touch()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_email_imports_touch ON myverse_email_imports;
CREATE TRIGGER trg_email_imports_touch
    BEFORE UPDATE ON myverse_email_imports
    FOR EACH ROW EXECUTE FUNCTION myverse_email_imports_touch();

-- RLS
ALTER TABLE myverse_email_imports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS email_imports_owner ON myverse_email_imports;
CREATE POLICY email_imports_owner ON myverse_email_imports
    USING (member_id IN (SELECT id FROM members WHERE auth_id = auth.uid()))
    WITH CHECK (member_id IN (SELECT id FROM members WHERE auth_id = auth.uid()));

COMMENT ON TABLE myverse_email_imports IS
    'Gmail 임포트 캐시 — 메일 메타·요약·triage 결과만 저장. 본문은 Gmail에서 직접 열람.';
