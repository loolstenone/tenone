/**
 * 경쟁 PT 회차 일괄 발급 (서버 전용, 2026-10-10) — 회차가 끝나면 인트라에서
 *   ① 회차 기본 정보(대회명·주최·발급일) ② 참가자 명단 업로드 ③ 팀별 결과 → 미리보기 → 일괄 생성
 *   규칙 (경쟁 PT 인증서 규칙): 참가자 전원 = 참가 확인서(COA), 결과(1등·2등·3등·본선)가 있는 사람 = 수상 확인서(MCP)도
 *   코드 = {발급 연도}-{COA|MCP} {일련번호 6자리}. 일련번호는 대장 전체 고유값 — 연도·구분이 바뀌어도 다시 시작하지 않는다
 *   대장 마지막 번호 다음부터: 참가 확인서 전원 → 수상 확인서(등수 순) — 기존 대장과 같은 순서
 *   같은 대회명에 같은 이름+생년월일이 이미 있으면 그 사람은 건너뛴다 (두 번 올려도 중복 발급 없음)
 *   전화번호는 매드리거 등록 매칭용 해시만 (원본 저장 안 함)
 */
import { createAdminClient } from "@/lib/supabase/admin";
import { ledgerMatchHash } from "@/lib/programs/ledger-match";
import { LEDGER_KEY_PREFIX, toIsoDate } from "@/lib/programs/ledger-import";

export const PT_RESULTS = ["1등", "2등", "3등", "본선"] as const;

export interface BatchRound { title: string; client?: string | null; issued_date: string }
export interface BatchPerson {
    name: string; birthdate: string; university?: string | null; major?: string | null;
    club?: string | null; cohort?: string | null; phone?: string | null; team?: string | null; result?: string | null;
}
export interface BatchPlanItem { line: number; name: string; team: string | null; codes: string[]; result: string | null }
export interface BatchResult {
    ok: boolean; created: number; participation: number; award: number;
    plan: BatchPlanItem[]; skipped: { line: number; name: string; reason: string }[]; errors: { line: number; reason: string }[];
    range: string | null;
}

const clean = (v: unknown) => (typeof v === "string" ? v.trim() || null : null);
const pad = (n: number) => String(n).padStart(6, "0");

/** 대장 전체의 마지막 번호 — 뒤 6자리는 연도·구분과 무관한 고유 일련번호 (해가 바뀌어도 이어진다: 2025 …141 → 2026 000142) */
async function lastSeq(): Promise<number> {
    const { data } = await createAdminClient().from("program_certificates").select("code")
        .like("cert_key", `${LEDGER_KEY_PREFIX}%`);
    return (data ?? []).reduce((m, r) => Math.max(m, Number(r.code.slice(-6)) || 0), 0);
}

/** preview=true면 저장하지 않고 계획(코드 배정)만 돌려준다 */
export async function batchIssueRound(brand: string, round: BatchRound, people: BatchPerson[], preview: boolean): Promise<BatchResult> {
    const errors: BatchResult["errors"] = [];
    const skipped: BatchResult["skipped"] = [];
    const title = clean(round.title);
    const issued = toIsoDate(round.issued_date);
    if (!title) errors.push({ line: 0, reason: "대회명을 입력해 주세요 (예: 춤추는고래 경쟁 PT)" });
    if (!issued) errors.push({ line: 0, reason: "발급일을 입력해 주세요" });
    if (errors.length) return { ok: false, created: 0, participation: 0, award: 0, plan: [], skipped, errors, range: null };
    const year = Number(issued!.slice(0, 4));
    const client = clean(round.client) ?? title!.replace(/\s*경쟁\s*PT\s*$/, "").trim();

    // 검증 + 같은 파일 안 중복
    const valid: (BatchPerson & { line: number; birth: string; nm: string; res: string | null })[] = [];
    const seen = new Set<string>();
    people.forEach((p, i) => {
        const line = i + 2;
        const nm = (p.name ?? "").replace(/\s+/g, "");
        const birth = toIsoDate(p.birthdate);
        const res = clean(p.result);
        if (!nm) { errors.push({ line, reason: "이름이 비어 있습니다" }); return; }
        if (!birth) { errors.push({ line, reason: `${nm}: 생년월일을 읽을 수 없습니다 (${p.birthdate ?? "빈칸"})` }); return; }
        if (res && !(PT_RESULTS as readonly string[]).includes(res)) { errors.push({ line, reason: `${nm}: 결과는 1등·2등·3등·본선 또는 빈칸 (${res})` }); return; }
        const key = `${nm}|${birth}`;
        if (seen.has(key)) { errors.push({ line, reason: `${nm}: 명단에 두 번 있습니다` }); return; }
        seen.add(key);
        valid.push({ ...p, line, birth, nm, res });
    });

    // 이미 이 대회로 발급된 사람은 건너뜀
    const admin = createAdminClient();
    const { data: existing } = await admin.from("program_certificates").select("snapshot")
        .like("cert_key", `${LEDGER_KEY_PREFIX}%`).eq("brand_id", brand).eq("snapshot->>round_title", title!);
    const issuedKeys = new Set((existing ?? []).map(e => { const s = e.snapshot as { name: string; birthdate: string }; return `${s.name}|${s.birthdate}`; }));
    const todo = valid.filter(p => {
        if (!issuedKeys.has(`${p.nm}|${p.birth}`)) return true;
        skipped.push({ line: p.line, name: p.nm, reason: "이미 이 대회 인증서가 있습니다" });
        return false;
    });

    // 코드 배정: 참가 확인서 전원 → 수상 확인서(1등→2등→3등→본선, 같은 등수는 팀끼리 묶어서) — 기존 대장 순서
    let seq = await lastSeq();
    const first = seq + 1;
    const plan = new Map<number, BatchPlanItem>(todo.map(p => [p.line, { line: p.line, name: p.nm, team: clean(p.team), codes: [], result: p.res }]));
    const rows: Record<string, unknown>[] = [];
    const build = (p: (typeof todo)[number], award: boolean) => {
        const code = `${year}-${award ? "MCP" : "COA"} ${pad(++seq)}`;
        plan.get(p.line)!.codes.push(code);
        rows.push({
            brand_id: brand, cert_key: `${LEDGER_KEY_PREFIX}${code}`, type: award ? "award" : "participation", code,
            result: award ? p.res : "참가", note: "수료증 관리 대장", issued_at: `${issued}T00:00:00+09:00`,
            match_hash: ledgerMatchHash(p.nm, p.phone),
            snapshot: {
                name: p.nm, birthdate: p.birth, university: clean(p.university), major: clean(p.major),
                group_label: "소속 동아리", group_name: clean(p.club), cohort: clean(p.cohort), team_name: clean(p.team),
                round_title: title, kind: "competition", year, client_name: client, brand_name: "MADLeague",
                label: award ? "경쟁 PT 수상 확인서" : "경쟁 PT 참가 확인서", title, source: "ledger",
            },
        });
    };
    todo.forEach(p => build(p, false));
    const rank = (r: string | null) => (PT_RESULTS as readonly string[]).indexOf(r ?? "");
    const winners = todo.filter(p => p.res);
    const teamOrder = [...new Set(winners.map(p => clean(p.team) ?? ""))];
    [...winners]
        .sort((a, b) => rank(a.res) - rank(b.res) || teamOrder.indexOf(clean(a.team) ?? "") - teamOrder.indexOf(clean(b.team) ?? "") || a.line - b.line)
        .forEach(p => build(p, true));

    const award = rows.filter(r => r.type === "award").length;
    const range = rows.length ? `${year} ${pad(first)} ~ ${pad(seq)}` : null;
    const base = { participation: rows.length - award, award, plan: [...plan.values()], skipped, errors, range };
    // 오류가 하나라도 있으면 만들지 않는다 (일부만 발급되면 번호·명단이 꼬인다)
    if (preview || rows.length === 0 || errors.length) return { ok: errors.length === 0, created: 0, ...base };

    const { error } = await admin.from("program_certificates").insert(rows);
    if (error) {
        const reason = error.code === "23505" ? "그 사이 다른 발급이 있어 번호가 겹쳤습니다. 미리보기를 다시 눌러 주세요." : `저장 실패: ${error.message}`;
        return { ok: false, created: 0, ...base, errors: [...errors, { line: 0, reason }] };
    }
    return { ok: true, created: rows.length, ...base };
}
