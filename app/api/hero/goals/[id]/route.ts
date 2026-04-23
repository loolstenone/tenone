/**
 * /api/hero/goals/:id
 *   PATCH  {title?, description?, vriefTargets?, gprTargets?, deadline?, status?, progressPercent?}
 *   DELETE
 */
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await ctx.params;
        const body = await req.json();

        const updates: Record<string, unknown> = {};
        if (body.title !== undefined) updates.title = body.title;
        if (body.description !== undefined) updates.description = body.description;
        if (body.vriefTargets !== undefined) updates.vrief_targets = body.vriefTargets;
        if (body.gprTargets !== undefined) updates.gpr_targets = body.gprTargets;
        if (body.deadline !== undefined) updates.deadline = body.deadline;
        if (body.status !== undefined) updates.status = body.status;
        if (body.progressPercent !== undefined) updates.progress_percent = body.progressPercent;

        const sb = createAdminClient();
        const { data, error } = await sb.from("hero_goals").update(updates).eq("id", id).select("*").single();
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json({ goal: data });
    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "unknown";
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await ctx.params;
        const sb = createAdminClient();
        const { error } = await sb.from("hero_goals").delete().eq("id", id);
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json({ ok: true });
    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "unknown";
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}
