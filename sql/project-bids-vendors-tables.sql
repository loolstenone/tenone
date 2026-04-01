-- ============================================================
-- project_bids + project_vendors 테이블
-- 실행: Supabase Dashboard → SQL Editor
-- ============================================================

-- ── project_bids (입찰관리) ──────────────────────────────
CREATE TABLE IF NOT EXISTS project_bids (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title            TEXT NOT NULL,
    client           TEXT NOT NULL DEFAULT '',
    type             TEXT NOT NULL DEFAULT '공개입찰',  -- 공개입찰 | 제한입찰 | 수의계약
    submit_deadline  DATE,
    estimated_amount BIGINT DEFAULT 0,
    status           TEXT NOT NULL DEFAULT '준비중',   -- 준비중 | 제출완료 | 낙찰 | 유찰 | 심사중
    assignee         TEXT DEFAULT '',
    brand_id         TEXT DEFAULT 'tenone',
    created_at       TIMESTAMPTZ DEFAULT now(),
    updated_at       TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_project_bids_status ON project_bids(status);
CREATE INDEX IF NOT EXISTS idx_project_bids_brand ON project_bids(brand_id);

ALTER TABLE project_bids ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "project_bids_read" ON project_bids;
CREATE POLICY "project_bids_read" ON project_bids FOR SELECT USING (true);
DROP POLICY IF EXISTS "project_bids_write" ON project_bids;
CREATE POLICY "project_bids_write" ON project_bids FOR ALL USING (true);

-- 시드
INSERT INTO project_bids (title, client, type, submit_deadline, estimated_amount, status, assignee)
SELECT v.title, v.client, v.type, v.submit_deadline, v.estimated_amount, v.status, v.assignee
FROM (VALUES
    ('2026 OO기관 홍보영상 제작', 'OO기관', '공개입찰', '2026-03-25'::date, 80000000, '준비중', 'Sarah Kim'),
    ('XX대학교 브랜드 필름', 'XX대학교', '제한입찰', '2026-03-20'::date, 30000000, '제출완료', '김콘텐'),
    ('YY그룹 사내 교육 콘텐츠', 'YY그룹', '수의계약', '2026-03-15'::date, 50000000, '낙찰', 'Cheonil Jeon'),
    ('ZZ엔터 아티스트 MV', 'ZZ엔터', '제한입찰', '2026-03-10'::date, 120000000, '유찰', '이영상')
) AS v(title, client, type, submit_deadline, estimated_amount, status, assignee)
WHERE NOT EXISTS (SELECT 1 FROM project_bids WHERE project_bids.title = v.title);

-- ── project_vendors (협력사 관리) ────────────────────────
CREATE TABLE IF NOT EXISTS project_vendors (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category       TEXT NOT NULL DEFAULT '기타',
    name           TEXT NOT NULL,
    contact_person TEXT DEFAULT '',
    phone          TEXT DEFAULT '',
    email          TEXT DEFAULT '',
    biz_number     TEXT DEFAULT '',
    bank_info      TEXT DEFAULT '',
    deal_count     INTEGER DEFAULT 0,
    avg_rating     NUMERIC(3,1) DEFAULT 0,
    status         TEXT NOT NULL DEFAULT '활성',   -- 활성 | 휴면 | 블랙리스트 | 신규
    address        TEXT,
    note           TEXT,
    evaluations    JSONB DEFAULT '[]',
    registered_at  DATE DEFAULT CURRENT_DATE,
    brand_id       TEXT DEFAULT 'tenone',
    created_at     TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_vendors_status ON project_vendors(status);
CREATE INDEX IF NOT EXISTS idx_vendors_brand ON project_vendors(brand_id);
CREATE INDEX IF NOT EXISTS idx_vendors_category ON project_vendors(category);

ALTER TABLE project_vendors ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "project_vendors_read" ON project_vendors;
CREATE POLICY "project_vendors_read" ON project_vendors FOR SELECT USING (true);
DROP POLICY IF EXISTS "project_vendors_write" ON project_vendors;
CREATE POLICY "project_vendors_write" ON project_vendors FOR ALL USING (true);

-- 시드
INSERT INTO project_vendors (category, name, contact_person, phone, email, biz_number, deal_count, avg_rating, status, registered_at)
SELECT v.category, v.name, v.contact_person, v.phone, v.email, v.biz_number, v.deal_count, v.avg_rating, v.status, v.registered_at
FROM (VALUES
    ('제작사', '(주)크리에이팅 프로덕션', '정프로', '02-1234-5678', 'jp@creating.co.kr', '123-45-67890', 12, 4.5, '활성', '2024-03-15'::date),
    ('매체사', '메가미디어', '한매체', '02-2345-6789', 'media@mega.co.kr', '234-56-78901', 8, 4.0, '활성', '2024-06-01'::date),
    ('프리랜서', '박영상 PD', '박영상', '010-3456-7890', 'park.pd@gmail.com', '345-67-89012', 5, 4.8, '활성', '2025-01-10'::date),
    ('이벤트사', '라이브커넥트', '강이벤', '02-6789-0123', 'kang@liveconnect.kr', '678-90-12345', 4, 4.3, '활성', '2025-03-20'::date),
    ('촬영스튜디오', '스튜디오 W', '임촬영', '02-7890-1234', 'lim@studiow.kr', '789-01-23456', 7, 4.6, '활성', '2024-04-10'::date)
) AS v(category, name, contact_person, phone, email, biz_number, deal_count, avg_rating, status, registered_at)
WHERE NOT EXISTS (SELECT 1 FROM project_vendors WHERE project_vendors.name = v.name);
