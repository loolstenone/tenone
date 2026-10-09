/**
 * 브랜드 성과 — 방문(GA4 보조) → 가입·문의·신청·수료(DB 1차) (서버 전용, 2026-10-10)
 *   Intelligence 3화면 중 "브랜드 성과"의 SSOT. 대시보드(이번 주 유니버스)도 이 결과를 쓴다
 *   집계 수만 낸다 — 개인 단위 교차 분석·브랜드 간 회원 대조 금지 (§0.1 데이터 계약 4, 개인정보보호법 제18조)
 *   행을 브랜드 컬럼만 페이지 단위로 읽어 센다 (API 1000행 제한 회피). 새 전환 원천이 생기면 SOURCES에 한 줄 추가
 */
import { createAdminClient } from "@/lib/supabase/admin";

export type Metric = "joins" | "inquiries" | "applications" | "certificates";

export interface BrandPerf {
    slug: string;
    name: string;
    tier: string | null;
    is_open: boolean;
    users: number;
    sessions: number;
    prev_users: number;
    cur: Record<Metric, number>;
    prev: Record<Metric, number>;
    members_total: number; // 새 사이트(Ten:One ID) 브랜드 가입 누적 — 외부 서버 브랜드는 재가입 추적
}

type Row = Record<string, string | null>;

/** 전환 원천: 테이블 · 시각 컬럼 · 브랜드 판정 */
const SOURCES: { metric: Metric; table: string; time: string; cols: string; brand: (r: Row) => string | null }[] = [
    { metric: "joins", table: "member_brand_joins", time: "joined_at", cols: "brand_id", brand: r => r.brand_id },
    { metric: "inquiries", table: "contact_submissions", time: "created_at", cols: "form_type", brand: r => r.form_type?.split("_")[0] ?? null },
    { metric: "inquiries", table: "hero_business_inquiries", time: "created_at", cols: "brand_id", brand: r => r.brand_id ?? "hero" },
    { metric: "applications", table: "program_applications", time: "created_at", cols: "brand_id", brand: r => r.brand_id },
    { metric: "applications", table: "brand_membership_applications", time: "created_at", cols: "brand_id", brand: r => r.brand_id },
    { metric: "applications", table: "mad_applications", time: "created_at", cols: "id", brand: () => "madleague" },
    { metric: "certificates", table: "program_certificates", time: "issued_at", cols: "brand_id", brand: r => r.brand_id },
];

async function readAll(table: string, cols: string, apply: (q: any) => any): Promise<Row[]> { // eslint-disable-line @typescript-eslint/no-explicit-any
    const admin = createAdminClient();
    const out: Row[] = [];
    for (let from = 0; ; from += 1000) {
        const { data, error } = await apply(admin.from(table).select(cols)).range(from, from + 999);
        if (error || !data?.length) break;
        out.push(...(data as Row[]));
        if (data.length < 1000) break;
    }
    return out;
}

const zero = (): Record<Metric, number> => ({ joins: 0, inquiries: 0, applications: 0, certificates: 0 });
const ymd = (d: Date) => new Date(d.getTime() + 9 * 3600000).toISOString().slice(0, 10);

export async function computeBrandPerformance(days: number): Promise<{ brands: BrandPerf[]; days: number; since: string; ga4_prev: boolean; checked_at: string }> {
    const now = Date.now();
    const curFrom = new Date(now - days * 86400000);
    const prevFrom = new Date(now - 2 * days * 86400000);

    const admin = createAdminClient();
    const [{ data: sites }, ga4, joinsAll, ...srcRows] = await Promise.all([
        admin.from("ums_sites").select("slug, name, tier, is_open"),
        readAll("analytics_snapshots", "brand_id, date, users, sessions", q => q.gt("date", ymd(prevFrom))),
        readAll("member_brand_joins", "brand_id", q => q.is("withdrawn_at", null)),
        ...SOURCES.map(s => readAll(s.table, `${s.cols}, ${s.time}`, q => q.gte(s.time, prevFrom.toISOString()))),
    ]);

    const map: Record<string, BrandPerf> = {};
    for (const s of (sites ?? []) as { slug: string; name: string; tier: string | null; is_open: boolean }[]) {
        map[s.slug] = { ...s, users: 0, sessions: 0, prev_users: 0, cur: zero(), prev: zero(), members_total: 0 };
    }

    const curDay = ymd(curFrom);
    let ga4Prev = false; // 앞 기간에 GA4 데이터가 없으면(수집 공백) 방문자 증감을 숨긴다
    for (const r of ga4) {
        const b = map[r.brand_id ?? ""];
        if (!b) continue; // _all · (not set)
        const users = Number(r.users) || 0;
        if ((r.date ?? "") > curDay) { b.users += users; b.sessions += Number(r.sessions) || 0; } else { b.prev_users += users; ga4Prev = true; }
    }
    for (const r of joinsAll) { const b = map[r.brand_id ?? ""]; if (b) b.members_total++; }

    SOURCES.forEach((s, i) => {
        for (const r of srcRows[i]) {
            const b = map[s.brand(r) ?? ""];
            if (!b) continue;
            (new Date(r[s.time] ?? 0) >= curFrom ? b.cur : b.prev)[s.metric]++;
        }
    });

    return { brands: Object.values(map), days, since: ymd(curFrom), ga4_prev: ga4Prev, checked_at: new Date().toISOString() };
}
