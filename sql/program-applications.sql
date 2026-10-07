-- 코어 프로그램 모듈 4단계 — 회차 참가 신청 (2026-10-08 적용, migration program_applications)
-- RooK 실전 프로젝트 · HeRo 프로그램처럼 "신청 → 운영진 선발" 회차용. 창구 사이트(MADLeague 등) 어디서 신청해도 주인 브랜드 데이터·동의.
-- 신청 = 주인 브랜드 참가 동의(member_brand_joins) 후. 받는 항목 최소: 지원 동기 · 포트폴리오 링크(선택). 이름·연락처는 계정(members)에서 — 복사하지 않는다 (데이터 계약 1조)
-- 승인 → program_participants(team_id NULL, joined_via 'apply') → 팀 회차면 운영진이 팀 배정

ALTER TABLE public.program_rounds ADD COLUMN IF NOT EXISTS applications_open boolean NOT NULL DEFAULT false;
GRANT SELECT (applications_open) ON public.program_rounds TO anon, authenticated;

CREATE TABLE IF NOT EXISTS public.program_applications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id text NOT NULL DEFAULT 'tenone',
    brand_id text NOT NULL REFERENCES public.ums_sites(slug),
    round_id uuid NOT NULL REFERENCES public.program_rounds(id) ON DELETE CASCADE,
    member_id uuid NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
    channel text,                       -- 신청한 창구 사이트 (madleague · rook · hero …) — 통계용
    motivation text NOT NULL,
    portfolio_url text,
    status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'withdrawn')),
    decided_at timestamptz,
    decided_by uuid REFERENCES public.members(id) ON DELETE SET NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (round_id, member_id)
);
CREATE INDEX IF NOT EXISTS program_applications_round_idx ON public.program_applications (round_id, status);
CREATE INDEX IF NOT EXISTS program_applications_member_idx ON public.program_applications (member_id);

ALTER TABLE public.program_applications ENABLE ROW LEVEL SECURITY;
-- 정책 없음 = anon·authenticated 접근 불가. 서버 API(service_role)만.
REVOKE ALL ON public.program_applications FROM anon, authenticated;
GRANT ALL ON public.program_applications TO service_role;
