// 공공데이터포털 — 한국천문연구원 특일정보 API 클라이언트
// https://www.data.go.kr/data/15012690/openapi.do
//
// 환경변수: KOREA_HOLIDAYS_API_KEY (Decoding 키)
// 응답: <item><dateName>...</dateName><locdate>20260101</locdate><isHoliday>Y</isHoliday></item>
//
// 동작: 연도/월 단위 조회 → JSON 파싱 → myverse_calendar_entries 시드용 배열 반환.

interface RawItem {
    dateName: { _text?: string } | string;
    locdate: { _text?: string } | string | number;
    isHoliday?: { _text?: string } | string;
}

export interface KoreanHoliday {
    date: string;       // YYYY-MM-DD
    name: string;
    is_holiday: boolean;
}

const SERVICE_BASE = "http://apis.data.go.kr/B090041/openapi/service/SpcdeInfoService";

function pad2(n: number): string { return String(n).padStart(2, "0"); }

function parseValue(v: unknown): string {
    if (typeof v === "string") return v;
    if (typeof v === "number") return String(v);
    if (v && typeof v === "object" && "_text" in v) return String((v as { _text?: string })._text ?? "");
    return "";
}

/**
 * 한 해 전체 한국 공휴일 (음력 환산 포함) — getRestDeInfo 호출 12회 (월별 1회).
 * 실제로는 getHoliDeInfo (휴일만) 또는 getRestDeInfo (전부) 둘 중 하나.
 */
export async function fetchKoreanHolidays(year: number): Promise<KoreanHoliday[]> {
    const apiKey = process.env.KOREA_HOLIDAYS_API_KEY;
    if (!apiKey) throw new Error("KOREA_HOLIDAYS_API_KEY not configured");

    const all: KoreanHoliday[] = [];
    for (let m = 1; m <= 12; m++) {
        const url = `${SERVICE_BASE}/getRestDeInfo?serviceKey=${encodeURIComponent(apiKey)}&solYear=${year}&solMonth=${pad2(m)}&numOfRows=50&_type=json`;
        const res = await fetch(url);
        if (!res.ok) continue;
        const json = await res.json().catch(() => null);
        const items = json?.response?.body?.items?.item;
        if (!items) continue;
        const arr = Array.isArray(items) ? items : [items];
        for (const it of arr as RawItem[]) {
            const dateStr = parseValue(it.locdate);
            const name = parseValue(it.dateName);
            const isHol = parseValue(it.isHoliday) === "Y";
            if (dateStr.length === 8) {
                all.push({
                    date: `${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6, 8)}`,
                    name,
                    is_holiday: isHol,
                });
            }
        }
    }
    return all;
}

/**
 * 24절기 — 한국천문연구원 절기 정보 API
 */
export async function fetchKoreanSolarTerms(year: number): Promise<KoreanHoliday[]> {
    const apiKey = process.env.KOREA_HOLIDAYS_API_KEY;
    if (!apiKey) throw new Error("KOREA_HOLIDAYS_API_KEY not configured");

    const all: KoreanHoliday[] = [];
    for (let m = 1; m <= 12; m++) {
        const url = `${SERVICE_BASE}/get24DivisionsInfo?serviceKey=${encodeURIComponent(apiKey)}&solYear=${year}&solMonth=${pad2(m)}&numOfRows=10&_type=json`;
        const res = await fetch(url);
        if (!res.ok) continue;
        const json = await res.json().catch(() => null);
        const items = json?.response?.body?.items?.item;
        if (!items) continue;
        const arr = Array.isArray(items) ? items : [items];
        for (const it of arr as RawItem[]) {
            const dateStr = parseValue(it.locdate);
            const name = parseValue(it.dateName);
            if (dateStr.length === 8) {
                all.push({
                    date: `${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6, 8)}`,
                    name,
                    is_holiday: false,
                });
            }
        }
    }
    return all;
}
