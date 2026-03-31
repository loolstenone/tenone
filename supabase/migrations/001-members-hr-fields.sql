-- Members 테이블에 HR 필드 추가
-- hire_date: 입사일
-- employment_type: 고용형태 (정규직, 계약직 등)

ALTER TABLE members ADD COLUMN IF NOT EXISTS hire_date DATE;
ALTER TABLE members ADD COLUMN IF NOT EXISTS employment_type VARCHAR(20) DEFAULT '정규직';

-- 기존 직원 데이터 업데이트 (대표이사)
UPDATE members
SET hire_date = '2019-10-01',
    employment_type = '정규직'
WHERE email = 'cjeon@tenone.biz';

-- 추가 staff 필드 (인트라 접근 관련)
ALTER TABLE members ADD COLUMN IF NOT EXISTS primary_type VARCHAR(30);
ALTER TABLE members ADD COLUMN IF NOT EXISTS roles TEXT[] DEFAULT '{}';
ALTER TABLE members ADD COLUMN IF NOT EXISTS affiliations TEXT[] DEFAULT '{}';
ALTER TABLE members ADD COLUMN IF NOT EXISTS intra_access BOOLEAN DEFAULT false;
ALTER TABLE members ADD COLUMN IF NOT EXISTS module_access TEXT[] DEFAULT '{}';
