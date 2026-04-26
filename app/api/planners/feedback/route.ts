import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: Request) {
    const body = await req.json().catch(() => ({}));
    const message: string = body?.message ?? "";
    const page_path: string | null = typeof body?.page_path === "string" ? body.page_path : null;
    if (!message?.trim()) {
        return NextResponse.json({ error: "empty" }, { status: 400 });
    }

    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() { return cookieStore.getAll(); },
                setAll() {},
            },
        }
    );
    const { data: { user } } = await supabase.auth.getUser();

    const userAgent = req.headers.get("user-agent") || null;

    // 1) DB 영구 저장 (인트라 인박스 소스)
    const admin = createAdminClient();
    const { data: inserted, error: insertErr } = await admin
        .from("planners_feedback")
        .insert({
            user_id: user?.id ?? null,
            user_email: user?.email ?? null,
            message: message.trim(),
            user_agent: userAgent,
            page_path,
            status: "new",
        })
        .select("id, created_at")
        .single();

    if (insertErr) {
        console.error("[feedback] insert", insertErr);
        // DB 실패해도 이메일은 시도 — 기존 동작 보존
    }

    // 2) Resend 이메일 알림 (즉시 알림)
    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey) {
        await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${resendKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                from: "Planner's AI <noreply@tenone.biz>",
                to: ["lools@tenone.biz"],
                subject: "[PP AI 베타 피드백]",
                text: `사용자: ${user?.email ?? "anonymous"}\n경로: ${page_path ?? "-"}\n\n${message.trim()}\n\n---\n인트라 인박스: https://tenone.biz/intra/planners/feedback${inserted?.id ? `?id=${inserted.id}` : ""}`,
            }),
        }).catch(() => {});
    }

    return NextResponse.json({ ok: true, id: inserted?.id ?? null });
}
