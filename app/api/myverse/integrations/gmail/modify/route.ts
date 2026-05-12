// Gmail modify — Gmail 메시지 라벨 변경 (archive·읽음 처리)
// body: { external_id: string, action: "archive" | "mark_read" | "mark_unread" | "star" | "unstar" }
// Gmail 라벨 매핑: INBOX(수신함), UNREAD(안읽음), STARRED(별표)

import { NextResponse } from "next/server";
import { getMemberId } from "@/lib/myverse/auth";
import { getValidAccessToken } from "@/lib/myverse/google-calendar";

const GMAIL_API = "https://gmail.googleapis.com/gmail/v1";

type Action = "archive" | "mark_read" | "mark_unread" | "star" | "unstar";

const ACTION_LABELS: Record<Action, { add: string[]; remove: string[] }> = {
    archive:     { add: [],          remove: ["INBOX"] },
    mark_read:   { add: [],          remove: ["UNREAD"] },
    mark_unread: { add: ["UNREAD"],  remove: [] },
    star:        { add: ["STARRED"], remove: [] },
    unstar:      { add: [],          remove: ["STARRED"] },
};

export async function POST(req: Request) {
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const externalId: string = (body.external_id ?? "").trim();
    const action: Action = body.action;

    if (!externalId || !(action in ACTION_LABELS)) {
        return NextResponse.json({ error: "missing_or_invalid", required: ["external_id", "action"] }, { status: 400 });
    }

    const token = await getValidAccessToken(memberId);
    if (!token) return NextResponse.json({ error: "not_connected" }, { status: 400 });

    const { add, remove } = ACTION_LABELS[action];
    try {
        const res = await fetch(`${GMAIL_API}/users/me/messages/${externalId}/modify`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ addLabelIds: add, removeLabelIds: remove }),
        });
        if (!res.ok) {
            const detail = await res.text().catch(() => "");
            if (res.status === 403 && /insufficient/i.test(detail)) {
                return NextResponse.json({
                    error: "insufficient_scope",
                    hint: "Gmail 수정 권한 누락 — 외부 연동 페이지에서 Gmail 재연결 필요",
                }, { status: 403 });
            }
            return NextResponse.json({ error: "modify_failed", status: res.status, detail }, { status: 500 });
        }
        return NextResponse.json({ ok: true, action });
    } catch (e) {
        console.error("[gmail/modify]", e);
        return NextResponse.json({ error: "modify_error" }, { status: 500 });
    }
}
