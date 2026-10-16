import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { HANDLE_RE } from '@/lib/profile/public-profile';
import { BRAND_PROFILES } from '@/lib/profile/brand-profiles';

/**
 * POST /api/profile/view — 공개 프로필 방문 1회 집계 { handle, scope? } (scope = 'universe' 또는 브랜드 slug)
 *
 * 하루 단위 숫자만 올린다 (누가 봤는지는 남기지 않는다 — 데이터 계약 4).
 * 같은 브라우저는 하루 한 번만 센다 (쿠키). 공개 프로필만 센다 — 공유 링크·비공개는 세지 않는다.
 * 집계 함수 record_profile_view는 service_role 전용 (sql/profile-p1-core.sql).
 */
export async function POST(request: NextRequest) {
    const body = await request.json().catch(() => ({})) as { handle?: unknown; scope?: unknown };
    const handle = typeof body.handle === 'string' ? body.handle.toLowerCase() : '';
    const scope = typeof body.scope === 'string' && BRAND_PROFILES[body.scope] ? body.scope : 'universe';
    if (!HANDLE_RE.test(handle)) return NextResponse.json({ ok: false }, { status: 400 });

    const cookieName = `pv_${scope}_${handle}`;
    if (request.cookies.get(cookieName)) return NextResponse.json({ ok: true, counted: false });

    const admin = createAdminClient();
    const { data } = scope === 'universe'
        ? await admin.rpc('get_public_profile', { p_handle: handle })
        : await admin.rpc('get_brand_profile', { p_handle: handle, p_brand: scope });
    const row = data as { id?: string; profile_visibility?: string } | null;
    if (!row?.id || row.profile_visibility !== 'public') return NextResponse.json({ ok: true, counted: false });

    await admin.rpc('record_profile_view', { p_member_id: row.id, p_scope: scope });

    const res = NextResponse.json({ ok: true, counted: true });
    res.cookies.set(cookieName, '1', { maxAge: 60 * 60 * 24, httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/' });
    return res;
}
