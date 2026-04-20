-- Phase A-7: NFT 블록체인 정보
-- 날짜: 2026-04-20

ALTER TABLE jakka_products
    ADD COLUMN IF NOT EXISTS nft_chain             TEXT,   -- 'ethereum', 'polygon', 'base', 'solana' 등
    ADD COLUMN IF NOT EXISTS nft_contract_address  TEXT,
    ADD COLUMN IF NOT EXISTS nft_token_id          TEXT,
    ADD COLUMN IF NOT EXISTS nft_token_standard    TEXT,   -- 'ERC-721', 'ERC-1155' 등
    ADD COLUMN IF NOT EXISTS nft_metadata_uri      TEXT,   -- IPFS 또는 HTTP URL
    ADD COLUMN IF NOT EXISTS nft_explorer_url      TEXT;   -- Etherscan 등 직접 링크

-- 기존 NFT 더미 상품에 데모 정보 주입
UPDATE jakka_products SET
    nft_chain = 'ethereum',
    nft_contract_address = '0x3b3ee1931dc30c1957379fac9aba94d1c48a5405',
    nft_token_id = '1',
    nft_token_standard = 'ERC-721',
    nft_metadata_uri = 'ipfs://QmX5fZqZqZqZqZqZqZqZqZqZqZqZqZqZqZqZqZqZqZqZq',
    nft_explorer_url = 'https://etherscan.io/address/0x3b3ee1931dc30c1957379fac9aba94d1c48a5405'
WHERE title = 'Genesis #001';

UPDATE jakka_products SET
    nft_chain = 'polygon',
    nft_contract_address = '0x9a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b',
    nft_token_id = '12',
    nft_token_standard = 'ERC-1155',
    nft_metadata_uri = 'ipfs://QmMoonCat12000000000000000000000000000000000',
    nft_explorer_url = 'https://polygonscan.com/address/0x9a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b'
WHERE title = 'Moon Cat Collection #12';
