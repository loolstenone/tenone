-- 플래너'스 AI 1단계 ③ — 아침 Top 3 · 저녁 회고 질문 저장 칸 (2026-10-14)
-- 적용: 2026-10-14 MCP apply_migration (사용자 승인) `planners_ai_focus_reflection_2026_10` · 재실행 가능
--
-- myverse_daily 한 행 = 한 사람의 하루. 칸 두 개만 더한다 (새 테이블 없음 → RLS·GRANT는 기존 myverse_daily 그대로)
--   focus      : 아침 Top 3 — {"generated_at":"…","items":[{"task_id":"…","text":"…","reason":"…"}],"message":"…"}
--                같은 날 다시 열면 AI를 또 부르지 않고 이 값을 쓴다 (유료 AI 비용 절약)
--   reflection : 저녁 회고 — {"generated_at":"…","questions":[{"q":"…","a":"…"}]}
--                질문은 그날 기록(완료·미완료·일정·기분)으로 AI가 만들고, 답은 사용자가 쓴다
-- 개인정보: 본인 플래너 기록과 같은 등급 (본인만 읽기 — 기존 myverse_daily RLS) · 탈퇴 시 myverse_daily 행과 함께 삭제
-- AI 처리 = Anthropic(미국) 국외 이전 → 개인정보처리방침 반영 필요 (공개 전 6단계)

ALTER TABLE public.myverse_daily ADD COLUMN IF NOT EXISTS focus jsonb;
ALTER TABLE public.myverse_daily ADD COLUMN IF NOT EXISTS reflection jsonb;

COMMENT ON COLUMN public.myverse_daily.focus IS '플래너''스 AI 아침 Top 3 (AI 생성 캐시)';
COMMENT ON COLUMN public.myverse_daily.reflection IS '플래너''스 AI 저녁 회고 질문과 사용자 답';

-- 되돌리기: ALTER TABLE public.myverse_daily DROP COLUMN IF EXISTS focus; ALTER TABLE public.myverse_daily DROP COLUMN IF EXISTS reflection;
