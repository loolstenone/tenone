import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sessionMemberId } from "@/lib/programs/access";
import { eligibleCertificates, certProfileDefaults, issueCertificate, validProfile } from "@/lib/programs/certificates";

export const runtime = "nodejs";

async function validBrand(brand: unknown): Promise<string | null> {
    if (typeof brand !== "string" || !/^[a-z0-9_-]{2,30}$/.test(brand)) return null;
    const { data } = await createAdminClient().from("ums_sites").select("slug").eq("slug", brand).maybeSingle();
    return data ? brand : null;
}

// GET ?brand= — 내 발급 가능·발급된 인증서 + 첫 발급 입력 기본값
export async function GET(req: NextRequest) {
    const memberId = await sessionMemberId();
    if (!memberId) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    const brand = await validBrand(req.nextUrl.searchParams.get("brand"));
    if (!brand) return NextResponse.json({ error: "알 수 없는 서비스입니다." }, { status: 400 });
    const [certs, defaults] = await Promise.all([eligibleCertificates(brand, memberId), certProfileDefaults(brand, memberId)]);
    return NextResponse.json({ certificates: certs, defaults: defaults.profile, hasPrevious: defaults.hasPrevious });
}

// POST { brand, key, profile:{birthdate, university, major}, consent } — 발급 (이미 있으면 그 코드)
export async function POST(req: NextRequest) {
    const memberId = await sessionMemberId();
    if (!memberId) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    const body = await req.json().catch(() => ({}));
    const brand = await validBrand(body.brand);
    if (!brand) return NextResponse.json({ error: "알 수 없는 서비스입니다." }, { status: 400 });
    const profile = validProfile(body.profile);
    if (!profile) return NextResponse.json({ error: "생년월일·출신 대학·전공을 확인해 주세요." }, { status: 400 });
    // 개인정보보호법 제15조 — 인증서 표기용 정보 수집 동의 (매 발급 시 확인)
    if (body.consent !== true) return NextResponse.json({ error: "인증서 정보 수집·이용 동의가 필요합니다." }, { status: 400 });
    const key = String(body.key ?? "");
    const r = await issueCertificate(brand, memberId, key, profile);
    if (r.error) return NextResponse.json({ error: r.error }, { status: r.status ?? 500 });
    return NextResponse.json({ ok: true, code: r.code });
}
