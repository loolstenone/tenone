import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/client';

export async function POST(request: NextRequest) {
    try {
        const { email, name, memberId } = await request.json();
        if (!email) return NextResponse.json({ error: '이메일은 필수입니다.' }, { status: 400 });

        const supabase = createClient();
        const { error } = await supabase.from('newsletter_subscribers').upsert(
            { email, name: name || null, member_id: memberId || null, status: 'active' },
            { onConflict: 'email' }
        );
        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Newsletter subscribe error:', error);
        return NextResponse.json({ error: '구독에 실패했습니다.' }, { status: 500 });
    }
}
