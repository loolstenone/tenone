-- SmarComm AIRM (AI Reputation Management) — V2.0 § 3-C
--
-- 4단계 워크플로우:
--   ① 발견 (Detection) — 정기 재진단에서 부정/오답/혼동 자동 플래그
--   ② 분석 (Diagnosis) — 오정보 출처 추적
--   ③ 교정 (Cleansing) — 액션 큐 (위키·보도자료·인터뷰·Schema)
--   ④ 검증 (Verification) — 30일 후 재진단 → diff 비교
--
-- 정책: tenant_id 단위 격리, super_admin 전체 접근

-- ──────────────────────────────────────────────────────────────
-- 1. smarcomm_ai_flags — 발견된 부정·오답·혼동 답변
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS smarcomm_ai_flags (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id             TEXT NOT NULL,
    -- 원천 probe (어느 진단의 어느 응답)
    probe_scan_id         UUID REFERENCES smarcomm_scans(id) ON DELETE CASCADE,
    probe_answer_id       UUID REFERENCES smarcomm_ai_probes(id) ON DELETE SET NULL,
    platform              TEXT NOT NULL CHECK (platform IN (
                              'claude', 'chatgpt', 'perplexity', 'naver-cue', 'google-aio'
                          )),
    query                 TEXT NOT NULL,
    response_excerpt      TEXT NOT NULL,

    -- 발견 유형 (3축)
    flag_type             TEXT NOT NULL CHECK (flag_type IN (
                              'negative_sentiment',   -- 부정 답변
                              'wrong_fact',           -- 사실 오류
                              'competitor_confusion', -- 경쟁사 혼동
                              'missing_brand',        -- 마땅히 언급되어야 할 곳에서 누락
                              'outdated_info'         -- 옛 정보
                          )),
    severity              TEXT NOT NULL DEFAULT 'medium' CHECK (severity IN ('low','medium','high','critical')),
    -- 자동 분류 신뢰도 (0~1)
    confidence            REAL NOT NULL DEFAULT 0.5 CHECK (confidence BETWEEN 0 AND 1),

    -- 처리 상태
    status                TEXT NOT NULL DEFAULT 'open' CHECK (status IN (
                              'open',           -- 신규 발견
                              'in_review',      -- 검토 중
                              'in_action',      -- 교정 진행
                              'verified_fixed', -- 검증 완료
                              'wont_fix',       -- 미처리 결정
                              'duplicate'       -- 중복
                          )),
    notes                 TEXT,

    detected_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved_at           TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_smarcomm_ai_flags_tenant ON smarcomm_ai_flags(tenant_id);
CREATE INDEX IF NOT EXISTS idx_smarcomm_ai_flags_open ON smarcomm_ai_flags(tenant_id, status) WHERE status IN ('open','in_review','in_action');
CREATE INDEX IF NOT EXISTS idx_smarcomm_ai_flags_severity ON smarcomm_ai_flags(tenant_id, severity, status);
CREATE INDEX IF NOT EXISTS idx_smarcomm_ai_flags_scan ON smarcomm_ai_flags(probe_scan_id);

-- ──────────────────────────────────────────────────────────────
-- 2. smarcomm_ai_flag_sources — 오정보 추정 출처
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS smarcomm_ai_flag_sources (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    flag_id               UUID NOT NULL REFERENCES smarcomm_ai_flags(id) ON DELETE CASCADE,
    -- 출처 종류
    source_type           TEXT NOT NULL CHECK (source_type IN (
                              'webpage',          -- 일반 웹페이지
                              'wiki',             -- 위키 (잘못된 정보)
                              'news_article',     -- 뉴스 (옛 정보)
                              'social_post',      -- 소셜 (부정 글)
                              'forum_thread',     -- 포럼/커뮤니티
                              'review_site',      -- 리뷰 사이트
                              'official_doc',     -- 공식 문서 (자사도 포함)
                              'unknown'
                          )),
    url                   TEXT,
    title                 TEXT,
    excerpt               TEXT,
    -- 정확도 영향 추정 (high = AI가 이걸 보고 학습했을 가능성 높음)
    likelihood            TEXT NOT NULL DEFAULT 'possible' CHECK (likelihood IN ('certain','likely','possible','unlikely')),
    created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_smarcomm_ai_flag_sources_flag ON smarcomm_ai_flag_sources(flag_id);

-- ──────────────────────────────────────────────────────────────
-- 3. smarcomm_airm_actions — 교정 액션 큐
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS smarcomm_airm_actions (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    flag_id               UUID NOT NULL REFERENCES smarcomm_ai_flags(id) ON DELETE CASCADE,
    tenant_id             TEXT NOT NULL,
    -- 액션 유형
    action_type           TEXT NOT NULL CHECK (action_type IN (
                              'update_wiki',
                              'press_release',
                              'media_interview',
                              'schema_update',
                              'social_response',
                              'remove_old_content',
                              'submit_correction',
                              'create_content',
                              'other'
                          )),
    title                 TEXT NOT NULL,
    description           TEXT,
    -- 담당 역할 (§ 3-A SSOT-4 role 매핑)
    role                  TEXT NOT NULL CHECK (role IN ('marketer','dev','writer','designer','partner_team')),
    assignee_member_id    UUID REFERENCES members(id) ON DELETE SET NULL,

    -- 진행 상태
    status                TEXT NOT NULL DEFAULT 'todo' CHECK (status IN (
                              'todo','in_progress','blocked','done','cancelled'
                          )),
    -- 예상 영향 점수 (Awareness/Depth/Trust/Sentiment 어디에 +N점)
    expected_axis         TEXT CHECK (expected_axis IN ('awareness','depth','trust','sentiment')),
    expected_impact       INTEGER CHECK (expected_impact BETWEEN 0 AND 50),

    due_date              DATE,
    completed_at          TIMESTAMPTZ,

    created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_smarcomm_airm_actions_flag ON smarcomm_airm_actions(flag_id);
CREATE INDEX IF NOT EXISTS idx_smarcomm_airm_actions_tenant ON smarcomm_airm_actions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_smarcomm_airm_actions_status ON smarcomm_airm_actions(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_smarcomm_airm_actions_assignee ON smarcomm_airm_actions(assignee_member_id) WHERE assignee_member_id IS NOT NULL;

-- ──────────────────────────────────────────────────────────────
-- 4. smarcomm_ai_diff_events — AI 답변 변화 추적 (검증 단계)
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS smarcomm_ai_diff_events (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id             TEXT NOT NULL,
    flag_id               UUID REFERENCES smarcomm_ai_flags(id) ON DELETE SET NULL,
    -- 비교 대상 두 진단
    before_scan_id        UUID REFERENCES smarcomm_scans(id) ON DELETE CASCADE,
    after_scan_id         UUID REFERENCES smarcomm_scans(id) ON DELETE CASCADE,
    platform              TEXT NOT NULL,
    query                 TEXT NOT NULL,

    -- 변화 종류
    diff_type             TEXT NOT NULL CHECK (diff_type IN (
                              'improved',        -- 답변 개선 (sentiment 양수, accuracy 상승)
                              'degraded',        -- 악화
                              'unchanged',       -- 변화 없음
                              'sentiment_flip',  -- 부정→긍정 또는 반대
                              'fact_corrected',  -- 잘못된 사실 교정
                              'fact_introduced'  -- 새 잘못된 사실 등장
                          )),
    before_excerpt        TEXT,
    after_excerpt         TEXT,
    summary               TEXT,
    detected_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_smarcomm_ai_diff_tenant ON smarcomm_ai_diff_events(tenant_id);
CREATE INDEX IF NOT EXISTS idx_smarcomm_ai_diff_flag ON smarcomm_ai_diff_events(flag_id);

-- ──────────────────────────────────────────────────────────────
-- 5. 트리거: updated_at
-- ──────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION smarcomm_airm_touch_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_smarcomm_airm_actions_updated ON smarcomm_airm_actions;
CREATE TRIGGER trg_smarcomm_airm_actions_updated
    BEFORE UPDATE ON smarcomm_airm_actions
    FOR EACH ROW EXECUTE FUNCTION smarcomm_airm_touch_updated_at();

-- ──────────────────────────────────────────────────────────────
-- 6. RLS
-- ──────────────────────────────────────────────────────────────
ALTER TABLE smarcomm_ai_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE smarcomm_ai_flag_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE smarcomm_airm_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE smarcomm_ai_diff_events ENABLE ROW LEVEL SECURITY;

-- 발견 데이터는 워크스페이스 멤버 + super_admin 접근
DROP POLICY IF EXISTS "smarcomm_ai_flags_read" ON smarcomm_ai_flags;
CREATE POLICY "smarcomm_ai_flags_read" ON smarcomm_ai_flags
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM member_roles mr
            JOIN members m ON m.id = mr.member_id
            WHERE m.auth_id = auth.uid()
              AND mr.role IN ('staff','manager','super_admin','subscriber')
              AND mr.is_active = TRUE
        )
    );

DROP POLICY IF EXISTS "smarcomm_ai_flag_sources_read" ON smarcomm_ai_flag_sources;
CREATE POLICY "smarcomm_ai_flag_sources_read" ON smarcomm_ai_flag_sources
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM smarcomm_ai_flags f
            JOIN member_roles mr ON TRUE
            JOIN members m ON m.id = mr.member_id
            WHERE f.id = flag_id
              AND m.auth_id = auth.uid()
              AND mr.role IN ('staff','manager','super_admin','subscriber')
              AND mr.is_active = TRUE
        )
    );

DROP POLICY IF EXISTS "smarcomm_airm_actions_read" ON smarcomm_airm_actions;
CREATE POLICY "smarcomm_airm_actions_read" ON smarcomm_airm_actions
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM member_roles mr
            JOIN members m ON m.id = mr.member_id
            WHERE m.auth_id = auth.uid()
              AND mr.role IN ('staff','manager','super_admin','subscriber')
              AND mr.is_active = TRUE
        )
    );

DROP POLICY IF EXISTS "smarcomm_ai_diff_read" ON smarcomm_ai_diff_events;
CREATE POLICY "smarcomm_ai_diff_read" ON smarcomm_ai_diff_events
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM member_roles mr
            JOIN members m ON m.id = mr.member_id
            WHERE m.auth_id = auth.uid()
              AND mr.role IN ('staff','manager','super_admin','subscriber')
              AND mr.is_active = TRUE
        )
    );

-- INSERT/UPDATE는 service_role 경유

COMMENT ON TABLE smarcomm_ai_flags IS 'V2.0 § 3-C AIRM ① 발견 — 부정·오답·혼동 답변 자동 플래그';
COMMENT ON TABLE smarcomm_ai_flag_sources IS 'V2.0 § 3-C AIRM ② 분석 — 오정보 추정 출처';
COMMENT ON TABLE smarcomm_airm_actions IS 'V2.0 § 3-C AIRM ③ 교정 — 액션 큐 (role별 할당)';
COMMENT ON TABLE smarcomm_ai_diff_events IS 'V2.0 § 3-C AIRM ④ 검증 — AI 답변 변화 diff';
