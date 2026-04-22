/**
 * HeRo JD API
 * - GET  /api/hero/jd?companyId=xxx&memberId=xxx  → 해당 기업의 JD 목록
 * - GET  /api/hero/jd?id=xxx&memberId=xxx         → 단일 JD 조회
 * - POST /api/hero/jd                             → JD 생성/수정 (upsert)
 *
 * 권한 검증: member_id가 company_id의 active 담당자여야만 접근 가능
 */
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

async function assertMemberInCompany(sb: ReturnType<typeof createAdminClient>, memberId: string, companyId: string) {
    const { data } = await sb
        .from("hero_company_members")
        .select("id, role")
        .eq("member_id", memberId)
        .eq("company_id", companyId)
        .eq("status", "active")
        .maybeSingle();
    return data;
}

export async function GET(req: NextRequest) {
    try {
        const id = req.nextUrl.searchParams.get("id");
        const companyId = req.nextUrl.searchParams.get("companyId");
        const memberId = req.nextUrl.searchParams.get("memberId");

        if (!memberId) return NextResponse.json({ error: "memberId required" }, { status: 400 });
        if (!id && !companyId) return NextResponse.json({ error: "id or companyId required" }, { status: 400 });

        const sb = createAdminClient();

        if (id) {
            const { data: jd } = await sb.from("hero_jd").select("*").eq("id", id).maybeSingle();
            if (!jd) return NextResponse.json({ error: "not found" }, { status: 404 });
            const member = await assertMemberInCompany(sb, memberId, jd.company_id);
            if (!member) return NextResponse.json({ error: "forbidden" }, { status: 403 });
            return NextResponse.json({ jd });
        }

        const member = await assertMemberInCompany(sb, memberId, companyId!);
        if (!member) return NextResponse.json({ error: "forbidden" }, { status: 403 });

        const { data: list } = await sb
            .from("hero_jd")
            .select("*")
            .eq("company_id", companyId)
            .order("updated_at", { ascending: false });

        return NextResponse.json({ jds: list ?? [] });
    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "unknown";
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const {
            id,
            memberId,
            companyId,
            tihResponseId,
            positionTitle,
            summary,
            blocks,
            employmentType,
            experienceRange,
            status,
        } = body as {
            id?: string;
            memberId: string;
            companyId: string;
            tihResponseId?: string | null;
            positionTitle: string;
            summary?: string;
            blocks?: Record<string, unknown>;
            employmentType?: string;
            experienceRange?: string;
            status?: "draft" | "published" | "archived";
        };

        if (!memberId || !companyId || !positionTitle) {
            return NextResponse.json({ error: "memberId, companyId, positionTitle required" }, { status: 400 });
        }

        const sb = createAdminClient();

        const member = await assertMemberInCompany(sb, memberId, companyId);
        if (!member) return NextResponse.json({ error: "forbidden" }, { status: 403 });
        // viewer는 작성 불가
        if (member.role === "viewer") {
            return NextResponse.json({ error: "viewer는 JD 작성 권한이 없습니다." }, { status: 403 });
        }

        const finalStatus = status ?? "draft";
        const payload = {
            company_id: companyId,
            tih_response_id: tihResponseId || null,
            author_member_id: memberId,
            position_title: positionTitle,
            summary: summary || null,
            blocks: blocks || {},
            employment_type: employmentType || null,
            experience_range: experienceRange || null,
            status: finalStatus,
            published_at: finalStatus === "published" ? new Date().toISOString() : null,
            archived_at: finalStatus === "archived" ? new Date().toISOString() : null,
        };

        if (id) {
            const { data, error } = await sb.from("hero_jd").update(payload).eq("id", id).select("id, status").single();
            if (error) return NextResponse.json({ error: error.message }, { status: 500 });
            return NextResponse.json({ ok: true, id: data.id, status: data.status });
        }

        const { data, error } = await sb.from("hero_jd").insert(payload).select("id, status").single();
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json({ ok: true, id: data.id, status: data.status }, { status: 201 });
    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "unknown";
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}
