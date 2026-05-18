/**
 * MoNTZ 캐스팅 컨택 API
 * POST /api/montz/contact
 *
 * 캐스팅 디렉터(또는 임의 방문자)가 모델·배우에게 컨택 제안을 보낸다.
 * 비로그인도 가능 (sender_email 필수). 서버에서 RLS 우회 + Resend 이메일 발송.
 */
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

interface ContactBody {
    targetCreatorId: string;
    senderName: string;
    senderEmail: string;
    senderCompany?: string;
    roleTitle?: string;
    message: string;
}

function buildContactEmailHtml({
    creatorName, senderName, senderEmail, senderCompany, roleTitle, message,
}: {
    creatorName: string;
    senderName: string;
    senderEmail: string;
    senderCompany: string | null;
    roleTitle: string | null;
    message: string;
}): string {
    const metaBlock = [
        senderCompany ? `<strong>${senderCompany}</strong>` : null,
        roleTitle ? `· ${roleTitle}` : null,
    ].filter(Boolean).join(" ");
    return `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="margin:0;padding:0;background:#f9f9f9;font-family:sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:40px 16px;">
<table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;">
<tr><td style="background:#c8a97e;padding:32px 40px;">
  <p style="margin:0;font-size:13px;color:#3a2a1a;letter-spacing:2px;">MONTZ CASTING</p>
  <h1 style="margin:8px 0 0;font-size:24px;color:#1a1a1a;font-weight:700;">캐스팅 제안이 도착했습니다</h1>
</td></tr>
<tr><td style="padding:32px 40px;">
  <p style="margin:0 0 12px;font-size:16px;color:#111;">${creatorName}님, 안녕하세요!</p>
  <p style="margin:0 0 16px;font-size:14px;color:#555;line-height:1.7;">아래와 같은 캐스팅 제안을 받았습니다.</p>
  <table cellpadding="0" cellspacing="0" style="margin:0 0 16px;width:100%;background:#fafafa;border-radius:8px;">
    <tr><td style="padding:14px 18px;">
      <p style="margin:0;font-size:13px;color:#888;">${metaBlock || "캐스팅 디렉터"}</p>
      <p style="margin:4px 0 0;font-size:15px;color:#111;font-weight:600;">${senderName}</p>
      <p style="margin:2px 0 0;font-size:13px;color:#666;">${senderEmail}</p>
    </td></tr>
  </table>
  <p style="margin:0 0 8px;font-size:13px;color:#888;font-weight:600;">메시지</p>
  <p style="margin:0 0 24px;padding:14px 18px;background:#fafafa;border-radius:8px;font-size:14px;color:#333;line-height:1.7;white-space:pre-wrap;">${message}</p>
  <table cellpadding="0" cellspacing="0">
    <tr><td style="background:#111;border-radius:8px;">
      <a href="https://montz.tenone.biz/my" style="display:block;padding:14px 28px;font-size:15px;font-weight:600;color:#fff;text-decoration:none;">받은 제안 보기 →</a>
    </td></tr>
  </table>
  <p style="margin:20px 0 0;font-size:13px;color:#888;line-height:1.7;">
    답장은 ${senderEmail} 로 직접 보내시거나, MoNTZ 마이페이지에서 상태를 변경하실 수 있습니다.
  </p>
</td></tr>
<tr><td style="padding:20px 40px;border-top:1px solid #f0f0f0;">
  <p style="margin:0;font-size:12px;color:#aaa;">MoNTZ · Ten:One™ Universe · noreply@tenone.biz</p>
</td></tr>
</table></td></tr></table>
</body></html>`;
}

export async function POST(req: NextRequest) {
    let body: ContactBody;
    try { body = await req.json(); } catch { return NextResponse.json({ error: "invalid json" }, { status: 400 }); }

    const { targetCreatorId, senderName, senderEmail, senderCompany, roleTitle, message } = body;
    if (!targetCreatorId || !senderName || !senderEmail || !message) {
        return NextResponse.json({ error: "필수 필드 누락" }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(senderEmail)) {
        return NextResponse.json({ error: "올바른 이메일이 아닙니다" }, { status: 400 });
    }

    const supabase = createAdminClient();

    // 1) target creator 조회 (display_name + user_id 필요)
    const { data: creator, error: cErr } = await supabase
        .from("montz_creators")
        .select("id, user_id, display_name, handle")
        .eq("id", targetCreatorId)
        .single();
    if (cErr || !creator) return NextResponse.json({ error: "creator not found" }, { status: 404 });

    // 2) sender user_id (현재 로그인 사용자가 있으면)
    const authHeader = req.headers.get("authorization");
    let senderUserId: string | null = null;
    if (authHeader?.startsWith("Bearer ")) {
        const token = authHeader.slice(7);
        const { data: userData } = await supabase.auth.getUser(token);
        senderUserId = userData.user?.id ?? null;
    }

    // 3) INSERT contact_requests
    const { data: inserted, error: insErr } = await supabase
        .from("montz_contact_requests")
        .insert({
            target_creator_id: targetCreatorId,
            sender_user_id: senderUserId,
            sender_name: senderName.trim(),
            sender_email: senderEmail.trim(),
            sender_company: senderCompany?.trim() || null,
            role_title: roleTitle?.trim() || null,
            message: message.trim(),
            status: "pending",
        })
        .select("id")
        .single();
    if (insErr || !inserted) {
        return NextResponse.json({ error: insErr?.message ?? "insert failed" }, { status: 500 });
    }

    // 4) 모델 user_id → auth.users.email 조회 + Resend 발송
    if (creator.user_id) {
        const { data: userData } = await supabase.auth.admin.getUserById(creator.user_id);
        const creatorEmail = userData?.user?.email;
        if (creatorEmail) {
            await resend.emails.send({
                from: "MoNTZ <noreply@tenone.biz>",
                to: creatorEmail,
                replyTo: senderEmail,
                subject: `[MoNTZ] ${senderName}님의 캐스팅 제안이 도착했습니다`,
                html: buildContactEmailHtml({
                    creatorName: creator.display_name || creator.handle,
                    senderName,
                    senderEmail,
                    senderCompany: senderCompany?.trim() || null,
                    roleTitle: roleTitle?.trim() || null,
                    message,
                }),
            }).catch(() => {/* 메일 실패 무시 — DB는 이미 INSERT됨 */});
        }
    }

    return NextResponse.json({ ok: true, id: inserted.id });
}
