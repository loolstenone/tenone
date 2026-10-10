import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { requireUser } from "@/lib/api-guard";
import { createAdminClient } from "@/lib/supabase/admin";
import { escapeHtml } from "@/lib/sanitize-html";

/*
 * 쇼케이스 승인 요청 메일 (2026-10-11 보안 수리)
 *   - 로그인한 주최자 본인의 쇼케이스만 · 수신자·토큰·제목은 body가 아니라 DB(jakka_showcase_approvals)에서
 *   - 이전: 인증 없이 body의 수신자·제목으로 noreply@tenone.biz 명의 임의 메일 발송 가능(피싱 릴레이)
 */

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://jakka.tenone.biz";
const FROM_EMAIL = process.env.NEWSLETTER_FROM_EMAIL || "noreply@tenone.biz";

function renderApprovalHtml(opts: {
    showcaseTitle: string;
    organizerName: string;
    approveUrl: string;
}) {
    const title = escapeHtml(opts.showcaseTitle);
    const organizer = escapeHtml(opts.organizerName);
    return `<!DOCTYPE html>
<html lang="ko">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:40px 0;">
  <tr><td align="center">
    <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;">
      <tr><td style="background:#000;padding:28px 40px;">
        <p style="margin:0;color:#fff;font-size:14px;font-weight:700;letter-spacing:0.3em;">JAKKA</p>
      </td></tr>
      <tr><td style="padding:36px 40px;">
        <p style="margin:0 0 8px;font-size:13px;color:#6b7280;font-weight:600;">쇼케이스 승인 요청</p>
        <p style="margin:0 0 24px;font-size:22px;font-weight:900;color:#111;letter-spacing:-0.5px;line-height:1.3;">${title}</p>
        <p style="margin:0 0 28px;font-size:15px;color:#374151;line-height:1.7;">
          <strong>${organizer}</strong>님이 위 쇼케이스의 승인을 요청했습니다.<br>
          함께 준비한 작가로서 아래 버튼을 눌러 승인 또는 거부해 주세요.
        </p>
        <p style="margin:0 0 28px;">
          <a href="${opts.approveUrl}" style="display:inline-block;background:#111;color:#fff;padding:14px 32px;text-decoration:none;font-size:14px;font-weight:700;letter-spacing:0.05em;">
            승인 / 거부하기
          </a>
        </p>
        <p style="margin:0;font-size:12px;color:#9ca3af;line-height:1.6;">
          이 링크를 통해 승인 또는 거부 의사를 전달해 주세요.<br>
          3명 모두 승인되면 쇼케이스가 공개됩니다.<br>
          본인이 요청받지 않은 경우 이 메일을 무시해 주세요.
        </p>
      </td></tr>
      <tr><td style="padding:20px 40px;border-top:1px solid #f3f4f6;">
        <p style="margin:0;font-size:11px;color:#9ca3af;">© JAKKA · Ten:One™ Universe · tenone.biz</p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`;
}

export async function POST(request: NextRequest) {
    const auth = await requireUser(request);
    if (auth instanceof NextResponse) return auth;

    try {
        const { showcaseId } = (await request.json().catch(() => ({}))) as { showcaseId?: string };
        if (!showcaseId || typeof showcaseId !== "string") {
            return NextResponse.json({ error: "showcaseId 누락" }, { status: 400 });
        }

        const admin = createAdminClient();
        const { data: showcase } = await admin
            .from("jakka_showcases")
            .select("id, title, organizer:jakka_creators!jakka_showcases_organizer_id_fkey(user_id, display_name)")
            .eq("id", showcaseId)
            .maybeSingle();
        const organizer = (showcase as unknown as { organizer?: { user_id: string; display_name: string } | null } | null)?.organizer ?? null;
        if (!showcase || !organizer) return NextResponse.json({ error: "쇼케이스를 찾을 수 없습니다" }, { status: 404 });
        if (organizer.user_id !== auth.user.id && !auth.isStaff) {
            return NextResponse.json({ error: "주최자만 승인 요청을 보낼 수 있습니다" }, { status: 403 });
        }

        // 대기 중 승인 요청만 — 발송 기록이 없는 것 (중복 발송 방지는 responded_at·status로)
        const { data: approvals } = await admin
            .from("jakka_showcase_approvals")
            .select("approver_email, token")
            .eq("showcase_id", showcaseId)
            .eq("status", "pending")
            .limit(5);
        if (!approvals?.length) return NextResponse.json({ ok: 0, fail: 0 });

        const resend = new Resend(process.env.RESEND_API_KEY);
        let ok = 0;
        let fail = 0;

        for (const { approver_email: email, token } of approvals) {
            const approveUrl = `${SITE_URL}/jakka/showcase/approve/${encodeURIComponent(token)}`;
            const { error } = await resend.emails.send({
                from: `JAKKA <${FROM_EMAIL}>`,
                to: email,
                subject: `[JAKKA] 쇼케이스 승인 요청 — ${String(showcase.title).replace(/[\r\n]/g, " ")}`,
                html: renderApprovalHtml({ showcaseTitle: showcase.title, organizerName: organizer.display_name, approveUrl }),
            });
            if (error) { console.error("showcase approval email error:", email.replace(/^(.{2}).*(@.*)$/, "$1***$2"), error); fail++; }
            else ok++;
        }

        return NextResponse.json({ ok, fail });
    } catch (err) {
        console.error("[jakka/showcase] error:", err);
        return NextResponse.json({ error: "서버 오류" }, { status: 500 });
    }
}
