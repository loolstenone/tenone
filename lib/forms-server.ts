// 신청 폼 서버 조회 (Server Component 전용) — 프로그램 페이지가 "참가 신청" 버튼을 그릴 때
import { createAdminClient } from "@/lib/supabase/admin";
import { formAvailability } from "@/lib/forms";
import type { FormAvailability, FormDef } from "@/types/forms";

export interface ProgramFormLink {
    slug: string;
    title: string;
    availability: FormAvailability;
    opens_at: string | null;
    closes_at: string | null;
}

/** 프로그램에 연결된 공개 폼(열림·마감) — 초안은 숨김. 열린 폼 먼저 */
export async function listProgramForms(brand: string, program: string): Promise<ProgramFormLink[]> {
    const admin = createAdminClient();
    const { data } = await admin.from("forms")
        .select("id, slug, title, status, opens_at, closes_at, settings, created_at")
        .eq("brand_id", brand).eq("program", program).in("status", ["open", "closed"])
        .order("created_at", { ascending: false });
    const rows = (data ?? []) as Pick<FormDef, "id" | "slug" | "title" | "status" | "opens_at" | "closes_at" | "settings">[];
    const out = await Promise.all(rows.map(async f => {
        let count = 0;
        if (f.settings?.max_responses) {
            const r = await admin.from("form_responses").select("id", { count: "exact", head: true }).eq("form_id", f.id).neq("status", "cancelled");
            count = r.count ?? 0;
        }
        return { slug: f.slug, title: f.title, availability: formAvailability(f, count), opens_at: f.opens_at, closes_at: f.closes_at };
    }));
    return out.sort((a, b) => Number(b.availability === "open") - Number(a.availability === "open"));
}
