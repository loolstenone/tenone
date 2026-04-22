/**
 * HeRo 기업 가입 API
 * POST /api/hero/company/register
 *
 * 요청자: 이미 Universe 회원인 사용자 (members.id 필요)
 * 동작:
 *   1. hero_companies에 기업 INSERT (중복 시 기존 row 반환)
 *   2. hero_company_members에 요청자를 'representative' role로 연결
 *   3. (선택) 기존 hero_tih_responses.email과 매칭되면 company_id 연결
 *
 * 본문:
 *   memberId: string          필수 (요청자 회원 ID)
 *   companyName: string       필수
 *   industry?: string
 *   sizeCategory?: string     (small / medium / large / enterprise)
 *   employeeCount?: number
 *   foundedYear?: number
 *   positionTitle?: string    요청자의 기업 내 직책
 *   department?: string
 *   contactEmail?: string
 *   contactPhone?: string
 */
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const {
            memberId,
            companyName,
            industry,
            sizeCategory,
            employeeCount,
            foundedYear,
            positionTitle,
            department,
            contactEmail,
            contactPhone,
        } = body;

        if (!memberId || !companyName) {
            return NextResponse.json(
                { error: "memberId와 companyName은 필수입니다." },
                { status: 400 }
            );
        }

        const sb = createAdminClient();

        // 1. 이미 같은 이름으로 가입된 기업이 있는지 확인
        const { data: existing } = await sb
            .from("hero_companies")
            .select("id")
            .eq("company_name", companyName)
            .maybeSingle();

        let companyId: string;

        if (existing) {
            companyId = existing.id;

            // 이미 이 멤버가 연결되어 있는지
            const { data: link } = await sb
                .from("hero_company_members")
                .select("id, status")
                .eq("member_id", memberId)
                .eq("company_id", companyId)
                .maybeSingle();

            if (link) {
                return NextResponse.json(
                    {
                        ok: true,
                        companyId,
                        status: link.status,
                        message: "이미 등록된 담당자입니다.",
                    },
                    { status: 200 }
                );
            }

            // 기업은 있지만 새 담당자 요청 → pending 상태로 추가
            const { error: linkErr } = await sb
                .from("hero_company_members")
                .insert({
                    member_id: memberId,
                    company_id: companyId,
                    role: "viewer",
                    status: "pending",
                    position_title: positionTitle,
                    department,
                    contact_email: contactEmail,
                    contact_phone: contactPhone,
                });

            if (linkErr) {
                return NextResponse.json({ error: linkErr.message }, { status: 500 });
            }

            return NextResponse.json(
                {
                    ok: true,
                    companyId,
                    status: "pending",
                    message: "기업 대표의 승인 대기 중입니다.",
                },
                { status: 201 }
            );
        }

        // 2. 신규 기업 생성
        const { data: newCompany, error: companyErr } = await sb
            .from("hero_companies")
            .insert({
                company_name: companyName,
                industry: industry || null,
                size_category: sizeCategory || null,
                employee_count: employeeCount || null,
                founded_year: foundedYear || null,
                tenant_id: "tenone",
            })
            .select("id")
            .single();

        if (companyErr || !newCompany) {
            return NextResponse.json(
                { error: companyErr?.message || "기업 생성 실패" },
                { status: 500 }
            );
        }

        companyId = newCompany.id;

        // 3. 요청자를 'representative' role로 연결 (즉시 active)
        const { error: repErr } = await sb.from("hero_company_members").insert({
            member_id: memberId,
            company_id: companyId,
            role: "representative",
            status: "active",
            position_title: positionTitle,
            department,
            contact_email: contactEmail,
            contact_phone: contactPhone,
            joined_at: new Date().toISOString(),
        });

        if (repErr) {
            return NextResponse.json({ error: repErr.message }, { status: 500 });
        }

        // 4. 기존 TIH 응답과 이메일·기업명 매칭 시도
        if (contactEmail) {
            await sb
                .from("hero_tih_responses")
                .update({
                    company_id: companyId,
                    submitted_by_member_id: memberId,
                })
                .eq("email", contactEmail)
                .is("company_id", null);
        }

        return NextResponse.json(
            {
                ok: true,
                companyId,
                status: "active",
                role: "representative",
            },
            { status: 201 }
        );
    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "unknown";
        console.error("[hero/company/register] error:", msg);
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}
