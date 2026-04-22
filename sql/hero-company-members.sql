-- ────────────────────────────────────────────────────────────────
-- HeRo: 기업 회원 인프라 (hero_company_members)
-- Phase 1-1 · 2026-04-22
--
-- 목적: 기업(hero_companies)과 담당자(members)를 N:M으로 연결
--       한 회원이 여러 기업에 속할 수 있고, 한 기업에 여러 담당자가 있을 수 있음
--
-- 역할 체계:
--   representative  — 기업 대표/오너 (모든 권한)
--   hiring_manager  — 채용 담당 (JD 등록·매칭 요청)
--   viewer          — 읽기 전용 (큐레이션 조회)
--
-- 상태:
--   pending   — 이메일 인증·대표 승인 대기
--   active    — 활성 담당자
--   suspended — 일시 정지
-- ────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS hero_company_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES hero_companies(id) ON DELETE CASCADE,

    role TEXT NOT NULL DEFAULT 'viewer'
        CHECK (role IN ('representative', 'hiring_manager', 'viewer')),
    status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'active', 'suspended')),

    -- 담당자 전용 정보
    position_title TEXT,              -- 예: "인사팀장", "CEO"
    department TEXT,                   -- 예: "People", "전략기획실"
    contact_email TEXT,                -- 기업 이메일 (members.email과 다를 수 있음)
    contact_phone TEXT,

    -- 승인 흐름
    invited_by UUID REFERENCES members(id),  -- 누가 초대했는가
    invited_at TIMESTAMPTZ DEFAULT now(),
    joined_at TIMESTAMPTZ,                    -- status='active' 시점

    tenant_id TEXT DEFAULT 'tenone',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),

    UNIQUE (member_id, company_id)
);

COMMENT ON TABLE hero_company_members IS '기업 회원 — members(담당자) × hero_companies(기업) 연결표';

CREATE INDEX IF NOT EXISTS hero_company_members_member_idx ON hero_company_members(member_id);
CREATE INDEX IF NOT EXISTS hero_company_members_company_idx ON hero_company_members(company_id);
CREATE INDEX IF NOT EXISTS hero_company_members_status_idx ON hero_company_members(status) WHERE status = 'active';

-- ────────────────────────────────────────────────────────────────
-- updated_at 자동 갱신
-- ────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION hero_company_members_touch_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at := now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS hero_company_members_updated ON hero_company_members;
CREATE TRIGGER hero_company_members_updated
    BEFORE UPDATE ON hero_company_members
    FOR EACH ROW EXECUTE FUNCTION hero_company_members_touch_updated_at();

-- ────────────────────────────────────────────────────────────────
-- RLS 정책 (Universe 표준)
-- ────────────────────────────────────────────────────────────────

ALTER TABLE hero_company_members ENABLE ROW LEVEL SECURITY;

-- authenticated는 자기 행과 같은 기업의 다른 담당자 조회 가능
DROP POLICY IF EXISTS hero_company_members_self_read ON hero_company_members;
CREATE POLICY hero_company_members_self_read ON hero_company_members
    FOR SELECT TO authenticated
    USING (
        member_id = auth.uid()
        OR company_id IN (
            SELECT company_id FROM hero_company_members
            WHERE member_id = auth.uid() AND status = 'active'
        )
    );

-- service_role은 모든 작업 가능 (Intra 관리·API 용)
DROP POLICY IF EXISTS hero_company_members_service_all ON hero_company_members;
CREATE POLICY hero_company_members_service_all ON hero_company_members
    FOR ALL TO service_role
    USING (true) WITH CHECK (true);

-- ────────────────────────────────────────────────────────────────
-- hero_tih_responses 확장: company_id FK 추가
--   기존 TIH 응답은 company TEXT로만 저장. 기업 가입 후 정식 연결.
-- ────────────────────────────────────────────────────────────────

ALTER TABLE hero_tih_responses
    ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES hero_companies(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS submitted_by_member_id UUID REFERENCES members(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS hero_tih_responses_company_idx
    ON hero_tih_responses(company_id) WHERE company_id IS NOT NULL;

COMMENT ON COLUMN hero_tih_responses.company_id IS
    '정식 기업 회원 등록 후 연결. 비회원 TIH 제출 시 NULL 유지.';
COMMENT ON COLUMN hero_tih_responses.submitted_by_member_id IS
    '로그인 상태로 TIH 제출한 담당자. 비회원은 NULL.';
