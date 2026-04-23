/**
 * POST /api/hero/matching/:id/report
 *
 * 사용자(인재·기업 담당자) 자체 진행 상황 보고.
 * 허용 전이:
 *   contacted    → interviewing  (면접 일정 잡힘)
 *   interviewing → trial         (트라이얼 시작)
 *   interviewing → declined      (면접 후 거절)
 *   trial        → hired         (트라이얼 통과)
 *   trial        → declined      (트라이얼 탈락)
 *
 * 어드민(Intra) PATCH와 달리 참여자 본인 확인 후 제한된 전이만 허용.
 */
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient as createServerClient } from "@/lib/supabase/server";

const USER_TRANSITIONS: Record<string, string[]> = {
    contacted:    ["interviewing", "withdrawn"],
    interviewing: ["trial", "declined"],
    trial:        ["hired", "declined"],
};

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await ctx.params;
        const body = await req.json() as { toStatus: string; note?: string };

        if (!body.toStatus) {
            return NextResponse.json({ error: "toStatus required" }, { status: 400 });
        }

        // 인증 확인
        const sbUser = await createServerClient();
        const { data: { user } } = await sbUser.auth.getUser();
        if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

        const sb = createAdminClient();

        // 현재 매칭 조회
        const { data: match, error: fetchErr } = await sb
            .from("hero_matches")
            .select("id, match_status, profile_member_id, company_id")
            .eq("id", id)
            .maybeSingle();

        if (fetchErr || !match) return NextResponse.json({ error: "not found" }, { status: 404 });

        // 참여자 확인 (인재 본인 또는 기업 담당자)
        const isTalent = match.profile_member_id === user.id;
        let isCompanyMember = false;
        if (!isTalent && match.company_id) {
            const { data: mem } = await sb
                .from("hero_company_members")
                .select("id")
                .eq("member_id", user.id)
                .eq("company_id", match.company_id)
                .eq("status", "active")
                .maybeSingle();
            isCompanyMember = !!mem;
        }

        if (!isTalent && !isCompanyMember) {
            return NextResponse.json({ error: "forbidden" }, { status: 403 });
        }

        // 전이 허용 여부 확인
        const allowed = USER_TRANSITIONS[match.match_status] ?? [];
        if (!allowed.includes(body.toStatus)) {
            return NextResponse.json(
                { error: `${match.match_status} → ${body.toStatus} 전이는 허용되지 않습니다.` },
                { status: 422 }
            );
        }

        const updates: Record<string, unknown> = {
            match_status: body.toStatus,
            status_changed_at: new Date().toISOString(),
        };
        if (body.note) {
            // 보고자 구분해 피드백 필드에 저장
            if (isTalent) updates.talent_feedback = body.note;
            else updates.company_feedback = body.note;
        }

        const { data, error } = await sb
            .from("hero_matches")
            .update(updates)
            .eq("id", id)
            .select("id, match_status")
            .single();

        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json({ ok: true, id: data.id, status: data.match_status });
    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "unknown";
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}
