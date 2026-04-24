import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";

async function getMemberId(): Promise<string | null> {
    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() { return cookieStore.getAll(); },
                setAll() { /* read-only */ },
            },
        }
    );
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const { data: member } = await supabase
        .from('members')
        .select('id')
        .eq('email', user.email!)
        .maybeSingle();
    return member?.id ?? null;
}

export async function POST(req: Request) {
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const body = await req.json();
    const amount = parseInt(String(body.amount ?? 19000), 10);
    const years = parseInt(String(body.years ?? 1), 10);

    if (amount !== 19000 * years) {
        return NextResponse.json({ error: "invalid_amount" }, { status: 400 });
    }

    const orderId = `pp_${memberId.slice(0, 8)}_${Date.now()}`;

    const admin = createAdminClient();
    const { error } = await admin.from("planners_payments").insert({
        member_id: memberId,
        order_id: orderId,
        amount,
        status: "pending",
        subscription_years: years,
        source: "toss",
    });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ orderId, amount });
}
