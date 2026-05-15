// LLM Source Classifier — V2.1 § 3-A SSOT-7 정직성 회복
//
// AI 응답에 등장한 URL/도메인을 의미적으로 분류한다 (휴리스틱 정규식 폐기).
// batch 호출 — 한 scan의 모든 URL을 한 번에 LLM에 전달.
//
// 비용: Claude Haiku 4.5 — input ~500 tokens + output ~300 tokens = 응답당 ~$0.0005
//       scan당 1회 호출 (URL 다수를 한 번에) = ~$0.0005

import Anthropic from '@anthropic-ai/sdk';

const MODEL = 'claude-haiku-4-5-20251001';

export type SourceCategoryLlm = 'news' | 'wiki' | 'official' | 'blog' | 'social' | 'forum' | 'review' | 'academic' | 'directory' | 'unknown';
export type TrustLevel = 'high' | 'medium' | 'low';

export interface ClassifiedSource {
    url: string;
    domain: string;
    category: SourceCategoryLlm;
    trust: TrustLevel;
    reason: string;
}

const SYSTEM_PROMPT = `당신은 도메인·URL 분류 전문가입니다. 각 URL을 9 카테고리 중 하나로 분류하고 신뢰도를 평가합니다.

카테고리:
- news: 뉴스 매체 (조선·동아·중앙·BBC·CNN·Reuters 등)
- wiki: 위키 (Wikipedia·나무위키·기업 위키)
- official: 공식 사이트 (브랜드·기업 자체 도메인)
- blog: 개인·기업 블로그 (Medium·티스토리·브런치)
- social: 소셜 (Twitter/X·Facebook·Instagram·LinkedIn·YouTube)
- forum: 커뮤니티·포럼 (Reddit·디시·클리앙·StackOverflow)
- review: 리뷰 사이트 (Yelp·TripAdvisor·G2·Capterra)
- academic: 학술 (arXiv·Google Scholar·논문 저널)
- directory: 산업 디렉토리·기업 정보 사이트 (Crunchbase·NICE·잡코리아)
- unknown: 판단 불가

신뢰도:
- high: 권위 매체·검증된 출처 (news·wiki·academic·official)
- medium: 보조 출처 (blog·directory·review)
- low: 검증 어려움 (social·forum·unknown)

JSON 응답 (코드 펜스 불필요):
{
  "sources": [
    {
      "url": "원본 URL",
      "domain": "도메인",
      "category": "news"|"wiki"|...,
      "trust": "high"|"medium"|"low",
      "reason": "분류 근거 (한 줄 ≤60자)"
    }
  ]
}`;

export async function classifySourcesLLM(
    urls: Array<{ url: string; domain: string }>,
    apiKey?: string,
): Promise<ClassifiedSource[] | null> {
    if (urls.length === 0) return [];

    const key = apiKey ?? process.env.ANTHROPIC_API_KEY;
    if (!key) return null;

    // 너무 많으면 chunked
    const MAX_BATCH = 30;
    const chunks: Array<Array<{ url: string; domain: string }>> = [];
    for (let i = 0; i < urls.length; i += MAX_BATCH) {
        chunks.push(urls.slice(i, i + MAX_BATCH));
    }

    const client = new Anthropic({ apiKey: key });
    const results: ClassifiedSource[] = [];

    for (const chunk of chunks) {
        try {
            const response = await client.messages.create({
                model: MODEL,
                max_tokens: 1500,
                system: SYSTEM_PROMPT,
                messages: [{
                    role: 'user',
                    content: `다음 ${chunk.length}개 URL을 분류해 JSON으로 응답하세요.

${chunk.map((u, i) => `${i + 1}. ${u.url} (domain: ${u.domain})`).join('\n')}`,
                }],
            });

            const text = response.content
                .filter((b): b is Anthropic.TextBlock => b.type === 'text')
                .map(b => b.text)
                .join('');

            const parsed = parseJsonRobust(text);
            if (!parsed || !Array.isArray(parsed.sources)) continue;

            for (const s of parsed.sources) {
                const c = normalizeSource(s as Record<string, unknown>);
                if (c) results.push(c);
            }
        } catch (err) {
            console.error('[source-classifier-llm] failed:', (err as Error).message);
        }
    }

    return results;
}

const VALID_CATEGORIES: SourceCategoryLlm[] = ['news', 'wiki', 'official', 'blog', 'social', 'forum', 'review', 'academic', 'directory', 'unknown'];
const VALID_TRUST: TrustLevel[] = ['high', 'medium', 'low'];

function normalizeSource(s: Record<string, unknown>): ClassifiedSource | null {
    const url = typeof s.url === 'string' ? s.url : null;
    const domain = typeof s.domain === 'string' ? s.domain : null;
    if (!url || !domain) return null;
    const category = typeof s.category === 'string' && VALID_CATEGORIES.includes(s.category as SourceCategoryLlm)
        ? s.category as SourceCategoryLlm
        : 'unknown';
    const trust = typeof s.trust === 'string' && VALID_TRUST.includes(s.trust as TrustLevel)
        ? s.trust as TrustLevel
        : 'low';
    return {
        url,
        domain,
        category,
        trust,
        reason: typeof s.reason === 'string' ? s.reason.slice(0, 100) : '',
    };
}

function parseJsonRobust(text: string): { sources?: unknown } | null {
    try { return JSON.parse(text); } catch { /* continue */ }
    const fence = text.match(/```(?:json)?\s*([\s\S]+?)```/);
    if (fence) {
        try { return JSON.parse(fence[1].trim()); } catch { /* continue */ }
    }
    const block = text.match(/\{[\s\S]+\}/);
    if (block) {
        try { return JSON.parse(block[0]); } catch { /* fall through */ }
    }
    return null;
}
