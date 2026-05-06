import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: Request) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() { return cookieStore.getAll(); },
                setAll() { /* read-only */ },
            },
            auth: { storageKey: 'tenone-auth' },
        }
    );
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const admin = createAdminClient();

    // 1) auth_id 로 먼저 조회 (가장 정확)
    let { data: member } = await admin
        .from('members')
        .select('id')
        .eq('auth_id', user.id)
        .maybeSingle();

    // 2) 없으면 email 로 fallback — limit(1)으로 중복 row시 PGRST116 에러 방지
    if (!member && user.email) {
        const { data: rows } = await admin
            .from('members')
            .select('id')
            .eq('email', user.email)
            .limit(1);
        const byEmail = rows?.[0] ?? null;
        if (byEmail) {
            await admin.from('members').update({ auth_id: user.id }).eq('id', byEmail.id);
            member = byEmail;
        }
    }

    // 3) 그래도 없으면 자동 생성
    if (!member) {
        const userName = (user.user_metadata?.full_name as string | undefined)
            || (user.user_metadata?.name as string | undefined)
            || user.email?.split('@')[0]
            || '사용자';
        const handleBase = (user.email || userName).toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 12) || 'user';
        const handle = `${handleBase}${Math.floor(Math.random() * 10000)}`;
        const { data: newMember, error: insertErr } = await admin
            .from('members')
            .insert({
                auth_id: user.id,
                email: user.email || '',
                name: userName,
                handle,
                account_type: 'member',
                primary_type: 'member',
                roles: ['member'],
                avatar_initials: userName.substring(0, 2).toUpperCase(),
                avatar_url: (user.user_metadata?.avatar_url as string | undefined)
                    || (user.user_metadata?.picture as string | undefined)
                    || null,
                role: 'Member',
                origin_site: 'myverse.kr',
                intra_access: false,
                module_access: [],
                affiliations: [],
                onboarding_completed: false,
            })
            .select('id')
            .single();

        if (insertErr || !newMember) {
            // INSERT 실패 시 (email 유니크 충돌 등) 마지막으로 email 재조회
            if (user.email) {
                const { data: retryRows } = await admin
                    .from('members')
                    .select('id')
                    .eq('email', user.email)
                    .limit(1);
                const found = retryRows?.[0] ?? null;
                if (found) {
                    await admin.from('members').update({ auth_id: user.id }).eq('id', found.id);
                    member = found;
                }
            }
            if (!member) {
                console.error('onboarding members auto-create failed', insertErr);
                return NextResponse.json({ error: 'member_create_failed', message: insertErr?.message }, { status: 500 });
            }
        } else {
            await admin.from('member_roles').insert({
                member_id: newMember.id, role: 'member', context: 'universe',
            }).then(() => {});
            member = newMember;
        }
    }

    const body = await req.json();
    const {
        mode,
        user_role,
        ai_morning_time,
        ai_evening_time,
        ai_tone,
        vision_statement,
        mission_statement,
    } = body;

    // 1. myverse_users upsert
    const { error: upsertErr } = await admin
        .from('myverse_users')
        .upsert(
            {
                member_id: member.id,
                mode,
                user_role: user_role ?? null,
                ai_morning_time,
                ai_evening_time,
                ai_tone,
                onboarding_completed: true,
                updated_at: new Date().toISOString(),
            },
            { onConflict: 'member_id' }
        );
    if (upsertErr) {
        console.error('onboarding myverse_users upsert error', upsertErr);
        return NextResponse.json({ error: 'upsert_failed', message: upsertErr.message }, { status: 500 });
    }

    // 1-b. members.affiliations[]에 'myverse' 추가 — 우상단 유틸리티 워크스페이스 드롭다운 노출
    {
        const { data: m } = await admin
            .from('members')
            .select('affiliations')
            .eq('id', member.id)
            .maybeSingle();
        const current = ((m?.affiliations as string[] | null) ?? []) as string[];
        if (!current.includes('myverse')) {
            await admin
                .from('members')
                .update({ affiliations: [...current, 'myverse'] })
                .eq('id', member.id);
        }
    }

    // 2. myverse_identities upsert (vision/mission만)
    if (vision_statement || mission_statement) {
        const { error: idErr } = await admin
            .from('myverse_identities')
            .upsert(
                {
                    member_id: member.id,
                    vision_statement: vision_statement || null,
                    mission_statement: mission_statement || null,
                    updated_at: new Date().toISOString(),
                },
                { onConflict: 'member_id' }
            );
        if (idErr) console.error('onboarding myverse_identities upsert error', idErr);
    }

    return NextResponse.json({ ok: true });
}
