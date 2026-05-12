// Gmail send — 새 메일 작성 + 답장
// body: { to: string, subject: string, body: string (text), inReplyTo?: messageId, threadId?: string, references?: string[] }
// 답장: inReplyTo 헤더 + Subject 앞에 "Re: " + threadId로 동일 thread에 묶이게

import { NextResponse } from "next/server";
import { getMemberId } from "@/lib/myverse/auth";
import { getValidAccessToken } from "@/lib/myverse/google-calendar";

const GMAIL_API = "https://gmail.googleapis.com/gmail/v1";

/** UTF-8 텍스트를 RFC 2047 인코딩으로 (제목 한글 깨짐 방지) */
function rfc2047(s: string): string {
    if (!s || /^[\x00-\x7F]*$/.test(s)) return s;
    return `=?UTF-8?B?${Buffer.from(s, "utf-8").toString("base64")}?=`;
}

/** base64url 인코딩 (Gmail API raw 필드 요구사항) */
function b64UrlEncode(s: string): string {
    return Buffer.from(s, "utf-8")
        .toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");
}

export async function POST(req: Request) {
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const to: string = (body.to ?? "").trim();
    const subject: string = (body.subject ?? "").trim();
    const text: string = (body.body ?? "").trim();
    const inReplyTo: string | undefined = body.inReplyTo;
    const threadId: string | undefined = body.threadId;
    const references: string[] | undefined = body.references;

    if (!to || !text) {
        return NextResponse.json({ error: "missing_required", required: ["to", "body"] }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
        return NextResponse.json({ error: "invalid_to" }, { status: 400 });
    }

    const token = await getValidAccessToken(memberId);
    if (!token) return NextResponse.json({ error: "not_connected" }, { status: 400 });

    // RFC 822 메시지 조립
    const headers: string[] = [
        `To: ${to}`,
        `Subject: ${rfc2047(subject || "(제목 없음)")}`,
        "MIME-Version: 1.0",
        'Content-Type: text/plain; charset="UTF-8"',
        "Content-Transfer-Encoding: 8bit",
    ];
    if (inReplyTo) headers.push(`In-Reply-To: <${inReplyTo}>`);
    if (references && references.length > 0) {
        headers.push(`References: ${references.map(r => `<${r}>`).join(" ")}`);
    } else if (inReplyTo) {
        headers.push(`References: <${inReplyTo}>`);
    }

    const raw = `${headers.join("\r\n")}\r\n\r\n${text}`;
    const encoded = b64UrlEncode(raw);

    const sendBody: Record<string, unknown> = { raw: encoded };
    if (threadId) sendBody.threadId = threadId;

    try {
        const res = await fetch(`${GMAIL_API}/users/me/messages/send`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(sendBody),
        });
        if (!res.ok) {
            const detail = await res.text().catch(() => "");
            // scope 부족 등 권한 에러 식별
            if (res.status === 403 && /insufficient/i.test(detail)) {
                return NextResponse.json({
                    error: "insufficient_scope",
                    hint: "Gmail 전송 권한 누락 — 외부 연동 페이지에서 Gmail 재연결 필요",
                }, { status: 403 });
            }
            return NextResponse.json({ error: "send_failed", status: res.status, detail }, { status: 500 });
        }
        const result = await res.json();
        return NextResponse.json({ ok: true, message_id: result.id, thread_id: result.threadId });
    } catch (e) {
        console.error("[gmail/send]", e);
        return NextResponse.json({ error: "send_error" }, { status: 500 });
    }
}
