-- pgvector — 흔적 의미 검색용 임베딩 인프라
--
-- OpenAI text-embedding-3-small (1536 차원) 또는 voyage-multilingual-2 (1024 차원) 등 선택 가능.
-- 일단 1536 차원으로 시작. 모델 변경 시 컬럼 재생성 필요.

CREATE EXTENSION IF NOT EXISTS vector;

ALTER TABLE myverse_daily_moments
    ADD COLUMN IF NOT EXISTS embedding vector(1536),
    ADD COLUMN IF NOT EXISTS embedding_model text,
    ADD COLUMN IF NOT EXISTS embedding_at timestamptz;

-- HNSW 인덱스 (코사인 거리)
CREATE INDEX IF NOT EXISTS idx_moments_embedding ON myverse_daily_moments
    USING hnsw (embedding vector_cosine_ops);

-- RPC — 의미 유사 검색 (member_id 격리)
-- 사용: select * from myverse_search_moments_semantic(member_id, query_embedding, limit)
CREATE OR REPLACE FUNCTION myverse_search_moments_semantic(
    p_member_id uuid,
    p_query_embedding vector(1536),
    p_match_count int DEFAULT 30
)
RETURNS TABLE (
    id uuid,
    date date,
    domain text,
    sub_tags text[],
    media_type text,
    media_url text,
    thumbnail_url text,
    caption text,
    happened_at timestamptz,
    with_whom text,
    location text,
    activity text,
    similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        m.id,
        m.date,
        m.domain,
        m.sub_tags,
        m.media_type,
        m.media_url,
        m.thumbnail_url,
        m.caption,
        m.happened_at,
        m.with_whom,
        m.location,
        m.activity,
        1 - (m.embedding <=> p_query_embedding) AS similarity
    FROM myverse_daily_moments m
    WHERE m.member_id = p_member_id
      AND m.embedding IS NOT NULL
    ORDER BY m.embedding <=> p_query_embedding
    LIMIT p_match_count;
END;
$$;
