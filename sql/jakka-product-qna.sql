-- Phase A-6: 마켓 상품 Q&A (질문·답변)
-- 날짜: 2026-04-20

CREATE TABLE IF NOT EXISTS jakka_product_qna (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id    UUID NOT NULL REFERENCES jakka_products(id) ON DELETE CASCADE,
    asker_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    question      TEXT NOT NULL,
    answer        TEXT,
    answered_at   TIMESTAMPTZ,
    is_private    BOOLEAN NOT NULL DEFAULT false,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_jakka_product_qna_product ON jakka_product_qna(product_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_jakka_product_qna_asker ON jakka_product_qna(asker_id);

CREATE OR REPLACE FUNCTION update_jakka_product_qna_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_jakka_product_qna_updated_at ON jakka_product_qna;
CREATE TRIGGER trg_jakka_product_qna_updated_at
    BEFORE UPDATE ON jakka_product_qna
    FOR EACH ROW EXECUTE FUNCTION update_jakka_product_qna_updated_at();

ALTER TABLE jakka_product_qna ENABLE ROW LEVEL SECURITY;

-- 조회: 공개글은 누구나 / 비공개는 본인(질문자) + 해당 작가
DROP POLICY IF EXISTS "jakka_product_qna_select" ON jakka_product_qna;
CREATE POLICY "jakka_product_qna_select"
    ON jakka_product_qna FOR SELECT
    USING (
        is_private = false
        OR asker_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM jakka_products p
            JOIN jakka_creators c ON c.id = p.creator_id
            WHERE p.id = jakka_product_qna.product_id
              AND c.user_id = auth.uid()
        )
    );

-- 질문 등록: 로그인 사용자
DROP POLICY IF EXISTS "jakka_product_qna_insert" ON jakka_product_qna;
CREATE POLICY "jakka_product_qna_insert"
    ON jakka_product_qna FOR INSERT
    WITH CHECK (auth.uid() = asker_id);

-- 수정: 질문자는 question만(답변 전), 작가는 answer 전용
DROP POLICY IF EXISTS "jakka_product_qna_update" ON jakka_product_qna;
CREATE POLICY "jakka_product_qna_update"
    ON jakka_product_qna FOR UPDATE
    USING (
        (asker_id = auth.uid() AND answered_at IS NULL)
        OR EXISTS (
            SELECT 1 FROM jakka_products p
            JOIN jakka_creators c ON c.id = p.creator_id
            WHERE p.id = jakka_product_qna.product_id
              AND c.user_id = auth.uid()
        )
    );

-- 삭제: 질문자 또는 작가
DROP POLICY IF EXISTS "jakka_product_qna_delete" ON jakka_product_qna;
CREATE POLICY "jakka_product_qna_delete"
    ON jakka_product_qna FOR DELETE
    USING (
        asker_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM jakka_products p
            JOIN jakka_creators c ON c.id = p.creator_id
            WHERE p.id = jakka_product_qna.product_id
              AND c.user_id = auth.uid()
        )
    );
