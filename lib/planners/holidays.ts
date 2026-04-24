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
