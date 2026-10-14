// Planner's 자료실 (planners_files) — 사이트 조회 (서버 전용). 분류·배지·표시 형식은 library-shared.ts
import { createClient } from "@/lib/supabase/server";
import type { PlannersFile, PlannersFileKind } from "@/lib/planners/library-shared";

export * from "@/lib/planners/library-shared";

const COLUMNS = "id, kind, category, title, description, year, file_name, file_size, thumbnail_url, images, detail_images, download_count, legacy_badak_no, sort_order";

/** 공개 자료 목록 (RLS: is_published) — kind를 주지 않으면 전체 */
export async function listPlannersFiles(kind?: PlannersFileKind): Promise<PlannersFile[]> {
    const supabase = await createClient();
    let q = supabase.from("planners_files").select(COLUMNS).eq("is_published", true);
    if (kind) q = q.eq("kind", kind);
    const { data, error } = await q.order("sort_order", { ascending: false });
    if (error) {
        console.error("[planners] 자료 목록 실패", error.message);
        return [];
    }
    return (data ?? []) as PlannersFile[];
}

/** 공개 자료 1건 (없거나 비공개면 null) */
export async function getPlannersFile(id: string): Promise<PlannersFile | null> {
    if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
    const supabase = await createClient();
    const { data, error } = await supabase.from("planners_files").select(COLUMNS).eq("id", id).eq("is_published", true).maybeSingle();
    if (error) console.error("[planners] 자료 조회 실패", error.message);
    return (data as PlannersFile | null) ?? null;
}
