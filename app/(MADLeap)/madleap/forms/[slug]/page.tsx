import type { Metadata } from "next";
import { FormRenderer } from "@/components/forms/FormRenderer";
import { createAdminClient } from "@/lib/supabase/admin";

// 매드립 지원서 등 — 인트라 > MADLeap > 지원하기에서 만든 폼 (유니버스 공통 폼 모듈)
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const { data } = await createAdminClient().from("forms").select("title, description, status")
        .eq("brand_id", "madleap").eq("slug", slug).in("status", ["open", "closed"]).maybeSingle();
    return { title: data?.title ?? "지원하기", description: data?.description ?? undefined };
}

export default async function MadLeapFormPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    return (
        <div className="bg-neutral-50 min-h-[70vh]">
            <div className="mx-auto max-w-2xl px-6 py-20">
                <FormRenderer brand="madleap" slug={slug} accent="#4361ee" />
            </div>
        </div>
    );
}
