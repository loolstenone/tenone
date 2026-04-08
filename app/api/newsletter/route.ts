import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// API 라우트 전용 service role 클라이언트 (RLS 우회)
function getAdminClient() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
}

export async function POST(request: NextRequest) {
    try {
        const { email, name, memberId, source } = await request.json();
        if (!email) return NextResponse.json({ error: '이메일은 필수입니다.' }, { status: 400 });

        const supabase = getAdminClient();

        // 1. 구독자 upsert
        const { data: subscriber, error } = await supabase
            .from('newsletter_subscribers')
            .upsert(
                {
                    email,
                    name: name || null,
                    member_id: memberId || null,
                    is_active: true,
                    source: source || null,
                },
                { onConflict: 'email' }
            )
            .select('id')
            .single();

        if (error) throw error;

        // 2. 브랜드 소스 태그 등록 (subscriber_tags)
        if (subscriber?.id && source) {
            await supabase
                .from('subscriber_tags')
                .upsert(
                    { subscriber_id: subscriber.id, tag: source },
                    { onConflict: 'subscriber_id,tag' }
                );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Newsletter subscribe error:', error);
        return NextResponse.json({ error: '구독에 실패했습니다.' }, { status: 500 });
    }
}
