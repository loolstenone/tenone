import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

function getAdmin() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { persistSession: false } },
    );
}

const resend = new Resend(process.env.RESEND_API_KEY);

// GET /api/intra/jakka/sellers?status=pending
export async function GET(req: NextRequest) {
    const supabaseAdmin = getAdmin();
    const status = req.nextUrl.searchParams.get("status") ?? "pending";
    const { data, error } = await supabaseAdmin
        .from("jakka_seller_applications")
        .select("*, creator:jakka_creators(id, handle, display_name, user_id, email, seller_status)")
        .eq("status", status)
        .order("created_at", { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ applications: data ?? [] });
}

function buildReviewEmailHtml({ displayName, isApprove, note }: {
    displayName: string;
    isApprove: boolean;
    note: string | null;
}): string {
    const accentColor = isApprove ? "#111111" : "#555555";
    const noteBlock = note
        ? `<p style="margin:16px 0 0;padding:12px 16px;background:#f5f5f5;border-radius:6px;font-size:14px;color:#444;line-height:1.6;white-space:pre-wrap;">${note}</p>`
        : "";

    if (isApprove) {
        return `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="margin:0;padding:0;background:#f9f9f9;font-family:sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:40px 16px;">
<table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;">
<tr><td style="background:${accentColor};padding:32px 40px;">
  <p style="margin:0;font-size:13px;color:#aaa;letter-spacing:2px;">JAKKA MARKET</p>
  <h1 style="margin:8px 0 0;font-size:24px;color:#fff;font-weight:700;">판매자 신청 승인</h1>
</td></tr>
<tr><td style="padding:32px 40px;">
  <p style="margin:0 0 16px;font-size:16px;color:#111;">${displayName}님, 안녕하세요!</p>
  <p style="margin:0 0 16px;font-size:15px;color:#333;line-height:1.7;">
    Jakka 마켓 판매자 신청이 <strong>승인</strong>되었습니다. 🎉<br>
    이제 상품을 등록하고 판매를 시작할 수 있습니다.
  </p>
  ${noteBlock}
  <table cellpadding="0" cellspacing="0" style="margin:28px 0 0;">
    <tr><td style="background:#111;border-radius:8px;">
      <a href="https://jakka.tenone.biz/market/seller" style="display:block;padding:14px 28px;font-size:15px;font-weight:600;color:#fff;text-decoration:none;">판매자 대시보드 바로가기 →</a>
    </td></tr>
  </table>
</td></tr>
<tr><td style="padding:20px 40px;border-top:1px solid #f0f0f0;">
  <p style="margin:0;font-size:12px;color:#aaa;">Jakka Market · Ten:One™ Universe · noreply@tenone.biz</p>
</td></tr>
</table></td></tr></table>
</body></html>`;
    }

    return `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="margin:0;padding:0;background:#f9f9f9;font-family:sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:40px 16px;">
<table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;">
<tr><td style="background:${accentColor};padding:32px 40px;">
  <p style="margin:0;font-size:13px;color:#ccc;letter-spacing:2px;">JAKKA MARKET</p>
  <h1 style="margin:8px 0 0;font-size:24px;color:#fff;font-weight:700;">판매자 신청 검토 결과</h1>
</td></tr>
<tr><td style="padding:32px 40px;">
  <p style="margin:0 0 16px;font-size:16px;color:#111;">${displayName}님, 안녕하세요!</p>
  <p style="margin:0 0 16px;font-size:15px;color:#333;line-height:1.7;">
    Jakka 마켓 판매자 신청을 꼼꼼히 검토하였으나,<br>
    이번에는 승인이 어렵게 되었습니다.
  </p>
  ${noteBlock}
  <p style="margin:20px 0 0;font-size:14px;color:#666;line-height:1.7;">
    궁금한 점이 있으시면 <a href="mailto:lools@tenone.biz" style="color:#111;">lools@tenone.biz</a>로 문의해 주세요.<br>
    앞으로도 Jakka를 이용해 주셔서 감사합니다.
  </p>
</td></tr>
<tr><td style="padding:20px 40px;border-top:1px solid #f0f0f0;">
  <p style="margin:0;font-size:12px;color:#aaa;">Jakka Market · Ten:One™ Universe · noreply@tenone.biz</p>
</td></tr>
</table></td></tr></table>
</body></html>`;
}

// POST /api/intra/jakka/sellers — { applicationId, action: 'approve'|'reject', note?, reviewerId }
export async function POST(req: NextRequest) {
    const supabaseAdmin = getAdmin();
    const body = await req.json();
    const { applicationId, action, note, reviewerId } = body as {
        applicationId: string;
        action: "approve" | "reject";
        note?: string;
        reviewerId: string;
    };

    if (!applicationId || !action || !reviewerId) {
        return NextResponse.json({ error: "applicationId, action, reviewerId required" }, { status: 400 });
    }

    const { data: app, error: fetchErr } = await supabaseAdmin
        .from("jakka_seller_applications")
        .select("id, creator_id, status, creator:jakka_creators(email, display_name, handle)")
        .eq("id", applicationId)
        .single();
    if (fetchErr || !app) return NextResponse.json({ error: "application not found" }, { status: 404 });
    if (app.status !== "pending") return NextResponse.json({ error: "already reviewed" }, { status: 400 });

    const newAppStatus = action === "approve" ? "approved" : "rejected";
    const newCreatorStatus = action === "approve" ? "approved" : "rejected";

    const { error: updErr } = await supabaseAdmin
        .from("jakka_seller_applications")
        .update({
            status: newAppStatus,
            reviewer_id: reviewerId,
            reviewer_note: note ?? null,
            reviewed_at: new Date().toISOString(),
        })
        .eq("id", applicationId);
    if (updErr) return NextResponse.json({ error: updErr.message }, { status: 500 });

    const updatePayload: Record<string, unknown> = { seller_status: newCreatorStatus };
    if (action === "approve") updatePayload.seller_approved_at = new Date().toISOString();

    const { error: creatorErr } = await supabaseAdmin
        .from("jakka_creators")
        .update(updatePayload)
        .eq("id", app.creator_id);
    if (creatorErr) return NextResponse.json({ error: creatorErr.message }, { status: 500 });

    // 이메일 알림 (실패해도 응답에 영향 없음)
    const creatorRaw = Array.isArray(app.creator) ? app.creator[0] : app.creator;
    const creator = creatorRaw as { email: string; display_name: string; handle: string } | null;
    if (creator?.email) {
        const isApprove = action === "approve";
        await resend.emails.send({
            from: "Jakka <noreply@tenone.biz>",
            to: creator.email,
            subject: isApprove
                ? "[Jakka] 판매자 신청이 승인되었습니다 🎉"
                : "[Jakka] 판매자 신청 검토 결과 안내",
            html: buildReviewEmailHtml({
                displayName: creator.display_name || creator.handle,
                isApprove,
                note: note ?? null,
            }),
        }).catch(() => {/* 이메일 실패 무시 */});
    }

    return NextResponse.json({ ok: true, status: newAppStatus });
}
