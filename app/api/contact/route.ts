import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/client';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { formType, name, email, phone, company, message, portfolioUrl, extra } = body;

        if (!formType || !name || !email) {
            return NextResponse.json({ error: '이름과 이메일은 필수입니다.' }, { status: 400 });
        }

        const supabase = createClient();
        const { error } = await supabase.from('contact_submissions').insert({
            form_type: formType,
            name, email, phone, company, message,
            portfolio_url: portfolioUrl,
            extra: extra || {},
        });

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Contact submit error:', error);
        return NextResponse.json({ error: '제출에 실패했습니다.' }, { status: 500 });
    }
}
