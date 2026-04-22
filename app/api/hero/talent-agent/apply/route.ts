import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, field, stage, intro, goal, portfolio_url, member_id } = body ?? {};

    if (!name || !email) {
      return NextResponse.json({ error: "이름과 이메일은 필수입니다." }, { status: 400 });
    }

    const sb = createAdminClient();
    const { data, error } = await sb
      .from("hero_talent_applications")
      .insert({
        member_id: member_id || null,
        name,
        email,
        phone: phone || null,
        field: field || null,
        stage: stage || null,
        intro: intro || null,
        goal: goal || null,
        portfolio_url: portfolio_url || null,
      })
      .select("id")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ id: data.id });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "신청 실패";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
