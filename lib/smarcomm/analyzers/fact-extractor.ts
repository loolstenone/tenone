// Fact Extractor — 자사 사이트와 AI 응답에서 핵심 사실을 추출하고 비교
//
// 목적: "AI가 우리 브랜드 사실을 정확히 말하는가" 측정
// 추출 카테고리:
//   - price: 가격 (월/연 단위, ₩/$/€ 인식)
//   - features: 핵심 기능 키워드 (서비스 페이지에서)
//   - strengths: 강점 키워드 (Hero/About에서)
//   - category: 업종 분류
//   - founded: 설립/시작 연도
//
// 추출 우선순위:
//   1) Schema.org structured data (가장 정확)
//   2) Meta description (요약 정보)
//   3) Hero 영역 본문 패턴 (휴리스틱)

export interface BrandFacts {
    /** 가격 정보 — 가장 저렴/대표 플랜 단위 표기 */
    price?: { value: number; currency: 'KRW' | 'USD' | 'EUR'; period: 'month' | 'year' | 'one-time' };
    /** 핵심 기능 키워드 (최대 5개) */
    features?: string[];
    /** 강점 키워드 (최대 5개) */
    strengths?: string[];
    /** 업종 분류 */
    category?: string;
    /** 설립 연도 */
    founded?: number;
    /** 원문 사실 단편 (감사용 — 어디서 추출됐는지) */
    sources?: Array<{ field: string; from: string; raw: string }>;
}

// ── 자사 사이트에서 사실 추출 ──
export function extractFromSite(
    html: string,
    schemaEntries: Array<{ type: string; raw: Record<string, unknown> }>,
    meta: { title?: string; description?: string; ogTitle?: string; ogDescription?: string },
): BrandFacts {
    const facts: BrandFacts = { sources: [] };

    // 1) Schema.org Organization·Service·Product에서 추출
    for (const entry of schemaEntries) {
        const raw = entry.raw;
        if (entry.type === 'Organization' || entry.type === 'Corporation') {
            if (typeof raw.foundingDate === 'string') {
                const year = parseInt(raw.foundingDate.slice(0, 4), 10);
                if (year > 1800) { facts.founded = year; facts.sources!.push({ field: 'founded', from: 'Schema:Organization.foundingDate', raw: raw.foundingDate }); }
            }
            if (typeof raw.description === 'string') {
                facts.strengths = extractKeywordsFromText(raw.description).slice(0, 5);
                if (facts.strengths.length > 0) facts.sources!.push({ field: 'strengths', from: 'Schema:Organization.description', raw: raw.description.slice(0, 100) });
            }
        }
        if (entry.type === 'Service' || entry.type === 'Product' || entry.type === 'SoftwareApplication') {
            const offer = raw.offers as Record<string, unknown> | undefined;
            if (offer) {
                const price = extractPriceFromOffer(offer);
                if (price && !facts.price) {
                    facts.price = price;
                    facts.sources!.push({ field: 'price', from: `Schema:${entry.type}.offers`, raw: JSON.stringify(offer).slice(0, 100) });
                }
            }
            if (typeof raw.category === 'string') {
                facts.category = raw.category;
                facts.sources!.push({ field: 'category', from: `Schema:${entry.type}.category`, raw: raw.category });
            }
        }
    }

    // 2) 메타 설명 + OG에서 강점 키워드 (schema 우선이지만 보조)
    if (!facts.strengths || facts.strengths.length === 0) {
        const text = [meta.description, meta.ogDescription, meta.title, meta.ogTitle].filter(Boolean).join(' ');
        facts.strengths = extractKeywordsFromText(text).slice(0, 5);
        if (facts.strengths.length > 0) facts.sources!.push({ field: 'strengths', from: 'meta+og description', raw: text.slice(0, 100) });
    }

    // 3) 본문에서 가격 패턴 검색 (schema에 없을 때)
    if (!facts.price) {
        const cleanedText = html
            .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
            .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
            .replace(/<[^>]+>/g, ' ')
            .replace(/\s+/g, ' ');
        const price = extractPriceFromText(cleanedText);
        if (price) {
            facts.price = price;
            facts.sources!.push({ field: 'price', from: 'body text pattern', raw: '...' });
        }

        // 본문에서 기능 키워드 — "AI 분석", "자동화", "GEO" 등 명사구
        facts.features = extractFeatureKeywordsFromBody(cleanedText).slice(0, 5);
        if (facts.features.length > 0) facts.sources!.push({ field: 'features', from: 'body text', raw: '...' });
    }

    return facts;
}

// V2.1 § 1.10 정직 원칙 — `extractFromAIResponse` / `compareFacts` 함수 완전 제거 (2026-05-15).
// AI 응답 의미 분석은 LLM(`lib/smarcomm/sentiment-llm.ts`)으로 일원화.
// `BrandFacts` 타입과 `extractFromSite` (사이트 측 표준 추출)은 유지.

// AccuracyVerdict 타입은 다른 곳에서 참조될 수 있어 유지
export type AccuracyVerdict = 'exact' | 'partial' | 'wrong' | 'absent';

// ── 헬퍼 ──
function extractPriceFromOffer(offer: Record<string, unknown>): BrandFacts['price'] | null {
    const price = offer.price ?? (offer as { lowPrice?: unknown }).lowPrice;
    const currency = (offer.priceCurrency as string) || 'KRW';
    const periodRaw = (offer as { billingDuration?: string }).billingDuration;
    if (price == null) return null;
    const value = typeof price === 'string' ? parseFloat(price.replace(/[,\s]/g, '')) : Number(price);
    if (!Number.isFinite(value)) return null;
    return {
        value,
        currency: (currency === 'KRW' || currency === 'USD' || currency === 'EUR') ? currency : 'KRW',
        period: periodRaw?.includes('Y') ? 'year' : 'month',
    };
}

function extractPriceFromText(text: string): BrandFacts['price'] | null {
    // 한국어 패턴: "14.9만 원/월", "월 9만원", "₩99,000"
    const patterns: Array<{ re: RegExp; parse: (m: RegExpMatchArray) => BrandFacts['price'] | null }> = [
        // "14.9만 원" 또는 "29만원"
        { re: /([\d.]+)\s*만\s*원/, parse: (m) => ({ value: Math.round(parseFloat(m[1]) * 10000), currency: 'KRW', period: 'month' }) },
        // "월 9만원" / "9만원/월"
        { re: /월\s*([\d,]+)\s*원|([\d,]+)\s*원\s*\/\s*월/, parse: (m) => ({ value: parseInt((m[1] || m[2]).replace(/,/g, ''), 10), currency: 'KRW', period: 'month' }) },
        // "₩99,000" / "99,000원"
        { re: /[₩\\]\s*([\d,]+)|([\d,]{4,})\s*원/, parse: (m) => ({ value: parseInt((m[1] || m[2]).replace(/,/g, ''), 10), currency: 'KRW', period: 'month' }) },
        // "$29/month"
        { re: /\$\s*([\d.]+)\s*\/\s*(?:month|mo|월)/i, parse: (m) => ({ value: parseFloat(m[1]), currency: 'USD', period: 'month' }) },
    ];

    for (const { re, parse } of patterns) {
        const m = text.match(re);
        if (m) {
            const result = parse(m);
            if (result && result.value > 0) return result;
        }
    }
    return null;
}

const STOPWORDS = new Set(['는', '은', '이', '가', '를', '을', '에', '의', '에서', '와', '과', 'the', 'a', 'an', 'is', 'are', 'and', 'or', '및', '및']);

function extractKeywordsFromText(text: string): string[] {
    const tokens = text
        .replace(/[^\w\sㄱ-ㅎㅏ-ㅣ가-힣·-]/g, ' ')
        .split(/\s+/)
        .filter(w => w.length >= 2 && !STOPWORDS.has(w.toLowerCase()))
        .map(w => w.trim())
        .filter(Boolean);

    // 빈도순 정렬
    const freq: Record<string, number> = {};
    for (const t of tokens) freq[t] = (freq[t] || 0) + 1;
    return Object.entries(freq)
        .sort(([, a], [, b]) => b - a)
        .map(([k]) => k)
        .slice(0, 10);
}

function extractFeatureKeywordsFromBody(text: string): string[] {
    // 마케팅 SaaS 특화: 명사구 패턴 매칭
    const matches: Set<string> = new Set();
    const patterns = [
        /AI\s*([가-힣]+)/g,
        /([가-힣]+)\s*분석/g,
        /([가-힣]+)\s*자동화/g,
        /([가-힣]+)\s*최적화/g,
        /GEO|SEO|CRM|API/g,
    ];
    for (const p of patterns) {
        let m;
        while ((m = p.exec(text)) !== null) {
            const phrase = m[0].trim();
            if (phrase.length >= 2 && phrase.length <= 15) matches.add(phrase);
        }
    }
    return Array.from(matches).slice(0, 5);
}

function normalizeKw(s: string): string {
    return s.trim().toLowerCase().replace(/[\s·-]/g, '');
}

function formatPrice(p: BrandFacts['price']): string {
    if (!p) return '';
    const symbol = p.currency === 'KRW' ? '₩' : p.currency === 'USD' ? '$' : '€';
    const period = p.period === 'month' ? '/월' : p.period === 'year' ? '/년' : '';
    if (p.currency === 'KRW' && p.value >= 10000) {
        const manVal = (p.value / 10000).toFixed(p.value % 10000 === 0 ? 0 : 1);
        return `${manVal}만 원${period}`;
    }
    return `${symbol}${p.value.toLocaleString('ko-KR')}${period}`;
}
