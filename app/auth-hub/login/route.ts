import { NextRequest, NextResponse } from 'next/server';

// [DEPRECATED] auth-hub is no longer used. Direct Supabase OAuth per domain.
export async function GET(request: NextRequest) {
    const url = new URL('/login', request.url);
    url.searchParams.set('error', 'auth_hub_deprecated');
    return NextResponse.redirect(url);
}
