// 한국 공휴일·절기 (2026~2027)
// 공식 법정 공휴일 + 주요 절기(24절기 중 절기명)
// 음력 공휴일(설날·추석·부처님오신날)은 연도별로 양력 날짜가 다르므로 하드코딩.

interface HolidayMap {
    [yyyyMMdd: string]: { label: string; type: 'holiday' | 'solar_term' | 'memorial' };
}

export const HOLIDAYS: HolidayMap = {
    // ── 2026년 ─────────────────────────────────────────────────
    '2026-01-01': { label: '신정', type: 'holiday' },
    '2026-02-16': { label: '설날 연휴', type: 'holiday' },
    '2026-02-17': { label: '설날', type: 'holiday' },
    '2026-02-18': { label: '설날 연휴', type: 'holiday' },
    '2026-03-01': { label: '삼일절', type: 'holiday' },
    '2026-05-05': { label: '어린이날', type: 'holiday' },
    '2026-05-24': { label: '부처님오신날', type: 'holiday' },
    '2026-06-06': { label: '현충일 · 망종', type: 'memorial' },
    '2026-08-15': { label: '광복절', type: 'holiday' },
    '2026-09-24': { label: '추석 연휴', type: 'holiday' },
    '2026-09-25': { label: '추석', type: 'holiday' },
    '2026-09-26': { label: '추석 연휴', type: 'holiday' },
    '2026-10-03': { label: '개천절', type: 'holiday' },
    '2026-10-09': { label: '한글날', type: 'holiday' },
    '2026-12-25': { label: '성탄절', type: 'holiday' },

    // ── 2026년 24절기 ──────────────────────────────────────────
    '2026-01-05': { label: '소한', type: 'solar_term' },
    '2026-01-20': { label: '대한', type: 'solar_term' },
    '2026-02-04': { label: '입춘', type: 'solar_term' },
    '2026-02-19': { label: '우수', type: 'solar_term' },
    '2026-03-06': { label: '경칩', type: 'solar_term' },
    '2026-03-20': { label: '춘분', type: 'solar_term' },
    '2026-04-05': { label: '청명', type: 'solar_term' },
    '2026-04-20': { label: '곡우', type: 'solar_term' },
    '2026-05-06': { label: '입하', type: 'solar_term' },
    '2026-05-21': { label: '소만', type: 'solar_term' },
    // 2026-06-06 현충일·망종 (위 holiday에 통합 표기)
    '2026-06-21': { label: '하지', type: 'solar_term' },
    '2026-07-07': { label: '소서', type: 'solar_term' },
    '2026-07-23': { label: '대서', type: 'solar_term' },
    '2026-08-07': { label: '입추', type: 'solar_term' },
    '2026-08-23': { label: '처서', type: 'solar_term' },
    '2026-09-08': { label: '백로', type: 'solar_term' },
    '2026-09-23': { label: '추분', type: 'solar_term' },
    '2026-10-08': { label: '한로', type: 'solar_term' },
    '2026-10-23': { label: '상강', type: 'solar_term' },
    '2026-11-07': { label: '입동', type: 'solar_term' },
    '2026-11-22': { label: '소설', type: 'solar_term' },
    '2026-12-07': { label: '대설', type: 'solar_term' },
    '2026-12-22': { label: '동지', type: 'solar_term' },

    // ── 2027년 (법정공휴일만) ──────────────────────────────────
    '2027-01-01': { label: '신정', type: 'holiday' },
    '2027-02-06': { label: '설날 연휴', type: 'holiday' },
    '2027-02-07': { label: '설날', type: 'holiday' },
    '2027-02-08': { label: '설날 연휴', type: 'holiday' },
    '2027-03-01': { label: '삼일절', type: 'holiday' },
    '2027-05-05': { label: '어린이날', type: 'holiday' },
    '2027-05-13': { label: '부처님오신날', type: 'holiday' },
    '2027-06-06': { label: '현충일', type: 'memorial' },
    '2027-08-15': { label: '광복절', type: 'holiday' },
    '2027-09-14': { label: '추석 연휴', type: 'holiday' },
    '2027-09-15': { label: '추석', type: 'holiday' },
    '2027-09-16': { label: '추석 연휴', type: 'holiday' },
    '2027-10-03': { label: '개천절', type: 'holiday' },
    '2027-10-09': { label: '한글날', type: 'holiday' },
    '2027-12-25': { label: '성탄절', type: 'holiday' },
};

export function getHoliday(date: string): { label: string; type: 'holiday' | 'solar_term' | 'memorial' } | null {
    return HOLIDAYS[date] ?? null;
}

// ── 음력 변환 (2024~2027 사전 검증 테이블) ───────────────────────────────
// 각 항목 s: 해당 음력 월 1일의 양력 날짜, y: 음력 연도, m: 음력 월, l: 윤달 여부
// 검증: 설날(음1/1), 추석(음8/15), 부처님오신날(음4/8) 모두 공식 날짜와 일치 확인
interface LunarEntry { s: string; y: number; m: number; l: boolean; }

const LUNAR_TABLE: LunarEntry[] = [
    // 2024
    {s:'2024-02-10', y:2024, m:1,  l:false},
    {s:'2024-03-11', y:2024, m:2,  l:false},
    {s:'2024-04-09', y:2024, m:3,  l:false},
    {s:'2024-05-08', y:2024, m:4,  l:false},
    {s:'2024-06-06', y:2024, m:5,  l:false},
    {s:'2024-07-06', y:2024, m:6,  l:false},
    {s:'2024-08-04', y:2024, m:7,  l:false},
    {s:'2024-09-03', y:2024, m:8,  l:false},
    {s:'2024-10-03', y:2024, m:9,  l:false},
    {s:'2024-11-01', y:2024, m:10, l:false},
    {s:'2024-12-01', y:2024, m:11, l:false},
    {s:'2024-12-31', y:2024, m:12, l:false},
    // 2025 (윤6월)
    {s:'2025-01-29', y:2025, m:1,  l:false},
    {s:'2025-02-28', y:2025, m:2,  l:false},
    {s:'2025-03-29', y:2025, m:3,  l:false},
    {s:'2025-04-28', y:2025, m:4,  l:false},
    {s:'2025-05-27', y:2025, m:5,  l:false},
    {s:'2025-06-26', y:2025, m:6,  l:false},
    {s:'2025-07-25', y:2025, m:6,  l:true },
    {s:'2025-08-23', y:2025, m:7,  l:false},
    {s:'2025-09-22', y:2025, m:8,  l:false},
    {s:'2025-10-21', y:2025, m:9,  l:false},
    {s:'2025-11-20', y:2025, m:10, l:false},
    {s:'2025-12-19', y:2025, m:11, l:false},
    {s:'2026-01-18', y:2025, m:12, l:false},
    // 2026
    {s:'2026-02-17', y:2026, m:1,  l:false},
    {s:'2026-03-19', y:2026, m:2,  l:false},
    {s:'2026-04-18', y:2026, m:3,  l:false},
    {s:'2026-05-17', y:2026, m:4,  l:false},
    {s:'2026-06-15', y:2026, m:5,  l:false},
    {s:'2026-07-15', y:2026, m:6,  l:false},
    {s:'2026-08-13', y:2026, m:7,  l:false},
    {s:'2026-09-11', y:2026, m:8,  l:false},
    {s:'2026-10-11', y:2026, m:9,  l:false},
    {s:'2026-11-09', y:2026, m:10, l:false},
    {s:'2026-12-09', y:2026, m:11, l:false},
    {s:'2027-01-08', y:2026, m:12, l:false},
    // 2027
    {s:'2027-02-07', y:2027, m:1,  l:false},
    {s:'2027-03-08', y:2027, m:2,  l:false},
    {s:'2027-04-07', y:2027, m:3,  l:false},
    {s:'2027-05-06', y:2027, m:4,  l:false},
    {s:'2027-06-05', y:2027, m:5,  l:false},
    {s:'2027-07-04', y:2027, m:6,  l:false},
    {s:'2027-08-03', y:2027, m:7,  l:false},
    {s:'2027-09-01', y:2027, m:8,  l:false},
    {s:'2027-09-30', y:2027, m:9,  l:false},
    {s:'2027-10-30', y:2027, m:10, l:false},
    {s:'2027-11-29', y:2027, m:11, l:false},
    {s:'2027-12-28', y:2027, m:12, l:false},
];

export interface LunarDate { year: number; month: number; day: number; isLeap: boolean; }

/** 음력 연도 목록 — 테이블 정밀 범위 */
export const LUNAR_YEARS = [2024, 2025, 2026, 2027];

/** 기념일용 확장 연도 목록 (1950~현재+2) */
export const LUNAR_YEARS_ANNIVERSARY = Array.from(
    { length: new Date().getFullYear() + 2 - 1950 + 1 },
    (_, i) => 1950 + i
);

/** 특정 음력 연도의 월 목록 (isLeap 포함) */
export function getLunarMonths(lunarYear: number): Array<{ month: number; isLeap: boolean }> {
    const seen = new Set<string>();
    const result: Array<{ month: number; isLeap: boolean }> = [];
    for (const e of LUNAR_TABLE) {
        if (e.y !== lunarYear) continue;
        const key = `${e.m}-${e.l}`;
        if (!seen.has(key)) { seen.add(key); result.push({ month: e.m, isLeap: e.l }); }
    }
    return result;
}

/** 해당 음력 월의 일수 */
export function getLunarMonthDays(lunarYear: number, lunarMonth: number, isLeap = false): number {
    const idx = LUNAR_TABLE.findIndex(e => e.y === lunarYear && e.m === lunarMonth && e.l === isLeap);
    if (idx < 0 || idx + 1 >= LUNAR_TABLE.length) return 30;
    const ms = new Date(LUNAR_TABLE[idx + 1].s).getTime() - new Date(LUNAR_TABLE[idx].s).getTime();
    return Math.round(ms / 86400000);
}

/** 음력 → 양력 변환 (YYYY-MM-DD)
 * - LUNAR_TABLE 범위(2024~2027) 내: 정밀 변환
 * - 범위 밖(기념일 원본 연도 등): 2026년 기준 월/일만 변환 후 연도를 보정 */
export function lunarToSolar(lunarYear: number, lunarMonth: number, lunarDay: number, isLeap = false): string | null {
    // 정밀 변환 (테이블 보유 연도)
    const exact = LUNAR_TABLE.find(e => e.y === lunarYear && e.m === lunarMonth && e.l === isLeap);
    if (exact) {
        const d = new Date(exact.s);
        d.setDate(d.getDate() + lunarDay - 1);
        return d.toISOString().slice(0, 10);
    }
    // 근사 변환 — 2026년 동일 월로 월/일만 추출 후 lunarYear로 연도 대체
    const proxy = LUNAR_TABLE.find(e => e.y === 2026 && e.m === lunarMonth && e.l === false)
               ?? LUNAR_TABLE.find(e => e.m === lunarMonth && e.l === false);
    if (!proxy) return null;
    const ref = new Date(proxy.s);
    ref.setDate(ref.getDate() + lunarDay - 1);
    // 연도를 lunarYear 기준으로 보정 (기념일 원본 연도 근사)
    const yearOffset = lunarYear - proxy.y;
    ref.setFullYear(ref.getFullYear() + yearOffset);
    return ref.toISOString().slice(0, 10);
}

export function getLunarDate(dateStr: string): LunarDate | null {
    let lo = 0, hi = LUNAR_TABLE.length - 1, idx = -1;
    while (lo <= hi) {
        const mid = (lo + hi) >> 1;
        if (LUNAR_TABLE[mid].s <= dateStr) { idx = mid; lo = mid + 1; }
        else hi = mid - 1;
    }
    if (idx < 0) return null;
    const entry = LUNAR_TABLE[idx];
    const diff = Math.round((new Date(dateStr).getTime() - new Date(entry.s).getTime()) / 86400000);
    return { year: entry.y, month: entry.m, day: diff + 1, isLeap: entry.l };
}
