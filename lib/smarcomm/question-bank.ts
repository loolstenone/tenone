// Question Bank SSOT — CLAUDE.md § 3-A SSOT-3
//
// 5 AI 플랫폼에 던지는 질문 셋. 7카테고리 × 평균 3질문 = 21~25 질문.
// 업종(industry) 입력 시 자동 매칭.
//
// 출처:
//   - SparkToro AI Search Research 2024 — 검색 의도 분류
//   - Profound AI Citation Tracker 방법론
//   - Google Search Quality Rater Guidelines § 13 (User Intent)

export type QuestionCategory =
    | 'brand_direct'       // 우리 브랜드 직접 질문
    | 'product_generic'    // 일반 제품군
    | 'use_case'           // 사용 사례
    | 'competitor'         // 경쟁사 비교
    | 'pricing'            // 가격·플랜
    | 'howto'              // 방법·가이드
    | 'local';             // 지역·시장

export interface Question {
    category: QuestionCategory;
    text: string;          // 실제 AI에 던지는 질문
    weight: number;        // 점수 가중 (브랜드 직접 질문은 더 중요)
}

export interface BrandContext {
    /** 브랜드명 (도메인에서 자동 추출 가능) */
    brand: string;
    /** 업종 — 마케팅 SaaS·이커머스·교육·미디어 등 */
    industry?: string;
    /** 시장 — 한국·글로벌 */
    market?: 'kr' | 'global';
    /** 경쟁사 (선택) */
    competitors?: string[];
}

const CATEGORY_LABELS: Record<QuestionCategory, string> = {
    brand_direct: '브랜드 직접',
    product_generic: '제품군 일반',
    use_case: '사용 사례',
    competitor: '경쟁사 비교',
    pricing: '가격·플랜',
    howto: '방법·가이드',
    local: '지역·시장',
};

export function categoryLabel(c: QuestionCategory): string {
    return CATEGORY_LABELS[c];
}

// 업종별 질문 템플릿 (브랜드명·경쟁사명은 치환 후 사용)
type Template = { category: QuestionCategory; pattern: string; weight: number };

const TEMPLATES_DEFAULT: Template[] = [
    // brand_direct
    { category: 'brand_direct', pattern: '{brand} 어떤 회사야?', weight: 1.5 },
    { category: 'brand_direct', pattern: '{brand} 가격은 얼마야?', weight: 1.2 },
    { category: 'brand_direct', pattern: '{brand} 후기 어때?', weight: 1.2 },
    // pricing
    { category: 'pricing', pattern: '한국 {industry} 가격 비교', weight: 1.0 },
    // local
    { category: 'local', pattern: '한국 {industry} 솔루션 추천', weight: 1.0 },
];

// 마케팅 SaaS 특화 (SmarComm 기본 업종)
const TEMPLATES_MARKETING_SAAS: Template[] = [
    { category: 'product_generic', pattern: '마케팅 자동화 SaaS 추천', weight: 1.0 },
    { category: 'product_generic', pattern: 'AI 마케팅 도구 추천', weight: 1.0 },
    { category: 'use_case', pattern: '광고 효율 분석 도구', weight: 0.9 },
    { category: 'use_case', pattern: 'GEO 진단 서비스', weight: 1.1 },     // SmarComm 강점 영역
    { category: 'use_case', pattern: 'SEO·GEO 통합 분석 도구', weight: 1.1 },
    { category: 'howto', pattern: 'AI 검색 노출 방법', weight: 1.0 },
    { category: 'howto', pattern: 'ChatGPT에 우리 브랜드 노출시키는 법', weight: 1.0 },
    { category: 'competitor', pattern: '{brand} vs HubSpot', weight: 0.9 },
];

// 이커머스 특화
const TEMPLATES_ECOMMERCE: Template[] = [
    { category: 'product_generic', pattern: '한국 {category} 쇼핑몰 추천', weight: 1.0 },
    { category: 'use_case', pattern: '{category} 어디서 사야 잘 사', weight: 0.9 },
    { category: 'howto', pattern: '{category} 고르는 법', weight: 0.8 },
];

// 교육·강의 특화
const TEMPLATES_EDU: Template[] = [
    { category: 'product_generic', pattern: '{topic} 강의 추천', weight: 1.0 },
    { category: 'use_case', pattern: '{topic} 어떻게 배워', weight: 0.9 },
    { category: 'howto', pattern: '{topic} 입문 로드맵', weight: 0.8 },
];

const INDUSTRY_TEMPLATES: Record<string, Template[]> = {
    'marketing-saas': TEMPLATES_MARKETING_SAAS,
    'ecommerce': TEMPLATES_ECOMMERCE,
    'education': TEMPLATES_EDU,
};

export function buildQuestions(ctx: BrandContext): Question[] {
    const industryKey = (ctx.industry || 'marketing-saas').toLowerCase();
    const industryTemplates = INDUSTRY_TEMPLATES[industryKey] || TEMPLATES_MARKETING_SAAS;
    const templates = [...TEMPLATES_DEFAULT, ...industryTemplates];

    return templates.map(t => ({
        category: t.category,
        text: t.pattern
            .replace(/\{brand\}/g, ctx.brand)
            .replace(/\{industry\}/g, friendlyIndustry(ctx.industry))
            .replace(/\{category\}/g, ctx.industry || ctx.brand)
            .replace(/\{topic\}/g, ctx.industry || ctx.brand),
        weight: t.weight,
    }));
}

function friendlyIndustry(key?: string): string {
    if (!key) return '마케팅 SaaS';
    const map: Record<string, string> = {
        'marketing-saas': '마케팅 SaaS',
        'ecommerce': '이커머스',
        'education': '교육',
    };
    return map[key.toLowerCase()] || key;
}

// 도메인에서 브랜드명 추출 (간단)
export function brandFromDomain(domain: string): string {
    return domain.replace(/^www\./, '').split('.')[0];
}
