// 플래너스 PAD 후기 (planners_reviews) — 서버 전용 조회. 브라우저 직접 읽기 없음(RLS) → member_id는 밖으로 내보내지 않는다
import { createAdminClient } from "@/lib/supabase/admin";

export interface PublicReview {
    id: string;
    name: string;          // 가린 이름 (예: 박**)
    rating: number;
    body: string;
    edition: string | null;
    source: "badak" | "site";
    adminReply: string | null;
    createdAt: string;
    mine: boolean;
}

export interface ReviewSummary { count: number; average: number }

/** '박수진' → '박**' · 빈 이름은 '회원' */
export function maskName(name: string | null | undefined): string {
    const chars = [...(name ?? "").trim()];
    return chars.length ? `${chars[0]}**` : "회원";
}

interface Row {
    id: string; source: "badak" | "site"; member_id: string | null; masked_name: string | null; edition: string | null;
    rating: number; body: string; admin_reply: string | null; created_at: string;
    members: { name: string | null } | null;
}

/** 상품 1개의 공개 후기 (최신순) + 요약. viewerMemberId를 주면 본인 후기에 mine=true */
export async function listFileReviews(fileId: string, viewerMemberId?: string | null): Promise<{ reviews: PublicReview[]; summary: ReviewSummary }> {
    const admin = createAdminClient();
    const { data, error } = await admin.from("planners_reviews")
        .select("id, source, member_id, masked_name, edition, rating, body, admin_reply, created_at, members(name)")
        .eq("file_id", fileId).eq("is_visible", true)
        .order("created_at", { ascending: false })
        .limit(200);
    if (error) {
        console.error("[planners] 후기 조회 실패", error.message);
        return { reviews: [], summary: { count: 0, average: 0 } };
    }
    const rows = (data ?? []) as unknown as Row[];
    const reviews = rows.map((r) => ({
        id: r.id,
        name: r.source === "badak" ? (r.masked_name ?? "회원") : maskName(r.members?.name),
        rating: r.rating,
        body: r.body,
        edition: r.edition,
        source: r.source,
        adminReply: r.admin_reply,
        createdAt: r.created_at,
        mine: !!viewerMemberId && r.member_id === viewerMemberId,
    }));
    const average = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;
    return { reviews, summary: { count: reviews.length, average } };
}

/** 상품별 공개 후기 수 (몰 카드·목록용) */
export async function reviewCountsByFile(): Promise<Map<string, number>> {
    const admin = createAdminClient();
    const { data, error } = await admin.from("planners_reviews").select("file_id").eq("is_visible", true).limit(5000);
    if (error) {
        console.error("[planners] 후기 수 조회 실패", error.message);
        return new Map();
    }
    const counts = new Map<string, number>();
    for (const r of data ?? []) counts.set(r.file_id, (counts.get(r.file_id) ?? 0) + 1);
    return counts;
}
