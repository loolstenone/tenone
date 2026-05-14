-- SmarComm 스캔 결과 영속 저장 테이블
-- Phase 4 ③ — 주간 자동 재진단 기반

CREATE TABLE IF NOT EXISTS smarcomm_scan_results (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    url             text NOT NULL,
    domain          text NOT NULL,
    industry        text NOT NULL DEFAULT 'general',
    findability     integer NOT NULL,
    trust           integer NOT NULL,
    citability      integer NOT NULL,
    index_score     integer NOT NULL,
    grade           text NOT NULL,
    breakdown       jsonb,
    benchmark       jsonb,
    scanned_at      timestamptz NOT NULL DEFAULT now(),
    next_scan_at    timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
    score_delta     integer,          -- 직전 대비 index 변화
    notified        boolean NOT NULL DEFAULT false
);

CREATE INDEX IF NOT EXISTS idx_smarcomm_scan_results_user_id ON smarcomm_scan_results(user_id);
CREATE INDEX IF NOT EXISTS idx_smarcomm_scan_results_next_scan ON smarcomm_scan_results(next_scan_at) WHERE next_scan_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_smarcomm_scan_results_domain ON smarcomm_scan_results(domain, scanned_at DESC);

ALTER TABLE smarcomm_scan_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "smarcomm_scan_results_select_own"
    ON smarcomm_scan_results FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "smarcomm_scan_results_insert_own"
    ON smarcomm_scan_results FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "smarcomm_scan_results_update_own"
    ON smarcomm_scan_results FOR UPDATE
    USING (user_id = auth.uid());
