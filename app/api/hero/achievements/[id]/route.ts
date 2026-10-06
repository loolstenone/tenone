/**
 * DELETE /api/hero/achievements/[id]
 */
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireMember, assertOwnsRow } from "@/lib/api-guard";

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    const { id } = await params;
    const auth = await requireMember(req);
    if (auth instanceof NextResponse) return auth;
    const notOwner = await assertOwnsRow(auth, "hero_achievements", id);
    if (notOwner) return notOwner;
    const sb = createAdminClient();
    const { error } = await sb.from("hero_achievements").delete().eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
}
