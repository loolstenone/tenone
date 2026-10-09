/** 브랜드 성과 — 직원 전용 (/api/intra/* → middleware requireStaff). 계산은 lib/intel/brand-performance.ts */
import { NextResponse, type NextRequest } from "next/server";
import { computeBrandPerformance } from "@/lib/intel/brand-performance";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
    const days = Math.min(Math.max(Number(req.nextUrl.searchParams.get("days")) || 30, 1), 180);
    return NextResponse.json(await computeBrandPerformance(days));
}
