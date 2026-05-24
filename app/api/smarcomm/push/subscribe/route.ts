import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';

// POST /api/smarcomm/push/subscribe — 구독 저장
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: '인증 필요' }, { status: 401 });

    const body = await request.json();
    const { endpoint, keys } = body;
    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return NextResponse.json({ error: '구독 정보가 올바르지 않습니다' }, { status: 400 });
    }

    const admin = createAdminClient();
    const { data: member } = await admin
      .from('members')
      .select('id')
      .eq('auth_id', user.id)
      .maybeSingle();
    if (!member) return NextResponse.json({ error: '멤버 정보 없음' }, { status: 404 });

    const userAgent = request.headers.get('user-agent') ?? undefined;

    const { error } = await admin.from('smarcomm_push_subscriptions').upsert(
      {
        member_id: member.id,
        endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth,
        user_agent: userAgent,
      },
      { onConflict: 'endpoint' }
    );

    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('push subscribe error', e);
    return NextResponse.json({ error: '구독 저장 실패' }, { status: 500 });
  }
}

// DELETE /api/smarcomm/push/subscribe — 구독 해제
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: '인증 필요' }, { status: 401 });

    const { endpoint } = await request.json();
    if (!endpoint) return NextResponse.json({ error: 'endpoint 필요' }, { status: 400 });

    const admin = createAdminClient();
    await admin.from('smarcomm_push_subscriptions').delete().eq('endpoint', endpoint);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('push unsubscribe error', e);
    return NextResponse.json({ error: '구독 해제 실패' }, { status: 500 });
  }
}
