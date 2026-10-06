-- 예시 뉴스레터 9건 삭제
-- 적용일: 2026-10-05 (Supabase MCP apply_migration: remove_dummy_newsletter_issues, 사용자 승인)
-- 근거: recipient_count 342 등 표기됐으나 total_sent 0 · email_sends 0 — 실발송 없는 예시·빈 초안. 참조 FK 없음
-- 'scheduled' 1건은 발송 cron이 실제 발송할 위험이 있어 함께 삭제. 구독자 1명(hero 출처)은 실데이터라 유지
delete from newsletter_issues;
