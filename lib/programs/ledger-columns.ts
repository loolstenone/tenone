/** 수료증 관리 대장 CSV 열 (구글 시트와 같은 이름·순서) — 인트라 업로드 화면·서버 적재 공용 */
export const LEDGER_COLUMNS = ["구분", "코드", "소속 동아리", "기수", "이름", "생년월일", "출신 대학", "전공", "개인 전화 번호", "출전팀", "발급일", "비고", "결과"] as const;
export type LedgerRow = Partial<Record<(typeof LEDGER_COLUMNS)[number], string>>;

/** 따옴표·줄바꿈을 지원하는 CSV 파서 → 첫 줄 열 이름으로 객체화 (BOM 제거) */
export function parseLedgerCsv(text: string): { rows: LedgerRow[]; missing: string[] } {
    const src = text.replace(/^\uFEFF/, "");
    const table: string[][] = [];
    let row: string[] = [], cur = "", q = false;
    for (let i = 0; i < src.length; i++) {
        const ch = src[i];
        if (q) {
            if (ch === '"') { if (src[i + 1] === '"') { cur += '"'; i++; } else q = false; } else cur += ch;
        } else if (ch === '"') q = true;
        else if (ch === ",") { row.push(cur); cur = ""; }
        else if (ch === "\n" || ch === "\r") { if (ch === "\r" && src[i + 1] === "\n") i++; row.push(cur); table.push(row); row = []; cur = ""; }
        else cur += ch;
    }
    if (cur || row.length) { row.push(cur); table.push(row); }
    const [head = [], ...body] = table;
    const idx = head.map(h => h.trim());
    const missing = LEDGER_COLUMNS.filter(c => c !== "결과" && c !== "출전팀" && !idx.includes(c));
    const rows = body.filter(r => r.some(v => v.trim())).map(r => Object.fromEntries(idx.map((h, i) => [h, r[i] ?? ""])) as LedgerRow);
    return { rows, missing };
}
