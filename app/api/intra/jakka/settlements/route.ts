import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

function buildSettlementEmailHtml({ displayName, month, netAmount, status, note }: {
    displayName: string;
    month: string;
    netAmount: number;
    status: "confirmed" | "paid";
    note: string | null;
}): string {
    const isPaid = status === "paid";
    const accent = isPaid ? "#0a7d3b" : "#1f3b8d";
    const headline = isPaid ? `${month} 정산 지급 완료` : `${month} 정산 확정`;
    const body = isPaid
        ? `${month} 정산금 <strong>${netAmount.toLocaleString("ko-KR")}원</strong>이 입금되었습니다.<br>입금 내역을 확인해 주세요.`
        : `${month} 정산이 <strong>확정</strong>되었습니다.<br>정산금: <strong>${netAmount.toLocaleString("ko-KR")}원</strong> (수수료 15% 차감 후)<br>곧 등록하신 계좌로 송금됩니다.`;
    const noteBlock = note
        ? `<p style="margin:16px 0 0;padding:12px 16px;background:#f5f5f5;border-radius:6px;font-size:14px;color:#444;line-height:1.6;white-space:pre-wrap;">${note}</p>`
        : "";
    return `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="margin:0;padding:0;background:#f9f9f9;font-family:sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:40px 16px;">
<table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;">
<tr><td style="background:${accent};padding:32px 40px;">
  <p style="margin:0;font-size:13px;color:#cfd;letter-spacing:2px;">JAKKA SETTLEMENT</p>
  <h1 style="margin:8px 0 0;font-size:24px;color:#fff;font-weight:700;">${headline}</h1>
</td></tr>
<tr><td style="padding:32px 40px;">
  <p style="margin:0 0 16px;font-size:16px;color:#111;">${displayName}님, 안녕하세요!</p>
  <p style="margin:0 0 16px;font-size:15px;color:#333;line-height:1.7;">${body}</p>
  ${noteBlock}
  <table cellpadding="0" cellspacing="0" style="margin:28px 0 0;">
    <tr><td style="background:#111;border-radius:8px;">
      <a href="https://jakka.tenone.biz/seller" style="display:block;padding:14px 28px;font-size:15px;font-weight:600;color:#fff;text-decoration:none;">판매자 대시보드 →</a>
    </td></tr>
  </table>
</td></tr>
<tr><td style="padding:20px 40px;border-top:1px solid #f0f0f0;">
  <p style="margin:0;font-size:12px;color:#aaa;">Jakka Market · Ten:One™ Universe · noreply@tenone.biz</p>
</td></tr>
</table></td></tr></table>
</body></html>`;
}

// GET /api/intra/jakka/settlements?month=YYYY-MM&creator_id=...&status=...
export async function GET(req: NextRequest) {
    const supabaseAdmin = createAdminClient();
    const { searchParams } = req.nextUrl;
    const month = searchParams.get("month");
    const creatorId = searchParams.get("creator_id");
    const status = searchParams.get("status");

    let query = supabaseAdmin
        .from("jakka_settlements")
        .select(`
            *,
            creator:jakka_creators(id, handle, display_name, email)
        `)
        .order("month", { ascending: false })
        .order("net_amount", { ascending: false });

    if (month) query = query.eq("month", month);
    if (creatorId) query = query.eq("creator_id", creatorId);
    if (status) query = query.eq("status", status);

    const { data, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ settlements: data ?? [] });
}

// POST /api/intra/jakka/settlements — { month: 'YYYY-MM' }
// completed 주문 기반으로 작가별 정산 레코드 생성(draft)
export async function POST(req: NextRequest) {
    const supabaseAdmin = createAdminClient();
    const body = await req.json();
    const { month } = body as { month: string };

    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
        return NextResponse.json({ error: "month required (YYYY-MM)" }, { status: 400 });
    }

    const [year, mon] = month.split("-").map(Number);
    const start = new Date(year, mon - 1, 1).toISOString();
    const end = new Date(year, mon, 1).toISOString();

    // 해당 월 completed 주문 조회
    const { data: orders, error: ordErr } = await supabaseAdmin
        .from("jakka_orders")
        .select("id, creator_id, total_price")
        .eq("status", "completed")
        .gte("updated_at", start)
        .lt("updated_at", end);

    if (ordErr) return NextResponse.json({ error: ordErr.message }, { status: 500 });
    if (!orders || orders.length === 0) {
        return NextResponse.json({ message: "해당 월 completed 주문 없음", created: 0 });
    }

    // 작가별 집계
    const byCreator = new Map<string, { orderIds: string[]; gross: number }>();
    for (const o of orders) {
        const entry = byCreator.get(o.creator_id) ?? { orderIds: [], gross: 0 };
        entry.orderIds.push(o.id);
        entry.gross += o.total_price ?? 0;
        byCreator.set(o.creator_id, entry);
    }

    // 작가 계좌 정보 — applications(계좌) + creators(수수료율) 병합
    const creatorIds = Array.from(byCreator.keys());
    const [{ data: apps }, { data: creators }] = await Promise.all([
        supabaseAdmin
            .from("jakka_seller_applications")
            .select("creator_id, bank_name, bank_account_number, bank_account_holder")
            .in("creator_id", creatorIds)
            .eq("status", "approved"),
        supabaseAdmin
            .from("jakka_creators")
            .select("id, seller_commission_rate")
            .in("id", creatorIds),
    ]);

    const appMap = new Map(apps?.map(a => [a.creator_id, a]) ?? []);
    const creatorMap = new Map(creators?.map(c => [c.id, c]) ?? []);

    let created = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const [creatorId, { orderIds, gross }] of byCreator) {
        const app = appMap.get(creatorId);
        const creator = creatorMap.get(creatorId);
        const commissionRate = creator?.seller_commission_rate ?? 15;
        const commissionAmount = Math.round(gross * commissionRate / 100);
        const netAmount = gross - commissionAmount;

        const { error: upsertErr } = await supabaseAdmin
            .from("jakka_settlements")
            .upsert({
                creator_id: creatorId,
                month,
                order_ids: orderIds,
                order_count: orderIds.length,
                gross_amount: gross,
                commission_rate: commissionRate,
                commission_amount: commissionAmount,
                net_amount: netAmount,
                bank_name: app?.bank_name ?? null,
                bank_account_number: app?.bank_account_number ?? null,
                bank_account_holder: app?.bank_account_holder ?? null,
                status: "draft",
                updated_at: new Date().toISOString(),
            }, { onConflict: "creator_id,month", ignoreDuplicates: true });

        if (upsertErr) {
            errors.push(`${creatorId}: ${upsertErr.message}`);
        } else {
            created++;
        }
    }

    return NextResponse.json({
        month,
        total_orders: orders.length,
        creators: byCreator.size,
        created,
        skipped,
        errors: errors.length ? errors : undefined,
    });
}

// PATCH /api/intra/jakka/settlements — { id, status, note? }
export async function PATCH(req: NextRequest) {
    const supabaseAdmin = createAdminClient();
    const body = await req.json();
    const { id, status, note } = body as { id: string; status: string; note?: string };

    if (!id || !status) {
        return NextResponse.json({ error: "id, status required" }, { status: 400 });
    }
    if (!["draft", "confirmed", "paid"].includes(status)) {
        return NextResponse.json({ error: "status must be draft|confirmed|paid" }, { status: 400 });
    }

    const patch: Record<string, unknown> = {
        status,
        updated_at: new Date().toISOString(),
    };
    if (note !== undefined) patch.note = note;
    if (status === "confirmed") patch.confirmed_at = new Date().toISOString();
    if (status === "paid") patch.paid_at = new Date().toISOString();

    const { data: updated, error } = await supabaseAdmin
        .from("jakka_settlements")
        .update(patch)
        .eq("id", id)
        .select("month, net_amount, creator:jakka_creators(display_name, email, handle)")
        .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // confirmed / paid 전환 시 작가에게 이메일 알림 (실패해도 응답 영향 없음)
    if ((status === "confirmed" || status === "paid") && updated) {
        const creatorRaw = Array.isArray(updated.creator) ? updated.creator[0] : updated.creator;
        const creator = creatorRaw as { display_name: string; email: string; handle: string } | null;
        if (creator?.email) {
            await resend.emails.send({
                from: "Jakka <noreply@tenone.biz>",
                to: creator.email,
                subject: status === "paid"
                    ? `[Jakka] ${updated.month} 정산금 입금 완료`
                    : `[Jakka] ${updated.month} 정산 확정 안내`,
                html: buildSettlementEmailHtml({
                    displayName: creator.display_name || creator.handle,
                    month: updated.month,
                    netAmount: updated.net_amount,
                    status,
                    note: note ?? null,
                }),
            }).catch(() => {/* 이메일 실패 무시 */});
        }
    }

    return NextResponse.json({ ok: true });
}
