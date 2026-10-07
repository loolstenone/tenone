-- ============================================================
-- MADLeague 프로그램 운영 (경쟁 PT 회차·팀·결과) — 매드리거 구조 개편 2단계
-- 작성: 2026-10-08
-- 적용: 2026-10-08 MCP apply_migration `madleague_programs_ops` (사용자 승인)
--
-- 1) 회차 ↔ 참가 신청 폼 연결 (forms 공통 모듈)
-- 2) 팀원 키 = members.id (데이터 계약 1조) — 기존 mad_members.id FK 교체. 적용 시점 mad_team_members 0행
-- 3) 팀원·제출물은 비공개 (본인·직원만 RLS, 매드리거 화면은 서버에서 입장 확인 후 service_role로 읽음)
--    회차·팀 이름·결과는 공개 유지 (명예의 전당)
-- 4) 쓰기는 인트라 API(service_role)만 — anon·authenticated 쓰기 권한 회수
-- ============================================================

-- 1) 참가 신청 폼 연결
ALTER TABLE public.mad_competitions
    ADD COLUMN IF NOT EXISTS form_id uuid REFERENCES public.forms(id) ON DELETE SET NULL;

-- 2) 팀원 키 교체 (0행일 때만 — 데이터가 있으면 중단)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM public.mad_team_members) THEN
        RAISE EXCEPTION 'mad_team_members에 데이터가 있어 키 교체를 중단합니다 (members.id 매핑 필요)';
    END IF;
END $$;
ALTER TABLE public.mad_team_members DROP CONSTRAINT IF EXISTS mad_team_members_member_id_fkey;
ALTER TABLE public.mad_team_members
    ADD CONSTRAINT mad_team_members_member_id_fkey FOREIGN KEY (member_id) REFERENCES public.members(id) ON DELETE CASCADE;
COMMENT ON COLUMN public.mad_team_members.member_id IS 'members.id (데이터 계약 1조, 2026-10-08 mad_members.id에서 교체)';

-- 3) RLS — 팀원·제출물 비공개
DROP POLICY IF EXISTS mad_team_members_read ON public.mad_team_members;
CREATE POLICY mad_team_members_read ON public.mad_team_members FOR SELECT TO authenticated
    USING (
        auth_is_staff()
        OR member_id IN (SELECT m.id FROM public.members m WHERE m.auth_id = auth.uid())
    );

DROP POLICY IF EXISTS mad_submissions_read ON public.mad_submissions;
CREATE POLICY mad_submissions_read ON public.mad_submissions FOR SELECT TO authenticated
    USING (
        auth_is_staff()
        OR team_id IN (
            SELECT tm.team_id FROM public.mad_team_members tm
            WHERE tm.member_id IN (SELECT m.id FROM public.members m WHERE m.auth_id = auth.uid())
        )
    );

-- 4) 권한 — 쓰기는 service_role만
REVOKE INSERT, UPDATE, DELETE ON public.mad_competitions, public.mad_competition_teams, public.mad_team_members,
    public.mad_submissions, public.mad_competition_results FROM anon, authenticated;
REVOKE SELECT ON public.mad_team_members, public.mad_submissions FROM anon;
GRANT SELECT ON public.mad_competitions, public.mad_competition_teams, public.mad_competition_results TO anon, authenticated;
GRANT SELECT ON public.mad_team_members, public.mad_submissions TO authenticated;
GRANT ALL ON public.mad_competitions, public.mad_competition_teams, public.mad_team_members,
    public.mad_submissions, public.mad_competition_results TO service_role;

-- 롤백:
--   ALTER TABLE public.mad_team_members DROP CONSTRAINT mad_team_members_member_id_fkey;
--   ALTER TABLE public.mad_team_members ADD CONSTRAINT mad_team_members_member_id_fkey FOREIGN KEY (member_id) REFERENCES public.mad_members(id) ON DELETE CASCADE;
--   ALTER TABLE public.mad_competitions DROP COLUMN form_id;
--   (정책은 이전: mad_team_members_read / mad_submissions_read = public USING true / status='submitted')
