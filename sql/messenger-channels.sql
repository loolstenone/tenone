-- ============================================================
-- 메신저 채널 시스템 — DB 스키마 확장
-- 날짜: 2026-04-03
-- 원칙: 기존 chat_threads/chat_messages 확장. 신규 테이블 생성 안 함.
-- ============================================================

-- 1. chat_threads에 채널 관련 컬럼 추가
ALTER TABLE chat_threads ADD COLUMN IF NOT EXISTS thread_type TEXT DEFAULT 'dm';
-- thread_type: 'dm' | 'group' | 'channel'
ALTER TABLE chat_threads ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE chat_threads ADD COLUMN IF NOT EXISTS agent_name TEXT;
-- agent_name: 채널 소유 에이전트 (agent_profiles.name 참조)

-- 2. chat_messages에 sender_type 추가
ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS sender_type TEXT DEFAULT 'human';
-- sender_type: 'human' | 'agent' | 'system'

-- 3. 기존 스레드 thread_type 업데이트
UPDATE chat_threads SET thread_type = CASE WHEN is_group THEN 'group' ELSE 'dm' END WHERE thread_type IS NULL OR thread_type = 'dm';

-- 4. 에이전트 채널 시드
INSERT INTO chat_threads (id, name, is_group, thread_type, description, agent_name, participants, tenant_id)
VALUES
  (gen_random_uuid(), '브리핑', true, 'channel', '열시일분 AM/PM 브리핑 — 매일 10:01 방향 제시·성과 보고', '1001', ARRAY[]::uuid[], 'tenone'),
  (gen_random_uuid(), '트렌드', true, 'channel', 'Whole See 트렌드 카드·크롤링 결과', 'mindle', ARRAY[]::uuid[], 'tenone'),
  (gen_random_uuid(), 'MADLeague', true, 'channel', '레드 MADLeague 운영 현황', 'madleague', ARRAY[]::uuid[], 'tenone'),
  (gen_random_uuid(), 'Badak', true, 'channel', '쇠봇 Badak 방 모니터링', 'badak', ARRAY[]::uuid[], 'tenone'),
  (gen_random_uuid(), '일반', true, 'channel', '일반 공지·소통', NULL, ARRAY[]::uuid[], 'tenone')
ON CONFLICT DO NOTHING;

-- 5. 인덱스
CREATE INDEX IF NOT EXISTS idx_chat_threads_type ON chat_threads(thread_type);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender_type ON chat_messages(sender_type);
