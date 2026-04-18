-- ============================================================
-- Universe Coin (UC) — 유니버스 공통 포인트 시스템
-- 탈퇴 시 잔액 소멸. 재가입 시 신규 member_id → 잔액 0 시작.
-- ============================================================

-- 1. 잔액 원장
CREATE TABLE IF NOT EXISTS uc_balances (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id    uuid NOT NULL UNIQUE REFERENCES badak_members(id) ON DELETE CASCADE,
  balance      integer NOT NULL DEFAULT 0 CHECK (balance >= 0),
  lifetime_earned integer NOT NULL DEFAULT 0,
  updated_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS uc_balances_member_idx ON uc_balances(member_id);

-- 2. 거래 원장 (적립/차감/이전 모두)
CREATE TABLE IF NOT EXISTS uc_transactions (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id    uuid NOT NULL REFERENCES badak_members(id) ON DELETE CASCADE,
  type         text NOT NULL CHECK (type IN ('earn','redeem','transfer_out','transfer_in','expire','admin')),
  amount       integer NOT NULL,                  -- earn/transfer_in: 양수, redeem/transfer_out: 음수
  balance_after integer NOT NULL,
  action_key   text,                              -- earn 시: 'join_group','write_review','create_group','refer_join','profile_complete' 등
  brand_id     text,                              -- 어느 서비스에서 발생했는지 (badak, wio, smarcomm ...)
  ref_id       uuid,                              -- 관련 리소스 ID (group_id, review_id 등)
  note         text,
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS uc_transactions_member_idx ON uc_transactions(member_id);
CREATE INDEX IF NOT EXISTS uc_transactions_created_idx ON uc_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS uc_transactions_action_idx ON uc_transactions(action_key);

-- 3. 적립 규칙 (DB 관리 — 프로모션 포함)
CREATE TABLE IF NOT EXISTS uc_earn_rules (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action_key   text NOT NULL,                     -- 'join_group','write_review','create_group','refer_join','profile_complete'
  brand_id     text,                              -- NULL = 전 브랜드 공통
  amount       integer NOT NULL CHECK (amount > 0),
  monthly_cap  integer NOT NULL DEFAULT 1,        -- 월 최대 적립 횟수
  valid_from   timestamptz,
  valid_until  timestamptz,
  is_active    boolean NOT NULL DEFAULT true,
  label        text,                              -- 관리자용 설명 (예: '4월 모임 참여 2배 이벤트')
  created_at   timestamptz NOT NULL DEFAULT now()
);

-- 기본 규칙 시드
INSERT INTO uc_earn_rules (action_key, brand_id, amount, monthly_cap, label) VALUES
  ('join_group',        'badak', 500, 1, '모임 참여 완료'),
  ('write_review',      'badak', 200, 1, '후기 작성'),
  ('create_group',      'badak', 300, 1, '모임 개설'),
  ('refer_join',        NULL,    400, 2, '친구 초대 가입'),
  ('profile_complete',  NULL,    100, 1, '프로필 최초 완성')
ON CONFLICT DO NOTHING;

-- 4. 사용 정책 (서비스별 할인 한도)
CREATE TABLE IF NOT EXISTS uc_redeem_policies (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id           text NOT NULL,               -- 'badak','wio','smarcomm','planners' ...
  scope              text NOT NULL DEFAULT 'default',  -- 'default','promo'
  max_discount_pct   numeric(5,2) NOT NULL DEFAULT 10.00 CHECK (max_discount_pct > 0 AND max_discount_pct <= 50),
  -- ⚠️ 프로모션 시 max_discount_pct > (platform_rate - 5) 금지 — 앱 레벨에서 가드레일 적용
  uc_per_krw         numeric(10,4) NOT NULL DEFAULT 1.0, -- 1 UC = 1 KRW
  valid_from         timestamptz,
  valid_until        timestamptz,
  is_active          boolean NOT NULL DEFAULT true,
  note               text,
  created_at         timestamptz NOT NULL DEFAULT now()
);

INSERT INTO uc_redeem_policies (brand_id, scope, max_discount_pct, note) VALUES
  ('badak',    'default', 10.00, '바닥 모임 비용 최대 10% UC 결제'),
  ('wio',      'default', 10.00, 'WIO 구독 최대 10% UC 결제'),
  ('smarcomm', 'default', 10.00, 'SmarComm 구독 최대 10% UC 결제'),
  ('planners', 'default', 10.00, '플래너스 교육 최대 10% UC 결제')
ON CONFLICT DO NOTHING;

-- 5. 월별 행위 추적 (중복 지급 방지)
CREATE TABLE IF NOT EXISTS uc_monthly_tracking (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id    uuid NOT NULL REFERENCES badak_members(id) ON DELETE CASCADE,
  year_month   char(7) NOT NULL,                  -- '2026-04'
  action_key   text NOT NULL,
  count        integer NOT NULL DEFAULT 0,        -- 이번 달 해당 행위 횟수
  last_earned_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (member_id, year_month, action_key)
);

CREATE INDEX IF NOT EXISTS uc_monthly_member_idx ON uc_monthly_tracking(member_id, year_month);

-- 6. 코인 이전 (멤버 간 전송)
CREATE TABLE IF NOT EXISTS uc_transfers (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_member_id uuid NOT NULL REFERENCES badak_members(id) ON DELETE CASCADE,
  to_member_id   uuid NOT NULL REFERENCES badak_members(id) ON DELETE CASCADE,
  amount         integer NOT NULL CHECK (amount > 0),
  note           text,
  created_at     timestamptz NOT NULL DEFAULT now(),
  CHECK (from_member_id <> to_member_id)
);

-- 7. 바닥 수수료 설정 (리더별·인증별 협의 반영)
CREATE TABLE IF NOT EXISTS badak_fee_configs (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scope           text NOT NULL CHECK (scope IN ('default','certification','leader','group')),
  ref_id          uuid,           -- certification_id / leader member_id / group_id
  platform_rate   numeric(5,2) NOT NULL DEFAULT 25.00 CHECK (platform_rate >= 0 AND platform_rate <= 100),
  -- scope 우선순위: group > leader > certification > default
  note            text,
  valid_from      timestamptz,
  valid_until     timestamptz,
  is_active       boolean NOT NULL DEFAULT true,
  created_at      timestamptz NOT NULL DEFAULT now()
);

INSERT INTO badak_fee_configs (scope, platform_rate, note) VALUES
  ('default', 25.00, '기본 바닥 수수료 25%'),
  ('certification', 15.00, '깜바닥 인증 수수료 15%')
ON CONFLICT DO NOTHING;

-- RLS (서비스 role key로 서버에서만 접근 — anon 차단)
ALTER TABLE uc_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE uc_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE uc_earn_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE uc_redeem_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE uc_monthly_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE uc_transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE badak_fee_configs ENABLE ROW LEVEL SECURITY;
