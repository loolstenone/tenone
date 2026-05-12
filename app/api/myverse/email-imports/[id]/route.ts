// 단일 메일 GET — DB에 본문 캐시 있으면 그대로, 없으면 Gmail API로 fetch + 캐시
// PATCH — is_read/is_starred 토글

import { NextResponse } from "next/server";
import { getMemberId } from "@/lib/myverse/auth";
import { getValidAccessToken } from "@/lib/myverse/google-calendar";
import { createAdminClient } from "@/lib/supabase/admin";

const GMAIL_API = "https://gmail.googleapis.com/gmail/v1";

interface GmailPart {
    partId?: string;
    mimeType?: string;
    filename?: string;
    body?: { data?: string; size?: number };
    parts?: GmailPart[];
}

/** base64url → utf-8 string */
function b64UrlDecode(s: string): string {
    try {
        const fixed = s.replace(/-/g, "+").replace(/_/g, "/");
        const padded = fixed + "=".repeat((4 - fixed.length % 4) % 4);
        const bin = Buffer.from(padded, "base64").toString("utf-8");
        return bin;
    } catch {
        return "";
    }
}

/** payload 트리에서 text/plain + text/html 본문 추출 (재귀) */
function extractBody(part: GmailPart): { text: string; html: string } {
    let text = "";
    let html = "";
    if (part.body?.data) {
        const decoded = b64UrlDecode(part.body.data);
        if (part.mimeType === "text/plain") text += decoded;
        else if (part.mimeType === "text/html") html += decoded;
    }
    if (part.parts) {
        for (const p of part.parts) {
            const sub = extractBody(p);
            text += sub.text;
            html += sub.html;
        }
    }
    return { text, html };
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const admin = createAdminClient();

    // 1) 우리 DB에서 row 조회
    const { data: row, error } = await admin
        .from("myverse_email_imports")
        .select("*")
        .eq("id", id)
        .eq("member_id", memberId)
        .maybeSingle();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (!row) return NextResponse.json({ error: "not_found" }, { status: 404 });

    // 2) 본문 캐시 있으면 그대로 반환
    if (row.body_fetched_at && (row.body_text || row.body_html)) {
        return NextResponse.json({ email: row });
    }

    // 3) Gmail API로 fetch (gmail 프로바이더만)
    if (row.provider !== "gmail") {
        return NextResponse.json({ email: row });
    }
    const token = await getValidAccessToken(memberId);
    if (!token) return NextResponse.json({ email: row, warning: "not_connected" });

    try {
        const res = await fetch(`${GMAIL_API}/users/me/messages/${row.external_id}?format=full`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
            return NextResponse.json({ email: row, warning: "fetch_failed", status: res.status });
        }
        const msg = await res.json();
        const { text, html } = msg.payload ? extractBody(msg.payload) : { text: "", html: "" };

        // 4) 캐시 저장 (text는 100KB·html은 500KB까지)
        const cappedText = text.slice(0, 100_000);
        const cappedHtml = html.slice(0, 500_000);
        const { data: updated } = await admin
            .from("myverse_email_imports")
            .update({
                body_text: cappedText || null,
                body_html: cappedHtml || null,
                body_fetched_at: new Date().toISOString(),
            })
            .eq("id", id)
            .eq("member_id", memberId)
            .select()
            .single();

        return NextResponse.json({ email: updated ?? row });
    } catch (e) {
        console.error("[email-imports/[id] fetch]", e);
        return NextResponse.json({ email: row, warning: "fetch_error" });
    }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const patch = await req.json().catch(() => ({}));
    const allowed: Record<string, unknown> = {};
    if (typeof patch.is_read === "boolean") allowed.is_read = patch.is_read;
    if (typeof patch.is_starred === "boolean") allowed.is_starred = patch.is_starred;
    if (typeof patch.triage_state === "string") allowed.triage_state = patch.triage_state;
    if (Object.keys(allowed).length === 0) {
        return NextResponse.json({ error: "no_valid_fields" }, { status: 400 });
    }

    const admin = createAdminClient();
    const { data, error } = await admin
        .from("myverse_email_imports")
        .update(allowed)
        .eq("id", id)
        .eq("member_id", memberId)
        .select()
        .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ email: data });
}
