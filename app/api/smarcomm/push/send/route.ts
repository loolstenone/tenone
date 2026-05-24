import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { sendPushToSubscribers } from '@/lib/smarcomm/push';

// POST /api/smarcomm/push/send
// body: { title, body, url?, segment_member_ids? }
// segment_member_ids 없으면 전체 구독자에게 발송
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: '인증 필요' }, { status: 401 });

    // 발송 권한 — staff/manager/super_admin만 허용
    const admin = createAdminClient();
    const { data: roleRow } = await admin
      .from('member_roles')
      .select('role')
      .eq('member_id', (await admin.from('members').select('id').eq('auth_id', user.id).maybeSingle()).data?.id ?? '')
      .in('role', ['staff', 'manager', 'super_admin'])
      .eq('is_active', true)
      .maybeSingle();
    if (!roleRow) return NextResponse.json({ error: '발송 권한이 없습니다' }, { status: 403 });

    const body = await request.json();
    const { title, body: msgBody, url, segment_member_ids } = body;

    if (!title || !msgBody) {
      return NextResponse.json({ error: 'title, body 필수' }, { status: 400 });
    }

    let memberIds: string[] = segment_member_ids ?? [];

    if (!memberIds.length) {
      // 전체 구독자
      const { data: subs } = await admin
        .from('smarcomm_push_subscriptions')
        .select('member_id');
      memberIds = [...new Set((subs ?? []).map((s: { member_id: string }) => s.member_id))];
    }

    if (!memberIds.length) {
      return NextResponse.json({ sent: 0, message: '구독자 없음' });
    }

    const sent = await sendPushToSubscribers({ memberIds, title, body: msgBody, url });
    return NextResponse.json({ sent });
  } catch (e) {
    console.error('push send error', e);
    return NextResponse.json({ error: '발송 실패' }, { status: 500 });
  }
}
