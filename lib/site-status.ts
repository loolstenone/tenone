// 서버 전용 — 사이트 현황 집계 (통합 관리 > 사이트 현황 · 브랜드 대시보드 · 에이전트 공용)
// Tier·상태 = ums_sites, 메뉴별 콘텐츠 = lib/brand-site-menus.ts
// 개수는 DB count(head)로 센다 — 행을 불러와 세면 API 1000행 제한에 잘린다 (Badak 회원 ~9,000)
import type { SupabaseClient } from "@supabase/supabase-js";
import { BRAND_SITE_MENUS, siteMenuTitle, type SiteMenu } from "@/lib/brand-site-menus";
import { OPEN_INQUIRY_STATUSES } from "@/lib/contact-inquiry";
import type { MenuStatus, SiteStatus } from "@/types/site-status";

const OPEN = Array.from(OPEN_INQUIRY_STATUSES);

/** 필터 체인 — eq·is·like·in만 쓴다 */
interface CountQuery extends PromiseLike<{ count: number | null; error: unknown }> {
    eq(column: string, value: string | boolean): CountQuery;
    is(column: string, value: null): CountQuery;
    like(column: string, pattern: string): CountQuery;
    in(column: string, values: string[]): CountQuery;
}

async function headCount(admin: SupabaseClient, table: string, filter: (q: CountQuery) => CountQuery = q => q): Promise<number | null> {
    const base = admin.from(table).select("*", { count: "exact", head: true }) as unknown as CountQuery;
    const { count, error } = await filter(base);
    return error ? null : count ?? 0;
}

function applyEq(q: CountQuery, eq?: Record<string, string | boolean>): CountQuery {
    return Object.entries(eq ?? {}).reduce((r, [k, v]) => r.eq(k, v), q);
}

/** form_type 정확히 일치 또는 사이트 접두어(`rook_…`) */
function inquiryCount(admin: SupabaseClient, match: { formType: string } | { prefix: string }, openOnly: boolean) {
    return headCount(admin, "contact_submissions", q => {
        const r = "formType" in match ? q.eq("form_type", match.formType) : q.like("form_type", `${match.prefix}\\_%`);
        return openOnly ? r.in("status", OPEN) : r;
    });
}

async function menuStatus(admin: SupabaseClient, boardId: (slug: string) => string | undefined, m: SiteMenu): Promise<MenuStatus> {
    const src = m.source;
    const base = { label: siteMenuTitle(m), path: m.path, adminHref: m.adminHref ?? null, unit: m.unit ?? "", kind: src.kind, placement: m.placement };
    switch (src.kind) {
        case "board": {
            const id = boardId(src.board);
            return { ...base, count: id ? await headCount(admin, "ums_posts", q => q.eq("board_id", id)) : null, pending: null };
        }
        case "inquiry": {
            const [count, pending] = await Promise.all([
                inquiryCount(admin, { formType: src.formType }, false),
                inquiryCount(admin, { formType: src.formType }, true),
            ]);
            return { ...base, count, pending };
        }
        case "table": {
            const [count, pending] = await Promise.all([
                headCount(admin, src.table, q => applyEq(q, src.eq)),
                src.pendingEq ? headCount(admin, src.table, q => applyEq(q, src.pendingEq)) : Promise.resolve(null),
            ]);
            return { ...base, count, pending };
        }
        default:
            return { ...base, count: null, pending: null };
    }
}

/** only 지정 시 그 사이트만 */
export async function computeSitesStatus(admin: SupabaseClient, only?: string | null): Promise<SiteStatus[]> {
    const [sitesRes, boardsRes] = await Promise.all([
        admin.from("ums_sites").select("id, slug, name, tier, lifecycle, hosting, is_open").order("slug"),
        admin.from("ums_boards").select("id, slug, name, site_id"),
    ]);
    if (sitesRes.error) throw sitesRes.error;
    if (boardsRes.error) throw boardsRes.error;
    type SiteRow = { id: string; slug: string; name: string | null; tier: string | null; lifecycle: string | null; hosting: string | null; is_open: boolean };
    const sites = ((sitesRes.data ?? []) as SiteRow[]).filter(s => !only || s.slug === only);
    const boards = (boardsRes.data ?? []) as { id: string; slug: string; name: string | null; site_id: string }[];

    return Promise.all(sites.map(async (s): Promise<SiteStatus> => {
        const reg = BRAND_SITE_MENUS.find(b => b.siteId === s.slug);
        const boardId = (slug: string) => boards.find(b => b.site_id === s.id && b.slug === slug)?.id;
        // DB 게시판 중 사이트 메뉴(레지스트리)에 연결 안 된 것 — 사이트에서 게시판을 늘리고 메뉴를 안 붙이면 여기 드러난다
        const mappedBoards = new Set((reg?.menus ?? []).flatMap(m => (m.source.kind === "board" ? [m.source.board] : [])));
        const unmappedBoards = reg ? boards.filter(b => b.site_id === s.id && !mappedBoards.has(b.slug)).map(b => b.name ?? b.slug) : [];
        const [members, posts, inquiries, openInquiries, menus] = await Promise.all([
            headCount(admin, "member_brand_joins", q => q.eq("brand_id", s.slug).is("withdrawn_at", null)),
            headCount(admin, "ums_posts", q => q.eq("site_id", s.id)),
            inquiryCount(admin, { prefix: s.slug }, false),
            inquiryCount(admin, { prefix: s.slug }, true),
            reg ? Promise.all(reg.menus.map(m => menuStatus(admin, boardId, m))) : Promise.resolve(null),
        ]);
        return {
            slug: s.slug, name: s.name, tier: s.tier, lifecycle: s.lifecycle, hosting: s.hosting, isOpen: !!s.is_open,
            members: members ?? 0, posts: posts ?? 0, inquiries: inquiries ?? 0, openInquiries: openInquiries ?? 0,
            menus, unmappedBoards,
        };
    }));
}
