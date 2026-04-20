import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://jakka.tenone.biz";
const FROM_EMAIL = process.env.NEWSLETTER_FROM_EMAIL || "noreply@tenone.biz";

function renderApprovalHtml(opts: {
    showcaseTitle: string;
    organizerName: string;
    approveUrl: string;
}) {
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
        <p style="margin:0 0 24px;font-size:22px;font-weight:900;color:#111;letter-spacing:-0.5px;line-height:1.3;">${opts.showcaseTitle}</p>
        <p style="margin:0 0 28px;font-size:15px;color:#374151;line-height:1.7;">
          <strong>${opts.organizerName}</strong>님이 위 쇼케이스의 승인을 요청했습니다.<br>
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
    try {
        const { approvals, showcaseTitle, organizerName } = await request.json() as {
            approvals: { email: string; token: string }[];
            showcaseTitle: string;
            organizerName: string;
        };

        if (!approvals?.length || !showcaseTitle) {
            return NextResponse.json({ error: "필수 항목 누락" }, { status: 400 });
        }

        const resend = new Resend(process.env.RESEND_API_KEY);
        let ok = 0;
        let fail = 0;

        for (const { email, token } of approvals) {
            const approveUrl = `${SITE_URL}/jakka/showcase/approve/${token}`;
            const { error } = await resend.emails.send({
                from: `JAKKA <${FROM_EMAIL}>`,
                to: email,
                subject: `[JAKKA] 쇼케이스 승인 요청 — ${showcaseTitle}`,
                html: renderApprovalHtml({ showcaseTitle, organizerName, approveUrl }),
            });
            if (error) { console.error("showcase approval email error:", email, error); fail++; }
            else ok++;
        }

        return NextResponse.json({ ok, fail });
    } catch (err) {
        console.error("[jakka/showcase] error:", err);
        return NextResponse.json({ error: "서버 오류" }, { status: 500 });
    }
}
