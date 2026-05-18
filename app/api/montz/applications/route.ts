/**
 * MoNTZ 오디션 응시 API
 * POST /api/montz/applications
 *
 * 모델·배우(인증 필요)가 오디션 공고에 응시 → DB INSERT + 캐스팅 디렉터 이메일 알림
 */
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

interface ApplyBody {
    auditionId: string;
    message?: string;
    applicantEmail?: string;
}

function buildApplicationEmailHtml({
    audition, applicantName, applicantHandle, applicantEmail, message,
}: {
    audition: { company: string; role: string };
    applicantName: string;
    applicantHandle: string;
    applicantEmail: string | null;
    message: string | null;
}): string {
    return `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="margin:0;padding:0;background:#f9f9f9;font-family:sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:40px 16px;">
<table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;">
<tr><td style="background:#1a1a1a;padding:32px 40px;">
  <p style="margin:0;font-size:13px;color:#c8a97e;letter-spacing:2px;">MONTZ AUDITION</p>
  <h1 style="margin:8px 0 0;font-size:24px;color:#fff;font-weight:700;">새 응시자가 도착했습니다</h1>
</td></tr>
<tr><td style="padding:32px 40px;">
  <p style="margin:0 0 8px;font-size:13px;color:#888;">공고</p>
  <p style="margin:0 0 18px;font-size:16px;color:#111;font-weight:600;">${audition.company} · ${audition.role}</p>
  <table cellpadding="0" cellspacing="0" style="margin:0 0 16px;width:100%;background:#fafafa;border-radius:8px;">
    <tr><td style="padding:14px 18px;">
      <p style="margin:0;font-size:13px;color:#888;">응시자</p>
      <p style="margin:4px 0 0;font-size:15px;color:#111;font-weight:600;">${applicantName} · @${applicantHandle}</p>
      ${applicantEmail ? `<p style="margin:2px 0 0;font-size:13px;color:#666;">${applicantEmail}</p>` : ""}
    </td></tr>
  </table>
  ${message ? `<p style="margin:0 0 8px;font-size:13px;color:#888;font-weight:600;">자기소개·메시지</p>
  <p style="margin:0 0 24px;padding:14px 18px;background:#fafafa;border-radius:8px;font-size:14px;color:#333;line-height:1.7;white-space:pre-wrap;">${message}</p>` : ""}
  <table cellpadding="0" cellspacing="0">
    <tr><td style="background:#c8a97e;border-radius:8px;">
      <a href="https://montz.tenone.biz/${applicantHandle}" style="display:block;padding:14px 28px;font-size:15px;font-weight:600;color:#1a1a1a;text-decoration:none;">응시자 포트폴리오 보기 →</a>
    </td></tr>
  </table>
</td></tr>
<tr><td style="padding:20px 40px;border-top:1px solid #f0f0f0;">
  <p style="margin:0;font-size:12px;color:#aaa;">MoNTZ · Ten:One™ Universe · noreply@tenone.biz</p>
</td></tr>
</table></td></tr></table>
</body></html>`;
}

export async function POST(req: NextRequest) {
    let body: ApplyBody;
    try { body = await req.json(); } catch { return NextResponse.json({ error: "invalid json" }, { status: 400 }); }

    const { auditionId, message, applicantEmail } = body;
    if (!auditionId) return NextResponse.json({ error: "auditionId 필수" }, { status: 400 });

    // 인증 헤더 — 응시자는 로그인 필요
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
        return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 });
    }

    const supabase = createAdminClient();
    const token = authHeader.slice(7);
    const { data: userData, error: authErr } = await supabase.auth.getUser(token);
    if (authErr || !userData.user) {
        return NextResponse.json({ error: "유효하지 않은 인증" }, { status: 401 });
    }

    // 1) 본인 montz_creators
    const { data: creator } = await supabase
        .from("montz_creators")
        .select("id, handle, display_name")
        .eq("user_id", userData.user.id)
        .single();
    if (!creator) {
        return NextResponse.json({ error: "MoNTZ 크리에이터 프로필이 필요합니다" }, { status: 400 });
    }

    // 2) audition 조회
    const { data: audition, error: aErr } = await supabase
        .from("montz_auditions")
        .select("id, company, role, contact_email, is_active")
        .eq("id", auditionId)
        .single();
    if (aErr || !audition) return NextResponse.json({ error: "공고를 찾을 수 없습니다" }, { status: 404 });
    if (!audition.is_active) return NextResponse.json({ error: "마감된 공고입니다" }, { status: 400 });

    // 3) INSERT
    const finalEmail = applicantEmail ?? userData.user.email ?? null;
    const { data: inserted, error: insErr } = await supabase
        .from("montz_audition_applications")
        .insert({
            audition_id: auditionId,
            creator_id: creator.id,
            message: message?.trim() || null,
            applicant_email: finalEmail,
            status: "pending",
        })
        .select("id")
        .single();
    if (insErr) {
        if (insErr.code === "23505") {
            return NextResponse.json({ error: "이미 응시하신 공고입니다" }, { status: 409 });
        }
        return NextResponse.json({ error: insErr.message }, { status: 500 });
    }

    // 4) 캐스팅 디렉터에게 이메일
    if (audition.contact_email) {
        await resend.emails.send({
            from: "MoNTZ <noreply@tenone.biz>",
            to: audition.contact_email,
            replyTo: finalEmail ?? undefined,
            subject: `[MoNTZ] ${audition.company} ${audition.role} 새 응시자: ${creator.display_name}`,
            html: buildApplicationEmailHtml({
                audition: { company: audition.company, role: audition.role },
                applicantName: creator.display_name,
                applicantHandle: creator.handle,
                applicantEmail: finalEmail,
                message: message?.trim() || null,
            }),
        }).catch(() => {/* 메일 실패 무시 */});
    }

    return NextResponse.json({ ok: true, id: inserted?.id });
}
