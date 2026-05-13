-- Myverse 결제 — Stripe 연동 + 구독 상태 추적
-- members.stripe_customer_id (Stripe customer mapping)
-- myverse_subscriptions (구독 상태 + 만료일)

ALTER TABLE members
    ADD COLUMN IF NOT EXISTS stripe_customer_id text UNIQUE;

CREATE TABLE IF NOT EXISTS myverse_subscriptions (
    id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id               uuid NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    stripe_subscription_id  text UNIQUE,
    stripe_customer_id      text NOT NULL,
    plan                    text NOT NULL CHECK (plan IN ('free','plus','pro','family')),
    status                  text NOT NULL CHECK (status IN ('active','past_due','canceled','unpaid','trialing','incomplete')),
    current_period_start    timestamptz,
    current_period_end      timestamptz,
    cancel_at_period_end    boolean DEFAULT false,
    canceled_at             timestamptz,
    created_at              timestamptz NOT NULL DEFAULT now(),
    updated_at              timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_subs_member ON myverse_subscriptions(member_id);
CREATE INDEX IF NOT EXISTS idx_subs_status ON myverse_subscriptions(status, current_period_end);

ALTER TABLE myverse_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS subs_owner_read ON myverse_subscriptions;
CREATE POLICY subs_owner_read ON myverse_subscriptions
    FOR SELECT
    USING (member_id IN (SELECT id FROM members WHERE auth_id = auth.uid()));

-- Stripe 이벤트 로그 (idempotency 추적)
CREATE TABLE IF NOT EXISTS myverse_stripe_events (
    id              text PRIMARY KEY,           -- Stripe event id
    type            text NOT NULL,
    received_at     timestamptz NOT NULL DEFAULT now(),
    processed       boolean NOT NULL DEFAULT false,
    payload         jsonb
);

-- RLS — service_role만 접근 (웹훅 처리 전용, anon/authenticated 차단)
ALTER TABLE myverse_stripe_events ENABLE ROW LEVEL SECURITY;
