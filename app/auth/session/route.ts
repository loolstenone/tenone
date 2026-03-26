import { NextRequest, NextResponse } from 'next/server';

// [DEPRECATED] Token transfer session is no longer used. Direct Supabase OAuth per domain.
export async function GET(request: NextRequest) {
    const url = new URL('/login', request.url);
    url.searchParams.set('error', 'session_deprecated');
    return NextResponse.redirect(url);
}
