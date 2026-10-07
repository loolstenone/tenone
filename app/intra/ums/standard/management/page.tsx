"use client";

/**
 * 관리 체계 — 유니버스 공통 가이드 · 사이트별 가이드 · 인트라 연계 (CLAUDE.md §1.9.5)
 * "브랜드를 바꿀 때마다 사람이 확인·지시하지 않아도 인트라가 따라온다"를 위한 SSOT 사슬
 */
import Link from "next/link";
import { ArrowRight, GitBranch, Layers, ListChecks, ShieldAlert, Workflow } from "lucide-react";
import { PageHeader } from "@/components/intra/IntraUI";
import { useSiteStatus } from "@/components/intra/BrandSiteStatus";

const GUIDE_LAYERS = [
    { title: "유니버스 공통 가이드", where: "CLAUDE.md (루트)", what: "헌법·데이터 계약·인증·권한·공통 컴포넌트·작업 프로토콜 — 모든 브랜드가 예외 없이 지킨다", who: "전 브랜드" },
    { title: "사이트별 가이드", where: "app/(Brand)/CLAUDE.md", what: "브랜드 정체성·디자인·접근 모델·특화 테이블·현재 상태·주의사항 — 공통 원칙 위에서 차별화", who: "해당 브랜드 파일 편집 시 자동 로드" },
];

const PRINCIPLES = [
    { title: "하나의 사실은 한 곳에만", desc: "같은 정보를 두 곳에 손으로 적지 않는다. 다른 곳은 원천을 읽어서 만든다 (예: 사이드바 집중 브랜드 = ums_sites.tier에서 계산)" },
    { title: "이름은 사이트 표기 그대로", desc: "인트라 브랜드 메뉴·화면 제목 = 사이트 헤더 메뉴명, 페이지 안 기능은 버튼 문구 그대로 (예: 상담 / 문의) — 상위 메뉴를 붙이지 않음. 사이트 헤더도 같은 레지스트리로 렌더하므로 이름을 고칠 곳은 한 곳뿐" },
    { title: "사이트 변경은 자동 반영", desc: "콘텐츠 수는 실시간 집계, Tier는 ums_sites, 메뉴는 레지스트리. 레지스트리에 연결 안 된 DB 게시판은 사이트 현황에 경고로 드러난다" },
    { title: "숫자는 한 함수로 센다", desc: "통합 관리·브랜드 대시보드·에이전트가 같은 집계 함수(lib/site-status.ts)를 쓴다 → 화면마다 숫자가 달라지지 않는다" },
    { title: "빠진 것은 숨기지 않고 드러낸다", desc: "Tier 미지정·메뉴 미매핑·조회 실패를 '점검 필요'로 표시. 조용히 0으로 보이게 하지 않는다" },
    { title: "가이드와 어긋나는 지시는 먼저 묻는다", desc: "공통·사이트별 가이드와 다른 지시는 어느 조항과 어긋나는지 짚고 가이드 변경·예외·지시 조정 중 결정을 받은 뒤 진행" },
    { title: "권한·데이터 계약은 공통, 화면·콘텐츠는 브랜드 자유", desc: "데이터 계약 5조·권한(member_roles)·동의는 예외 없음. 디자인·메뉴·콘텐츠 구조는 브랜드 가이드에서 정한다" },
];

const SSOT_CHAIN = [
    { source: "DB ums_sites (tier · lifecycle · hosting · is_open)", feeds: ["사이드바 집중 / 실험·보관 자동 분류 (lib/intra-nav.ts regroupBrandSections)", "통합 관리 > 사이트 현황 그룹", "SiteClosedOverlay 공개 여부", "플랫폼 헌법 Tier 표"] },
    { source: "lib/domain-registry.ts (도메인 · CANONICAL_HOSTS)", feeds: ["middleware 공식 주소 이동", "brandSiteUrl() — 인트라 → 사이트 링크 (vercel=공식 주소, external=스테이징)"] },
    { source: "lib/brand-site-menus.ts (사이트 헤더 메뉴·페이지 기능 ↔ 콘텐츠 원천 ↔ 인트라 화면)", feeds: ["사이트 헤더 메뉴 (siteHeaderNav)", "인트라 브랜드 메뉴 (brandAdminChildren) · 화면 제목 (adminTitle)", "사이트 현황·브랜드 대시보드의 메뉴별 콘텐츠 수 · 미연결 DB 게시판 경고"] },
    { source: "lib/action-hub-registry.ts (처리 대기 액션)", feeds: ["인트라 대시보드 Action Hub"] },
    { source: "member_roles → isStaffMember / auth_is_staff()", feeds: ["인트라·관리 API·RLS 직원 판단 (한 정의)"] },
];

const CHECKLISTS = [
    { when: "브랜드 Tier 변경 (예: 실험 → 집중)", steps: ["ums_sites.tier 변경 — 사이드바·사이트 현황은 자동 반영", "CANONICAL_HOSTS 갱신 (공식 주소가 생기면)", "CLAUDE.md §0.1 Tier 표 갱신", "집중으로 올리면 lib/brand-site-menus.ts에 사이트 메뉴 등록"] },
    { when: "사이트 메뉴 추가·변경", steps: ["lib/brand-site-menus.ts 해당 브랜드 메뉴 수정 (콘텐츠 원천·인트라 화면)", "인트라 관리 화면이 없으면 만든다 — 메뉴가 생기면 인트라 메뉴도 자동으로 생김", "브랜드 CLAUDE.md 핵심 파일·인트라 경로 갱신"] },
    { when: "새 브랜드", steps: ["CLAUDE.md §2.4 체크리스트", "ums_sites 등록(tier 포함) · domain-registry", "lib/brand-site-menus.ts 등록 → 인트라 메뉴·현황 자동", "Action Hub 등록 (처리 대기 테이블이 있으면)"] },
    { when: "브랜드 종료·보관", steps: ["헌법 §0.1 서비스 종료 7단계", "ums_sites.tier=archive · lifecycle 갱신 → 사이드바 자동 이동", "페이지·API 차단 (원칙 5)"] },
];

export default function ManagementStandardPage() {
    const { data } = useSiteStatus();
    const focus = data?.filter(s => s.tier === "core" || s.tier === "focus") ?? [];
    const untiered = data?.filter(s => !s.tier) ?? [];
    const unmapped = focus.filter(s => !s.menus);

    return (
        <div className="space-y-6">
            <PageHeader title="관리 체계" description="공통 가이드 · 사이트별 가이드 · 인트라 연계 — 브랜드가 바뀌어도 사람이 매번 확인하지 않게 (CLAUDE.md §1.9.5)" />

            <section>
                <h2 className="text-sm font-semibold text-neutral-900 mb-3 flex items-center gap-2"><Layers className="h-4 w-4" />가이드 2층 구조</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {GUIDE_LAYERS.map(g => (
                        <div key={g.title} className="bg-white border border-neutral-200 rounded-lg p-4">
                            <p className="text-sm font-semibold text-neutral-900">{g.title}</p>
                            <p className="text-[11px] text-neutral-400 mt-0.5">{g.where} · {g.who}</p>
                            <p className="text-[12px] text-neutral-600 mt-2 leading-relaxed">{g.what}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section>
                <h2 className="text-sm font-semibold text-neutral-900 mb-3 flex items-center gap-2"><ShieldAlert className="h-4 w-4" />오류를 막는 대원칙</h2>
                <div className="space-y-2">
                    {PRINCIPLES.map((p, i) => (
                        <div key={p.title} className="bg-white border border-neutral-200 rounded-lg p-4 flex gap-3">
                            <span className="h-6 w-6 shrink-0 rounded bg-neutral-900 text-white text-xs font-bold flex items-center justify-center">{i + 1}</span>
                            <div>
                                <p className="text-sm font-semibold text-neutral-900">{p.title}</p>
                                <p className="text-[11px] text-neutral-600 mt-0.5 leading-relaxed">{p.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <section>
                <h2 className="text-sm font-semibold text-neutral-900 mb-3 flex items-center gap-2"><GitBranch className="h-4 w-4" />SSOT 사슬 — 원천 한 곳 → 자동으로 따라오는 곳</h2>
                <div className="space-y-2">
                    {SSOT_CHAIN.map(c => (
                        <div key={c.source} className="bg-white border border-neutral-200 rounded-lg p-4">
                            <p className="text-[12px] font-semibold text-neutral-900">{c.source}</p>
                            <ul className="mt-1.5 space-y-0.5">
                                {c.feeds.map(f => <li key={f} className="text-[11px] text-neutral-600 flex gap-1.5"><ArrowRight className="h-3 w-3 mt-0.5 shrink-0 text-neutral-300" />{f}</li>)}
                            </ul>
                        </div>
                    ))}
                </div>
            </section>

            <section>
                <h2 className="text-sm font-semibold text-neutral-900 mb-3 flex items-center gap-2"><Workflow className="h-4 w-4" />인트라 › 유니버스 구성</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="bg-white border border-neutral-200 rounded-lg p-4">
                        <p className="text-sm font-semibold">통합 관리</p>
                        <p className="text-[11px] text-neutral-600 mt-1 leading-relaxed">전 사이트 집계 — 사이트 현황(Tier·상태·회원·게시글·문의·메뉴 매핑), 통합 회원, 게시판, CS 통합, UC, 외부 리소스, Standard</p>
                        <Link href="/intra/ums/sites/status" className="text-[11px] text-blue-600 hover:underline mt-2 inline-block">사이트 현황 열기</Link>
                    </div>
                    <div className="bg-white border border-neutral-200 rounded-lg p-4">
                        <p className="text-sm font-semibold">집중 브랜드 <span className="text-neutral-400 font-normal">({focus.length})</span></p>
                        <p className="text-[11px] text-neutral-600 mt-1 leading-relaxed">ums_sites.tier = core·focus. 브랜드별 대시보드 = 사이트 메뉴별 현황 + 메뉴 1:1 관리 화면</p>
                        <p className="text-[11px] text-neutral-400 mt-2">{focus.map(s => s.name ?? s.slug).join(" · ") || "-"}</p>
                    </div>
                    <div className="bg-white border border-neutral-200 rounded-lg p-4">
                        <p className="text-sm font-semibold">실험 · 보관 브랜드 <span className="text-neutral-400 font-normal">({(data?.length ?? 0) - focus.length})</span></p>
                        <p className="text-[11px] text-neutral-600 mt-1 leading-relaxed">그 외 전 브랜드 (기본 접힘). 신규 투자 없음 — 현황 확인·문의 응대·종료 절차 위주</p>
                    </div>
                </div>
                {(untiered.length > 0 || unmapped.length > 0) && (
                    <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mt-3">
                        점검 필요 — {untiered.length > 0 && `Tier 미지정 ${untiered.length}개`}{untiered.length > 0 && unmapped.length > 0 && " · "}
                        {unmapped.length > 0 && `집중 브랜드 메뉴 미매핑: ${unmapped.map(s => s.name ?? s.slug).join(", ")}`}
                    </p>
                )}
            </section>

            <section>
                <h2 className="text-sm font-semibold text-neutral-900 mb-3 flex items-center gap-2"><ListChecks className="h-4 w-4" />변경 체크리스트</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {CHECKLISTS.map(c => (
                        <div key={c.when} className="bg-white border border-neutral-200 rounded-lg p-4">
                            <p className="text-[12px] font-semibold text-neutral-900">{c.when}</p>
                            <ol className="mt-1.5 space-y-0.5 list-decimal list-inside">
                                {c.steps.map(s => <li key={s} className="text-[11px] text-neutral-600">{s}</li>)}
                            </ol>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
