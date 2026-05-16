// SmarComm Brand Assets — V2.0 § 3-D 자산화 SSOT
//
// Entity Branding 영속 자산의 타입·템플릿·CRUD 헬퍼.
// 5 Entity Type을 표준화하고, Schema.org JSON-LD를 영속 저장한다.

export type EntityType =
    | 'Organization'
    | 'Service'
    | 'Person'
    | 'Product'
    | 'FAQPage'
    | 'HowTo'
    | 'WebSite'
    | 'BreadcrumbList'
    | 'SoftwareApplication'
    | 'Article';

export interface EntityTypeMeta {
    key: EntityType;
    label: string;
    icon: string;
    description: string;
    /** 자동 생성 지원 여부 (schema-generator.ts) */
    autoGen: boolean;
    /** Phase 5 이상 — Person·Product 자동 등록은 정보 부족으로 어려움 */
    manualOnly?: boolean;
}

/** § 3-D Entity 5종 + 보조 5종 = 총 10종 — Schema.org 표준 정렬 */
export const ENTITY_TYPES: EntityTypeMeta[] = [
    { key: 'Organization',         label: '기업·조직',     icon: '🏢', description: '회사의 핵심 정체성 (이름·소속·연락처·SameAs). 모든 자산의 베이스.', autoGen: true },
    { key: 'Service',              label: '서비스',        icon: '🎯', description: '판매·제공 중인 서비스 카탈로그. 가격·범위·산출물.', autoGen: true },
    { key: 'Person',               label: '인물·전문가',   icon: '👤', description: '대표·핵심 인물 프로필 (Phase 5 — 신뢰 신호 핵심).', autoGen: false, manualOnly: true },
    { key: 'Product',              label: '제품',          icon: '📦', description: '개별 제품·상품 (Phase 5).', autoGen: false, manualOnly: true },
    { key: 'FAQPage',              label: 'FAQ',           icon: '❓', description: '자주 묻는 질문 + 답변. AI가 직접 인용하기 좋은 형식.', autoGen: true },
    { key: 'HowTo',                label: '가이드·튜토리얼', icon: '📋', description: '단계별 가이드. AI 추천 응답에 인용되기 쉬움.', autoGen: false, manualOnly: true },
    { key: 'WebSite',              label: '사이트',        icon: '🌐', description: '사이트 메타 (이름·URL·검색 액션). 단일 Entity.', autoGen: true },
    { key: 'BreadcrumbList',       label: '경로',          icon: '🗺️', description: '사이트 내 위치 경로. 자동 생성.', autoGen: true },
    { key: 'SoftwareApplication',  label: 'SaaS·앱',       icon: '💻', description: '소프트웨어 제품 (SaaS·앱·플러그인).', autoGen: false, manualOnly: true },
    { key: 'Article',              label: '기사·블로그',   icon: '📰', description: '블로그·매거진 글 (개별 콘텐츠 자산).', autoGen: false, manualOnly: true },
];

export function getEntityMeta(type: EntityType): EntityTypeMeta {
    return ENTITY_TYPES.find(e => e.key === type) ?? ENTITY_TYPES[0];
}

// ── 자산 row 표준 형태 ──
export interface BrandAsset {
    id: string;
    tenant_id: string;
    member_id: string | null;
    entity_type: EntityType;
    name: string;
    slug: string;
    description: string | null;
    schema_jsonld: Record<string, unknown>;
    valid_from: string;
    valid_until: string | null;
    source_campaign_id: string | null;
    source_scan_id: string | null;
    source_creative_id: string | null;
    persistence_score: number;
    is_public: boolean;
    created_at: string;
    updated_at: string;
}

export interface AssetDistribution {
    id: string;
    asset_id: string;
    tenant_id: string;
    channel: 'wikipedia' | 'news_press' | 'academic_paper' | 'industry_directory' | 'social_proof' | 'company_listing' | 'product_db' | 'other';
    medium_name: string;
    external_url: string | null;
    status: 'pending' | 'submitted' | 'live' | 'rejected' | 'expired';
    submitted_at: string | null;
    confirmed_at: string | null;
    domain_authority: number | null;
    notes: string | null;
    created_at: string;
    updated_at: string;
}

export interface AssetCitation {
    id: string;
    asset_id: string;
    tenant_id: string;
    platform: 'claude' | 'chatgpt' | 'perplexity' | 'naver-cue' | 'google-aio';
    query: string;
    response_excerpt: string | null;
    probe_scan_id: string | null;
    accuracy: 'exact' | 'partial' | 'wrong';
    measured_at: string;
}

// ── 채널 메타 ──
export const DISTRIBUTION_CHANNEL_META: Record<AssetDistribution['channel'], { label: string; icon: string; tip: string }> = {
    wikipedia:           { label: '위키피디아',       icon: '📚', tip: '권위 최상위. Notability 충족 필요.' },
    news_press:          { label: '뉴스·보도자료',    icon: '📰', tip: '권위 상위. 매체 직접 발신 효과 큼.' },
    academic_paper:      { label: '학술 백서',        icon: '🎓', tip: 'AI 학습 데이터에 진입할 가능성 높음.' },
    industry_directory:  { label: '산업 디렉토리',    icon: '📂', tip: '업종별 카탈로그 (예: Capterra, G2).' },
    social_proof:        { label: '소셜 증거',        icon: '👥', tip: '리뷰 사이트·커뮤니티 (예: Reddit, GitHub).' },
    company_listing:     { label: '기업 정보',        icon: '🏢', tip: '잡코리아·NICE·Crunchbase 등.' },
    product_db:          { label: '제품 DB',          icon: '🗃️', tip: 'Product Hunt·App Store 등.' },
    other:               { label: '기타',              icon: '🔗', tip: '커스텀 채널.' },
};

export const DISTRIBUTION_STATUS_META: Record<AssetDistribution['status'], { label: string; color: string }> = {
    pending:   { label: '대기',    color: '#6B7280' },
    submitted: { label: '제출됨',  color: '#3B82F6' },
    live:      { label: '게재됨',  color: '#10B981' },
    rejected:  { label: '반려',    color: '#DC2626' },
    expired:   { label: '만료',    color: '#9CA3AF' },
};

// ── JSON-LD 템플릿 생성 ──
export function buildOrganizationSchema(input: { name: string; url?: string; description?: string; foundingDate?: string; logo?: string; sameAs?: string[] }) {
    const jsonld: Record<string, unknown> = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: input.name,
    };
    if (input.url) jsonld.url = input.url;
    if (input.description) jsonld.description = input.description;
    if (input.foundingDate) jsonld.foundingDate = input.foundingDate;
    if (input.logo) jsonld.logo = input.logo;
    if (input.sameAs && input.sameAs.length > 0) jsonld.sameAs = input.sameAs;
    return jsonld;
}

export function buildServiceSchema(input: { name: string; description?: string; provider?: string; areaServed?: string; offers?: { price?: number; priceCurrency?: string } }) {
    const jsonld: Record<string, unknown> = {
        '@context': 'https://schema.org',
        '@type': 'Service',
        name: input.name,
    };
    if (input.description) jsonld.description = input.description;
    if (input.provider) jsonld.provider = { '@type': 'Organization', name: input.provider };
    if (input.areaServed) jsonld.areaServed = input.areaServed;
    if (input.offers?.price) {
        jsonld.offers = { '@type': 'Offer', price: input.offers.price, priceCurrency: input.offers.priceCurrency ?? 'KRW' };
    }
    return jsonld;
}

export function buildFAQSchema(input: { name: string; questions: Array<{ q: string; a: string }> }) {
    return {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        name: input.name,
        mainEntity: input.questions.map(({ q, a }) => ({
            '@type': 'Question',
            name: q,
            acceptedAnswer: { '@type': 'Answer', text: a },
        })),
    };
}

export function buildWebSiteSchema(input: { name: string; url: string; description?: string }) {
    return {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: input.name,
        url: input.url,
        ...(input.description ? { description: input.description } : {}),
    };
}

// ── 슬러그 정규화 (URL-safe) ──
export function slugify(input: string): string {
    return input
        .toLowerCase()
        .trim()
        .replace(/[^\w\s가-힣-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .slice(0, 60) || `asset-${Date.now()}`;
}

// ── 디지털 흔적 점수 (persistence_score) 산출 ──
// 외부 배포 live + 인용 정확도 누적 평가
//
// V2.1 § 1.10 정직성 (Phase 5 Item 4 — 2026-05-16) — 채널 가중치는 max cap이며,
// distribution.domain_authority 가 있으면 DA-scaled (DA × maxWeight / 100)로 정규화한다.
// domain_authority IS NULL인 경우만 채널 가중치 fallback (휴리스틱).
// DA 자동 채움: POST /api/smarcomm/assets/[id]/distributions/enrich-da (Moz·Ahrefs)
export function computePersistenceScore(distributions: AssetDistribution[], citations: AssetCitation[]): number {
    if (distributions.length === 0 && citations.length === 0) return 0;

    // 배포 채널별 가중치 (DA 미연동 시 fallback / DA 연동 시 max cap)
    const channelWeight: Record<AssetDistribution['channel'], number> = {
        wikipedia: 25,
        news_press: 15,
        academic_paper: 20,
        industry_directory: 8,
        social_proof: 5,
        company_listing: 5,
        product_db: 5,
        other: 3,
    };

    let distScore = 0;
    for (const d of distributions) {
        if (d.status !== 'live') continue;
        const maxWeight = channelWeight[d.channel];
        const score = d.domain_authority != null
            ? Math.round(d.domain_authority * maxWeight / 100)
            : maxWeight;
        distScore += score;
    }
    distScore = Math.min(60, distScore); // 배포 최대 60점

    // 인용 정확도
    let citScore = 0;
    for (const c of citations) {
        if (c.accuracy === 'exact') citScore += 4;
        else if (c.accuracy === 'partial') citScore += 2;
        else if (c.accuracy === 'wrong') citScore -= 2;
    }
    citScore = Math.max(0, Math.min(40, citScore)); // 인용 최대 40점

    return Math.min(100, distScore + citScore);
}
