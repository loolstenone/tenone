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
            auth: { storageKey: "tenone-auth" }, // 유니버스 공통 세션 쿠키 이름 (lib/supabase/server.ts와 같음, 빠지면 로그인해도 401)
            cookies: {
                getAll() { return cookieStore.getAll(); },
                setAll() {},
            },
        }
    );
    const { data: { user } } = await supabase.auth.getUser();
    // 로그인 회원만 (2026-10-18) - 전엔 누구나 보낼 수 있어 스팸·알림 메일 폭주가 가능했다
    if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
    if (message.length > 2000) return NextResponse.json({ error: "too_long" }, { status: 400 });
    const isPlanners = page_path?.startsWith("/planners") ?? false;

    const userAgent = req.headers.get("user-agent") || null;

    // 1) DB 영구 저장 (인트라 인박스 소스)
    const admin = createAdminClient();
    const { data: inserted, error: insertErr } = await admin
        .from("myverse_feedback")
        .insert({
            user_id: user.id,
            user_email: user.email ?? null,
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
                from: isPlanners ? "Planner's <noreply@tenone.biz>" : "Myverse AI <noreply@tenone.biz>",
                to: ["lools@tenone.biz"],
                subject: isPlanners ? "[Planner's 베타 의견]" : "[Myverse AI 베타 피드백]",
                text: `사용자: ${user.email ?? "-"}\n경로: ${page_path ?? "-"}\n\n${message.trim()}\n\n---\n인트라 인박스: https://intra.tenone.biz/intra/planners/feedback${inserted?.id ? `?id=${inserted.id}` : ""}`,
            }),
        }).catch(() => {});
    }

    return NextResponse.json({ ok: true, id: inserted?.id ?? null });
}
