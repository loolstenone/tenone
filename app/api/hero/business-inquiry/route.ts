import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
    const body = await req.json();
    const { company, contact, email, phone, role, duration, budget, message } = body;

    if (!company || !contact || !email) {
        return NextResponse.json({ error: "필수 항목 누락" }, { status: 400 });
    }

    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    const memberId = user
        ? (await supabase.from("members").select("id").eq("auth_id", user.id).single()).data?.id
        : null;

    const { error } = await supabase.from("hero_business_inquiries").insert({
        member_id: memberId,
        company,
        contact,
        email,
        phone: phone || null,
        role: role || null,
        duration: duration || null,
        budget: budget || null,
        message: message || null,
        status: "pending",
        brand_id: "hero",
    });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ ok: true });
}
