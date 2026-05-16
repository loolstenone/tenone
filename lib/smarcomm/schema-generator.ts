// Schema.org JSON-LD 자동 생성기
//
// 분석 결과 기반으로 9종 schema를 자동 생성. 마케터/개발자가 그대로 복사 → <head>에 삽입.
//
// 생성 9종 (Phase 3 = 1~5 / Phase 5 Item 6 = 6~9):
//   1) Organization (모든 사이트 필수)
//   2) WebSite (검색 sitelinks search box)
//   3) FAQPage (AI 검색 인용 최적)
//   4) Service (해당 시)
//   5) BreadcrumbList (사이트 구조)
//   6) Person (핵심 인물 — 대표·전문가 프로필)
//   7) Product (개별 제품 — 가격·브랜드·평점)
//   8) HowTo (튜토리얼/방법론 — AI 인용 최적)
//   9) Article (뉴스·블로그 — 검색 풍부한 결과)
//
// 출처: Schema.org 표준 + Google Rich Results 요건 + V2.0 § 3-D Entity Branding

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

    // 6) Person — 대표·핵심 전문가 (Phase 5 Item 6)
    {
        const alreadyApplied = ctx.existingTypes.has('Person');
        const orgName = ctx.siteName || ctx.siteTruth?.strengths?.[0];
        const person: Record<string, unknown> = {
            '@context': 'https://schema.org',
            '@type': 'Person',
            name: placeholderText('대표/전문가 이름'),
            jobTitle: placeholderText('직책 (예: CEO·CTO·수석 컨설턴트)'),
            url: `https://${ctx.domain}/about/team`,
            image: `https://${ctx.domain}/team/${placeholderText('photo-slug')}.jpg`,
            sameAs: [
                `https://www.linkedin.com/in/${placeholderText('linkedin-handle')}`,
                `https://twitter.com/${placeholderText('twitter-handle')}`,
            ],
        };
        if (orgName) {
            person.worksFor = { '@type': 'Organization', name: orgName, url: `https://${ctx.domain}` };
        }
        suggestions.push({
            type: 'Person',
            label: 'Person',
            description: 'E-E-A-T Expertise/Authoritativeness 강화 — 대표·전문가 프로필을 AI가 인용할 수 있도록 영속화',
            alreadyApplied,
            priority: alreadyApplied ? 'recommended' : 'recommended',
            snippet: wrap(person),
            placeholders: [
                'name (실제 인물 이름)',
                'jobTitle (정확한 직책)',
                'image (얼굴 사진 URL — 정사각형 권장)',
                'sameAs (LinkedIn·X 공식 프로필 URL)',
            ],
        });
    }

    // 7) Product — 개별 제품 (Phase 5 Item 6)
    {
        const alreadyApplied = ctx.existingTypes.has('Product');
        const productName = ctx.siteName ? `${ctx.siteName} ${placeholderText('제품명')}` : placeholderText('제품명');
        const product: Record<string, unknown> = {
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: productName,
            description: ctx.description || placeholderText('제품 한 줄 설명'),
            image: ctx.ogImage || `https://${ctx.domain}/products/${placeholderText('product-slug')}.jpg`,
            brand: { '@type': 'Brand', name: ctx.siteName || placeholderText('브랜드명') },
            sku: placeholderText('SKU/모델번호'),
        };
        if (ctx.siteTruth?.price) {
            product.offers = {
                '@type': 'Offer',
                price: String(ctx.siteTruth.price.value),
                priceCurrency: ctx.siteTruth.price.currency,
                availability: 'https://schema.org/InStock',
                url: ctx.url,
            };
        } else {
            product.offers = {
                '@type': 'Offer',
                price: placeholderText('가격 (숫자만)'),
                priceCurrency: 'KRW',
                availability: 'https://schema.org/InStock',
                url: ctx.url,
            };
        }
        product.aggregateRating = {
            '@type': 'AggregateRating',
            ratingValue: placeholderText('평균 별점 (1~5)'),
            reviewCount: placeholderText('총 리뷰 수'),
        };
        suggestions.push({
            type: 'Product',
            label: 'Product',
            description: '커머스·SaaS 제품 — 가격·평점·재고 Rich Result 노출. Google Shopping·AI 추천 기반',
            alreadyApplied,
            priority: alreadyApplied ? 'recommended' : 'high',
            snippet: wrap(product),
            placeholders: [
                'name (정확한 제품명)',
                'image (제품 사진 URL — 1200×1200 권장)',
                'sku (실제 SKU 또는 제거)',
                ...(ctx.siteTruth?.price ? [] : ['가격 (숫자만 — 통화 분리)']),
                'aggregateRating (실측 평점·리뷰 수 또는 블록 제거)',
            ],
        });
    }

    // 8) HowTo — 튜토리얼/방법론 (Phase 5 Item 6)
    {
        const alreadyApplied = ctx.existingTypes.has('HowTo');
        const howto: Record<string, unknown> = {
            '@context': 'https://schema.org',
            '@type': 'HowTo',
            name: placeholderText('방법론 제목 (예: SmarComm으로 GEO 진단하는 법)'),
            description: placeholderText('이 방법론이 해결하는 문제 한 줄'),
            totalTime: placeholderText('ISO 8601 (예: PT15M = 15분)'),
            estimatedCost: { '@type': 'MonetaryAmount', currency: 'KRW', value: '0' },
            supply: [{ '@type': 'HowToSupply', name: placeholderText('필요 준비물 (없으면 블록 제거)') }],
            tool: [{ '@type': 'HowToTool', name: placeholderText('필요 도구 (없으면 블록 제거)') }],
            step: [
                { '@type': 'HowToStep', position: 1, name: placeholderText('1단계 제목'), text: placeholderText('1단계 상세 설명'), url: `${ctx.url}#step1` },
                { '@type': 'HowToStep', position: 2, name: placeholderText('2단계 제목'), text: placeholderText('2단계 상세 설명'), url: `${ctx.url}#step2` },
                { '@type': 'HowToStep', position: 3, name: placeholderText('3단계 제목'), text: placeholderText('3단계 상세 설명'), url: `${ctx.url}#step3` },
            ],
        };
        suggestions.push({
            type: 'HowTo',
            label: 'HowTo',
            description: '⭐ AI 답변·Google 단계별 Rich Result 인용 최적. FAQPage와 함께 GEO 핵심 schema',
            alreadyApplied,
            priority: alreadyApplied ? 'recommended' : 'high',
            snippet: wrap(howto),
            placeholders: [
                'name (튜토리얼 제목 — 검색 쿼리에 맞춤)',
                'step 배열 (실제 단계 수에 맞게 추가/삭제)',
                'totalTime (ISO 8601 형식 필수: PT5M, PT1H30M 등)',
                'supply·tool (필요 없으면 블록 자체 삭제)',
            ],
        });
    }

    // 9) Article — 뉴스·블로그·매체 글 (Phase 5 Item 6)
    {
        const alreadyApplied = ctx.existingTypes.has('Article') || ctx.existingTypes.has('NewsArticle') || ctx.existingTypes.has('BlogPosting');
        const orgName = ctx.siteName || ctx.siteTruth?.strengths?.[0] || placeholderText('발행 조직명');
        const today = new Date().toISOString().slice(0, 10);
        const article: Record<string, unknown> = {
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: ctx.title || placeholderText('기사 제목 (110자 이내 권장)'),
            description: ctx.description || placeholderText('기사 요약 (검색 결과에 노출)'),
            image: ctx.ogImage || `https://${ctx.domain}/og-image.jpg`,
            datePublished: placeholderText(`발행 ISO 날짜 (예: ${today})`),
            dateModified: placeholderText(`최종 수정 ISO 날짜 (예: ${today})`),
            author: { '@type': 'Person', name: placeholderText('기자/저자 이름'), url: `https://${ctx.domain}/about/${placeholderText('author-slug')}` },
            publisher: {
                '@type': 'Organization',
                name: orgName,
                logo: { '@type': 'ImageObject', url: `https://${ctx.domain}/logo.png`, width: 600, height: 60 },
            },
            mainEntityOfPage: { '@type': 'WebPage', '@id': ctx.url },
        };
        suggestions.push({
            type: 'Article',
            label: 'Article',
            description: '블로그·뉴스 페이지 — Google Top Stories·Discover 노출 + AI 답변에서 "최근 OO에 따르면" 인용',
            alreadyApplied,
            priority: alreadyApplied ? 'recommended' : 'recommended',
            snippet: wrap(article),
            placeholders: [
                'headline (페이지 H1과 일치)',
                'datePublished·dateModified (실제 ISO 날짜)',
                'author (실제 작성자 정보)',
                'image (1200×630 .jpg/.png)',
                '뉴스면 @type을 NewsArticle, 블로그면 BlogPosting으로 교체',
            ],
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
