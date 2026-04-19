-- members 테이블 레거시 포인트 컬럼 제거
-- UC(uc_balances)로 완전 통합
ALTER TABLE members DROP COLUMN IF EXISTS total_points;
ALTER TABLE members DROP COLUMN IF EXISTS grade;
