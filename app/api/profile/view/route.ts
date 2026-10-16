import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { HANDLE_RE } from '@/lib/profile/public-profile';

/**
 * POST /api/profile/view — 공개 프로필 방문 1회 집계 { handle }
 *
 * 하루 단위 숫자만 올린다 (누가 봤는지는 남기지 않는다 — 데이터 계약 4).
 * 같은 브라우저는 하루 한 번만 센다 (쿠키). 공개 프로필만 센다 — 공유 링크·비공개는 세지 않는다.
 * 집계 함수 record_profile_view는 service_role 전용 (sql/profile-p1-core.sql).
 */
export async function POST(request: NextRequest) {
    const body = await request.json().catch(() => ({})) as { handle?: unknown };
    const handle = typeof body.handle === 'string' ? body.handle.toLowerCase() : '';
    if (!HANDLE_RE.test(handle)) return NextResponse.json({ ok: false }, { status: 400 });

    const cookieName = `pv_${handle}`;
    if (request.cookies.get(cookieName)) return NextResponse.json({ ok: true, counted: false });

    const admin = createAdminClient();
    const { data } = await admin.rpc('get_public_profile', { p_handle: handle });
    const row = data as { id?: string; profile_visibility?: string } | null;
    if (!row?.id || row.profile_visibility !== 'public') return NextResponse.json({ ok: true, counted: false });

    await admin.rpc('record_profile_view', { p_member_id: row.id, p_scope: 'universe' });

    const res = NextResponse.json({ ok: true, counted: true });
    res.cookies.set(cookieName, '1', { maxAge: 60 * 60 * 24, httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/' });
    return res;
}
