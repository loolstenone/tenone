/**
 * 외부 소스 추가 API
 * POST /api/external/sources
 * Body: { type: 'rss' | 'web' | 'newsletter', url: string, name: string, category?: string, notes?: string }
 *
 * mindle_sources 테이블에 INSERT (service_role bypass RLS).
 */
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

interface AddSourceRequest {
    type: "rss" | "web" | "newsletter";
    url: string;
    name: string;
    category?: string;
    notes?: string;
    crawl_interval_hours?: number;
}

export async function POST(request: NextRequest) {
    let body: AddSourceRequest;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
    }

    const { type, url, name, category, notes, crawl_interval_hours } = body;

    if (!type || !url || !name) {
        return NextResponse.json({ ok: false, error: "type, url, name required" }, { status: 400 });
    }
    if (!["rss", "web", "newsletter"].includes(type)) {
        return NextResponse.json({ ok: false, error: `Invalid type: ${type}` }, { status: 400 });
    }

    const sb = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    // 중복 체크
    const { data: existing } = await sb.from("mindle_sources").select("id").eq("url", url).limit(1);
    if (existing && existing.length > 0) {
        return NextResponse.json({ ok: false, error: "이미 등록된 URL입니다.", id: existing[0].id }, { status: 409 });
    }

    const { data, error } = await sb.from("mindle_sources").insert({
        name,
        url,
        source_type: type,
        category: category || "general",
        is_active: true,
        crawl_interval_hours: crawl_interval_hours || 24,
        crawl_count: 0,
        error_count: 0,
        notes: notes || null,
        tenant_id: "tenone",
    }).select().single();

    if (error) {
        return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, source: data });
}
