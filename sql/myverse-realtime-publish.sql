-- Supabase Realtime 활성화 — 알림 + DM 메시지
-- 클라이언트가 postgres_changes로 INSERT 이벤트를 받으려면 publication에 등록되어야 함.

ALTER PUBLICATION supabase_realtime ADD TABLE myverse_notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE myverse_dm_messages;
