import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://tenone.biz";
const FROM_EMAIL = process.env.NEWSLETTER_FROM_EMAIL || "noreply@tenone.biz";

const BRAND_CONFIG = {
    madleague: {
        label: "MAD League",
        color: "#7c3aed",
        signupPath: "/madleague/join",
        fromName: "MAD League",
    },
    madleap: {
        label: "MADLeap",
        color: "#4338ca",
        signupPath: "/madleap/join",
        fromName: "MADLeap",
    },
} as const;

type Brand = keyof typeof BRAND_CONFIG;

function getAdminClient() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
}

function renderInviteHtml(opts: {
    brand: Brand;
    message: string;
    inviteUrl: string;
}) {
    const cfg = BRAND_CONFIG[opts.brand];
    return `<!DOCTYPE html>
<html lang="ko">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:40px 0;">
  <tr><td align="center">
    <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;">
      <tr><td style="background:${cfg.color};padding:32px 40px;">
        <p style="margin:0;color:#fff;font-size:22px;font-weight:700;letter-spacing:-0.5px;">${cfg.label}</p>
      </td></tr>
      <tr><td style="padding:36px 40px;">
        <p style="margin:0 0 20px;font-size:15px;color:#374151;line-height:1.7;">${opts.message}</p>
        <p style="margin:24px 0;">
          <a href="${opts.inviteUrl}" style="display:inline-block;background:${cfg.color};color:#fff;padding:13px 28px;border-radius:8px;text-decoration:none;font-size:15px;font-weight:600;">
            가입하기
          </a>
        </p>
        <p style="margin:24px 0 0;font-size:12px;color:#9ca3af;">
          이 링크는 7일간 유효합니다.<br>
          본인이 요청하지 않은 경우 이 메일을 무시해 주세요.
        </p>
      </td></tr>
      <tr><td style="padding:20px 40px;border-top:1px solid #f3f4f6;">
        <p style="margin:0;font-size:11px;color:#9ca3af;">© 2026 Ten:One Universe · tenone.biz</p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`;
}

export async function POST(request: NextRequest) {
    try {
        const { emails, brand, message } = await request.json() as {
            emails: string[];
            brand: Brand;
            message?: string;
        };

        if (!emails?.length || !brand || !BRAND_CONFIG[brand]) {
            return NextResponse.json({ error: "이메일 또는 브랜드가 없습니다." }, { status: 400 });
        }

        const supabase = getAdminClient();
        const resend = new Resend(process.env.RESEND_API_KEY);
        const cfg = BRAND_CONFIG[brand];
        const inviteMessage = message || `${cfg.label} OB 커뮤니티에 초대합니다.`;

        let ok = 0;
        let fail = 0;

        for (const email of emails) {
            // DB에 초대 레코드 upsert
            const { data: invite, error: dbErr } = await supabase
                .from("member_invites")
                .upsert(
                    {
                        email,
                        brand,
                        message: inviteMessage,
                        status: "pending",
                        invited_at: new Date().toISOString(),
                        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                    },
                    { onConflict: "email", ignoreDuplicates: false }
                )
                .select("invite_token")
                .single();

            if (dbErr || !invite) { fail++; continue; }

            const inviteUrl = `${SITE_URL}${cfg.signupPath}?token=${invite.invite_token}`;

            // 이메일 발송
            const { error: mailErr } = await resend.emails.send({
                from: `${cfg.fromName} <${FROM_EMAIL}>`,
                to: email,
                subject: `[${cfg.label}] 커뮤니티 초대장이 도착했습니다`,
                html: renderInviteHtml({ brand, message: inviteMessage, inviteUrl }),
            });

            if (mailErr) { fail++; } else { ok++; }
        }

        return NextResponse.json({ ok, fail });
    } catch (err) {
        console.error("[invite] error:", err);
        return NextResponse.json({ error: "서버 오류" }, { status: 500 });
    }
}
