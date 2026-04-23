/**
 * /api/hero/goals
 *   GET  ?memberId=xxx&status=active → 목표 목록
 *   POST  {memberId, title, description?, vriefTargets[], gprTargets[], deadline?}
 */
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const memberId = searchParams.get("memberId");
        const status = searchParams.get("status");

        if (!memberId) return NextResponse.json({ error: "memberId required" }, { status: 400 });

        const sb = createAdminClient();
        let q = sb.from("hero_goals").select("*").eq("member_id", memberId).order("created_at", { ascending: false });
        if (status) q = q.eq("status", status);

        const { data, error } = await q;
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });

        return NextResponse.json({ goals: data ?? [] });
    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "unknown";
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}

interface VriefTarget { code: string; label: string; from: number; to: number; }
interface GprTarget { label: string; metric?: string; target?: number; current?: number; }

export async function POST(req: NextRequest) {
    try {
        const body = (await req.json()) as {
            memberId: string;
            title: string;
            description?: string;
            vriefTargets?: VriefTarget[];
            gprTargets?: GprTarget[];
            deadline?: string;
        };

        if (!body.memberId || !body.title) {
            return NextResponse.json({ error: "memberId & title required" }, { status: 400 });
        }

        const sb = createAdminClient();
        const { data, error } = await sb.from("hero_goals").insert({
            member_id: body.memberId,
            title: body.title,
            description: body.description ?? null,
            vrief_targets: body.vriefTargets ?? [],
            gpr_targets: body.gprTargets ?? [],
            deadline: body.deadline ?? null,
        }).select("*").single();

        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json({ goal: data }, { status: 201 });
    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "unknown";
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}
