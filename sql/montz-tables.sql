-- MoNTZ 테이블 마이그레이션
-- 적용일: 2026-04-20
-- 테이블: montz_creators, montz_works, montz_auditions, montz_verification_requests

-- ── montz_creators ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS montz_creators (
    id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id          uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    handle           text NOT NULL UNIQUE,
    display_name     text NOT NULL,
    type             text NOT NULL CHECK (type IN ('model','actor','both')) DEFAULT 'model',
    gender           text CHECK (gender IN ('female','male')),
    age_group        text CHECK (age_group IN ('어린이','10대','20~30대','40~50대','60대+')),
    specialties      text[] NOT NULL DEFAULT '{}',
    avatar_url       text,
    cover_url        text,
    bio              text,
    height           numeric,
    weight           numeric,
    show_weight      boolean NOT NULL DEFAULT false,
    bust             numeric,
    waist            numeric,
    hip              numeric,
    shoe_size        numeric,
    hair_color       text,
    eye_color        text,
    availability_status text NOT NULL CHECK (availability_status IN ('active','selective','inactive')) DEFAULT 'active',
    follower_count   integer NOT NULL DEFAULT 0,
    work_count       integer NOT NULL DEFAULT 0,
    is_verified      boolean NOT NULL DEFAULT false,
    portfolio_links  text[] NOT NULL DEFAULT '{}',
    is_hero          boolean NOT NULL DEFAULT false,
    created_at       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS montz_creators_user_id_idx  ON montz_creators(user_id);
CREATE INDEX IF NOT EXISTS montz_creators_handle_idx   ON montz_creators(handle);
CREATE INDEX IF NOT EXISTS montz_creators_type_idx     ON montz_creators(type);
CREATE INDEX IF NOT EXISTS montz_creators_gender_idx   ON montz_creators(gender);

ALTER TABLE montz_creators ENABLE ROW LEVEL SECURITY;

CREATE POLICY "montz_creators_select_all"  ON montz_creators FOR SELECT USING (true);
CREATE POLICY "montz_creators_insert_own"  ON montz_creators FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "montz_creators_update_own"  ON montz_creators FOR UPDATE USING (auth.uid() = user_id);

-- ── montz_works ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS montz_works (
    id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id   uuid NOT NULL REFERENCES montz_creators(id) ON DELETE CASCADE,
    title        text NOT NULL,
    description  text,
    category     text NOT NULL DEFAULT '',
    images       text[] NOT NULL DEFAULT '{}',
    tags         text[] NOT NULL DEFAULT '{}',
    likes_count  integer NOT NULL DEFAULT 0,
    is_featured  boolean NOT NULL DEFAULT false,
    created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS montz_works_creator_id_idx ON montz_works(creator_id);

ALTER TABLE montz_works ENABLE ROW LEVEL SECURITY;

CREATE POLICY "montz_works_select_all"   ON montz_works FOR SELECT USING (true);
CREATE POLICY "montz_works_insert_own"   ON montz_works FOR INSERT
    WITH CHECK (EXISTS (SELECT 1 FROM montz_creators WHERE id = creator_id AND user_id = auth.uid()));
CREATE POLICY "montz_works_update_own"   ON montz_works FOR UPDATE
    USING (EXISTS (SELECT 1 FROM montz_creators WHERE id = creator_id AND user_id = auth.uid()));
CREATE POLICY "montz_works_delete_own"   ON montz_works FOR DELETE
    USING (EXISTS (SELECT 1 FROM montz_creators WHERE id = creator_id AND user_id = auth.uid()));

-- ── montz_auditions ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS montz_auditions (
    id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company       text NOT NULL,
    role          text NOT NULL,
    type          text NOT NULL CHECK (type IN ('드라마','영화','뮤지컬','모델','광고','CF','기타')),
    tags          text[] NOT NULL DEFAULT '{}',
    deadline      text NOT NULL DEFAULT '상시',
    pay           text,
    href          text,
    contact_email text NOT NULL DEFAULT '',
    is_active     boolean NOT NULL DEFAULT true,
    is_pinned     boolean NOT NULL DEFAULT false,
    sort_order    integer NOT NULL DEFAULT 0,
    created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS montz_auditions_active_idx ON montz_auditions(is_active);

ALTER TABLE montz_auditions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "montz_auditions_select_active" ON montz_auditions FOR SELECT USING (is_active = true);

-- ── montz_verification_requests ──────────────────────────────────
CREATE TABLE IF NOT EXISTS montz_verification_requests (
    id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id       uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    email         text,
    real_name     text NOT NULL,
    phone         text NOT NULL,
    creator_type  text NOT NULL DEFAULT 'model',
    agency        text,
    sns_link      text,
    status        text NOT NULL CHECK (status IN ('pending','approved','rejected')) DEFAULT 'pending',
    reviewer_note text,
    reviewed_at   timestamptz,
    created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS montz_verification_user_id_idx ON montz_verification_requests(user_id);
CREATE INDEX IF NOT EXISTS montz_verification_status_idx  ON montz_verification_requests(status);

ALTER TABLE montz_verification_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "montz_verification_insert_auth"  ON montz_verification_requests FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "montz_verification_select_own"   ON montz_verification_requests FOR SELECT USING (auth.uid() = user_id);
