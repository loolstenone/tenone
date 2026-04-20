-- NFT 카테고리 제거
-- 날짜: 2026-04-20

-- 기존 NFT 상품 삭제
DELETE FROM jakka_products WHERE category = 'NFT';

-- category CHECK 제약 갱신 (NFT 제거)
ALTER TABLE jakka_products DROP CONSTRAINT IF EXISTS jakka_products_category_check;
ALTER TABLE jakka_products ADD CONSTRAINT jakka_products_category_check
    CHECK (category IN ('원화', '프린트', '굿즈', '피규어', '포스터', '사진', '기타'));

-- currency CHECK — ETH 제거
ALTER TABLE jakka_products DROP CONSTRAINT IF EXISTS jakka_products_currency_check;
ALTER TABLE jakka_products ADD CONSTRAINT jakka_products_currency_check
    CHECK (currency = 'KRW');

ALTER TABLE jakka_orders DROP CONSTRAINT IF EXISTS jakka_orders_currency_check;
ALTER TABLE jakka_orders ADD CONSTRAINT jakka_orders_currency_check
    CHECK (currency = 'KRW');

-- NFT 전용 컬럼 제거
ALTER TABLE jakka_products
    DROP COLUMN IF EXISTS nft_chain,
    DROP COLUMN IF EXISTS nft_contract_address,
    DROP COLUMN IF EXISTS nft_token_id,
    DROP COLUMN IF EXISTS nft_token_standard,
    DROP COLUMN IF EXISTS nft_metadata_uri,
    DROP COLUMN IF EXISTS nft_explorer_url;

ALTER TABLE jakka_orders DROP COLUMN IF EXISTS wallet_address;
