-- MADLeague 지원서 — Ten:One ID(members.id) 연결 + 동의 기록 — 운영 적용 2026-10-06 (migration madleague_apply_member_link, 롤백 시뮬레이션 검증)
-- 데이터 계약 1: 지원자 식별 = members.id (이메일 매칭 제거)
-- 개인정보보호법 제15조: 지원서 추가 수집 항목 동의를 버전과 함께 기록
-- 기존 버그: year·university NOT NULL인데 API가 year를 넣지 않음 / 기업 지원은 대학 없음 → 지원서 제출 전부 실패

ALTER TABLE public.mad_applications
    ADD COLUMN IF NOT EXISTS member_id uuid REFERENCES public.members(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS consent jsonb;

CREATE INDEX IF NOT EXISTS idx_mad_applications_member_id ON public.mad_applications(member_id);

-- 기업 지원자는 대학이 없다
ALTER TABLE public.mad_applications ALTER COLUMN university DROP NOT NULL;

-- 본인 지원서 조회 (마이페이지 지원 상태). 쓰기는 service_role API만
DROP POLICY IF EXISTS mad_apps_read_own ON public.mad_applications;
CREATE POLICY mad_apps_read_own ON public.mad_applications
    FOR SELECT TO authenticated
    USING (member_id IS NOT NULL AND member_id = public.hero_current_member_id());

-- 기존 지원서 member_id 백필 (이메일이 확인된 계정과 일치하는 건만, 1회)
UPDATE public.mad_applications a
SET member_id = m.id
FROM public.members m
WHERE a.member_id IS NULL AND lower(m.email) = lower(a.email) AND m.auth_id IS NOT NULL;

GRANT SELECT, UPDATE ON public.mad_applications TO authenticated;
GRANT ALL ON public.mad_applications TO service_role;
