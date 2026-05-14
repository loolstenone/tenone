// Schema.org JSON-LD 자동 생성기
//
// 분석 결과 기반으로 5종 schema를 자동 생성. 마케터/개발자가 그대로 복사 → <head>에 삽입.
//
// 생성 5종:
//   1) Organization (모든 사이트 필수)
//   2) WebSite (검색 sitelinks search box)
//   3) FAQPage (AI 검색 인용 최적)
//   4) Service (해당 시)
//   5) BreadcrumbList (사이트 구조)
//
// 출처: Schema.org 표준 + Google Rich Results 요건

import type { BrandFacts } from './analyzers/fact-extractor';

export interface SchemaSuggestion {
    type: string;
    label: string;
    description: string;
    /** 이미 적용된 schema인지 — 적용됐으면 "✓ 적용됨" 표시 */
    alreadyApplied: boolean;
    /** 권장 우선순위 */
    priority: 'critical' | 'high' | 'recommended';
    /** 복사용 JSON-LD <script> 블록 */
    snippet: string;
    /** 미충족 필드 / 자동 생성된 placeholder 표시 */
    placeholders: string[];
}

interface BuildContext {
    domain: string;
    url: string;
    siteName?: string;
    siteTruth?: BrandFacts | null;
    /** 페이지 메타 */
    title?: string;
    description?: string;
    ogImage?: string;
    /** 이미 있는 schema @type 목록 */
    existingTypes: Set<string>;
    /** FAQ 추출 후보 (페이지 본문에서) */
    faqCandidates?: Array<{ q: string; a: string }>;
}

function wrap(obj: Record<string, unknown>): string {
    const json = JSON.stringify(obj, null, 2);
    return `<script type="application/ld+json">\n${json}\n</script>`;
}

function placeholderText(field: string): string {
    return `__${field}__`;
}

/** Schema 5종 자동 생성. 이미 적용된 것은 알려주고, 누락된 것만 placeholder로 채워서 제공 */
export function generateSchemaSuggestions(ctx: BuildContext): SchemaSuggestion[] {
    const suggestions: SchemaSuggestion[] = [];

    // 1) Organization — 모든 사이트 필수
    {
        const alreadyApplied = ctx.existingTypes.has('Organization') || ctx.existingTypes.has('Corporation');
        const placeholders: string[] = [];
        const org: Record<string, unknown> = {
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: ctx.siteName || ctx.siteTruth?.strengths?.[0] || placeholderText('회사명'),
            url: `https://${ctx.domain}`,
        };
        if (!ctx.siteName && !ctx.siteTruth?.strengths?.[0]) placeholders.push('name (회사 정식명)');

        if (ctx.description || ctx.siteTruth?.strengths) {
            org.description = ctx.description || ctx.siteTruth?.strengths?.slice(0, 3).join(', ');
        } else placeholders.push('description (한 줄 소개)');

        org.logo = `https://${ctx.domain}/logo.png`;
        placeholders.push('logo (1200x630 .png URL로 교체)');

        if (ctx.siteTruth?.founded) {
            org.foundingDate = `${ctx.siteTruth.founded}-01-01`;
        }

        org.sameAs = [
            `https://www.linkedin.com/company/${placeholderText('linkedin-id')}`,
            `https://twitter.com/${placeholderText('twitter-handle')}`,
        ];
        placeholders.push('sameAs (LinkedIn·X·Facebook 등 공식 계정 URL)');

        suggestions.push({
            type: 'Organization',
            label: 'Organization',
            description: '회사·기관 정보 — Google Knowledge Panel·검색 사이드바 노출의 기본',
            alreadyApplied,
            priority: alreadyApplied ? 'recommended' : 'critical',
            snippet: wrap(org),
            placeholders,
        });
    }

    // 2) WebSite — sitelinks 검색 박스
    {
        const alreadyApplied = ctx.existingTypes.has('WebSite');
        const site: Record<string, unknown> = {
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: ctx.siteName || placeholderText('사이트명'),
            url: `https://${ctx.domain}`,
            potentialAction: {
                '@type': 'SearchAction',
                target: {
                    '@type': 'EntryPoint',
                    urlTemplate: `https://${ctx.domain}/search?q={search_term_string}`,
                },
                'query-input': 'required name=search_term_string',
            },
        };
        suggestions.push({
            type: 'WebSite',
            label: 'WebSite',
            description: 'Google 검색 결과에 sitelinks 검색박스 노출 + 사이트 정체 명시',
            alreadyApplied,
            priority: alreadyApplied ? 'recommended' : 'high',
            snippet: wrap(site),
            placeholders: ['SearchAction url이 실제 검색 경로와 일치하는지 확인'],
        });
    }

    // 3) FAQPage — AI 검색 인용 최적
    {
        const alreadyApplied = ctx.existingTypes.has('FAQPage');
        const faqs = ctx.faqCandidates && ctx.faqCandidates.length > 0
            ? ctx.faqCandidates
            : [
                { q: `${ctx.siteName || ctx.domain}는 무엇인가요?`, a: ctx.description || placeholderText('짧은 한 줄 답변') },
                { q: '어떤 기능이 있나요?', a: ctx.siteTruth?.features?.join(', ') || placeholderText('핵심 기능 3가지') },
                { q: '가격은 얼마인가요?', a: ctx.siteTruth?.price ? `월 ${(ctx.siteTruth.price.value / 10000).toFixed(1)}만 원부터` : placeholderText('Free·Pro·Enterprise 등 플랜 안내') },
            ];
        const faq: Record<string, unknown> = {
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: faqs.map(f => ({
                '@type': 'Question',
                name: f.q,
                acceptedAnswer: { '@type': 'Answer', text: f.a },
            })),
        };
        suggestions.push({
            type: 'FAQPage',
            label: 'FAQPage',
            description: '⭐ AI 검색이 자주 인용하는 형식. ChatGPT/Perplexity 답변에 우리 페이지 인용 가능성 ↑',
            alreadyApplied,
            priority: alreadyApplied ? 'recommended' : 'critical',
            snippet: wrap(faq),
            placeholders: ['질문 5~10개로 확장 권장 (제품 핵심 의문 위주)'],
        });
    }

    // 4) Service (마케팅·SaaS 등)
    if (ctx.siteTruth?.category || ctx.existingTypes.has('Service') === false) {
        const alreadyApplied = ctx.existingTypes.has('Service');
        const svc: Record<string, unknown> = {
            '@context': 'https://schema.org',
            '@type': 'Service',
            name: ctx.siteName || placeholderText('서비스명'),
            provider: { '@type': 'Organization', name: ctx.siteName || placeholderText('회사명') },
            description: ctx.description || placeholderText('서비스 한 줄 설명'),
            serviceType: ctx.siteTruth?.category || placeholderText('업종 (예: Marketing SaaS)'),
        };
        if (ctx.siteTruth?.price) {
            svc.offers = {
                '@type': 'Offer',
                price: String(ctx.siteTruth.price.value),
                priceCurrency: ctx.siteTruth.price.currency,
            };
        } else {
            svc.offers = {
                '@type': 'Offer',
                price: placeholderText('가격 (숫자만)'),
                priceCurrency: 'KRW',
            };
        }
        suggestions.push({
            type: 'Service',
            label: 'Service',
            description: 'B2B/SaaS 사이트 — 서비스 제공자/가격 명시. Google "서비스" 패널 노출',
            alreadyApplied,
            priority: alreadyApplied ? 'recommended' : 'high',
            snippet: wrap(svc),
            placeholders: ctx.siteTruth?.price ? [] : ['가격 (정확한 숫자로 교체)'],
        });
    }

    // 5) BreadcrumbList
    {
        const alreadyApplied = ctx.existingTypes.has('BreadcrumbList');
        const breadcrumb: Record<string, unknown> = {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Home', item: `https://${ctx.domain}` },
                { '@type': 'ListItem', position: 2, name: placeholderText('카테고리'), item: `https://${ctx.domain}/category` },
                { '@type': 'ListItem', position: 3, name: placeholderText('현재 페이지'), item: ctx.url },
            ],
        };
        suggestions.push({
            type: 'BreadcrumbList',
            label: 'BreadcrumbList',
            description: '검색 결과에 빵 부스러기 경로 노출 — 페이지 구조 명시',
            alreadyApplied,
            priority: alreadyApplied ? 'recommended' : 'recommended',
            snippet: wrap(breadcrumb),
            placeholders: ['각 페이지의 실제 경로로 교체'],
        });
    }

    return suggestions;
}

/** 하나의 HTML로 만들어 다운로드 가능하게 통합 */
export function buildIntegratedSchemaHTML(suggestions: SchemaSuggestion[]): string {
    const blocks = suggestions
        .filter(s => !s.alreadyApplied)
        .map(s => s.snippet)
        .join('\n\n');
    return `<!--\n  SmarComm Index — 권장 Schema.org JSON-LD\n  __ 표시는 placeholder. 실제 값으로 교체 후 <head>에 삽입.\n-->\n${blocks}`;
}
