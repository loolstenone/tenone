// Google Photos OAuth 연결 시작 — auth URL 생성 후 redirect
// GET /api/myverse/integrations/google-photos/connect

import { NextResponse } from "next/server";
import { getMemberId } from "@/lib/myverse/auth";

export const dynamic = "force-dynamic";

const GOOGLE_AUTH = "https://accounts.google.com/o/oauth2/v2/auth";
const SCOPES = [
    "https://www.googleapis.com/auth/photoslibrary.readonly",
    "openid",
    "email",
    "profile",
].join(" ");

export async function GET(req: Request) {
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const clientId = process.env.GMAIL_CLIENT_ID;
    if (!clientId) return NextResponse.json({ error: "missing_client_id" }, { status: 500 });

    const origin = new URL(req.url).origin;
    const redirectUri = `${origin}/api/myverse/integrations/google-photos/callback`;

    // state로 memberId + nonce 토큰 — callback에서 검증
    const state = Buffer.from(JSON.stringify({ memberId, nonce: crypto.randomUUID() })).toString("base64url");

    const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: "code",
        scope: SCOPES,
        access_type: "offline",
        prompt: "consent",
        state,
    });

    return NextResponse.redirect(`${GOOGLE_AUTH}?${params.toString()}`);
}
