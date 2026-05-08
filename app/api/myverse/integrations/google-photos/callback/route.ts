// Google Photos OAuth 콜백 — code → token 교환 → DB 저장 → settings로 redirect

import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

interface TokenResponse {
    access_token: string;
    refresh_token?: string;
    expires_in: number;
    scope: string;
    token_type: string;
}

export async function GET(req: Request) {
    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    const stateRaw = url.searchParams.get("state");
    const error = url.searchParams.get("error");

    if (error) {
        return NextResponse.redirect(`${url.origin}/myverse/app/settings/integrations?error=${encodeURIComponent(error)}`);
    }
    if (!code || !stateRaw) {
        return NextResponse.redirect(`${url.origin}/myverse/app/settings/integrations?error=missing_params`);
    }

    let memberId: string;
    try {
        const decoded = JSON.parse(Buffer.from(stateRaw, "base64url").toString("utf8"));
        memberId = decoded.memberId;
    } catch {
        return NextResponse.redirect(`${url.origin}/myverse/app/settings/integrations?error=invalid_state`);
    }

    const clientId = process.env.GMAIL_CLIENT_ID;
    const clientSecret = process.env.GMAIL_CLIENT_SECRET;
    if (!clientId || !clientSecret) {
        return NextResponse.redirect(`${url.origin}/myverse/app/settings/integrations?error=missing_oauth_config`);
    }

    const redirectUri = `${url.origin}/api/myverse/integrations/google-photos/callback`;

    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
            code,
            client_id: clientId,
            client_secret: clientSecret,
            redirect_uri: redirectUri,
            grant_type: "authorization_code",
        }),
    });

    if (!tokenRes.ok) {
        const errText = await tokenRes.text();
        console.error("[google-photos callback] token exchange failed:", errText);
        return NextResponse.redirect(`${url.origin}/myverse/app/settings/integrations?error=token_exchange_failed`);
    }

    const token = (await tokenRes.json()) as TokenResponse;

    // 사용자 정보 가져오기 (선택)
    let profile: { email?: string; name?: string } = {};
    try {
        const userInfoRes = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
            headers: { Authorization: `Bearer ${token.access_token}` },
        });
        if (userInfoRes.ok) profile = await userInfoRes.json();
    } catch { /* ignore */ }

    const expiresAt = new Date(Date.now() + token.expires_in * 1000);

    const admin = createAdminClient();
    await admin
        .from("myverse_oauth_tokens")
        .upsert({
            member_id: memberId,
            provider: "google_photos",
            access_token: token.access_token,
            refresh_token: token.refresh_token ?? null,
            expires_at: expiresAt.toISOString(),
            scope: token.scope,
            raw_profile: profile,
        }, { onConflict: "member_id,provider" });

    return NextResponse.redirect(`${url.origin}/myverse/app/settings/integrations?connected=google_photos`);
}
