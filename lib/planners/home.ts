// Planner's 첫 화면 관리 데이터 — 배너(planners_banners) · 진열대(planners_showcases). 서버 전용 (RLS가 공개 기간·공개분만 돌려준다)
import { createClient } from "@/lib/supabase/server";
import type { PlannersFile } from "@/lib/planners/library-shared";

export interface PlannersBanner {
    id: string;
    title: string;
    subtitle: string | null;
    image_url: string | null;
    link_url: string | null;
    button_label: string | null;
}

export interface PlannersShowcase {
    id: string;
    title: string;
    description: string | null;
    files: PlannersFile[];
}

/** 지금 보여 줄 배너 (공개 + 공개 기간 안) */
export async function listActiveBanners(): Promise<PlannersBanner[]> {
    const supabase = await createClient();
    const now = new Date().toISOString();
    const { data, error } = await supabase.from("planners_banners")
        .select("id, title, subtitle, image_url, link_url, button_label")
        .eq("is_published", true)
        .or(`starts_at.is.null,starts_at.lte.${now}`)
        .or(`ends_at.is.null,ends_at.gt.${now}`)
        .order("sort_order").order("created_at", { ascending: false });
    if (error) {
        console.error("[planners] 배너 조회 실패", error.message);
        return [];
    }
    return (data ?? []) as PlannersBanner[];
}

/** 지금 보여 줄 진열대 — 상품은 공개 자료 목록(files)에서 순서대로 찾아 붙인다 (없는·비공개 상품은 건너뜀) */
export async function listActiveShowcases(files: PlannersFile[]): Promise<PlannersShowcase[]> {
    const supabase = await createClient();
    const now = new Date().toISOString();
    const { data, error } = await supabase.from("planners_showcases")
        .select("id, title, description, file_ids")
        .eq("is_published", true)
        .or(`starts_at.is.null,starts_at.lte.${now}`)
        .or(`ends_at.is.null,ends_at.gt.${now}`)
        .order("sort_order").order("created_at", { ascending: false });
    if (error) {
        console.error("[planners] 진열대 조회 실패", error.message);
        return [];
    }
    const byId = new Map(files.map((f) => [f.id, f]));
    return (data ?? [])
        .map((s) => ({
            id: s.id as string,
            title: s.title as string,
            description: s.description as string | null,
            files: ((s.file_ids as string[]) ?? []).map((id) => byId.get(id)).filter((f): f is PlannersFile => !!f),
        }))
        .filter((s) => s.files.length > 0);
}
