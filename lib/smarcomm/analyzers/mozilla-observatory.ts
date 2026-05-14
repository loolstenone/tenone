// Mozilla Observatory API 통합 — 보안 헤더 등급
//
// 출처: https://developer.mozilla.org/en-US/observatory
// API v2: https://observatory-api.mdn.mozilla.net/api/v2/
//
// 측정: HSTS·CSP·X-Frame-Options·X-Content-Type-Options·Referrer-Policy 종합
// 결과: 등급 (A+~F) + 점수 + 통과/실패 항목

export interface ObservatoryResult {
    grade: string;                   // 'A+', 'A', 'B+', 'B', ..., 'F'
    score: number;                   // 0~135 (보너스 포함)
    testsPassed: number;
    testsTotal: number;
    failedTests: string[];           // 실패한 테스트 이름 (간략)
    scanUrl: string;                 // 자세히 보기 링크
    measuredAt: Date;
}

const OBSERVATORY_API_BASE = 'https://observatory-api.mdn.mozilla.net/api/v2';

export async function fetchObservatoryGrade(hostname: string): Promise<ObservatoryResult | null> {
    if (!hostname) return null;
    try {
        // GET — 캐시된 결과 우선. 없으면 백엔드가 즉시 scan 시작.
        // 단, polling은 안 함 (스캔에 30s+ 걸릴 수 있음) — best-effort.
        const url = `${OBSERVATORY_API_BASE}/scan?host=${encodeURIComponent(hostname)}`;
        const res = await fetch(url, {
            method: 'POST',  // POST = 새로 스캔 또는 캐시 반환
            signal: AbortSignal.timeout(8000),
            headers: { 'Accept': 'application/json' },
        }).catch(() => null);
        if (!res || !res.ok) return null;

        const data = await res.json();
        // v2 응답 구조: { id, grade, score, tests_passed, tests_quantity, tests_failed, ... }
        if (!data || typeof data.grade !== 'string') return null;

        // 실패 테스트 추출 (필드명 변형 대응)
        const tests = data.tests || data.tests_failed_details || {};
        const failedTests: string[] = [];
        for (const [name, info] of Object.entries(tests)) {
            const obj = info as { pass?: boolean; result?: string };
            if (obj && obj.pass === false) failedTests.push(name);
        }

        return {
            grade: data.grade,
            score: Number(data.score) || 0,
            testsPassed: Number(data.tests_passed) || 0,
            testsTotal: Number(data.tests_quantity) || 0,
            failedTests: failedTests.slice(0, 8),
            scanUrl: `https://developer.mozilla.org/en-US/observatory/analyze?host=${encodeURIComponent(hostname)}`,
            measuredAt: new Date(),
        };
    } catch {
        return null;
    }
}

// 등급 → 점수 매핑 (Trust 점수 산입용, 0~10)
function gradeToScore(grade: string): number {
    const mapping: Record<string, number> = {
        'A+': 10, 'A': 9, 'A-': 8.5,
        'B+': 8, 'B': 7, 'B-': 6.5,
        'C+': 6, 'C': 5, 'C-': 4.5,
        'D+': 4, 'D': 3, 'D-': 2.5,
        'F': 1,
    };
    return mapping[grade] ?? 0;
}

export interface ObservatoryScoreCard {
    score: number;     // 0~10 (Trust Trustworthiness sub-score)
    maxScore: number;
    description: string;
    action: string;
}

export function scoreObservatory(result: ObservatoryResult | null): ObservatoryScoreCard {
    if (!result) {
        return {
            score: 0,
            maxScore: 0,  // T4_UNKNOWN — 점수 영향 제거
            description: '📋 N/A — Mozilla Observatory 응답 실패 (네트워크/타임아웃 또는 미지원 도메인)',
            action: 'observatory.mozilla.org에서 직접 진단 시도',
        };
    }

    const score = Math.round(gradeToScore(result.grade));
    const failedText = result.failedTests.length > 0
        ? ` 미흡: ${result.failedTests.slice(0, 3).join(', ')}${result.failedTests.length > 3 ? '…' : ''}`
        : '';

    const judgement =
        score >= 9 ? '✓ 상위'
        : score >= 7 ? '✓ 양호'
        : score >= 4 ? '△ 보통'
        : '⛔ 미흡';

    return {
        score,
        maxScore: 10,
        description: `${judgement} 등급 ${result.grade} (${result.score}점, 통과 ${result.testsPassed}/${result.testsTotal}).${failedText} (출처: Mozilla Observatory)`,
        action: score >= 7
            ? '현 상태 유지 — HSTS·CSP 등 보안 헤더 정착'
            : 'HSTS·Content-Security-Policy·X-Frame-Options 적용으로 등급 B+ 이상 목표',
    };
}
