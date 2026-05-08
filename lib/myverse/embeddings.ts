// Myverse 임베딩 생성 — OpenAI text-embedding-3-small (1536 차원)
// 환경변수 OPENAI_API_KEY 필요. 없으면 null 반환.

const OPENAI_EMBED_URL = "https://api.openai.com/v1/embeddings";
const MODEL = "text-embedding-3-small";

export async function embed(text: string): Promise<number[] | null> {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return null;
    const cleaned = (text ?? "").trim().slice(0, 8000);
    if (!cleaned) return null;

    try {
        const res = await fetch(OPENAI_EMBED_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({ model: MODEL, input: cleaned }),
        });
        if (!res.ok) {
            console.warn("[embeddings] OpenAI error:", res.status);
            return null;
        }
        const data = await res.json();
        return data?.data?.[0]?.embedding ?? null;
    } catch (e) {
        console.warn("[embeddings] failed:", (e as Error).message);
        return null;
    }
}

/** 흔적 → 임베딩 텍스트 (caption + tags + meta 합성) */
export function momentEmbeddingText(m: {
    caption?: string | null;
    sub_tags?: string[] | null;
    location?: string | null;
    with_whom?: string | null;
    activity?: string | null;
    domain?: string | null;
}): string {
    const parts: string[] = [];
    if (m.caption) parts.push(m.caption);
    if (m.location) parts.push(`장소: ${m.location}`);
    if (m.with_whom) parts.push(`함께: ${m.with_whom}`);
    if (m.activity) parts.push(`활동: ${m.activity}`);
    if (m.domain) parts.push(`영역: ${m.domain}`);
    if (m.sub_tags && m.sub_tags.length > 0) parts.push(`태그: ${m.sub_tags.join(", ")}`);
    return parts.join(" · ");
}

export const EMBED_MODEL_NAME = MODEL;
