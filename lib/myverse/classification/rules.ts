// 분류 엔진 v1 — 룰 기반 9 영역 라우팅
//
// 입력: 5축 메타 (time/geo/people/content/context) + 사용자 거점·캘린더
// 출력: { domain: DomainKey, confidence: 0..1, reason: string }
//
// 분류 우선순위 (중복 매칭 시 위가 이김):
//   1. 거점 매칭 (사용자 등록 거점이 명확한 경우 — 사무실=work, 집=daily, 헬스장=body)
//   2. 캘린더 매칭 (해당 시각 미팅 일정이 있으면 work/schedule)
//   3. 사람 매칭 (people_axis 비어있지 않으면 relation 가산점)
//   4. 거리 (평소 거점에서 30km+ + 1박 → travel)
//   5. 시간 (근무 시간대 → work, 새벽·저녁 자유시간 → daily)
//   6. 컨텐츠 키워드 (운동·식사 키워드 → body)
//   7. 디폴트 → daily

import type { DomainKey, GeoAxis, TimeAxis } from "../domains";

export interface ClassifyInput {
    time_axis?: TimeAxis | null;
    geo_axis?: GeoAxis | null;
    people_axis?: string[] | null;
    content_axis?: string | null;
    /** 사용자 등록 거점 — 사이트 레벨에서 매칭 */
    bases?: Array<{ id: string; name: string; type: "home" | "office" | "study" | "gym" | "cafe" | "other"; lat?: number | null; lng?: number | null; }>;
    /** 같은 시각의 캘린더 매칭 결과 (선택) */
    calendar_match?: { kind: string; title: string } | null;
}

export interface ClassifyResult {
    domain: DomainKey;
    confidence: number;
    reason: string;
    sub_tags: string[];
}

// 거점 type → 도메인 매핑
const BASE_TYPE_TO_DOMAIN: Record<string, DomainKey> = {
    office: "work",
    study:  "study",
    gym:    "body",
    home:   "daily",
    cafe:   "daily",   // 카페는 일상 기본 (학습 패턴은 사용자별 학습 후 study)
    other:  "daily",
};

// 컨텐츠 키워드 → 도메인 (간단 매칭, v2에서 임베딩 기반)
const CONTENT_KEYWORDS: Array<{ pattern: RegExp; domain: DomainKey; weight: number; tag?: string }> = [
    { pattern: /운동|헬스|러닝|요가|크로스핏|필라테스|걷기|등산|수영/, domain: "body", weight: 0.8, tag: "운동" },
    { pattern: /아침|점심|저녁|간식|음식|식사|커피|디저트|밥|국|찌개|면|치킨|피자|버거/, domain: "body", weight: 0.6, tag: "식사" },
    { pattern: /수면|잠|취침|기상|꿈/, domain: "body", weight: 0.7, tag: "수면" },
    { pattern: /미팅|회의|업무|프로젝트|클라이언트|발표|보고|기획|디자인|개발/, domain: "work", weight: 0.7, tag: "업무" },
    { pattern: /강의|수업|공부|학습|시험|과제|논문|책|독서|복습|예습/, domain: "study", weight: 0.7, tag: "학습" },
    { pattern: /여행|출장|호텔|비행기|공항|숙소|관광/, domain: "travel", weight: 0.8, tag: "여행" },
    { pattern: /이동|운전|지하철|버스|택시|기차|자전거/, domain: "move", weight: 0.5, tag: "이동" },
    { pattern: /일기|기분|감정|생각|마음|혼자|일상/, domain: "daily", weight: 0.4, tag: "일상" },
];

/** Haversine 거리 (m) */
function distanceMeters(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
    const R = 6371000;
    const toRad = (d: number) => (d * Math.PI) / 180;
    const dLat = toRad(b.lat - a.lat);
    const dLng = toRad(b.lng - a.lng);
    const x = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

/** 가장 가까운 거점 반환 (반경 m 내) */
function nearestBase(geo: GeoAxis, bases: ClassifyInput["bases"], radius = 150): NonNullable<ClassifyInput["bases"]>[number] | null {
    if (!geo?.lat || !geo?.lng || !bases) return null;
    let best: NonNullable<ClassifyInput["bases"]>[number] | null = null;
    let bestDist = Infinity;
    for (const b of bases) {
        if (b.lat == null || b.lng == null) continue;
        const d = distanceMeters({ lat: geo.lat, lng: geo.lng }, { lat: b.lat, lng: b.lng });
        if (d <= radius && d < bestDist) {
            best = b;
            bestDist = d;
        }
    }
    return best;
}

/** 평소 거점에서 가장 멀리 떨어진 거리 (m) */
function farthestFromHome(geo: GeoAxis, bases: ClassifyInput["bases"]): number {
    if (!geo?.lat || !geo?.lng || !bases) return 0;
    let max = 0;
    for (const b of bases) {
        if (b.lat == null || b.lng == null) continue;
        const d = distanceMeters({ lat: geo.lat, lng: geo.lng }, { lat: b.lat, lng: b.lng });
        if (d > max) max = d;
    }
    return max;
}

/** 메인 분류 함수 */
export function classify(input: ClassifyInput): ClassifyResult {
    const sub_tags: string[] = [];

    // 1. 거점 매칭 (가장 강한 신호)
    if (input.geo_axis) {
        const matched = nearestBase(input.geo_axis, input.bases, 150);
        if (matched) {
            const domain = BASE_TYPE_TO_DOMAIN[matched.type] ?? "daily";
            sub_tags.push(`base:${matched.name}`);
            return {
                domain,
                confidence: 0.9,
                reason: `등록 거점 "${matched.name}"(${matched.type}) 반경 150m 내`,
                sub_tags,
            };
        }
    }

    // 2. 캘린더 매칭
    if (input.calendar_match) {
        const km = input.calendar_match.kind;
        if (km === "meeting" || km === "task") {
            sub_tags.push("calendar:meeting");
            return {
                domain: "work",
                confidence: 0.8,
                reason: `캘린더 미팅 매칭: "${input.calendar_match.title}"`,
                sub_tags,
            };
        }
        if (km === "anniversary") {
            return {
                domain: "schedule",
                confidence: 0.85,
                reason: `기념일 매칭: "${input.calendar_match.title}"`,
                sub_tags: ["calendar:anniversary"],
            };
        }
    }

    // 3. 거리 — 30km+ 이탈 → travel 후보
    const farthest = farthestFromHome(input.geo_axis ?? {}, input.bases);
    if (farthest > 30000) {
        sub_tags.push(`far_from_home:${Math.round(farthest / 1000)}km`);
    }

    // 4. 컨텐츠 키워드
    let bestKeyword: { domain: DomainKey; weight: number; tag?: string } | null = null;
    if (input.content_axis) {
        for (const rule of CONTENT_KEYWORDS) {
            if (rule.pattern.test(input.content_axis)) {
                if (!bestKeyword || rule.weight > bestKeyword.weight) {
                    bestKeyword = rule;
                }
                if (rule.tag) sub_tags.push(rule.tag);
            }
        }
    }

    // 5. 사람 신호 (relation 가산)
    const hasPeople = (input.people_axis?.length ?? 0) > 0;

    // 6. 시간대 — 근무 시간대(월~금 9–18시)면 업무 가산
    const period = input.time_axis?.period;
    const dow = input.time_axis?.day_of_week;
    const isWeekday = dow && !["sat", "sun"].includes(dow);
    const isWorkHours = period === "morning" || period === "afternoon";
    const workTimeBoost = isWeekday && isWorkHours;

    // 종합 판정
    if (farthest > 30000) {
        return {
            domain: "travel",
            confidence: 0.7,
            reason: `평소 거점에서 ${Math.round(farthest / 1000)}km 이탈 → 여행`,
            sub_tags,
        };
    }

    if (bestKeyword && bestKeyword.weight >= 0.7) {
        return {
            domain: bestKeyword.domain,
            confidence: bestKeyword.weight,
            reason: `컨텐츠 키워드 매칭${bestKeyword.tag ? ` (${bestKeyword.tag})` : ""}`,
            sub_tags,
        };
    }

    if (hasPeople) {
        return {
            domain: "relation",
            confidence: 0.6,
            reason: `사람 매칭(${input.people_axis!.length}명)`,
            sub_tags: [...sub_tags, "people"],
        };
    }

    if (workTimeBoost) {
        return {
            domain: "work",
            confidence: 0.55,
            reason: "평일 근무 시간대",
            sub_tags,
        };
    }

    if (bestKeyword) {
        return {
            domain: bestKeyword.domain,
            confidence: bestKeyword.weight,
            reason: `컨텐츠 키워드(약함)${bestKeyword.tag ? ` (${bestKeyword.tag})` : ""}`,
            sub_tags,
        };
    }

    // 디폴트
    return {
        domain: "daily",
        confidence: 0.3,
        reason: "특정 신호 없음 → 일상",
        sub_tags,
    };
}
