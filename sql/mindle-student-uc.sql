-- mindle-student-uc.sql — Phase 2-E
-- Mindle 학생 할인 정책 + 이메일 도메인 자동 인증 헬퍼
--
-- 정직성: 본 SQL은 정책 시드만. 실제 결제·UC 차감은 Phase 3 PRO 결제 도입 시 작동.
-- 본 정책이 미리 있어야 Phase 3 결제 흐름에서 자동 적용 가능.
--
-- 정책 설계 (CLAUDE.md § 1.5 UC 정책 + Mindle CLAUDE.md § 2 가격 정책 근거):
--   - 일반 사용자: Mindle PRO 결제 시 최대 10% UC 차감 (uc_redeem_policies 기본값)
--   - 학생 (.ac.kr · .edu): Mindle PRO 50% 직접 할인 (UC 차감 별개)
--   - 학생 인증: 가입 시 회원 이메일 도메인 검증 (자동)
--
-- 적용 방법:
--   (1) scripts/run-sql.js queries 배열에 본 파일 추가
--   (2) Supabase Dashboard > SQL Editor 직접 실행

-- 1. uc_redeem_policies — Mindle 기본 정책 등록 (기존 brand_id IN (badak/wio/smarcomm/planners)에 mindle 추가)
INSERT INTO uc_redeem_policies (brand_id, scope, max_discount_pct, note) VALUES
    ('mindle', 'default', 10.00, 'Mindle PRO 구독 최대 10% UC 결제')
ON CONFLICT DO NOTHING;

-- 2. uc_redeem_policies — Mindle 학생 50% 할인 (별도 scope)
INSERT INTO uc_redeem_policies (brand_id, scope, max_discount_pct, note) VALUES
    ('mindle', 'student', 50.00, 'Mindle PRO 학생 할인 (.ac.kr · .edu) — Phase 3 결제 도입 시 적용')
ON CONFLICT DO NOTHING;

-- 3. 학생 도메인 판별 SQL 함수 — Mindle 가입/결제 흐름에서 호출
CREATE OR REPLACE FUNCTION is_student_email(email TEXT)
RETURNS BOOLEAN
LANGUAGE sql
IMMUTABLE
AS $$
    SELECT email ~* '\.(ac\.kr|edu|edu\.[a-z]{2})$';
$$;

COMMENT ON FUNCTION is_student_email(TEXT) IS
'학생 이메일 도메인 자동 판별. .ac.kr (한국 대학) / .edu (미국 대학) / .edu.XX (기타국가).
Mindle Phase 3 PRO 결제 시 학생 할인 50% 자동 적용 여부 판단에 사용.';

-- 4. members 테이블에 학생 여부 캐싱 컬럼 (옵션 — 결제 시점 조회 비용 최소화)
ALTER TABLE members ADD COLUMN IF NOT EXISTS is_student BOOLEAN GENERATED ALWAYS AS (is_student_email(email)) STORED;
CREATE INDEX IF NOT EXISTS idx_members_is_student ON members(is_student) WHERE is_student = true;

-- 5. 검증
SELECT
    brand_id,
    scope,
    max_discount_pct,
    note
FROM uc_redeem_policies
WHERE brand_id = 'mindle'
ORDER BY scope;

-- 학생 도메인 함수 동작 확인
SELECT
    is_student_email('test@hongik.ac.kr') AS hongik_ackr,
    is_student_email('test@mit.edu') AS mit_edu,
    is_student_email('test@gmail.com') AS gmail,
    is_student_email('test@oxford.ac.uk') AS oxford_acuk_NOT_student;
