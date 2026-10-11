/**
 * JH 실무 매칭 필드 (hero_jh_responses.practical_filters) — 키 SSOT
 *
 * DB·매칭 함수(`_hero_practical_fit` → `company_size_ranges`)는 snake_case를 읽는다.
 * 2026-10-12까지 화면이 camelCase(`companySizeRanges`)로 저장해 매칭에서 항상 "중립"으로 무시됐고,
 * 저장값이 `{}`이면 화면이 `undefined.includes`로 죽었다 → 읽을 때도 쓸 때도 이 함수로 정규화한다.
 */
export interface JHPracticalFilters {
    company_size_ranges: string[];
    work_mode: string;
    locations: string[];
    compensation_floor: string;
    compensation_floor_public: boolean;
}

export const EMPTY_PRACTICAL_FILTERS: JHPracticalFilters = {
    company_size_ranges: [],
    work_mode: "",
    locations: [],
    compensation_floor: "",
    compensation_floor_public: true,
};

const strArray = (v: unknown): string[] => (Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : []);
const str = (v: unknown): string => (typeof v === "string" ? v : typeof v === "number" ? String(v) : "");

/** camelCase(구 화면)·snake_case(DB) 어느 쪽이 와도 snake_case 표준형으로. 빈 값·누락 키는 기본값 */
export function normalizePracticalFilters(raw: unknown): JHPracticalFilters {
    const r = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
    const pick = (snake: string, camel: string) => (r[snake] !== undefined ? r[snake] : r[camel]);
    const pub = pick("compensation_floor_public", "compensationFloorPublic");
    return {
        company_size_ranges: strArray(pick("company_size_ranges", "companySizeRanges")),
        work_mode: str(pick("work_mode", "workMode")),
        locations: strArray(pick("locations", "locations")),
        compensation_floor: str(pick("compensation_floor", "compensationFloor")),
        compensation_floor_public: typeof pub === "boolean" ? pub : true,
    };
}
