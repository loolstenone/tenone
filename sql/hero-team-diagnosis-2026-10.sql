-- ============================================================
-- HeRo 팀 진단 (자동 리포트) — 2026-10-13 적용 (MCP apply_migration)
--
-- 기업 담당자가 팀 진단을 만들고 초대 링크를 팀원에게 보낸다 → 팀원(HeRo 회원)이 동의하고 참여
-- → 기본 성향 검사(hit_a_results)를 마친 참여자가 5명 이상이면 팀 단위 묶음 리포트가 자동으로 만들어진다.
-- ❌ 개인의 검사 내용은 기업에 주지 않는다 (2026-10-13 사용자 결정) — 참여자 이름·개인 결과 없음, 비율만
-- 동의: 참여 시 '팀 통계 작성' 목적의 이용 동의 (개인정보보호법 제15·17조 — 기업에는 통계만)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.hero_team_diagnoses (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id  uuid NOT NULL REFERENCES public.hero_companies(id) ON DELETE CASCADE,
    name        text NOT NULL,
    invite_code text NOT NULL UNIQUE,
    created_by  uuid REFERENCES public.members(id) ON DELETE SET NULL,
    status      text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
    closed_at   timestamptz,
    brand_id    text NOT NULL DEFAULT 'hero',
    tenant_id   text NOT NULL DEFAULT 'tenone',
    created_at  timestamptz NOT NULL DEFAULT now(),
    updated_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS hero_team_diagnoses_company_idx ON public.hero_team_diagnoses (company_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.hero_team_participants (
    id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    diagnosis_id uuid NOT NULL REFERENCES public.hero_team_diagnoses(id) ON DELETE CASCADE,
    member_id    uuid NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,   -- 탈퇴·나가기 = 통계에서 빠짐
    consent      jsonb NOT NULL,                                                  -- {version, purpose, agreed_at}
    brand_id     text NOT NULL DEFAULT 'hero',
    tenant_id    text NOT NULL DEFAULT 'tenone',
    joined_at    timestamptz NOT NULL DEFAULT now(),
    UNIQUE (diagnosis_id, member_id)
);
CREATE INDEX IF NOT EXISTS hero_team_participants_member_idx ON public.hero_team_participants (member_id);

ALTER TABLE public.hero_team_diagnoses    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hero_team_participants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS hero_team_diagnoses_company_staff_read ON public.hero_team_diagnoses;
CREATE POLICY hero_team_diagnoses_company_staff_read ON public.hero_team_diagnoses
    FOR SELECT TO authenticated USING (
        public.auth_is_staff() OR EXISTS (
            SELECT 1 FROM public.hero_company_members cm
            WHERE cm.company_id = hero_team_diagnoses.company_id
              AND cm.member_id = public.hero_current_member_id() AND cm.status = 'active'
        )
    );

DROP POLICY IF EXISTS hero_team_participants_self_staff_read ON public.hero_team_participants;
CREATE POLICY hero_team_participants_self_staff_read ON public.hero_team_participants
    FOR SELECT TO authenticated USING (member_id = public.hero_current_member_id() OR public.auth_is_staff());

GRANT SELECT, INSERT, UPDATE, DELETE ON public.hero_team_diagnoses    TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.hero_team_participants TO authenticated;
GRANT ALL ON public.hero_team_diagnoses    TO service_role;
GRANT ALL ON public.hero_team_participants TO service_role;
