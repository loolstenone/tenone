import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
);

// GET /api/intra/jakka/market?kind=products|orders|stats
export async function GET(req: NextRequest) {
    const kind = req.nextUrl.searchParams.get("kind") ?? "products";

    if (kind === "products") {
        const { data, error } = await supabaseAdmin
            .from("jakka_products")
            .select(`
                id, title, category, price, currency, status,
                stock, is_limited, sold_count, likes_count, view_count,
                created_at,
                creator:jakka_creators(id, handle, display_name, seller_status, seller_commission_rate)
            `)
            .order("created_at", { ascending: false })
            .limit(200);
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json({ products: data ?? [] });
    }

    if (kind === "orders") {
        const { data, error } = await supabaseAdmin
            .from("jakka_orders")
            .select(`
                id, status, quantity, total_price, currency,
                buyer_name, buyer_email, created_at, status_changed_at,
                product:jakka_products(id, title, thumb_url),
                creator:jakka_creators(id, handle, display_name)
            `)
            .order("created_at", { ascending: false })
            .limit(200);
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json({ orders: data ?? [] });
    }

    if (kind === "stats") {
        const [{ count: productCount }, { count: activeCount }, { count: soldOutCount }, { data: orderRows }] = await Promise.all([
            supabaseAdmin.from("jakka_products").select("id", { count: "exact", head: true }),
            supabaseAdmin.from("jakka_products").select("id", { count: "exact", head: true }).eq("status", "active"),
            supabaseAdmin.from("jakka_products").select("id", { count: "exact", head: true }).eq("status", "sold_out"),
            supabaseAdmin.from("jakka_orders").select("status, total_price, currency"),
        ]);
        const orderStats = { pending: 0, confirmed: 0, paid: 0, shipped: 0, completed: 0, cancelled: 0 };
        let completedRevenue = 0;
        for (const o of orderRows ?? []) {
            if (o.status in orderStats) orderStats[o.status as keyof typeof orderStats]++;
            if (o.status === "completed") completedRevenue += Number(o.total_price);
        }
        return NextResponse.json({
            productCount: productCount ?? 0,
            activeCount: activeCount ?? 0,
            soldOutCount: soldOutCount ?? 0,
            orderStats,
            completedRevenue,
        });
    }

    return NextResponse.json({ error: "invalid kind" }, { status: 400 });
}
