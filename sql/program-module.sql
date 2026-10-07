-- ============================================================
-- 코어 프로그램 모듈 — 회차 · 팀 · 참가자 · 제출 · 코멘트 · 결과 · 공지 · Q&A
-- 설계: docs/Program_Module.md · 작성: 2026-10-08 · 적용: MCP apply_migration `program_module`
--
-- 원칙: 기능은 하나(코어), 주인은 브랜드(brand_id → ums_sites.slug), 창구는 여러 곳(channels)
-- MADLeague 경쟁 PT(mad_*)에서 이전 — 같은 UUID 유지. 옛 mad_* 테이블 삭제는 배포 후 별도 (sql/program-module-drop-mad.sql)
-- 공개 읽기: 회차 기본 정보(brief_content 제외) · 팀 이름(invite_code 제외) · 발표된 결과(feedback 제외) — 컬럼 단위 GRANT
-- 그 외: anon·authenticated 권한 없음 (서버 API가 권한 확인 후 service_role로)
-- ============================================================

-- 1) 회차
CREATE TABLE IF NOT EXISTS public.program_rounds (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id text NOT NULL DEFAULT 'tenone',
    brand_id text NOT NULL REFERENCES public.ums_sites(slug) ON UPDATE CASCADE,
    channels text[] NOT NULL DEFAULT '{}',
    kind text NOT NULL DEFAULT 'competition' CHECK (kind IN ('competition', 'project', 'program', 'course')),
    mode text NOT NULL DEFAULT 'team' CHECK (mode IN ('team', 'individual')),
    slug text,
    title text NOT NULL,
    year integer,
    client_name text,
    client_logo_url text,
    cover_url text,
    brief_title text,
    brief_content text,
    start_date date,
    end_date date,
    final_deadline date,
    presentation_date date,
    status text NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),
    form_id uuid REFERENCES public.forms(id) ON DELETE SET NULL,
    results_published_at timestamptz,
    context jsonb NOT NULL DEFAULT '{}',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.program_rounds IS '코어 프로그램 회차 — brand_id=데이터 주인, channels=노출 사이트';
COMMENT ON COLUMN public.program_rounds.end_date IS '예선(또는 단일) 제출 마감 (KST 23:59)';
COMMENT ON COLUMN public.program_rounds.final_deadline IS '본선 제출 마감 (KST 23:59)';
CREATE INDEX IF NOT EXISTS program_rounds_brand_idx ON public.program_rounds (brand_id, year DESC, created_at DESC);
CREATE INDEX IF NOT EXISTS program_rounds_channels_idx ON public.program_rounds USING gin (channels);

-- 2) 팀
CREATE TABLE IF NOT EXISTS public.program_teams (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id text NOT NULL DEFAULT 'tenone',
    brand_id text NOT NULL,
    round_id uuid NOT NULL REFERENCES public.program_rounds(id) ON DELETE CASCADE,
    name text NOT NULL,
    description text,
    is_finalist boolean NOT NULL DEFAULT false,
    invite_code text UNIQUE,
    context jsonb NOT NULL DEFAULT '{}',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);
COMMENT ON COLUMN public.program_teams.context IS '브랜드 전용 값 — MADLeague: {club_id}';
CREATE INDEX IF NOT EXISTS program_teams_round_idx ON public.program_teams (round_id, created_at);

-- 3) 참가자 — 한 회차에 한 사람 한 번
CREATE TABLE IF NOT EXISTS public.program_participants (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id text NOT NULL DEFAULT 'tenone',
    brand_id text NOT NULL,
    round_id uuid NOT NULL REFERENCES public.program_rounds(id) ON DELETE CASCADE,
    team_id uuid REFERENCES public.program_teams(id) ON DELETE CASCADE,
    member_id uuid NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
    role text NOT NULL DEFAULT 'member' CHECK (role IN ('leader', 'member')),
    joined_via text NOT NULL DEFAULT 'staff' CHECK (joined_via IN ('staff', 'officer', 'invite', 'apply')),
    joined_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (round_id, member_id)
);
CREATE INDEX IF NOT EXISTS program_participants_team_idx ON public.program_participants (team_id);
CREATE INDEX IF NOT EXISTS program_participants_member_idx ON public.program_participants (member_id);

-- 4) 제출물 — 팀 × 단계 1건 (개인 참가는 member × 단계)
CREATE TABLE IF NOT EXISTS public.program_submissions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id text NOT NULL DEFAULT 'tenone',
    brand_id text NOT NULL,
    round_id uuid NOT NULL REFERENCES public.program_rounds(id) ON DELETE CASCADE,
    team_id uuid REFERENCES public.program_teams(id) ON DELETE CASCADE,
    member_id uuid REFERENCES public.members(id) ON DELETE CASCADE,
    stage text NOT NULL DEFAULT 'prelim' CHECK (stage IN ('prelim', 'final')),
    title text NOT NULL,
    description text,
    presentation_url text,
    file_path text,
    file_name text,
    file_size bigint,
    status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'withdrawn')),
    submitted_at timestamptz,
    submitted_by uuid REFERENCES public.members(id) ON DELETE SET NULL,
    consent jsonb,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CHECK (team_id IS NOT NULL OR member_id IS NOT NULL)
);
COMMENT ON COLUMN public.program_submissions.file_path IS 'program-submissions 버킷 경로 (비공개 — API 서명 URL로만)';
CREATE UNIQUE INDEX IF NOT EXISTS program_submissions_team_stage_uniq ON public.program_submissions (team_id, stage) WHERE team_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS program_submissions_member_stage_uniq ON public.program_submissions (round_id, member_id, stage) WHERE team_id IS NULL;
CREATE INDEX IF NOT EXISTS program_submissions_round_idx ON public.program_submissions (round_id);

-- 5) 제출물 코멘트
CREATE TABLE IF NOT EXISTS public.program_submission_comments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id text NOT NULL DEFAULT 'tenone',
    brand_id text NOT NULL,
    submission_id uuid NOT NULL REFERENCES public.program_submissions(id) ON DELETE CASCADE,
    author_member_id uuid REFERENCES public.members(id) ON DELETE SET NULL,
    author_role text NOT NULL CHECK (author_role IN ('staff', 'client')),
    body text NOT NULL,
    visible_to_team boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS program_submission_comments_sub_idx ON public.program_submission_comments (submission_id, created_at);

-- 6) 결과 — team_name·context는 발표 기록 스냅샷
CREATE TABLE IF NOT EXISTS public.program_results (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id text NOT NULL DEFAULT 'tenone',
    brand_id text NOT NULL,
    round_id uuid NOT NULL REFERENCES public.program_rounds(id) ON DELETE CASCADE,
    team_id uuid REFERENCES public.program_teams(id) ON DELETE SET NULL,
    member_id uuid REFERENCES public.members(id) ON DELETE SET NULL,
    rank integer,
    award_name text,
    feedback text,
    team_name text,
    context jsonb NOT NULL DEFAULT '{}',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS program_results_team_uniq ON public.program_results (round_id, team_id) WHERE team_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS program_results_club_idx ON public.program_results ((context->>'club_id'));

-- 7) 공지 · Q&A
CREATE TABLE IF NOT EXISTS public.program_notices (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id text NOT NULL DEFAULT 'tenone',
    brand_id text NOT NULL,
    round_id uuid NOT NULL REFERENCES public.program_rounds(id) ON DELETE CASCADE,
    title text NOT NULL,
    body text,
    pinned boolean NOT NULL DEFAULT false,
    author_member_id uuid REFERENCES public.members(id) ON DELETE SET NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS program_notices_round_idx ON public.program_notices (round_id, pinned DESC, created_at DESC);

CREATE TABLE IF NOT EXISTS public.program_questions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id text NOT NULL DEFAULT 'tenone',
    brand_id text NOT NULL,
    round_id uuid NOT NULL REFERENCES public.program_rounds(id) ON DELETE CASCADE,
    team_id uuid REFERENCES public.program_teams(id) ON DELETE SET NULL,
    asker_member_id uuid REFERENCES public.members(id) ON DELETE SET NULL,
    title text NOT NULL,
    body text,
    is_private boolean NOT NULL DEFAULT false,
    status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'answered')),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS program_questions_round_idx ON public.program_questions (round_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.program_answers (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id text NOT NULL DEFAULT 'tenone',
    brand_id text NOT NULL,
    question_id uuid NOT NULL REFERENCES public.program_questions(id) ON DELETE CASCADE,
    author_member_id uuid REFERENCES public.members(id) ON DELETE SET NULL,
    author_role text NOT NULL CHECK (author_role IN ('staff', 'client')),
    body text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS program_answers_q_idx ON public.program_answers (question_id, created_at);

-- 8) RLS
ALTER TABLE public.program_rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.program_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.program_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.program_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.program_submission_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.program_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.program_notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.program_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.program_answers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS program_rounds_read ON public.program_rounds;
CREATE POLICY program_rounds_read ON public.program_rounds FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS program_teams_read ON public.program_teams;
CREATE POLICY program_teams_read ON public.program_teams FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS program_results_read ON public.program_results;
CREATE POLICY program_results_read ON public.program_results FOR SELECT TO anon, authenticated
    USING (EXISTS (SELECT 1 FROM public.program_rounds r WHERE r.id = round_id AND r.results_published_at IS NOT NULL));

-- 9) GRANT — 기본 권한 회수 후 공개 컬럼만
REVOKE ALL ON public.program_rounds, public.program_teams, public.program_participants, public.program_submissions,
    public.program_submission_comments, public.program_results, public.program_notices, public.program_questions, public.program_answers
    FROM anon, authenticated;
GRANT SELECT (id, tenant_id, brand_id, channels, kind, mode, slug, title, year, client_name, client_logo_url, cover_url, brief_title,
    start_date, end_date, final_deadline, presentation_date, status, results_published_at, created_at, updated_at)
    ON public.program_rounds TO anon, authenticated;
GRANT SELECT (id, brand_id, round_id, name, is_finalist, context, created_at) ON public.program_teams TO anon, authenticated;
GRANT SELECT (id, brand_id, round_id, team_id, rank, award_name, team_name, context, created_at) ON public.program_results TO anon, authenticated;
GRANT ALL ON public.program_rounds, public.program_teams, public.program_participants, public.program_submissions,
    public.program_submission_comments, public.program_results, public.program_notices, public.program_questions, public.program_answers
    TO service_role;

-- 10) 제출 파일 버킷 (비공개, 50MB)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('program-submissions', 'program-submissions', false, 52428800, ARRAY[
    'application/pdf', 'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/x-iwork-keynote-sffkey', 'application/zip', 'application/x-zip-compressed',
    'image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'application/octet-stream'
])
ON CONFLICT (id) DO UPDATE SET public = false, file_size_limit = EXCLUDED.file_size_limit, allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 11) MADLeague 경쟁 PT 데이터 이전 (같은 UUID, 재실행 안전)
INSERT INTO public.program_rounds (id, tenant_id, brand_id, channels, kind, mode, slug, title, year, client_name, client_logo_url, cover_url,
    brief_title, brief_content, start_date, end_date, final_deadline, presentation_date, status, form_id, results_published_at, created_at, updated_at)
SELECT id, tenant_id, 'madleague', ARRAY['madleague'], kind, 'team', slug, title, year, client_name, client_logo_url, cover_url,
    brief_title, brief_content, start_date, end_date, final_deadline, presentation_date, status, form_id, results_published_at, created_at, updated_at
FROM public.mad_competitions ON CONFLICT (id) DO NOTHING;

INSERT INTO public.program_teams (id, tenant_id, brand_id, round_id, name, description, is_finalist, context, created_at, updated_at)
SELECT id, tenant_id, 'madleague', competition_id, name, description, is_finalist,
    CASE WHEN club_id IS NULL THEN '{}'::jsonb ELSE jsonb_build_object('club_id', club_id) END, created_at, updated_at
FROM public.mad_competition_teams ON CONFLICT (id) DO NOTHING;

INSERT INTO public.program_participants (id, tenant_id, brand_id, round_id, team_id, member_id, role, joined_via, joined_at)
SELECT m.id, m.tenant_id, 'madleague', t.competition_id, m.team_id, m.member_id, m.role, 'staff', m.joined_at
FROM public.mad_team_members m JOIN public.mad_competition_teams t ON t.id = m.team_id
ON CONFLICT DO NOTHING;

INSERT INTO public.program_submissions (id, tenant_id, brand_id, round_id, team_id, stage, title, description, presentation_url, file_path,
    file_name, file_size, status, submitted_at, submitted_by, consent, created_at, updated_at)
SELECT id, tenant_id, 'madleague', competition_id, team_id, stage, title, description, presentation_url, file_url,
    file_name, file_size, status, submitted_at, submitted_by, consent, created_at, updated_at
FROM public.mad_submissions ON CONFLICT (id) DO NOTHING;

INSERT INTO public.program_submission_comments (id, tenant_id, brand_id, submission_id, author_member_id, author_role, body, visible_to_team, created_at)
SELECT id, tenant_id, 'madleague', submission_id, author_member_id, author_role, body, visible_to_team, created_at
FROM public.mad_submission_comments ON CONFLICT (id) DO NOTHING;

INSERT INTO public.program_results (id, tenant_id, brand_id, round_id, team_id, rank, award_name, feedback, team_name, context, created_at)
SELECT id, tenant_id, 'madleague', competition_id, team_id, rank, award_name, feedback, team_name,
    CASE WHEN club_id IS NULL THEN '{}'::jsonb ELSE jsonb_build_object('club_id', club_id) END, created_at
FROM public.mad_competition_results ON CONFLICT (id) DO NOTHING;

INSERT INTO public.program_notices (id, tenant_id, brand_id, round_id, title, body, pinned, author_member_id, created_at, updated_at)
SELECT id, tenant_id, 'madleague', competition_id, title, body, pinned, author_member_id, created_at, updated_at
FROM public.mad_round_notices ON CONFLICT (id) DO NOTHING;

INSERT INTO public.program_questions (id, tenant_id, brand_id, round_id, team_id, asker_member_id, title, body, is_private, status, created_at, updated_at)
SELECT id, tenant_id, 'madleague', competition_id, team_id, asker_member_id, title, body, is_private, status, created_at, updated_at
FROM public.mad_round_questions ON CONFLICT (id) DO NOTHING;

INSERT INTO public.program_answers (id, tenant_id, brand_id, question_id, author_member_id, author_role, body, created_at)
SELECT id, tenant_id, 'madleague', question_id, author_member_id, author_role, body, created_at
FROM public.mad_round_answers ON CONFLICT (id) DO NOTHING;

-- 클라이언트 연결 capability: context.competition_id → round_id (이전 시점 0건)
UPDATE public.member_capability_roles SET context = context || jsonb_build_object('round_id', context->>'competition_id')
WHERE context ? 'competition_id' AND NOT context ? 'round_id';
CREATE INDEX IF NOT EXISTS mcr_program_round_client_idx ON public.member_capability_roles ((context->>'round_id'))
    WHERE capability_key = 'showcase' AND valid_until IS NULL;

-- 롤백: DROP TABLE public.program_answers, public.program_questions, public.program_notices, public.program_results,
--        public.program_submission_comments, public.program_submissions, public.program_participants, public.program_teams, public.program_rounds;
--        DELETE FROM storage.buckets WHERE id = 'program-submissions';  (비어 있을 때)
