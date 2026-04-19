-- jakka_notices: is_pinned(유료고정) + contact_email(신청자 연락처) 추가
ALTER TABLE jakka_notices
    ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS contact_email TEXT;
