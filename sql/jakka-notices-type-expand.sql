-- jakka_notices type 제약 확장: 파트너, 외주, 인턴 추가
ALTER TABLE jakka_notices
    ALTER COLUMN type TYPE TEXT;

-- 기존 인라인 CHECK 제거 후 재추가
ALTER TABLE jakka_notices
    DROP CONSTRAINT IF EXISTS jakka_notices_type_check;

ALTER TABLE jakka_notices
    ADD CONSTRAINT jakka_notices_type_check
    CHECK (type IN ('채용', '공모전', '프로젝트', '공고', '파트너', '외주', '인턴'));
