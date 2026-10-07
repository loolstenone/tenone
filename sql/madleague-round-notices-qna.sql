-- ============================================================
-- MADLeague 회차(경쟁 PT·프로젝트) 공지 · Q&A
-- 작성: 2026-10-08 · 적용: MCP apply_migration `madleague_round_notices_qna`
--
-- 열람: 그 회차 팀원 · 직원 · (3단계) 클라이언트 — 서버 API가 권한 확인 후 service_role로 읽음
-- 비밀 Q&A: 질문한 팀 · 직원 · 클라이언트만. 공개 Q&A: 회차 참여자 전체 (질문자는 팀 이름으로만 표시)
-- 답변: 직원 · 클라이언트
-- anon·authenticated 권한 없음 (RLS 활성 + 정책 없음 = 클라이언트 직접 접근 차단)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.mad_round_notices (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id text NOT NULL DEFAULT 'tenone',
    brand_id text NOT NULL DEFAULT 'madleague',
    competition_id uuid NOT NULL REFERENCES public.mad_competitions(id) ON DELETE CASCADE,
    title text NOT NULL,
    body text,
    pinned boolean NOT NULL DEFAULT false,
    author_member_id uuid REFERENCES public.members(id) ON DELETE SET NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS mad_round_notices_comp_idx ON public.mad_round_notices (competition_id, pinned DESC, created_at DESC);

CREATE TABLE IF NOT EXISTS public.mad_round_questions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id text NOT NULL DEFAULT 'tenone',
    brand_id text NOT NULL DEFAULT 'madleague',
    competition_id uuid NOT NULL REFERENCES public.mad_competitions(id) ON DELETE CASCADE,
    team_id uuid REFERENCES public.mad_competition_teams(id) ON DELETE SET NULL,
    asker_member_id uuid REFERENCES public.members(id) ON DELETE SET NULL,
    title text NOT NULL,
    body text,
    is_private boolean NOT NULL DEFAULT false,
    status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'answered')),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS mad_round_questions_comp_idx ON public.mad_round_questions (competition_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.mad_round_answers (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id text NOT NULL DEFAULT 'tenone',
    brand_id text NOT NULL DEFAULT 'madleague',
    question_id uuid NOT NULL REFERENCES public.mad_round_questions(id) ON DELETE CASCADE,
    author_member_id uuid REFERENCES public.members(id) ON DELETE SET NULL,
    author_role text NOT NULL CHECK (author_role IN ('staff', 'client')),
    body text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS mad_round_answers_q_idx ON public.mad_round_answers (question_id, created_at);

ALTER TABLE public.mad_round_notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mad_round_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mad_round_answers ENABLE ROW LEVEL SECURITY;

-- GRANT — 서버(service_role)만. 기본 권한으로 열린 anon·authenticated 회수
REVOKE ALL ON public.mad_round_notices, public.mad_round_questions, public.mad_round_answers FROM anon, authenticated;
GRANT ALL ON public.mad_round_notices, public.mad_round_questions, public.mad_round_answers TO service_role;

-- 롤백: DROP TABLE public.mad_round_answers, public.mad_round_questions, public.mad_round_notices;
