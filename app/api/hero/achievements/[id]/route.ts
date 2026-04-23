/**
 * DELETE /api/hero/achievements/[id]
 */
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function DELETE(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    const { id } = await params;
    const sb = createAdminClient();
    const { error } = await sb.from("hero_achievements").delete().eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
}
