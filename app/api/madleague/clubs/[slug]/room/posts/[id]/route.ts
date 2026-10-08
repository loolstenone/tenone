/**
 * 동아리 방 글 관리
 *   PATCH  { pinned }  — 상단 고정/해제 (운영진·관리자)
 *   DELETE             — 삭제 (운영진·관리자 · 작성자 본인) — 댓글·좋아요도 함께 정리
 * 권한 확인 후 service_role (mad_posts RLS는 본인 글만 수정·삭제 허용이라 운영진 관리는 서버에서)
 */
import { NextRequest, NextResponse } from 'next/server';
import { requireMember } from '@/lib/api-guard';
import { createAdminClient } from '@/lib/supabase/admin';
import { getMadAccess } from '@/lib/madleague-roles';
import { clubRoomAccess } from '@/lib/madleague-club-cafe';

export const runtime = 'nodejs';
type Params = { params: Promise<{ slug: string; id: string }> };

async function context(req: NextRequest, slug: string, id: string) {
    const auth = await requireMember(req);
    if (auth instanceof NextResponse) return { error: auth };
    const admin = createAdminClient();
    const { data: club } = await admin.from('mad_clubs').select('id').eq('slug', slug).maybeSingle();
    if (!club) return { error: NextResponse.json({ error: 'CLUB_NOT_FOUND' }, { status: 404 }) };
    const { data: post } = await admin.from('mad_posts').select('id, author_id, club_id').eq('id', id).eq('club_id', club.id).maybeSingle();
    if (!post) return { error: NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 }) };
    const room = clubRoomAccess(await getMadAccess(auth.memberId), club.id);
    if (!room.canEnter) return { error: NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 }) };
    const { data: mad } = await admin.from('mad_members').select('id').eq('member_id', auth.memberId).maybeSingle();
    return { admin, post, room, isAuthor: !!mad && mad.id === post.author_id };
}

export async function PATCH(req: NextRequest, { params }: Params) {
    const { slug, id } = await params;
    const c = await context(req, slug, id);
    if ('error' in c) return c.error;
    if (!c.room.isOfficer) return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
    const body = await req.json().catch(() => ({})) as { pinned?: unknown };
    if (typeof body.pinned !== 'boolean') return NextResponse.json({ error: 'INVALID' }, { status: 400 });
    const { error } = await c.admin.from('mad_posts').update({ is_pinned: body.pinned }).eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest, { params }: Params) {
    const { slug, id } = await params;
    const c = await context(req, slug, id);
    if ('error' in c) return c.error;
    if (!c.room.isOfficer && !c.isAuthor) return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
    await c.admin.from('mad_comments').delete().eq('post_id', id);
    await c.admin.from('mad_post_likes').delete().eq('post_id', id);
    const { error } = await c.admin.from('mad_posts').delete().eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
}
