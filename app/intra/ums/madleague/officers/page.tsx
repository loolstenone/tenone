import { createAdminClient } from "@/lib/supabase/admin";
import { ClubOfficersEditor } from "@/components/madleague/ClubOfficersEditor";
import { adminTitle } from "@/lib/brand-site-menus";

// 동아리 운영진 — 처음 지정은 직원, 이후 각 동아리 회장·부회장이 사이트 동아리 관리 화면에서 지정 (2026-10-08)
export default async function MadleagueOfficersPage() {
    const { data: clubs } = await createAdminClient().from("mad_clubs").select("slug, name, region").eq("status", "active").order("sort_order");
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-neutral-900">{adminTitle("/intra/ums/madleague/officers", "동아리")} · 운영진</h1>
                <p className="mt-1 text-sm text-neutral-500">
                    동아리별 회장·부회장·총무 등 최대 5명. 처음 한 번은 여기서 지정하고, 이후에는 각 동아리 회장·부회장이 동아리 관리 화면에서 다음 임기 운영진을 지정합니다.
                    운영진은 자기 동아리 지원서를 승인·반려할 수 있습니다.
                </p>
            </div>
            {(clubs ?? []).map(c => (
                <section key={c.slug} id={c.slug} className="space-y-3">
                    <h2 className="text-lg font-semibold text-neutral-800">{c.name} <span className="text-sm font-normal text-neutral-400">{c.region}</span></h2>
                    <ClubOfficersEditor slug={c.slug} tone="light" />
                </section>
            ))}
        </div>
    );
}
