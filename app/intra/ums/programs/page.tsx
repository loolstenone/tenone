import { ProgramsAdmin } from "@/components/intra/programs/ProgramsAdmin";
import { createAdminClient } from "@/lib/supabase/admin";

// 통합 관리 › 프로그램 — 전 브랜드 회차 (경쟁 PT·실전 프로젝트·프로그램·교육 과정) · docs/Program_Module.md
export default async function ProgramsIntegratedPage() {
    const { data: brands } = await createAdminClient().from("ums_sites").select("slug, name").or("tier.in.(core,focus),slug.eq.planners").order("name"); // 집중 브랜드 + 교육 과정 후보(Planner's)
    return (
        <ProgramsAdmin
            title="프로그램"
            description="전 브랜드의 회차를 한곳에서 봅니다. 각 회차의 데이터 주인은 운영 브랜드이고, 창구로 지정한 사이트에도 노출됩니다."
            basePath="/intra/ums/programs"
            brands={brands ?? []}
        />
    );
}
