// Paid / Earned / Owned × SEO / GEO / AEO 3×3 매트릭스 계산기
//
// 각 셀은 기존 scan 분석 결과(techSeo·contentSeo·geoChecks·geoReadiness)에서
// 관련 항목을 뽑아 0~100 점수로 환산한다.
//
// measuredAs:
//   'measured'   — 해당 항목이 직접 측정됨
//   'inferred'   — 측정값으로 간접 추론 (실제 Paid 퍼포먼스와 다를 수 있음)
//   'unavailable'— 외부 도구(Phase 4) 없이는 측정 불가

export type MediaType = 'owned' | 'earned' | 'paid';
export type OptType = 'seo' | 'geo' | 'aeo';
export type MeasuredAs = 'measured' | 'inferred' | 'unavailable';

export interface CheckSnapshot {
    name: string;
    status: 'pass' | 'warning' | 'fail';
    score: number;
    maxScore: number;
}

export interface MatrixCell {
    score: number | null;   // 0~100, null = unavailable
    measuredAs: MeasuredAs;
    checks: CheckSnapshot[];
    description: string;    // 이 셀이 측정하는 것
    unavailableReason?: string;
}

export type MediaMatrix = {
    [M in MediaType]: { [O in OptType]: MatrixCell }
};

// AnalysisItem 최소 타입 (seo-analyzer에서 import 없이 독립 유지)
interface Item { name: string; score: number; maxScore: number; status: 'pass' | 'warning' | 'fail'; }
interface GeoCheck { platform: string; mentioned: boolean; skipped?: boolean; }

export interface ScanForMatrix {
    techSeo?: Item[];
    contentSeo?: Item[];
    geoChecks?: GeoCheck[];
    geoReadiness?: Item[];
}

// ── 헬퍼 ────────────────────────────────────────────────────────────
function pick(items: Item[], names: string[]): Item[] {
    const set = new Set(names);
    return items.filter(i => set.has(i.name));
}

function avg(items: Item[]): number | null {
    if (!items.length) return null;
    const total = items.reduce((s, i) => s + i.score, 0);
    const max = items.reduce((s, i) => s + i.maxScore, 0);
    if (max <= 0) return null;
    return Math.round((total / max) * 100);
}

function toSnapshots(items: Item[]): CheckSnapshot[] {
    return items.map(i => ({ name: i.name, status: i.status, score: i.score, maxScore: i.maxScore }));
}

// ── 체크 이름 상수 (index-calculator SSOT 동기화) ───────────────────
const FINDABILITY_TECH = [
    '페이지 로딩 속도', '모바일 최적화', 'HTTPS 적용',
    '크롤링 접근성 (robots + sitemap)', '인덱싱 가능', 'Canonical URL', '사이트 링크 분류',
];
const FINDABILITY_CONTENT = ['타이틀 태그', '메타 디스크립션', 'H1~H3 구조', '언어 설정'];
const CITABILITY_TECH = ['AI 봇 Access (5 플랫폼)', 'llms.txt (AI 친화 진입점)'];
const SCHEMA = ['구조화 데이터'];
const GEO_READINESS_GEO = ['구조화 데이터 AI 친화도'];
const GEO_READINESS_AEO = ['콘텐츠 인용 친화도'];
const CONTENT_AEO = ['H1~H3 구조', '타이틀 태그', '메타 디스크립션'];
const CONTENT_PAID_SEO = ['콘텐츠 볼륨', '이미지 ALT 태그'];
const TECH_PAID_SEO = ['페이지 로딩 속도', '모바일 최적화', 'HTTPS 적용'];
const CONTENT_PAID_GEO = ['OG 태그 (소셜 공유)', '타이틀 태그'];
const CONTENT_PAID_AEO = ['H1~H3 구조', '콘텐츠 볼륨'];

// ── 메인 함수 ────────────────────────────────────────────────────────
export function computeMediaMatrix(scan: ScanForMatrix): MediaMatrix {
    const tech = scan.techSeo ?? [];
    const content = scan.contentSeo ?? [];
    const geo = scan.geoChecks ?? [];
    const readiness = scan.geoReadiness ?? [];

    // ── Owned × SEO ──
    const ownedSeoItems = [...pick(tech, FINDABILITY_TECH), ...pick(content, FINDABILITY_CONTENT)];
    const ownedSeo: MatrixCell = {
        score: avg(ownedSeoItems),
        measuredAs: ownedSeoItems.length ? 'measured' : 'unavailable',
        checks: toSnapshots(ownedSeoItems),
        description: '자사 사이트 기술·콘텐츠 SEO (크롤링·인덱싱·메타)',
    };

    // ── Owned × GEO ──
    const ownedGeoItems = [
        ...pick(tech, CITABILITY_TECH),
        ...pick(tech, SCHEMA),
        ...pick(readiness, GEO_READINESS_GEO),
    ];
    const ownedGeo: MatrixCell = {
        score: avg(ownedGeoItems),
        measuredAs: ownedGeoItems.length ? 'measured' : 'unavailable',
        checks: toSnapshots(ownedGeoItems),
        description: 'AI 크롤러 접근·구조화 데이터·llms.txt',
    };

    // ── Owned × AEO ──
    const ownedAeoItems = [
        ...pick(readiness, GEO_READINESS_AEO),
        ...pick(content, CONTENT_AEO),
    ];
    const ownedAeo: MatrixCell = {
        score: avg(ownedAeoItems),
        measuredAs: ownedAeoItems.length ? 'measured' : 'unavailable',
        checks: toSnapshots(ownedAeoItems),
        description: '인용·답변 최적화 — 콘텐츠 구조·인용 친화도',
    };

    // ── Earned × SEO ──
    // 외부 백링크·DA/DR 측정은 Phase 4 외부 도구 필요
    const earnedSeo: MatrixCell = {
        score: null,
        measuredAs: 'unavailable',
        checks: [],
        description: '외부 백링크·도메인 권위 (Ahrefs/Moz)',
        unavailableReason: '외부 링크 데이터는 Phase 4에서 Ahrefs/Moz API로 측정 예정',
    };

    // ── Earned × GEO ──
    const activeGeo = geo.filter(c => !c.skipped);
    const mentionedCount = activeGeo.filter(c => c.mentioned).length;
    const platformCount = activeGeo.length;
    const earnedGeo: MatrixCell = {
        score: platformCount > 0 ? Math.round((mentionedCount / platformCount) * 100) : null,
        measuredAs: platformCount > 0 ? 'measured' : 'unavailable',
        checks: activeGeo.map(c => ({
            name: c.platform,
            status: c.mentioned ? 'pass' : 'fail',
            score: c.mentioned ? 1 : 0,
            maxScore: 1,
        })),
        description: 'AI 플랫폼 브랜드 언급 (Claude·ChatGPT·Perplexity·Naver·Google AIO)',
    };

    // ── Earned × AEO ──
    // 구조화 데이터(Review/Rating schema)로 간접 추론
    const earnedAeoItems = [...pick(tech, SCHEMA), ...pick(content, ['콘텐츠 볼륨'])];
    const earnedAeo: MatrixCell = {
        score: avg(earnedAeoItems),
        measuredAs: earnedAeoItems.length ? 'inferred' : 'unavailable',
        checks: toSnapshots(earnedAeoItems),
        description: '리뷰·인용·E-E-A-T Experience 신호 (구조화 데이터에서 추론)',
    };

    // ── Paid × SEO ──
    const paidSeoItems = [...pick(tech, TECH_PAID_SEO), ...pick(content, CONTENT_PAID_SEO)];
    const paidSeo: MatrixCell = {
        score: avg(paidSeoItems),
        measuredAs: paidSeoItems.length ? 'inferred' : 'unavailable',
        checks: toSnapshots(paidSeoItems),
        description: '광고 랜딩 품질 (속도·모바일·콘텐츠 — Quality Score 간접 지표)',
    };

    // ── Paid × GEO ──
    const paidGeoItems = [...pick(content, CONTENT_PAID_GEO), ...pick(tech, SCHEMA)];
    const paidGeo: MatrixCell = {
        score: avg(paidGeoItems),
        measuredAs: paidGeoItems.length ? 'inferred' : 'unavailable',
        checks: toSnapshots(paidGeoItems),
        description: 'AI 응답 내 광고 브랜드 명확성 (OG·구조화 데이터에서 추론)',
    };

    // ── Paid × AEO ──
    const paidAeoItems = [
        ...pick(tech, SCHEMA),
        ...pick(readiness, GEO_READINESS_GEO),
        ...pick(content, CONTENT_PAID_AEO),
    ];
    const paidAeo: MatrixCell = {
        score: avg(paidAeoItems),
        measuredAs: paidAeoItems.length ? 'inferred' : 'unavailable',
        checks: toSnapshots(paidAeoItems),
        description: 'Product·LocalBusiness Schema — 쇼핑·답변 광고 노출 기반',
    };

    return {
        owned: { seo: ownedSeo, geo: ownedGeo, aeo: ownedAeo },
        earned: { seo: earnedSeo, geo: earnedGeo, aeo: earnedAeo },
        paid:   { seo: paidSeo,   geo: paidGeo,   aeo: paidAeo },
    };
}

export const MEDIA_LABELS: Record<MediaType, { ko: string; desc: string }> = {
    owned:  { ko: '자사 채널', desc: '웹사이트·블로그·앱 등 직접 운영하는 미디어' },
    earned: { ko: '획득 채널', desc: 'AI 노출·언론·후기·소셜 공유 등 외부에서 얻은 미디어' },
    paid:   { ko: '유료 채널', desc: '검색 광고·디스플레이·소셜 광고 등 비용 집행 미디어' },
};

export const OPT_LABELS: Record<OptType, { ko: string; desc: string }> = {
    seo: { ko: 'SEO', desc: '검색 엔진 최적화' },
    geo: { ko: 'GEO', desc: '생성형 AI 검색 최적화' },
    aeo: { ko: 'AEO', desc: '답변 엔진 최적화' },
};
