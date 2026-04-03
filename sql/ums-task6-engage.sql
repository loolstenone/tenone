-- ============================================================
-- UMS TASK 6 — ENGAGE 활성화
-- 2026-04-03
-- newsletter_subscribers: site_id, member_id 추가
-- notifications: site_id, brand_id 추가
-- member_points: tenant_id, type 추가
-- member_point_balances 뷰 생성
-- ============================================================

-- 1. newsletter_subscribers — site_id, member_id 추가
ALTER TABLE newsletter_subscribers
    ADD COLUMN IF NOT EXISTS site_id   UUID REFERENCES ums_sites(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS member_id UUID REFERENCES members(id)   ON DELETE SET NULL;

-- email → member 연결 (기존 구독자 중 회원인 경우)
UPDATE newsletter_subscribers ns
SET member_id = m.id
FROM members m
WHERE m.email = ns.email
  AND ns.member_id IS NULL;

-- email 도메인으로 site 추론 불가 → tenant_id 기반으로 site 연결
UPDATE newsletter_subscribers ns
SET site_id = us.id
FROM ums_sites us
WHERE us.slug = ns.tenant_id
  AND ns.site_id IS NULL;

CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_site_id   ON newsletter_subscribers (site_id);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_member_id ON newsletter_subscribers (member_id);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_email     ON newsletter_subscribers (email);

-- 2. notifications — site_id, brand_id 추가
ALTER TABLE notifications
    ADD COLUMN IF NOT EXISTS site_id  UUID REFERENCES ums_sites(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS brand_id TEXT;

CREATE INDEX IF NOT EXISTS idx_notifications_site_id  ON notifications (site_id);
CREATE INDEX IF NOT EXISTS idx_notifications_member_id ON notifications (member_id);

-- 3. member_points — tenant_id, type 추가
--    (현재: id, member_id, brand_id, points, reason, reference_id, created_at)
ALTER TABLE member_points
    ADD COLUMN IF NOT EXISTS tenant_id TEXT DEFAULT 'tenone',
    ADD COLUMN IF NOT EXISTS type      TEXT DEFAULT 'earn'
        CHECK (type IN ('earn', 'use', 'expire', 'adjust'));

CREATE INDEX IF NOT EXISTS idx_member_points_member_id ON member_points (member_id);
CREATE INDEX IF NOT EXISTS idx_member_points_brand_id  ON member_points (brand_id);
CREATE INDEX IF NOT EXISTS idx_member_points_type      ON member_points (type);

-- 4. member_point_balances 뷰 — 멤버×브랜드별 현재 포인트 잔액
CREATE OR REPLACE VIEW member_point_balances AS
    SELECT
        member_id,
        brand_id,
        SUM(
            CASE
                WHEN type IN ('earn', 'adjust') THEN points
                WHEN type IN ('use', 'expire')  THEN -points
                ELSE points
            END
        ) AS balance,
        COUNT(*)        AS transaction_count,
        MAX(created_at) AS last_transaction_at
    FROM member_points
    GROUP BY member_id, brand_id;

-- 5. 트리거: 뉴스레터 구독 시 member_brand_joins 자동 연결
CREATE OR REPLACE FUNCTION fn_newsletter_auto_brand_join()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    IF NEW.member_id IS NOT NULL AND NEW.site_id IS NOT NULL THEN
        INSERT INTO member_brand_joins (member_id, brand_id, joined_at, origin)
        SELECT NEW.member_id, us.brand_id, now(), 'signup'
        FROM ums_sites us
        WHERE us.id = NEW.site_id
          AND us.brand_id IS NOT NULL
        ON CONFLICT (member_id, brand_id) DO NOTHING;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_newsletter_auto_brand_join ON newsletter_subscribers;
CREATE TRIGGER trg_newsletter_auto_brand_join
    AFTER INSERT OR UPDATE OF member_id ON newsletter_subscribers
    FOR EACH ROW EXECUTE FUNCTION fn_newsletter_auto_brand_join();

-- 6. 검증
SELECT
    (SELECT count(*) FROM information_schema.columns
     WHERE table_name = 'newsletter_subscribers'
       AND column_name IN ('site_id', 'member_id')) AS ns_cols_added,
    (SELECT count(*) FROM information_schema.columns
     WHERE table_name = 'notifications'
       AND column_name IN ('site_id', 'brand_id')) AS notif_cols_added,
    (SELECT count(*) FROM information_schema.columns
     WHERE table_name = 'member_points'
       AND column_name IN ('tenant_id', 'type')) AS mp_cols_added,
    (SELECT count(*) FROM information_schema.views
     WHERE table_name = 'member_point_balances') AS balances_view_exists,
    (SELECT count(*) FROM newsletter_subscribers WHERE member_id IS NOT NULL) AS linked_subscribers;
