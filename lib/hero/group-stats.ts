/**
 * HeRo 묶음 통계 — 팀 진단·인재 풀 리포트 공용 (서버 전용)
 * ❌ 개인의 검사 내용은 기업에 주지 않는다 (2026-10-13) — 여기서 나가는 것은 비율·평균뿐
 * 집단이 GROUP_FLOOR(5)명 미만이면 리포트를 만들지 않고, 칸 단위로도 5명 미만은 숨긴다(talent report)
 */
import type { SupabaseClient } from "@supabase/supabase-js";

export const GROUP_FLOOR = 5;

export interface HitRow {
    member_id: string;
    disc_primary: string | null;
    mbti_e_score: number | null;
    mbti_s_score: number | null;
    mbti_t_score: number | null;
    mbti_j_score: number | null;
    ap_top3_code: string | null;
}

/** 회원별 가장 최근 기본 성향 검사 결과 1건 */
export async function latestHitA(sb: SupabaseClient, memberIds: string[]): Promise<HitRow[]> {
    if (memberIds.length === 0) return [];
    const out = new Map<string, HitRow>();
    for (let i = 0; i < memberIds.length; i += 200) {
        const { data } = await sb.from("hit_a_results")
            .select("member_id, disc_primary, mbti_e_score, mbti_s_score, mbti_t_score, mbti_j_score, ap_top3_code, created_at")
            .in("member_id", memberIds.slice(i, i + 200))
            .order("created_at", { ascending: false });
        for (const r of (data ?? []) as (HitRow & { created_at: string })[]) {
            if (!out.has(r.member_id)) out.set(r.member_id, r);
        }
    }
    return [...out.values()];
}

/* ── 행동 유형 (DISC 주 유형) → 팀 역할 ── */
export const DISC_ROLES = [
    { key: "D", role: "추진", desc: "목표를 정하고 밀어붙이는 힘" },
    { key: "I", role: "소통", desc: "사람을 모으고 분위기를 만드는 힘" },
    { key: "S", role: "안정", desc: "꾸준히 실행하고 팀을 받치는 힘" },
    { key: "C", role: "분석", desc: "따져 보고 기준을 세우는 힘" },
] as const;

/* ── 일하는 방식 4축 (MBTI 점수 = 왼쪽 성향 %) ── */
export const WORK_AXES = [
    { key: "mbti_e_score", left: "외향", right: "내향", leftDesc: "말하며 생각을 정리", rightDesc: "혼자 정리한 뒤 말함" },
    { key: "mbti_s_score", left: "감각", right: "직관", leftDesc: "사실·경험 중심", rightDesc: "가능성·큰 그림 중심" },
    { key: "mbti_t_score", left: "사고", right: "감정", leftDesc: "논리·기준으로 결정", rightDesc: "사람·관계를 살펴 결정" },
    { key: "mbti_j_score", left: "계획", right: "유연", leftDesc: "미리 정하고 지킴", rightDesc: "상황에 맞춰 바꿈" },
] as const;

/* ── 흥미 유형 (RIASEC 1순위) ── */
export const INTERESTS = [
    { key: "R", label: "현실형", desc: "손으로 만들고 다루는 일" },
    { key: "I", label: "탐구형", desc: "조사하고 분석하는 일" },
    { key: "A", label: "예술형", desc: "표현하고 창작하는 일" },
    { key: "S", label: "사회형", desc: "돕고 가르치는 일" },
    { key: "E", label: "진취형", desc: "이끌고 설득하는 일" },
    { key: "C", label: "관습형", desc: "정리하고 관리하는 일" },
] as const;

const pct = (n: number, total: number) => (total > 0 ? Math.round((n / total) * 100) : 0);

export function discShares(rows: HitRow[]) {
    const valid = rows.filter(r => r.disc_primary);
    return DISC_ROLES.map(d => {
        const n = valid.filter(r => r.disc_primary === d.key).length;
        return { ...d, count: n, pct: pct(n, valid.length) };
    });
}

export function workBalance(rows: HitRow[]) {
    return WORK_AXES.map(a => {
        const vals = rows.map(r => r[a.key]).filter((v): v is number => typeof v === "number");
        const avg = vals.length ? Math.round(vals.reduce((x, y) => x + y, 0) / vals.length) : 50;
        return { ...a, leftPct: avg };
    });
}

export function interestShares(rows: HitRow[]) {
    const valid = rows.filter(r => r.ap_top3_code);
    return INTERESTS.map(it => {
        const n = valid.filter(r => r.ap_top3_code!.charAt(0) === it.key).length;
        return { ...it, count: n, pct: pct(n, valid.length) };
    });
}

/** 칸 단위 숨김 — count가 GROUP_FLOOR 미만이면 숫자를 지운다 (분포 비율도 숨김) */
export function suppress<T extends { count: number; pct: number }>(cells: T[]): (Omit<T, "count"> & { hidden: boolean })[] {
    return cells.map(({ count, ...rest }) => ({ ...rest, pct: count < GROUP_FLOOR ? 0 : rest.pct, hidden: count > 0 && count < GROUP_FLOOR }));
}
