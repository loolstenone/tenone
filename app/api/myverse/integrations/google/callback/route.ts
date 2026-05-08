import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import { exchangeCodeForTokens, fetchUserInfo } from "@/lib/myverse/google-calendar";

export async function GET(req: Request) {
    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    const error = url.searchParams.get("error");

    if (error) {
        return NextResponse.redirect(new URL(`/myverse/app/settings?google_error=${error}`, req.url));
    }
    if (!code || !state) {
        return NextResponse.redirect(new URL("/myverse/app/settings?google_error=missing_code", req.url));
    }

    const cookieStore = await cookies();
    const savedState = cookieStore.get("pp_google_state")?.value;
    if (!savedState || savedState !== state) {
        return NextResponse.redirect(new URL("/myverse/app/settings?google_error=state_mismatch", req.url));
    }

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
    if (!user) return NextResponse.redirect(new URL("/login?redirect=/myverse/app/settings", req.url));

    const { data: member } = await supabase.from("members").select("id").eq("email", user.email!).maybeSingle();
    if (!member) return NextResponse.redirect(new URL("/myverse/app/settings?google_error=member_not_found", req.url));

    // 토큰 교환
    const tokens = await exchangeCodeForTokens(code);
    if (!tokens) {
        return NextResponse.redirect(new URL("/myverse/app/settings?google_error=token_exchange_failed", req.url));
    }

    // 사용자 정보 조회
    const userInfo = await fetchUserInfo(tokens.access_token);

    const expiresAt = new Date(Date.now() + tokens.expires_in * 1000).toISOString();

    const admin = createAdminClient();
    await admin.from("myverse_integrations").upsert({
        member_id: member.id,
        provider: "google_calendar",
        status: "active",
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token ?? undefined,
        expires_at: expiresAt,
        scope: tokens.scope,
        external_email: userInfo?.email ?? null,
        external_name: userInfo?.name ?? null,
        sync_direction: "read",
        updated_at: new Date().toISOString(),
    }, { onConflict: "member_id,provider" });

    return NextResponse.redirect(new URL("/myverse/app/settings?google=connected", req.url));
}
