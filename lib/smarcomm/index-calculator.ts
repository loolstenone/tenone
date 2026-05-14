// SmarComm Index 계산 SSOT
//
// 가중치: Findability 30% + Trust 30% + Citability 40% (CLAUDE.md § 3-A SSOT-1)
// 등급:   S(95+) · A(80~94) · B(60~79) · C(40~59) · D(0~39)
//
// 입력: seo-analyzer의 AnalysisResult (techSeo·contentSeo·geoChecks·geoReadiness·performance)
// 출력: 3축 점수 + 통합 Index + 등급
//
// 분류 규칙:
//   - Findability(30%) = 기술 SEO의 "찾혀짐" 관련 + 사이트 구조 (속도·모바일·HTTPS·크롤링·인덱싱·내부 링크)
//   - Trust(30%)       = 콘텐츠 SEO 전반 + 구조화 데이터 + 도메인 권위
//   - Citability(40%)  = AI 노출 실측 + 인용 가능성 (geoChecks·geoReadiness)

import type { AnalysisResult, AnalysisItem, GeoCheckResult } from './seo-analyzer';
import type { BacklinkData } from './analyzers/backlink-authority';
import type { WikidataResult } from './analyzers/wikidata-knowledge-graph';

export type Grade = 'S' | 'A' | 'B' | 'C' | 'D';

export interface EEATBreakdown {
    experience: number;          // 0~100 — "직접 경험" 신호 (작성일·후기·1차 데이터)
    expertise: number;           // 0~100 — "전문성" 신호 (작성자·기관·자격)
    authoritativeness: number | null; // 0~100 or null(N/A) — 백링크·DR (Moz DA / Ahrefs DR)
    trustworthiness: number;     // 0~100 — HTTPS·보안 헤더·연락처 (Mozilla Observatory 등)
}

export interface IndexScores {
    findability: number;        // 0~100
    trust: number;              // 0~100
    citability: number;         // 0~100
    index: number;              // 0~100 (가중 합)
    grade: Grade;
}

export interface IndexBreakdown extends IndexScores {
    [key: string]: unknown;
    findabilityItems: AnalysisItem[];
    trustItems: AnalysisItem[];
    citabilityChecks: GeoCheckResult[];
    citabilityReadiness: AnalysisItem[];
    /** E-E-A-T 4 sub-score (Google QRG § 3) — Trust 분해 표시용 */
    eeat: EEATBreakdown;
    /** Wikidata Knowledge Graph 등록 여부 — Citability 보너스 표시용 */
    knowledgeGraph?: {
        registered: boolean;
        entityCount: number;
        bonus: number;
    };
    // Phase 3 부가 데이터 — scan API에서 동적 추가
    schemaSuggestions?: unknown[];
    actionPlan?: Array<{
        title: string;
        category: string;
        impact: 'high' | 'medium' | 'low';
        effort: 'low' | 'medium' | 'high';
        quadrant: 'quick-win' | 'major' | 'fill-in' | 'avoid';
        role: 'marketer' | 'dev' | 'writer' | 'designer';
        estimatedPoints: number;
        action: string;
        description: string;
    }>;
    execSummary?: { winning: string; problem: string; nextAction: string; generatedAt: string } | null;
}

// 0~100 정규화 헬퍼
function toPct(score: number, max: number): number {
    if (max <= 0) return 0;
    return Math.round((score / max) * 100);
}

function pickItems(items: AnalysisItem[], names: string[]): AnalysisItem[] {
    const set = new Set(names);
    return items.filter(i => set.has(i.name));
}

// === Findability: "찾힐 수 있는가" — 기술 SEO·구조·메타 ===
// Phase 1.5에서 카드 분리·이름 변경 반영
const FINDABILITY_TECH = [
    '페이지 로딩 속도',
    '모바일 최적화',
    'HTTPS 적용',
    '크롤링 접근성 (robots + sitemap)', // Phase 1.5 — 이름 변경
    '인덱싱 가능',                       // Phase 1.5 — 분리
    'Canonical URL',                     // Phase 1.5 — 분리
    '사이트 링크 분류',                  // Phase 1.5 — 이름 변경 (구 "내부 링크")
];
const FINDABILITY_CONTENT = [
    '타이틀 태그',
    '메타 디스크립션',
    'H1~H3 구조',
    '언어 설정',
];

// === Trust: "신뢰할 만한가" — 콘텐츠 깊이·구조화 ===
const TRUST_TECH = [
    '구조화 데이터',
];
const TRUST_CONTENT = [
    '이미지 ALT 태그',
    'OG 태그 (소셜 공유)',
    '콘텐츠 볼륨',
    '보안 헤더 (Mozilla Observatory)',   // Phase 1.5.6 — E-E-A-T Trustworthiness
];

// === Citability 보강: AI 봇 access + llms.txt는 techSeo에 있지만 Citability로 분류 ===
const CITABILITY_TECH = [
    'AI 봇 Access (5 플랫폼)',
    'llms.txt (AI 친화 진입점)',
];

export function computeIndex(result: AnalysisResult, backlink?: BacklinkData, wikidata?: WikidataResult): IndexBreakdown {
    // ── Findability 점수 ──
    const findabilityTechItems = pickItems(result.techSeo, FINDABILITY_TECH);
    const findabilityContentItems = pickItems(result.contentSeo, FINDABILITY_CONTENT);
    const findabilityItems = [...findabilityTechItems, ...findabilityContentItems];
    const fTotal = findabilityItems.reduce((s, i) => s + i.score, 0);
    const fMax = findabilityItems.reduce((s, i) => s + i.maxScore, 0);
    const findability = toPct(fTotal, fMax);

    // ── Trust 점수 ──
    const trustTechItems = pickItems(result.techSeo, TRUST_TECH);
    const trustContentItems = pickItems(result.contentSeo, TRUST_CONTENT);
    const trustItems = [...trustTechItems, ...trustContentItems];
    const tTotal = trustItems.reduce((s, i) => s + i.score, 0);
    const tMax = trustItems.reduce((s, i) => s + i.maxScore, 0);
    const trust = toPct(tTotal, tMax);

    // ── Citability 점수 ──
    // 1. AI 플랫폼 노출 (geoChecks) — 50점 만점
    const platformCount = result.geoChecks.length || 1;
    const mentionedCount = result.geoChecks.filter(c => c.mentioned).length;
    const platformScore = Math.round((mentionedCount / platformCount) * 50);

    // 2. AI 준비도 (geoReadiness) — 30점 만점 (도메인 권위도 T4는 maxScore 0이라 합산에서 자동 제외)
    const readinessTotal = result.geoReadiness.reduce((s, i) => s + i.score, 0);
    const readinessMax = result.geoReadiness.reduce((s, i) => s + i.maxScore, 0);
    const readinessScore = readinessMax > 0
        ? Math.round((readinessTotal / readinessMax) * 30)
        : 0;

    // 3. AI 봇 access + llms.txt (Phase 1.5 신규) — 20점 만점
    const citabilityTechItems = pickItems(result.techSeo, CITABILITY_TECH);
    const techTotal = citabilityTechItems.reduce((s, i) => s + i.score, 0);
    const techMax = citabilityTechItems.reduce((s, i) => s + i.maxScore, 0);
    const techScore = techMax > 0 ? Math.round((techTotal / techMax) * 20) : 0;

    // 4. Wikidata Knowledge Graph 보너스 — 최대 +10점 (kgScore 0~100 → 0~10)
    const kgBonus = wikidata?.found ? Math.round(wikidata.kgScore / 10) : 0;

    const citability = Math.min(100, platformScore + readinessScore + techScore + kgBonus);

    // ── 통합 Index (가중 합 30/30/40) ──
    const index = Math.round(findability * 0.3 + trust * 0.3 + citability * 0.4);

    // ── E-E-A-T 4 sub-score (Google QRG § 3) ──
    // Experience: 콘텐츠 볼륨 + 이미지 ALT (1차 경험 흔적)
    const experienceItems = pickItems(result.contentSeo, ['콘텐츠 볼륨', '이미지 ALT 태그']);
    const expE = experienceItems.reduce((s, i) => s + i.score, 0);
    const expEMax = experienceItems.reduce((s, i) => s + i.maxScore, 0);
    const experience = expEMax > 0 ? toPct(expE, expEMax) : 0;

    // Expertise: 구조화 데이터(Person/Org schema 포함 여부) + OG 태그(외부 노출 전문성 표지)
    const expertiseItems = [
        ...pickItems(result.techSeo, ['구조화 데이터']),
        ...pickItems(result.contentSeo, ['OG 태그 (소셜 공유)']),
    ];
    const expT = expertiseItems.reduce((s, i) => s + i.score, 0);
    const expTMax = expertiseItems.reduce((s, i) => s + i.maxScore, 0);
    const expertise = expTMax > 0 ? toPct(expT, expTMax) : 0;

    // Authoritativeness: Moz DA (0-100) or Ahrefs DR (0-100), 없으면 Wikidata kgScore, 그래도 없으면 null
    const authoritativeness: number | null =
        backlink?.domainAuthority ?? backlink?.domainRating ?? (wikidata?.found ? wikidata.kgScore : null);

    // Trustworthiness: HTTPS + 보안 헤더 (Mozilla Observatory)
    const trustworthinessItems = [
        ...pickItems(result.techSeo, ['HTTPS 적용']),
        ...pickItems(result.contentSeo, ['보안 헤더 (Mozilla Observatory)']),
    ];
    const trW = trustworthinessItems.reduce((s, i) => s + i.score, 0);
    const trWMax = trustworthinessItems.reduce((s, i) => s + i.maxScore, 0);
    const trustworthiness = trWMax > 0 ? toPct(trW, trWMax) : 0;

    return {
        findability,
        trust,
        citability,
        index,
        grade: getGrade(index),
        findabilityItems,
        trustItems,
        citabilityChecks: result.geoChecks,
        citabilityReadiness: result.geoReadiness,
        eeat: { experience, expertise, authoritativeness, trustworthiness },
        knowledgeGraph: wikidata
            ? { registered: wikidata.found, entityCount: wikidata.entities.length, bonus: kgBonus }
            : undefined,
    };
}

export function getGrade(index: number): Grade {
    if (index >= 95) return 'S';
    if (index >= 80) return 'A';
    if (index >= 60) return 'B';
    if (index >= 40) return 'C';
    return 'D';
}

// 등급 메타데이터 (UI 렌더용)
export const GRADE_META: Record<Grade, { label: string; color: string; description: string }> = {
    S: { label: 'S', color: '#16A34A', description: '최상위 — 업종 평균 대비 압도적 우위' },
    A: { label: 'A', color: '#22C55E', description: '우수 — 검색·AI 검색 모두 잘 노출됨' },
    B: { label: 'B', color: '#3B82F6', description: '양호 — 기본기 갖춤, 보강 시 상위권 진입 가능' },
    C: { label: 'C', color: '#F59E0B', description: '개선 필요 — 핵심 항목 누락 다수' },
    D: { label: 'D', color: '#DC2626', description: '심각 — 검색·AI 검색에서 거의 보이지 않음' },
};

// 마케터에게 보여줄 4가지 질문 매핑 SSOT
export interface MarketerQuestion {
    id: 'findability' | 'trust' | 'citability' | 'competition';
    icon: string;
    question: string;
    score?: number;
    color: string;
}

export function buildMarketerQuestions(breakdown: IndexBreakdown): MarketerQuestion[] {
    return [
        { id: 'findability', icon: '🔍', question: '고객이 우리를 찾을 수 있는가?', score: breakdown.findability, color: '#3B82F6' },
        { id: 'trust',       icon: '⭐', question: '고객이 우리를 신뢰할 만한가?',    score: breakdown.trust,       color: '#A855F7' },
        { id: 'citability',  icon: '🤖', question: 'AI가 우리를 추천하는가?',         score: breakdown.citability,  color: '#10B981' },
        { id: 'competition', icon: '⚔️', question: '경쟁사 대비 어떤가?',              color: '#F59E0B' },
    ];
}
