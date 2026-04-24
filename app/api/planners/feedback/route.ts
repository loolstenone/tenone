import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST(req: Request) {
    const { message } = await req.json();
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

    // Resend로 피드백 이메일 발송
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
                text: `사용자: ${user?.email ?? "anonymous"}\n\n${message.trim()}`,
            }),
        }).catch(() => {});
    }

    return NextResponse.json({ ok: true });
}
