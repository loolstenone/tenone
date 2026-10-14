import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { buildAuthUrl, originOf } from "@/lib/myverse/google-calendar";
import crypto from "crypto";

export async function GET(req: Request) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            auth: { storageKey: "tenone-auth" }, // 유니버스 공통 세션 쿠키 이름 (lib/supabase/server.ts와 같음, 빠지면 로그인해도 401)
            cookies: {
                getAll() { return cookieStore.getAll(); },
                setAll() { /* read-only */ },
            },
        }
    );
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    // CSRF state 토큰 생성
    const state = crypto.randomBytes(16).toString("hex");

    const url = buildAuthUrl(state, originOf(req));
    if (!url) {
        return NextResponse.json({
            error: "not_configured",
            message: "Google 연동 환경변수가 설정되지 않았습니다 (GOOGLE_CLIENT_ID·GOOGLE_CLIENT_SECRET)",
        }, { status: 503 });
    }

    const response = NextResponse.redirect(url);
    response.cookies.set("pp_google_state", state, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 600,
        path: "/",
    });
    return response;
}
