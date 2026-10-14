// Planner's 자료실 (planners_files) — 사이트 목록 조회 (서버 전용). 분류·표시 형식은 library-shared.ts
import { createClient } from "@/lib/supabase/server";
import type { PlannersFile, PlannersFileKind } from "@/lib/planners/library-shared";

export * from "@/lib/planners/library-shared";

/** 공개 자료 목록 (RLS: is_published) — sort_order 내림차순(최신 상품 먼저) */
export async function listPlannersFiles(kind: PlannersFileKind): Promise<PlannersFile[]> {
    const supabase = await createClient();
    const { data, error } = await supabase.from("planners_files")
        .select("id, kind, category, title, description, year, file_name, file_size, thumbnail_url, download_count")
        .eq("kind", kind).eq("is_published", true)
        .order("sort_order", { ascending: false });
    if (error) {
        console.error("[planners] 자료 목록 실패", error.message);
        return [];
    }
    return (data ?? []) as PlannersFile[];
}
