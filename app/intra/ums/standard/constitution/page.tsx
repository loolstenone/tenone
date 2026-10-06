"use client";

/**
 * 플랫폼 헌법 — CLAUDE.md §0.1 (2026-10-04 확정)
 * 지주사–계열사 모델 7원칙 + 브랜드 Tier (현재 상태 SSOT = ums_sites)
 */
import { useEffect, useState } from "react";
import Link from "next/link";
import { Landmark, Loader2, ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/intra/IntraUI";
import { createClient } from "@/lib/supabase/client";

const PRINCIPLES = [
    { n: 1, title: "계정은 하나, 서비스는 독립", desc: "Ten:One ID 하나로 전 브랜드 이용. 각 브랜드는 단독 완결 서비스 — 첫 진입 시 브랜드 약관 동의(member_brand_joins), 탈퇴는 \"이 서비스만\" / \"계정 전체\" 구분" },
    { n: 2, title: "코어는 작고 단단하게", desc: "코어 = Ten:One ID · 공통 프로필 · 권한(member_roles) · 여정(capability) · UC · 인트라. 보안 투자는 코어에 집중" },
    { n: 3, title: "서비스는 코어(ID·API)로만 연결", desc: "다른 브랜드 테이블 직접 조회 금지" },
    { n: 4, title: "브랜드당 공식 주소 1개", desc: "나머지 진입로는 공식 주소로 308. tenone.biz/{brand} 경로는 외부 비노출 (로컬 개발 전용)" },
    { n: 5, title: "Tier별로 투자", desc: "핵심 / 집중 / 실험 / 보관. 보관 브랜드는 페이지·API를 끈다 (공격 표면 축소)" },
    { n: 6, title: "같은 브랜드를 두 곳에서 동시에 공개 운영하지 않음", desc: "외부 서버 운영 브랜드의 Vercel 버전은 오픈일까지 비공개 스테이징(noindex). 오픈일 DNS 전환으로 한 번에 이동" },
    { n: 7, title: "유니버스는 강조하지 않는다", desc: "사용자에겐 푸터 관련 사이트 링크 정도. 프로필·여정은 전 브랜드 일관 적용, 다른 브랜드 활동 교차 노출은 본인 허락 시에만" },
];

const TIERS = [
    { key: "core", label: "핵심", desc: "TenOne · 인트라 · Ten:One ID" },
    { key: "focus", label: "집중", desc: "개별 투자·운영 중인 브랜드" },
    { key: "experiment", label: "실험", desc: "개별 결정 전까지 신규 투자 없음" },
    { key: "archive", label: "보관", desc: "페이지·API 차단" },
];

interface SiteRow { slug: string; name: string; domain: string | null; tier: string | null; lifecycle: string | null; hosting: string | null }

export default function ConstitutionPage() {
    const [loading, setLoading] = useState(true);
    const [sites, setSites] = useState<SiteRow[]>([]);

    useEffect(() => {
        createClient().from("ums_sites").select("slug, name, domain, tier, lifecycle, hosting").order("name")
            .then(({ data }: { data: SiteRow[] | null }) => { setSites(data ?? []); setLoading(false); });
    }, []);

    const untiered = sites.filter(s => !s.tier);

    return (
        <div className="space-y-6">
            <PageHeader title="플랫폼 헌법" description="지주사–계열사 모델 · 모든 설계 판단의 최상위 기준 (2026-10-04 확정)" />

            <div className="bg-neutral-900 text-white rounded-lg p-5 flex items-start gap-3">
                <Landmark className="h-5 w-5 shrink-0 mt-0.5" />
                <p className="text-sm leading-relaxed">
                    각 브랜드는 독립 사업이고, TenOne은 운영사(사업자)로만 드러난다. 브랜드끼리는 세계관 속에서 순환하며 시너지를 낸다.
                    tenone.biz에서만 TenOne이 대표로 나선다.
                </p>
            </div>

            <div>
                <h2 className="text-sm font-semibold text-neutral-900 mb-3">7원칙</h2>
                <div className="space-y-2">
                    {PRINCIPLES.map(p => (
                        <div key={p.n} className="bg-white border border-neutral-200 rounded-lg p-4 flex gap-3">
                            <span className="h-6 w-6 shrink-0 rounded bg-neutral-900 text-white text-xs font-bold flex items-center justify-center">{p.n}</span>
                            <div>
                                <p className="text-sm font-semibold text-neutral-900">{p.title}</p>
                                <p className="text-[11px] text-neutral-600 mt-0.5 leading-relaxed">{p.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div>
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-sm font-semibold text-neutral-900">브랜드 Tier (ums_sites.tier)</h2>
                    <Link href="/intra/ums/standard/sites" className="text-[11px] text-neutral-500 hover:text-neutral-800 flex items-center gap-1">
                        사이트 상태 전체 <ArrowRight className="h-3 w-3" />
                    </Link>
                </div>
                {loading ? (
                    <div className="flex items-center justify-center h-24"><Loader2 className="h-5 w-5 animate-spin text-neutral-400" /></div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {TIERS.map(t => {
                            const list = sites.filter(s => s.tier === t.key);
                            return (
                                <div key={t.key} className="bg-white border border-neutral-200 rounded-lg p-4">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs font-semibold text-neutral-900">{t.label}</span>
                                        <span className="text-[10px] text-neutral-400">{list.length}개</span>
                                    </div>
                                    <p className="text-[11px] text-neutral-500 mb-2">{t.desc}</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {list.length === 0 ? <span className="text-[11px] text-neutral-300">없음</span> : list.map(s => (
                                            <span key={s.slug} className="text-[11px] bg-neutral-100 px-2 py-0.5 rounded">
                                                {s.name}{s.hosting === "external" && <span className="text-amber-600"> · 외부 서버</span>}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
                {!loading && untiered.length > 0 && (
                    <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mt-3">
                        Tier 미지정 {untiered.length}개 — 실험/보관 중 지정 필요: {untiered.map(s => s.name).join(", ")}
                    </p>
                )}
                <p className="text-[11px] text-neutral-500 mt-3">
                    체계 변경 순서: ① ums_sites 갱신 → ② lib/domain-registry.ts CANONICAL_HOSTS 갱신 → ③ CLAUDE.md Tier 표 갱신.
                    통합·분리·이름 변경도 서비스 종료 절차·동의 기반 이전 원칙을 그대로 적용.
                </p>
            </div>
        </div>
    );
}
