// SmarComm Index 측정 임계값 SSOT
//
// 모든 점수의 pass/warn/fail 기준을 권위 있는 출처에 anchor.
// 보고서에서 hover 시 "출처:" 표시.
//
// CLAUDE.md § 3-A 원칙: 모든 점수는 T0(실측) ~ T2(비교)에서 나옴.
// T3(추정)·T4(부재)는 별도 표시.

export type MeasurementTier = 'T0_FACT' | 'T1_DERIVED' | 'T2_BENCHMARK' | 'T3_INFERRED' | 'T4_UNKNOWN';

export interface Threshold<TValue = number> {
    /** 권위 출처 (보고서 footnote 표시용) */
    source: string;
    /** 측정 신뢰도 단계 */
    tier: MeasurementTier;
    /** pass 조건 — 부등호 명시 */
    pass: TValue | { min?: TValue; max?: TValue };
    /** warn 조건 (pass에 못 미치지만 fail은 아닌 경계) */
    warn?: TValue | { min?: TValue; max?: TValue };
    /** 한국어 라벨 (UI 표시용) */
    label: string;
    /** 마케터용 설명 — "왜 이 임계값인가" */
    rationale: string;
}

// ═══════════════════════════════════════════════════════════════
// Core Web Vitals 2024 (Google 공식)
// https://web.dev/articles/vitals
// ═══════════════════════════════════════════════════════════════

export const CWV_LCP: Threshold = {
    source: 'Google Core Web Vitals 2024 (web.dev/vitals)',
    tier: 'T0_FACT',
    pass: { max: 2500 },         // ≤ 2.5s
    warn: { max: 4000 },         // 2.5~4s 보통, 4s+ 느림
    label: 'LCP (Largest Contentful Paint)',
    rationale: '가장 큰 컨텐츠가 표시되는 시간. 2.5초 이하가 Google 공식 "양호" 기준.',
};

export const CWV_INP: Threshold = {
    source: 'Google Core Web Vitals 2024 (INP가 FID 대체, 2024.03 발효)',
    tier: 'T0_FACT',
    pass: { max: 200 },          // ≤ 200ms
    warn: { max: 500 },          // 200~500 보통, 500+ 느림
    label: 'INP (Interaction to Next Paint)',
    rationale: '사용자 상호작용 직후 다음 페인트까지. 200ms 이하가 Google "양호". TBT를 대체.',
};

export const CWV_CLS: Threshold = {
    source: 'Google Core Web Vitals 2024',
    tier: 'T0_FACT',
    pass: { max: 0.1 },
    warn: { max: 0.25 },
    label: 'CLS (Cumulative Layout Shift)',
    rationale: '레이아웃 이동 누적. 0.1 이하가 Google "양호" 기준 (사용자가 클릭 잘못하는 빈도 최소).',
};

// ═══════════════════════════════════════════════════════════════
// SEO On-Page (Google Search Central + Lighthouse SEO Audit)
// ═══════════════════════════════════════════════════════════════

export const SEO_TITLE_LENGTH: Threshold = {
    source: 'Google Search Central — Title link best practices (SERP cutoff ~60자)',
    tier: 'T1_DERIVED',
    pass: { min: 30, max: 60 },
    warn: { min: 10, max: 70 },
    label: '타이틀 길이',
    rationale: 'Google 검색 결과는 ~60자에서 잘림. 30자 미만은 정보 부족, 60자 초과는 잘림 경고.',
};

export const SEO_META_DESCRIPTION_LENGTH: Threshold = {
    source: 'Google Search Central — Meta description best practices (SERP cutoff ~160자)',
    tier: 'T1_DERIVED',
    pass: { min: 70, max: 160 },
    warn: { min: 50, max: 200 },
    label: '메타 설명 길이',
    rationale: 'Google SERP은 ~160자에서 잘림 (모바일 ~120자). 70자 미만은 CTR 손실.',
};

export const SEO_H1_COUNT: Threshold<number> = {
    source: 'HTML5 표준 + Google Lighthouse SEO Audit',
    tier: 'T0_FACT',
    pass: 1,                     // 정확히 1개
    warn: 0,                     // 0개 또는 2개+
    label: 'H1 태그 수',
    rationale: '페이지당 H1 정확히 1개가 표준. 0개는 주제 신호 부재, 2개+는 SEO 혼란.',
};

export const SEO_ALT_RATIO: Threshold = {
    source: 'WCAG 2.1 Level A + Google Image SEO Guidelines',
    tier: 'T1_DERIVED',
    pass: { min: 0.9 },          // ≥ 90%
    warn: { min: 0.5 },          // 50~90% 보통
    label: 'ALT 태그 비율',
    rationale: 'WCAG 2.1 — 의미 있는 이미지는 모두 alt 필수. 90% 이상이 접근성 + SEO 권장.',
};

export const SEO_OG_COVERAGE: Threshold<number> = {
    source: 'OpenGraph 공식 표준 + Facebook 공유 디버거',
    tier: 'T0_FACT',
    pass: 3,                     // og:title + og:description + og:image
    warn: 2,
    label: 'OG 3종 세트 충족 수',
    rationale: 'og:title·og:description·og:image 3종이 SNS 공유 표준. 3종 모두 있어야 카드 정상 렌더.',
};

export const SEO_OG_IMAGE_DIMENSIONS: Threshold = {
    source: 'Facebook Sharing Best Practices (1200×630 권장)',
    tier: 'T1_DERIVED',
    pass: { min: 1200 },         // 가로 1200px 이상
    warn: { min: 600 },          // 600~1200
    label: 'OG 이미지 가로 픽셀',
    rationale: 'Facebook은 1200×630px 권장. 600px 미만은 SNS에서 흐릿하게 렌더링.',
};

export const SEO_CONTENT_LENGTH: Threshold = {
    source: 'Backlinko Content Length Study + Semrush Anatomy of Top-10',
    tier: 'T2_BENCHMARK',
    pass: { min: 1000 },         // 1000자 이상
    warn: { min: 300 },          // 300~1000 보통
    label: '본문 글자 수',
    rationale: 'Top SERP 페이지 평균 1000~3000자. 300자 미만은 thin content 위험.',
};

// ═══════════════════════════════════════════════════════════════
// Crawlability & Indexing (Google Search Central)
// ═══════════════════════════════════════════════════════════════

export const CRAWL_SITEMAP: Threshold<boolean> = {
    source: 'Google Search Central — Build & submit a sitemap',
    tier: 'T0_FACT',
    pass: true,
    label: 'sitemap.xml 존재 + XML 유효',
    rationale: 'Google이 사이트의 모든 페이지를 찾는 주 경로. 없으면 깊은 페이지 인덱싱 지연.',
};

export const CRAWL_ROBOTS_TXT: Threshold<boolean> = {
    source: 'robotstxt.org 표준 + Google Search Central',
    tier: 'T0_FACT',
    pass: true,
    label: 'robots.txt 존재 + Sitemap 디렉티브',
    rationale: '크롤러에게 사이트 정책 전달. Sitemap 디렉티브가 들어 있으면 인덱싱 가속.',
};

export const CRAWL_CANONICAL: Threshold<boolean> = {
    source: 'Google Search Central — Canonical URLs',
    tier: 'T0_FACT',
    pass: true,
    label: 'canonical 태그',
    rationale: '중복 콘텐츠 방어. 누락 시 Google이 임의로 정규 URL 선정 → 의도와 다를 수 있음.',
};

export const CRAWL_NOINDEX_BLOCK: Threshold<boolean> = {
    source: 'Google Search Central — noindex',
    tier: 'T0_FACT',
    pass: false,                 // noindex 없어야 통과 (인덱싱 가능)
    label: 'noindex 차단 없음',
    rationale: 'noindex 태그가 있으면 Google 검색 결과에서 완전 제외. 의도된 경우만 적용.',
};

// ═══════════════════════════════════════════════════════════════
// E-E-A-T (Google Search Quality Rater Guidelines 2024)
// https://services.google.com/fh/files/misc/hsw-sqrg.pdf
// ═══════════════════════════════════════════════════════════════

export const EEAT_EXPERIENCE: Threshold<number> = {
    source: 'Google QRG § 3.1 Experience (2024 강화)',
    tier: 'T1_DERIVED',
    pass: 3,                     // 3개 신호 이상 (날짜·후기·실측 표현 등)
    warn: 1,
    label: 'Experience 신호 수',
    rationale: '"우리가 직접 써봤다" 신호. 작성일·수정일·후기·실제 데이터 등 1차 정보 흔적.',
};

export const EEAT_EXPERTISE: Threshold<number> = {
    source: 'Google QRG § 3.2 Expertise',
    tier: 'T1_DERIVED',
    pass: 2,                     // Person/Organization schema + 자격 표시
    warn: 1,
    label: 'Expertise 신호 수',
    rationale: '작성자·기관 전문성. Person schema·직책·자격증·외부 인용 등 확인 가능한 표지.',
};

export const EEAT_AUTHORITATIVENESS: Threshold = {
    source: 'Google QRG § 3.3 Authoritativeness (백링크는 Phase 4)',
    tier: 'T4_UNKNOWN',          // ← 정확 측정은 외부 도구 필요
    pass: { min: 0 },
    label: '권위도 (백링크·브랜드 멘션)',
    rationale: '도메인 권위도는 Ahrefs/Moz API 연동 후 정확 측정 가능. 현재는 N/A.',
};

export const EEAT_TRUSTWORTHINESS: Threshold<number> = {
    source: 'Google QRG § 3.4 Trustworthiness + Mozilla Observatory',
    tier: 'T1_DERIVED',
    pass: 4,                     // HTTPS + 연락처 + 개인정보 + HSTS 4개 신호
    warn: 2,
    label: '신뢰 신호 수',
    rationale: 'HTTPS·연락처·개인정보처리방침·HSTS·CSP 등 신뢰 표지. 4개 이상이 표준.',
};

// ═══════════════════════════════════════════════════════════════
// AI / GEO (2024+ 신표준)
// ═══════════════════════════════════════════════════════════════

export const AI_BOT_USER_AGENTS: Record<string, { provider: string; doc: string }> = {
    GPTBot: { provider: 'OpenAI', doc: 'https://platform.openai.com/docs/gptbot' },
    'OAI-SearchBot': { provider: 'OpenAI', doc: 'https://platform.openai.com/docs/bots' },
    ClaudeBot: { provider: 'Anthropic', doc: 'https://support.anthropic.com/en/articles/8896518' },
    'Google-Extended': { provider: 'Google', doc: 'https://developers.google.com/search/docs/crawling-indexing/overview-google-crawlers' },
    PerplexityBot: { provider: 'Perplexity', doc: 'https://docs.perplexity.ai/guides/bots' },
    'Applebot-Extended': { provider: 'Apple', doc: 'https://support.apple.com/en-us/119829' },
};

export const AI_BOT_ACCESS: Threshold<number> = {
    source: 'OpenAI·Anthropic·Google·Perplexity·Apple 공식 봇 문서 (2024)',
    tier: 'T0_FACT',
    pass: 5,                     // 5개 봇 모두 허용
    warn: 3,
    label: 'AI 봇 허용 수 (5개 중)',
    rationale: 'AI가 우리 콘텐츠를 학습/인용하려면 robots.txt에서 허용해야. 차단 시 AI 검색 누락.',
};

export const AI_LLMS_TXT: Threshold<boolean> = {
    source: 'llms.txt 제안 (Jeremy Howard / Answer.AI, 2024)',
    tier: 'T0_FACT',
    pass: true,
    label: 'llms.txt 존재',
    rationale: 'AI 친화 콘텐츠 진입점 표준 (제안 단계). 있으면 AI 검색 우선순위 가산 기대.',
};

export const AI_CITATION_PLATFORMS = ['claude', 'chatgpt', 'perplexity', 'naver-cue', 'google-aio'] as const;
export type AICitationPlatform = (typeof AI_CITATION_PLATFORMS)[number];

export const AI_CITATION_PER_PLATFORM: Threshold<number> = {
    source: 'SparkToro AI Search Research (2024) + Profound 인용 트래커 방법론',
    tier: 'T0_FACT',
    pass: 1,                     // 1번 이상 언급되면 pass
    label: 'AI 플랫폼별 노출',
    rationale: '5개 카테고리 질문 중 1개라도 브랜드 언급되면 pass. 우선순위는 첫 추천 → 가산.',
};

// ═══════════════════════════════════════════════════════════════
// Trust (보안 헤더 — Mozilla Observatory)
// ═══════════════════════════════════════════════════════════════

export const MOZILLA_OBSERVATORY_GRADE: Threshold<string> = {
    source: 'Mozilla Observatory (observatory.mozilla.org)',
    tier: 'T0_FACT',
    pass: 'B',                   // B 이상
    warn: 'D',
    label: 'Mozilla Observatory 등급',
    rationale: 'HSTS·CSP·X-Frame·CORS 종합 보안 등급 (A+ ~ F). B 이상이 표준.',
};

// ═══════════════════════════════════════════════════════════════
// Schema.org (Google Rich Results Test)
// ═══════════════════════════════════════════════════════════════

export const SCHEMA_VALID_JSONLD: Threshold<boolean> = {
    source: 'Schema.org 표준 + Google Rich Results Test',
    tier: 'T0_FACT',
    pass: true,
    label: 'JSON-LD 구조화 데이터 유효',
    rationale: 'Google Rich Results Test가 인증한 schema. 잘못된 schema는 검색 결과에 영향 없음.',
};

export const SCHEMA_FAQ_PRESENT: Threshold<boolean> = {
    source: 'Schema.org FAQPage + Google AI Overview 인용 패턴',
    tier: 'T0_FACT',
    pass: true,
    label: 'FAQPage schema 존재',
    rationale: 'AI 검색이 FAQ schema를 자주 인용. 있으면 ChatGPT/Perplexity 인용 가능성 ↑.',
};

// ═══════════════════════════════════════════════════════════════
// 헬퍼 함수
// ═══════════════════════════════════════════════════════════════

export type Status = 'pass' | 'warn' | 'fail' | 'na';

export function evaluateNumber(value: number | null | undefined, threshold: Threshold): Status {
    if (threshold.tier === 'T4_UNKNOWN' || value == null) return 'na';
    const checkPass = (v: number, t: Threshold['pass']): boolean => {
        if (typeof t === 'number') return v === t;
        if (typeof t === 'object') {
            if (t.min != null && v < t.min) return false;
            if (t.max != null && v > t.max) return false;
            return true;
        }
        return false;
    };
    if (checkPass(value, threshold.pass)) return 'pass';
    if (threshold.warn && checkPass(value, threshold.warn)) return 'warn';
    return 'fail';
}

export function evaluateBoolean(value: boolean | null | undefined, threshold: Threshold<boolean>): Status {
    if (threshold.tier === 'T4_UNKNOWN' || value == null) return 'na';
    return value === threshold.pass ? 'pass' : 'fail';
}
