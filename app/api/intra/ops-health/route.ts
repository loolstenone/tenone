/** 운영 상태 — 직원 전용 (/api/intra/* → middleware requireStaff). 계산은 lib/intel/ops-health.ts */
import { NextResponse } from "next/server";
import { computeOpsHealth } from "@/lib/intel/ops-health";

export const dynamic = "force-dynamic";

export async function GET() {
    return NextResponse.json(await computeOpsHealth());
}
