-- Myverse Phase 0-D: 자동 캡처 사용자 동의 토글
-- 적용일: 2026-05-04
--
-- 3티어 원칙:
--   기본 ON: 사용자가 직접 입력·업로드한 데이터 (능동 캡처)
--   기본 OFF·명시 동의: 갤러리·GPS·캘린더·헬스·메일 등 백그라운드 수집
--   절대 금지: 마이크 상시 녹음·화면 캡처·키보드 모니터링

ALTER TABLE planners_users
    ADD COLUMN IF NOT EXISTS auto_capture_consent JSONB DEFAULT '{
        "gallery_scan":      false,
        "gps_background":    false,
        "calendar_sync":     false,
        "healthkit":         false,
        "google_fit":        false,
        "samsung_health":    false,
        "email_receipts":    false,
        "stt_recording":     false,
        "ocr_auto":          false,
        "vision_classify":   false
    }'::jsonb;

-- 동의 변경 이력 (감사 추적)
CREATE TABLE IF NOT EXISTS myverse_consent_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    consent_key TEXT NOT NULL,          -- 'gallery_scan' 등
    granted BOOLEAN NOT NULL,
    user_agent TEXT,
    changed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_consent_log_member
    ON myverse_consent_log(member_id, changed_at DESC);

ALTER TABLE myverse_consent_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS consent_log_self ON myverse_consent_log;
CREATE POLICY consent_log_self ON myverse_consent_log
    FOR ALL USING (
        member_id IN (SELECT id FROM members WHERE auth_id = auth.uid())
    );
