-- 한국 공휴일·24절기 시드 (2026~2027)
-- is_system=true, country='KR' — 사용자가 편집 불가, 모든 사용자에게 공유

-- 시스템 엔트리는 member_id 가 NULL 이 아니라 실제 row 가 필요.
-- 접근법: NULL member_id 대신 "공용 시스템 멤버" 개념을 회피하기 위해
-- 각 사용자별로 동일한 row 를 복제하지 않고, 클라이언트에서 holidays.ts 정적 데이터를 그대로 사용.
-- (DB 시드는 향후 공공 데이터 API 연동 시 재설계)

-- 임시 안: country='KR' 인 사용자가 있으면 그들에게 시드. 그러나 이건 모든 KR 사용자에게 70개 row 씩 복제 → 비효율.
--
-- 결정: 시스템(공휴일·절기) 엔트리는 member_id NULL 허용으로 스키마 변경 + RLS 에 시스템 row 노출 정책 추가.

ALTER TABLE planners_calendar_entries
    ALTER COLUMN member_id DROP NOT NULL;

-- 시스템(member_id IS NULL) 엔트리는 모든 사용자가 SELECT 가능
DROP POLICY IF EXISTS planners_calendar_select ON planners_calendar_entries;
CREATE POLICY planners_calendar_select ON planners_calendar_entries
    FOR SELECT USING (
        member_id IS NULL  -- 시스템 엔트리
        OR
        member_id IN (SELECT id FROM members WHERE email = (auth.jwt() ->> 'email'))
    );

-- INSERT/UPDATE/DELETE 정책은 그대로 (본인만)
-- 단, 시스템 엔트리 INSERT 는 service_role 만 가능 (RLS bypass)

-- 기존 시드 정리
DELETE FROM planners_calendar_entries WHERE is_system = true AND country = 'KR';

-- 2026 한국 법정공휴일 (음력 공휴일은 양력 환산 하드코딩)
INSERT INTO planners_calendar_entries (kind, title, start_date, recurrence, is_system, country, color) VALUES
    ('public_holiday', '신정',         '2026-01-01', 'none', true, 'KR', '#DC2626'),
    ('public_holiday', '설날 연휴',     '2026-02-16', 'none', true, 'KR', '#DC2626'),
    ('public_holiday', '설날',         '2026-02-17', 'none', true, 'KR', '#DC2626'),
    ('public_holiday', '설날 연휴',     '2026-02-18', 'none', true, 'KR', '#DC2626'),
    ('public_holiday', '삼일절',        '2026-03-01', 'none', true, 'KR', '#DC2626'),
    ('public_holiday', '어린이날',      '2026-05-05', 'none', true, 'KR', '#DC2626'),
    ('public_holiday', '부처님오신날',   '2026-05-24', 'none', true, 'KR', '#DC2626'),
    ('public_holiday', '현충일',        '2026-06-06', 'none', true, 'KR', '#DC2626'),
    ('public_holiday', '광복절',        '2026-08-15', 'none', true, 'KR', '#DC2626'),
    ('public_holiday', '추석 연휴',     '2026-09-24', 'none', true, 'KR', '#DC2626'),
    ('public_holiday', '추석',         '2026-09-25', 'none', true, 'KR', '#DC2626'),
    ('public_holiday', '추석 연휴',     '2026-09-26', 'none', true, 'KR', '#DC2626'),
    ('public_holiday', '개천절',        '2026-10-03', 'none', true, 'KR', '#DC2626'),
    ('public_holiday', '한글날',        '2026-10-09', 'none', true, 'KR', '#DC2626'),
    ('public_holiday', '성탄절',        '2026-12-25', 'none', true, 'KR', '#DC2626');

-- 2026 24절기
INSERT INTO planners_calendar_entries (kind, title, start_date, recurrence, is_system, country, color) VALUES
    ('solar_term', '소한', '2026-01-05', 'none', true, 'KR', '#94A3B8'),
    ('solar_term', '대한', '2026-01-20', 'none', true, 'KR', '#94A3B8'),
    ('solar_term', '입춘', '2026-02-04', 'none', true, 'KR', '#94A3B8'),
    ('solar_term', '우수', '2026-02-19', 'none', true, 'KR', '#94A3B8'),
    ('solar_term', '경칩', '2026-03-06', 'none', true, 'KR', '#94A3B8'),
    ('solar_term', '춘분', '2026-03-20', 'none', true, 'KR', '#94A3B8'),
    ('solar_term', '청명', '2026-04-05', 'none', true, 'KR', '#94A3B8'),
    ('solar_term', '곡우', '2026-04-20', 'none', true, 'KR', '#94A3B8'),
    ('solar_term', '입하', '2026-05-06', 'none', true, 'KR', '#94A3B8'),
    ('solar_term', '소만', '2026-05-21', 'none', true, 'KR', '#94A3B8'),
    ('solar_term', '망종', '2026-06-06', 'none', true, 'KR', '#94A3B8'),
    ('solar_term', '하지', '2026-06-21', 'none', true, 'KR', '#94A3B8'),
    ('solar_term', '소서', '2026-07-07', 'none', true, 'KR', '#94A3B8'),
    ('solar_term', '대서', '2026-07-23', 'none', true, 'KR', '#94A3B8'),
    ('solar_term', '입추', '2026-08-07', 'none', true, 'KR', '#94A3B8'),
    ('solar_term', '처서', '2026-08-23', 'none', true, 'KR', '#94A3B8'),
    ('solar_term', '백로', '2026-09-08', 'none', true, 'KR', '#94A3B8'),
    ('solar_term', '추분', '2026-09-23', 'none', true, 'KR', '#94A3B8'),
    ('solar_term', '한로', '2026-10-08', 'none', true, 'KR', '#94A3B8'),
    ('solar_term', '상강', '2026-10-23', 'none', true, 'KR', '#94A3B8'),
    ('solar_term', '입동', '2026-11-07', 'none', true, 'KR', '#94A3B8'),
    ('solar_term', '소설', '2026-11-22', 'none', true, 'KR', '#94A3B8'),
    ('solar_term', '대설', '2026-12-07', 'none', true, 'KR', '#94A3B8'),
    ('solar_term', '동지', '2026-12-22', 'none', true, 'KR', '#94A3B8');

-- 2027 법정공휴일
INSERT INTO planners_calendar_entries (kind, title, start_date, recurrence, is_system, country, color) VALUES
    ('public_holiday', '신정',         '2027-01-01', 'none', true, 'KR', '#DC2626'),
    ('public_holiday', '설날 연휴',     '2027-02-06', 'none', true, 'KR', '#DC2626'),
    ('public_holiday', '설날',         '2027-02-07', 'none', true, 'KR', '#DC2626'),
    ('public_holiday', '설날 연휴',     '2027-02-08', 'none', true, 'KR', '#DC2626'),
    ('public_holiday', '삼일절',        '2027-03-01', 'none', true, 'KR', '#DC2626'),
    ('public_holiday', '어린이날',      '2027-05-05', 'none', true, 'KR', '#DC2626'),
    ('public_holiday', '부처님오신날',   '2027-05-13', 'none', true, 'KR', '#DC2626'),
    ('public_holiday', '현충일',        '2027-06-06', 'none', true, 'KR', '#DC2626'),
    ('public_holiday', '광복절',        '2027-08-15', 'none', true, 'KR', '#DC2626'),
    ('public_holiday', '추석 연휴',     '2027-09-14', 'none', true, 'KR', '#DC2626'),
    ('public_holiday', '추석',         '2027-09-15', 'none', true, 'KR', '#DC2626'),
    ('public_holiday', '추석 연휴',     '2027-09-16', 'none', true, 'KR', '#DC2626'),
    ('public_holiday', '개천절',        '2027-10-03', 'none', true, 'KR', '#DC2626'),
    ('public_holiday', '한글날',        '2027-10-09', 'none', true, 'KR', '#DC2626'),
    ('public_holiday', '성탄절',        '2027-12-25', 'none', true, 'KR', '#DC2626');
