-- ============================================================
-- UMS TASK 2 — account_type 확장 + 고객 플로우
-- 2026-04-03
-- ============================================================

-- 1. account_type enum에 subscriber, guest_buyer 추가
--    (member는 이미 존재)
ALTER TYPE account_type ADD VALUE IF NOT EXISTS 'subscriber';
ALTER TYPE account_type ADD VALUE IF NOT EXISTS 'guest_buyer';

-- 2. member_brand_joins — origin 컬럼 추가
ALTER TABLE member_brand_joins
    ADD COLUMN IF NOT EXISTS origin TEXT DEFAULT 'signup'
        CHECK (origin IN ('signup', 'sso_auto', 'admin'));

-- 3. guests — member_id 컬럼 추가 (가입 후 연결)
ALTER TABLE guests
    ADD COLUMN IF NOT EXISTS member_id UUID REFERENCES members(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_guests_member_id ON guests (member_id);
CREATE INDEX IF NOT EXISTS idx_guests_email     ON guests (email);

-- 4. members — deprecated 컬럼 주석
COMMENT ON COLUMN members.brand_access IS 'DEPRECATED: member_brand_joins 사용';
COMMENT ON COLUMN members.brands       IS 'DEPRECATED: member_brand_joins 사용';
COMMENT ON COLUMN members.brand_roles  IS 'DEPRECATED: member_brand_joins 사용';

-- 5. 뷰 분리: vw_staff / vw_customers
CREATE OR REPLACE VIEW vw_staff AS
    SELECT * FROM members
    WHERE account_type IN ('staff', 'partner', 'junior-partner', 'crew');

CREATE OR REPLACE VIEW vw_customers AS
    SELECT * FROM members
    WHERE account_type IN ('member', 'subscriber', 'guest_buyer');

-- 6. 트리거: member 가입 시 member_brand_joins 자동 INSERT
CREATE OR REPLACE FUNCTION fn_auto_member_brand_join()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    -- account_type이 member/subscriber이고 origin_site가 있을 때
    IF NEW.account_type IN ('member', 'subscriber') AND NEW.origin_site IS NOT NULL THEN
        INSERT INTO member_brand_joins (member_id, brand_id, joined_at, origin)
        VALUES (NEW.id, NEW.origin_site, now(), 'signup')
        ON CONFLICT (member_id, brand_id) DO NOTHING;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_auto_member_brand_join ON members;
CREATE TRIGGER trg_auto_member_brand_join
    AFTER INSERT ON members
    FOR EACH ROW EXECUTE FUNCTION fn_auto_member_brand_join();

-- 7. 트리거: subscriptions 활성화 시 account_type → subscriber 승격
CREATE OR REPLACE FUNCTION fn_upgrade_to_subscriber()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    IF NEW.status = 'active' AND NEW.member_id IS NOT NULL THEN
        UPDATE members
        SET account_type = 'subscriber'
        WHERE id = NEW.member_id
          AND account_type = 'member';
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_upgrade_to_subscriber ON subscriptions;
CREATE TRIGGER trg_upgrade_to_subscriber
    AFTER INSERT OR UPDATE OF status ON subscriptions
    FOR EACH ROW EXECUTE FUNCTION fn_upgrade_to_subscriber();

-- 8. 트리거: subscriptions 만료/취소 시 subscriber → member 강등
CREATE OR REPLACE FUNCTION fn_downgrade_from_subscriber()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    IF NEW.status IN ('expired', 'cancelled') AND NEW.member_id IS NOT NULL THEN
        -- 다른 활성 구독이 없으면 강등
        IF NOT EXISTS (
            SELECT 1 FROM subscriptions
            WHERE member_id = NEW.member_id
              AND status = 'active'
              AND id != NEW.id
        ) THEN
            UPDATE members
            SET account_type = 'member'
            WHERE id = NEW.member_id
              AND account_type = 'subscriber';
        END IF;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_downgrade_from_subscriber ON subscriptions;
CREATE TRIGGER trg_downgrade_from_subscriber
    AFTER UPDATE OF status ON subscriptions
    FOR EACH ROW EXECUTE FUNCTION fn_downgrade_from_subscriber();

-- 9. subscriptions — member_id 컬럼 있는지 확인 후 추가
ALTER TABLE subscriptions
    ADD COLUMN IF NOT EXISTS member_id UUID REFERENCES members(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_subscriptions_member_id ON subscriptions (member_id);

-- 10. 검증
SELECT
    (SELECT count(*) FROM pg_enum WHERE enumtypid = 'account_type'::regtype) AS enum_count,
    (SELECT string_agg(enumlabel, ', ' ORDER BY enumsortorder)
     FROM pg_enum WHERE enumtypid = 'account_type'::regtype) AS enum_values,
    (SELECT count(*) FROM information_schema.columns
     WHERE table_name = 'member_brand_joins' AND column_name = 'origin') AS mbj_origin_added,
    (SELECT count(*) FROM information_schema.columns
     WHERE table_name = 'guests' AND column_name = 'member_id') AS guests_member_id_added;
