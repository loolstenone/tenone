/**
 * GA4 동기화 환경변수 체크
 * GET /api/analytics/env-check
 * Returns: { propertyId, serviceAccount, cronSecret, gtmId, gaId, clarityId }
 * 민감정보는 전송하지 않음 (존재 여부만)
 */
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
    return NextResponse.json({
        propertyId: !!process.env.GA4_PROPERTY_ID,
        serviceAccount: !!process.env.GA4_SERVICE_ACCOUNT_JSON,
        cronSecret: !!process.env.CRON_SECRET,
        gtmId: !!process.env.NEXT_PUBLIC_GTM_ID,
        gaId: !!process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
        clarityId: !!process.env.NEXT_PUBLIC_CLARITY_ID,
        serviceRoleKey: !!(process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY_PROD),
    });
}
