-- Phase 5: 프로젝트 회고 (5F) 저장
ALTER TABLE myverse_projects
    ADD COLUMN IF NOT EXISTS retrospective jsonb;

-- retrospective JSON 형식:
-- {
--   "fact": "이 프로젝트에서 무엇을 했는가",
--   "feeling": "어떤 감정·경험이었는가",
--   "finding": "무엇을 배웠는가 (Identity Key Results 후보)",
--   "future": "다음에 어떻게 할 것인가",
--   "feedback": "팀·자신·세상에게 줄 피드백",
--   "completed_at": "2026-04-27T..."
-- }
