// Schema.org JSON-LD 자체 검증기
//
// Google Rich Results Test는 공식 API 없음 → 자체 구현.
// HTML 파싱 → JSON-LD 추출 → 정합성 검증 → 권장 schema 누락 검사.
//
// 출처:
//   - Schema.org 공식 (https://schema.org/)
//   - Google Search Central — Structured Data 가이드
//   - Rich Results Test 검증 규칙 (필수 필드)

export interface SchemaEntry {
    type: string;                          // @type 값 (예: 'Organization', 'FAQPage')
    raw: Record<string, unknown>;          // 원본 JSON
    validation: {
        valid: boolean;
        missingRequired: string[];         // 누락된 필수 필드
        warnings: string[];                // 누락된 권장 필드
    };
}

export interface SchemaAnalysis {
    found: SchemaEntry[];
    foundTypes: Set<string>;
    validCount: number;
    invalidCount: number;
    missingRecommended: string[];          // 사이트에 없는데 있어야 할 schema 종류
    parseErrors: string[];                 // JSON 파싱 실패한 블록들
}

// ── Schema 별 필수/권장 필드 (Google Rich Results 요건) ──
const SCHEMA_RULES: Record<string, { required: string[]; recommended?: string[] }> = {
    Organization: {
        required: ['name'],
        recommended: ['url', 'logo', 'sameAs', 'contactPoint'],
    },
    LocalBusiness: {
        required: ['name', 'address'],
        recommended: ['telephone', 'openingHours', 'priceRange'],
    },
    WebSite: {
        required: ['name', 'url'],
        recommended: ['potentialAction'], // SearchAction
    },
    WebPage: {
        required: [],
        recommended: ['datePublished', 'dateModified'],
    },
    Article: {
        required: ['headline', 'datePublished', 'author'],
        recommended: ['image', 'dateModified', 'publisher'],
    },
    BlogPosting: {
        required: ['headline', 'datePublished', 'author'],
        recommended: ['image', 'dateModified'],
    },
    FAQPage: {
        required: ['mainEntity'],          // Question 배열
        recommended: [],
    },
    Question: {
        required: ['name', 'acceptedAnswer'],
        recommended: [],
    },
    HowTo: {
        required: ['name', 'step'],
        recommended: ['totalTime', 'tool', 'supply'],
    },
    Product: {
        required: ['name'],
        recommended: ['image', 'description', 'offers', 'review', 'aggregateRating'],
    },
    BreadcrumbList: {
        required: ['itemListElement'],
        recommended: [],
    },
    Person: {
        required: ['name'],
        recommended: ['url', 'sameAs', 'jobTitle'],
    },
    Service: {
        required: ['name'],
        recommended: ['provider', 'serviceType', 'areaServed'],
    },
    SoftwareApplication: {
        required: ['name'],
        recommended: ['applicationCategory', 'operatingSystem', 'offers'],
    },
    Review: {
        required: ['author', 'reviewRating'],
        recommended: ['itemReviewed', 'datePublished'],
    },
};

// 마케팅 사이트라면 최소 있어야 할 schema (휴리스틱)
const RECOMMENDED_FOR_MARKETING = ['Organization', 'WebSite', 'FAQPage'];

export function analyzeSchema(html: string): SchemaAnalysis {
    const found: SchemaEntry[] = [];
    const parseErrors: string[] = [];
    const foundTypes = new Set<string>();

    // <script type="application/ld+json"> 블록 모두 추출
    const regex = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
    let match;
    while ((match = regex.exec(html)) !== null) {
        const jsonText = match[1].trim();
        if (!jsonText) continue;
        try {
            const parsed = JSON.parse(jsonText);
            // 단일 객체 또는 배열
            const blocks = Array.isArray(parsed) ? parsed : [parsed];
            for (const block of blocks) {
                processBlock(block, found, foundTypes);
            }
        } catch (err) {
            parseErrors.push((err as Error).message);
        }
    }

    const validCount = found.filter(f => f.validation.valid).length;
    const invalidCount = found.length - validCount;

    const missingRecommended = RECOMMENDED_FOR_MARKETING.filter(t => !foundTypes.has(t));

    return { found, foundTypes, validCount, invalidCount, missingRecommended, parseErrors };
}

function processBlock(block: unknown, found: SchemaEntry[], foundTypes: Set<string>) {
    if (!block || typeof block !== 'object') return;
    const obj = block as Record<string, unknown>;

    // @graph 안에 여러 entity 있는 경우
    if (Array.isArray(obj['@graph'])) {
        for (const sub of obj['@graph']) processBlock(sub, found, foundTypes);
        return;
    }

    const rawType = obj['@type'];
    const types = Array.isArray(rawType) ? rawType : (typeof rawType === 'string' ? [rawType] : []);
    if (types.length === 0) return;

    for (const type of types) {
        if (typeof type !== 'string') continue;
        foundTypes.add(type);
        const rule = SCHEMA_RULES[type];
        const missingRequired = rule?.required.filter(f => !(f in obj)) ?? [];
        const warnings = rule?.recommended?.filter(f => !(f in obj)) ?? [];
        found.push({
            type,
            raw: obj,
            validation: {
                valid: missingRequired.length === 0,
                missingRequired,
                warnings,
            },
        });
    }
}

// 점수화 — seo-analyzer에서 사용
export interface SchemaScore {
    score: number;             // 0~10
    description: string;
    action: string;
}

export function scoreSchema(analysis: SchemaAnalysis): SchemaScore {
    const { found, validCount, invalidCount, missingRecommended, parseErrors } = analysis;

    if (found.length === 0 && parseErrors.length === 0) {
        return {
            score: 0,
            description: '⛔ 구조화 데이터 없음 — 검색엔진/AI가 페이지 정체를 구조적으로 이해하기 어려움 (출처: Schema.org 표준)',
            action: 'JSON-LD <script>에 Organization + WebSite + (해당 시) FAQPage 추가',
        };
    }

    if (parseErrors.length > 0) {
        return {
            score: 2,
            description: `⚠ 구조화 데이터 ${found.length}개 + JSON 파싱 오류 ${parseErrors.length}건 — Google이 인식 못 함`,
            action: 'JSON 형식 오류 수정. Google Rich Results Test로 검증 필수',
        };
    }

    // 유효한 schema 개수 + 권장 schema 충족도로 점수
    const validRatio = found.length > 0 ? validCount / found.length : 0;
    const recommendedCovered = RECOMMENDED_FOR_MARKETING.length - missingRecommended.length;
    const recommendedRatio = recommendedCovered / RECOMMENDED_FOR_MARKETING.length;

    // 점수 = 유효성 50% + 권장 커버리지 50%
    const score = Math.round(validRatio * 5 + recommendedRatio * 5);

    const typesText = Array.from(analysis.foundTypes).slice(0, 5).join(', ');
    const missingText = missingRecommended.length > 0 ? ` 권장 누락: ${missingRecommended.join(', ')}.` : '';
    const invalidText = invalidCount > 0 ? ` ${invalidCount}개 schema 필수 필드 누락.` : '';

    return {
        score,
        description: `${score >= 8 ? '✓' : score >= 4 ? '△' : '⚠'} 구조화 데이터 ${found.length}개 (${typesText}).${invalidText}${missingText} (출처: Schema.org + Google Search Central)`,
        action: missingRecommended.length > 0
            ? `${missingRecommended.join(' + ')} schema 추가로 검색·AI 검색에서 우선 노출`
            : invalidCount > 0
                ? '누락된 필수 필드 보강 (Rich Results Test 통과 보장)'
                : '현 상태 유지 — Article/Product 등 페이지 종류별 추가 schema 검토',
    };
}
