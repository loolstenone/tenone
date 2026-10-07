import type { Metadata } from "next";
import { FormRenderer } from "@/components/forms/FormRenderer";
import { createAdminClient } from "@/lib/supabase/admin";

// 행사 참가 신청 — 인트라 > MADLeague > 참가 신청에서 만든 폼 (유니버스 공통 폼 모듈)
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const { data } = await createAdminClient().from("forms").select("title, description, status")
        .eq("brand_id", "madleague").eq("slug", slug).in("status", ["open", "closed"]).maybeSingle();
    return { title: data?.title ?? "참가 신청", description: data?.description ?? undefined };
}

export default async function MadFormPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    return (
        <div className="bg-black text-white min-h-[70vh]">
            <div className="mx-auto max-w-2xl px-6 py-20">
                <FormRenderer brand="madleague" slug={slug} accent="#EC1D25" dark />
            </div>
        </div>
    );
}
