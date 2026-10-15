import Link from "next/link";
import { Award, ExternalLink, GraduationCap, Trophy, UserCheck, Users } from "lucide-react";
import { PageHeader, StatCard, Card, SectionTitle } from "@/components/intra/IntraUI";
import { createAdminClient } from "@/lib/supabase/admin";
import { brandSiteUrl } from "@/lib/domain-registry";
import { BrandSiteStatus } from "@/components/intra/BrandSiteStatus";

/**
 * MAD League 관리 대시보드 (2026-10-15 현실화)
 *   - 실제 데이터만 센다: 테스트 데이터(데모 역할 context.demo · 테스트 이메일 *.invalid · [데모] 회차)는 숫자에서 빼고 따로 표시
 *   - 상세 작업은 위쪽 탭(경쟁 PT · MADzine · 매드리거 등록 · 인증서 발급 …)에서 — 여기에 같은 목록을 두지 않는다
 *   - 회장 = 운영진 지정(member_capability_roles club/임원 context.position='회장'), 옛 mad_clubs.president_member_id는 보지 않는다
 *   - MAD Crown 카드는 뺐다 (2026-10-15 사용자 결정: 필요하면 다시 만든다)
 */
export const dynamic = "force-dynamic";

const isTestEmail = (e: string | null | undefined) => !!e && /\.invalid$/i.test(e);
const isDemoRound = (title: string) => title.startsWith("[데모]");

interface RoleRow { member_id: string; role: string; context: { club_id?: string; position?: string; demo?: boolean } | null }

export default async function MADLeagueIntraPage() {
    const db = createAdminClient();
    const [clubsRes, rolesRes, appsRes, roundsRes, certTotal, certRevoked, certLinked] = await Promise.all([
        db.from("mad_clubs").select("id, slug, name, region, color").eq("status", "active").order("sort_order"),
        db.from("member_capability_roles").select("member_id, role, context")
            .eq("brand_id", "madleague").eq("capability_key", "club").in("role", ["현역", "임원"]).is("valid_until", null),
        db.from("mad_applications").select("email").eq("status", "pending"),
        db.from("program_rounds").select("title, status").eq("brand_id", "madleague"),
        db.from("program_certificates").select("id", { count: "exact", head: true }).eq("brand_id", "madleague"),
        db.from("program_certificates").select("id", { count: "exact", head: true }).eq("brand_id", "madleague").not("revoked_at", "is", null),
        db.from("program_certificates").select("id", { count: "exact", head: true }).eq("brand_id", "madleague").not("member_id", "is", null).is("revoked_at", null),
    ]);

    const clubs = (clubsRes.data ?? []) as { id: string; slug: string; name: string; region: string | null; color: string | null }[];
    const roles = (rolesRes.data ?? []) as RoleRow[];
    const realRoles = roles.filter(r => !r.context?.demo);
    const demoRoles = roles.length - realRoles.length;

    const apps = (appsRes.data ?? []) as { email: string | null }[];
    const testApps = apps.filter(a => isTestEmail(a.email)).length;

    const rounds = (roundsRes.data ?? []) as { title: string; status: string }[];
    const realRounds = rounds.filter(r => !isDemoRound(r.title));
    const ongoing = realRounds.filter(r => r.status === "ongoing").length;

    const certs = certTotal.count ?? 0, revoked = certRevoked.count ?? 0, linked = certLinked.count ?? 0;

    // 동아리별 회장 (운영진 지정 기준) — 이름은 members에서
    const presidents = roles.filter(r => r.role === "임원" && r.context?.position === "회장" && r.context?.club_id);
    const { data: presMembers } = presidents.length
        ? await db.from("members").select("id, name").in("id", presidents.map(p => p.member_id))
        : { data: [] as { id: string; name: string | null }[] };
    const presidentOf = (clubId: string) => {
        const p = presidents.find(x => x.context?.club_id === clubId);
        if (!p) return null;
        return { name: presMembers?.find(m => m.id === p.member_id)?.name ?? "(이름 없음)", demo: !!p.context?.demo };
    };
    const memberCount = (clubId: string) => realRoles.filter(r => r.context?.club_id === clubId).length;

    const testNote = (n: number) => (n ? ` · 테스트 ${n}건 제외` : "");

    return (
        <div>
            <PageHeader title="MAD League 관리" description="대학 동아리 연합 운영 대시보드">
                <Link href={brandSiteUrl("madleague", "/madleague")} target="_blank" className="flex items-center gap-1.5 text-xs text-neutral-400 transition-colors hover:text-neutral-700">
                    <ExternalLink className="h-3.5 w-3.5" />
                    사이트 바로가기
                </Link>
            </PageHeader>

            <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-5">
                <StatCard label="경쟁 PT" value={`${realRounds.length}회`} sub={`진행 중 ${ongoing}${testNote(rounds.length - realRounds.length)}`} icon={<Trophy className="h-4 w-4" />} href="/intra/ums/madleague/competitions" />
                <StatCard label="인증서" value={`${certs - revoked}건`} sub={`계정 연결 ${linked} · 취소 ${revoked}`} icon={<Award className="h-4 w-4" />} href="/intra/ums/madleague/certificates" />
                <StatCard label="매드리거 등록 대기" value={`${apps.length - testApps}건`} sub={`승인 필요${testNote(testApps)}`} icon={<Users className="h-4 w-4" />} href="/intra/ums/madleague/applications" />
                <StatCard label="활동 회원" value={`${realRoles.length}명`} sub={`현역·임원${testNote(demoRoles)}`} icon={<UserCheck className="h-4 w-4" />} href="/intra/ums/madleague/officers" />
                <StatCard label="공식 동아리" value={`${clubs.length}개`} sub="운영 중" icon={<GraduationCap className="h-4 w-4" />} href="/intra/ums/madleague/officers" />
            </div>

            {/* 사이트 메뉴별 현황 — 통합 관리 > 사이트 현황과 같은 정의 (lib/brand-site-menus.ts) */}
            <Card className="mb-6">
                <SectionTitle title="사이트 메뉴별 현황" />
                <BrandSiteStatus site="madleague" />
            </Card>

            <Card>
                <SectionTitle title="동아리 현황" />
                <div>
                    {clubs.map(c => {
                        const pres = presidentOf(c.id);
                        return (
                            <div key={c.slug} className="flex items-center gap-3 border-b border-neutral-100 py-2.5 last:border-0">
                                <span className="inline-block h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: c.color ?? "#EC1D25" }} />
                                <div className="min-w-0 flex-1">
                                    <div className="text-sm font-medium text-neutral-800">{c.name}</div>
                                    <div className="text-xs text-neutral-500">{c.region}</div>
                                </div>
                                <div className="w-24 text-xs text-neutral-500">활동 {memberCount(c.id)}명</div>
                                <div className="w-40 text-xs">
                                    <span className="text-neutral-400">회장 </span>
                                    {pres ? (
                                        <span className="text-neutral-700">{pres.name}{pres.demo && <span className="ml-1 rounded bg-neutral-100 px-1 text-[10px] text-neutral-500">테스트</span>}</span>
                                    ) : (
                                        <Link href={`/intra/ums/madleague/officers#${c.slug}`} className="text-neutral-400 underline hover:text-neutral-700">지정하기</Link>
                                    )}
                                </div>
                                <div className="flex shrink-0 items-center gap-2">
                                    <Link href={brandSiteUrl("madleague", `/madleague/clubs/${c.slug}`)} target="_blank" className="text-neutral-300 hover:text-neutral-600" title="사이트 동아리 페이지">
                                        <ExternalLink className="h-3.5 w-3.5" />
                                    </Link>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </Card>
        </div>
    );
}
