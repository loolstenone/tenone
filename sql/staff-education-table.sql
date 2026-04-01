-- ============================================================
-- staff_education 테이블 (HR 교육 이수 관리)
-- 실행: Supabase Dashboard → SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS staff_education (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id   TEXT NOT NULL DEFAULT '',
    member_name TEXT NOT NULL,
    department  TEXT NOT NULL DEFAULT '',
    course_name TEXT NOT NULL,
    category    TEXT NOT NULL DEFAULT '기타',   -- 필수 | 리더십 | 직무 | AI/기술 | 어학 | 자격증
    hours       INTEGER DEFAULT 0,
    status      TEXT NOT NULL DEFAULT '예정',   -- 수료 | 진행중 | 미수료 | 예정
    mandatory   BOOLEAN DEFAULT false,
    completed_at DATE,
    brand_id    TEXT DEFAULT 'tenone',
    created_at  TIMESTAMPTZ DEFAULT now(),
    updated_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_staff_edu_member ON staff_education(member_id);
CREATE INDEX IF NOT EXISTS idx_staff_edu_status ON staff_education(status);
CREATE INDEX IF NOT EXISTS idx_staff_edu_brand ON staff_education(brand_id);

ALTER TABLE staff_education ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "staff_education_read" ON staff_education;
CREATE POLICY "staff_education_read" ON staff_education FOR SELECT USING (true);
DROP POLICY IF EXISTS "staff_education_write" ON staff_education;
CREATE POLICY "staff_education_write" ON staff_education FOR ALL USING (true);

-- 시드 데이터
INSERT INTO staff_education (member_name, department, course_name, category, hours, status, mandatory)
SELECT v.member_name, v.department, v.course_name, v.category, v.hours, v.status, v.mandatory
FROM (VALUES
    ('Cheonil Jeon', '경영기획', 'VRIEF Orientation', '필수', 4, '수료', true),
    ('Cheonil Jeon', '경영기획', 'GPR 프레임워크 이해', '필수', 6, '수료', true),
    ('Cheonil Jeon', '경영기획', 'Mind Set: 본질·속도·이행', '필수', 4, '진행중', true),
    ('Sarah Kim', '브랜드관리', 'VRIEF Orientation', '필수', 4, '수료', true),
    ('Sarah Kim', '브랜드관리', 'GPR 프레임워크 이해', '필수', 6, '예정', true),
    ('Sarah Kim', '브랜드관리', '리더십 과정 3기', '리더십', 20, '수료', false),
    ('김준호', '커뮤니티운영', 'VRIEF Orientation', '필수', 4, '미수료', true),
    ('김준호', '커뮤니티운영', 'AI 활용 실무', 'AI/기술', 16, '진행중', false),
    ('박영상', '콘텐츠제작', 'VRIEF Orientation', '필수', 4, '수료', true),
    ('박영상', '콘텐츠제작', '프로젝트 매니지먼트 심화', '직무', 30, '진행중', false),
    ('이수진', '디자인', 'VRIEF Orientation', '필수', 4, '수료', true),
    ('이수진', '디자인', '비즈니스 영어 회화', '어학', 48, '예정', false)
) AS v(member_name, department, course_name, category, hours, status, mandatory)
WHERE NOT EXISTS (
    SELECT 1 FROM staff_education
    WHERE staff_education.member_name = v.member_name
    AND staff_education.course_name = v.course_name
);
