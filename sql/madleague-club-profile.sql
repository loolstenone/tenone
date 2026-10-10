-- MADLeague 동아리 소개 페이지 템플릿 (2026-10-10 적용)
-- 동아리 운영진이 직접 고치는 소개 내용 — 슬로건·소개·팀·활동·프로젝트·수상·모집 안내·채널
-- 형식: types/madleague-club-profile.ts ClubProfile · 쓰기 = /api/madleague/clubs/{slug}/profile (운영진·직원, 서버 검증)
-- 공개 정보만 담는다: 개인 휴대폰 번호·개인 이름 칸 없음 (대표 이메일·채널만)

ALTER TABLE public.mad_clubs ADD COLUMN IF NOT EXISTS profile jsonb NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE public.mad_clubs ADD COLUMN IF NOT EXISTS profile_updated_at timestamptz;
ALTER TABLE public.mad_clubs ADD COLUMN IF NOT EXISTS profile_updated_by uuid REFERENCES public.members(id) ON DELETE SET NULL;

COMMENT ON COLUMN public.mad_clubs.profile IS '동아리 소개 템플릿 (types/madleague-club-profile.ts) — 운영진 편집, 공개';
