-- UC 테이블 FK를 badak_members → members로 교정 + 가입 자동 지급 트리거

-- 0. from_member_id NOT NULL 제거 (시스템 지급은 NULL)
ALTER TABLE uc_transfers ALTER COLUMN from_member_id DROP NOT NULL;

-- 1. 기존 잘못된 FK 제거
ALTER TABLE uc_balances DROP CONSTRAINT IF EXISTS uc_balances_member_id_fkey;
ALTER TABLE uc_monthly_tracking DROP CONSTRAINT IF EXISTS uc_monthly_tracking_member_id_fkey;
ALTER TABLE uc_transfers DROP CONSTRAINT IF EXISTS uc_transfers_from_member_id_fkey;
ALTER TABLE uc_transfers DROP CONSTRAINT IF EXISTS uc_transfers_to_member_id_fkey;

-- 2. members.id 참조로 재연결
ALTER TABLE uc_balances
  ADD CONSTRAINT uc_balances_member_id_fkey
  FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE;

ALTER TABLE uc_monthly_tracking
  ADD CONSTRAINT uc_monthly_tracking_member_id_fkey
  FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE;

ALTER TABLE uc_transfers
  ADD CONSTRAINT uc_transfers_from_member_id_fkey
  FOREIGN KEY (from_member_id) REFERENCES members(id) ON DELETE SET NULL;

ALTER TABLE uc_transfers
  ADD CONSTRAINT uc_transfers_to_member_id_fkey
  FOREIGN KEY (to_member_id) REFERENCES members(id) ON DELETE CASCADE;

-- 3. uc_balances.member_id UNIQUE 보장
ALTER TABLE uc_balances DROP CONSTRAINT IF EXISTS uc_balances_member_id_key;
ALTER TABLE uc_balances ADD CONSTRAINT uc_balances_member_id_key UNIQUE (member_id);

-- 4. 가입 자동 UC 지급 트리거 함수
CREATE OR REPLACE FUNCTION grant_signup_uc()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO uc_balances (member_id, balance, lifetime_earned, tenant_id, updated_at)
  VALUES (NEW.id, 10000, 10000, 'tenone', NOW())
  ON CONFLICT (member_id) DO NOTHING;

  INSERT INTO uc_transfers (from_member_id, to_member_id, amount, note, tenant_id, created_at)
  VALUES (NULL, NEW.id, 10000, '가입 축하 UC', 'tenone', NOW());

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. 트리거 등록 (members INSERT)
DROP TRIGGER IF EXISTS trg_grant_signup_uc ON members;
CREATE TRIGGER trg_grant_signup_uc
  AFTER INSERT ON members
  FOR EACH ROW EXECUTE FUNCTION grant_signup_uc();

-- 6. 기존 members 백필 (잔액 없는 경우만)
INSERT INTO uc_balances (member_id, balance, lifetime_earned, tenant_id, updated_at)
SELECT id, 10000, 10000, 'tenone', NOW()
FROM members
WHERE id NOT IN (SELECT member_id FROM uc_balances WHERE member_id IS NOT NULL)
ON CONFLICT (member_id) DO NOTHING;

INSERT INTO uc_transfers (from_member_id, to_member_id, amount, note, tenant_id, created_at)
SELECT NULL, m.id, 10000, '가입 축하 UC (백필)', 'tenone', NOW()
FROM members m
WHERE m.id NOT IN (
  SELECT to_member_id FROM uc_transfers
  WHERE note LIKE '가입 축하 UC%' AND from_member_id IS NULL
);
