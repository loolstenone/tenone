/** 수료증 관리 대장 CSV 열 (구글 시트와 같은 이름·순서) — 인트라 업로드 화면·서버 적재 공용 */
export const LEDGER_COLUMNS = ["구분", "코드", "소속 동아리", "기수", "이름", "생년월일", "출신 대학", "전공", "개인 전화 번호", "출전팀", "발급일", "비고", "결과"] as const;
export type LedgerRow = Partial<Record<(typeof LEDGER_COLUMNS)[number], string>>;

/** 회차 일괄 발급용 참가자 명단 열 — 코드·구분·발급일·대회명은 화면의 회차 정보로 채운다 */
export const ROSTER_COLUMNS = ["이름", "생년월일", "출신 대학", "전공", "소속 동아리", "기수", "전화번호", "출전팀", "결과"] as const;
export const ROSTER_REQUIRED = ["이름", "생년월일"] as const;

/** 따옴표·줄바꿈을 지원하는 CSV 분해 (BOM 제거, 빈 줄 제외) */
function splitCsv(text: string): { head: string[]; body: string[][] } {
    const src = text.replace(/^﻿/, "");
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
    return { head: head.map(h => h.trim()), body: body.filter(r => r.some(v => v.trim())) };
}

/** CSV → 첫 줄 열 이름으로 객체 배열 */
export function parseCsvObjects(text: string): { head: string[]; rows: Record<string, string>[] } {
    const { head, body } = splitCsv(text);
    return { head, rows: body.map(r => Object.fromEntries(head.map((h, i) => [h, r[i] ?? ""]))) };
}

/** 대장 형식(코드 포함) CSV */
export function parseLedgerCsv(text: string): { rows: LedgerRow[]; missing: string[] } {
    const { head, rows } = parseCsvObjects(text);
    const missing = LEDGER_COLUMNS.filter(c => c !== "결과" && c !== "출전팀" && !head.includes(c));
    return { rows: rows as LedgerRow[], missing };
}
