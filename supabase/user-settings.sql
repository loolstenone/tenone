-- =============================================
-- User Settings Table
-- Ten:One™ Universe 사용자 설정 저장소
-- localStorage → DB 전환
-- 2026-03-31
-- =============================================

-- 범용 사용자 설정 (key-value 스토어)
CREATE TABLE IF NOT EXISTS user_settings (
  id           TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  app          TEXT NOT NULL DEFAULT 'tenone',   -- tenone, smarcomm, wio, badak 등
  key          TEXT NOT NULL,                     -- 설정 키 (theme, favorites, etc.)
  value        JSONB NOT NULL DEFAULT '{}',       -- 설정 값 (자유 구조)
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, app, key)
);

-- RLS
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- 본인 설정만 읽기/쓰기
CREATE POLICY "users read own settings"
  ON user_settings FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "users write own settings"
  ON user_settings FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_user_settings_lookup
  ON user_settings(user_id, app, key);
