-- JAKKA 쇼케이스 (전시회)
-- 대학졸업전시, 동호회, 취미 전시회 — 대표자 1명 신청 + 자까 가입자 3명 승인 후 공개

-- ─── jakka_showcases ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS jakka_showcases (
    id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organizer_id   uuid NOT NULL REFERENCES jakka_creators(id) ON DELETE CASCADE,
    user_id        uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    slug           text NOT NULL UNIQUE,
    title          text NOT NULL,                      -- 전시회 명
    subtitle       text,                               -- 부제
    description    text NOT NULL,                      -- 내용
    cover_image    text,                               -- 대표 이미지
    category       text,                               -- 유형 (졸업전시, 동호회, 취미 등)
    location       text,                               -- 장소
    start_date     date NOT NULL,
    end_date       date NOT NULL,
    status         text NOT NULL DEFAULT 'pending'
                   CHECK (status IN ('pending','approved','rejected','ended')),
    approval_count int     NOT NULL DEFAULT 0,         -- 승인 누적 (3이면 approved)
    rejected_at    timestamptz,
    approved_at    timestamptz,
    created_at     timestamptz NOT NULL DEFAULT now(),
    updated_at     timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_jakka_showcases_organizer ON jakka_showcases(organizer_id);
CREATE INDEX IF NOT EXISTS idx_jakka_showcases_status    ON jakka_showcases(status, start_date DESC);

ALTER TABLE jakka_showcases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "jakka_showcases_select" ON jakka_showcases FOR SELECT
    USING (status IN ('approved','ended') OR auth.uid() = user_id);
CREATE POLICY "jakka_showcases_insert" ON jakka_showcases FOR INSERT
    WITH CHECK (auth.uid() = user_id);
CREATE POLICY "jakka_showcases_update" ON jakka_showcases FOR UPDATE
    USING (auth.uid() = user_id);
CREATE POLICY "jakka_showcases_delete" ON jakka_showcases FOR DELETE
    USING (auth.uid() = user_id);

-- ─── jakka_showcase_members (참여 작가) ──────────────────────
CREATE TABLE IF NOT EXISTS jakka_showcase_members (
    showcase_id uuid NOT NULL REFERENCES jakka_showcases(id) ON DELETE CASCADE,
    creator_id  uuid NOT NULL REFERENCES jakka_creators(id) ON DELETE CASCADE,
    role        text NOT NULL DEFAULT 'participant'
                CHECK (role IN ('organizer','participant')),
    created_at  timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (showcase_id, creator_id)
);

CREATE INDEX IF NOT EXISTS idx_jakka_showcase_members_creator ON jakka_showcase_members(creator_id);

ALTER TABLE jakka_showcase_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "jakka_showcase_members_select" ON jakka_showcase_members FOR SELECT USING (true);
CREATE POLICY "jakka_showcase_members_insert" ON jakka_showcase_members FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM jakka_showcases s
            WHERE s.id = showcase_id AND s.user_id = auth.uid()
        )
    );
CREATE POLICY "jakka_showcase_members_delete" ON jakka_showcase_members FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM jakka_showcases s
            WHERE s.id = showcase_id AND s.user_id = auth.uid()
        )
    );

-- ─── jakka_showcase_approvals (3인 이메일 승인) ──────────────
CREATE TABLE IF NOT EXISTS jakka_showcase_approvals (
    id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    showcase_id  uuid NOT NULL REFERENCES jakka_showcases(id) ON DELETE CASCADE,
    approver_email text NOT NULL,                      -- 대표자가 지정한 자까 가입자 이메일
    approver_id  uuid REFERENCES auth.users(id),       -- 실제 승인한 사용자
    token        text NOT NULL UNIQUE,                 -- 이메일 승인 링크 토큰
    status       text NOT NULL DEFAULT 'pending'
                 CHECK (status IN ('pending','approved','rejected')),
    responded_at timestamptz,
    comment      text,
    created_at   timestamptz NOT NULL DEFAULT now(),
    UNIQUE (showcase_id, approver_email)
);

CREATE INDEX IF NOT EXISTS idx_jakka_showcase_approvals_showcase ON jakka_showcase_approvals(showcase_id);
CREATE INDEX IF NOT EXISTS idx_jakka_showcase_approvals_token    ON jakka_showcase_approvals(token);

ALTER TABLE jakka_showcase_approvals ENABLE ROW LEVEL SECURITY;
-- 승인 링크는 토큰 기반이라 누구든 읽기 가능 (토큰을 알아야 접근)
CREATE POLICY "jakka_showcase_approvals_select" ON jakka_showcase_approvals FOR SELECT USING (true);
CREATE POLICY "jakka_showcase_approvals_insert" ON jakka_showcase_approvals FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM jakka_showcases s
            WHERE s.id = showcase_id AND s.user_id = auth.uid()
        )
    );
-- 승인/거부는 로그인한 사용자 누구나 (토큰 검증은 앱 레벨에서)
CREATE POLICY "jakka_showcase_approvals_update" ON jakka_showcase_approvals FOR UPDATE
    USING (auth.uid() IS NOT NULL);

-- ─── 승인 시 쇼케이스 상태 자동 갱신 트리거 ──────────────────
CREATE OR REPLACE FUNCTION jakka_showcases_update_on_approval()
RETURNS TRIGGER AS $$
DECLARE
    approved_total int;
    rejected_total int;
BEGIN
    SELECT
        COUNT(*) FILTER (WHERE status = 'approved'),
        COUNT(*) FILTER (WHERE status = 'rejected')
    INTO approved_total, rejected_total
    FROM jakka_showcase_approvals
    WHERE showcase_id = NEW.showcase_id;

    IF rejected_total > 0 THEN
        UPDATE jakka_showcases
            SET status = 'rejected', rejected_at = now(), approval_count = approved_total
            WHERE id = NEW.showcase_id AND status = 'pending';
    ELSIF approved_total >= 3 THEN
        UPDATE jakka_showcases
            SET status = 'approved', approved_at = now(), approval_count = approved_total
            WHERE id = NEW.showcase_id AND status = 'pending';
    ELSE
        UPDATE jakka_showcases
            SET approval_count = approved_total
            WHERE id = NEW.showcase_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_jakka_showcases_approval ON jakka_showcase_approvals;
CREATE TRIGGER trg_jakka_showcases_approval
    AFTER UPDATE OF status ON jakka_showcase_approvals
    FOR EACH ROW
    WHEN (NEW.status IN ('approved','rejected') AND OLD.status = 'pending')
    EXECUTE FUNCTION jakka_showcases_update_on_approval();
