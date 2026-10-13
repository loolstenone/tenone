"use client";

/**
 * 기업 회원 (헤더 오른쪽 기업 서비스 첫 메뉴, 2026-10-13 — 옛 이름 기업 허브·인재 찾기)
 * - 첫 화면 PageHero → (로그인) 내 기업(좋은 사람 찾기·팀 진단·채용 공고·기업 고민 설문) → 기업 서비스 4가지 → 인재 정보 보호 → 자주 묻는 질문
 * - 좋은 사람 찾기 = 써치 라이트 기업 쪽 (/hero/search-light/people) · 유료직업소개사업 등록 전제 (발송 스위치 HERO_OFFERS_LIVE)
 * - 비로그인도 소개는 볼 수 있다 · 가격·요금 문구 금지
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { Building2, Plus, ArrowRight, Clock, CheckCircle2, FileText, Compass, ShieldCheck, ChevronDown, Users, Send } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { createClient } from "@/lib/supabase/client";
import { PageHero } from "@/features/hero/PageHero";

interface MyCompany {
    id: string;
    role: string;
    status: string;
    position_title: string | null;
    joined_at: string | null;
    invited_at: string;
    hero_companies: {
        id: string;
        company_name: string;
        industry: string | null;
        size_category: string | null;
    } | null;
}

/* ── 기업 회원이 쓰는 서비스 — 실제 화면이 있는 것만 ── */
const STEPS = [
    {
        icon: Building2,
        title: "기업 등록",
        desc: "기업명·산업·규모와 담당자 정보를 등록합니다. 등록하면 아래 서비스를 바로 쓸 수 있습니다.",
        meta: "약 3분",
    },
    {
        icon: Users,
        title: "좋은 사람 찾기 · 써치 라이트",
        desc: "원하는 인재상을 고르면 조건에 맞는 인재가 몇 명인지, 원하는 성향의 사람이 어느 정도 있는지 인재 풀 리포트로 바로 보입니다.",
        meta: "자동 리포트",
    },
    {
        icon: Send,
        title: "면접·인터뷰 제안",
        desc: "제안 내용을 쓰면 HeRo 운영자가 확인한 뒤 조건에 맞는 인재에게 알림으로 보냅니다. 응한 인재의 이름·연락처·이력서를 받습니다.",
        meta: "응답일부터 180일 열람",
    },
    {
        icon: Compass,
        title: "팀 진단",
        desc: "팀장이 신청하면 팀원과 동시에 설문·검사해, 팀의 케미·단합·문제점과 팀장과 팀원의 인식 차이를 자동 리포트로 보여 드립니다.",
        meta: "자동 리포트",
    },
];

const FAQ = [
    {
        q: "누가 기업 회원이 될 수 있나요?",
        a: "기업 대표나 채용 담당자라면 회원 가입 후 기업을 등록할 수 있습니다. 등록하면 바로 기업 고민 설문과 채용 공고를 쓸 수 있습니다.",
    },
    {
        q: "기업 고민 설문과 채용 공고는 꼭 써야 하나요?",
        a: "좋은 사람 찾기와 제안은 없어도 됩니다. 다만 채용 공고를 제안에 함께 붙이면 인재가 맡을 일을 더 정확히 알고 응할 수 있고, 기업 고민 설문은 HeRo가 기업에 맞는 사람을 이해하는 데 쓰입니다.",
    },
    {
        q: "제안은 몇 명에게 가나요?",
        a: "제안 요청 시점이 아니라 운영자 확인이 끝난 시점에, 고른 조건에 맞고 '제안 받기'를 켠 인재 전원에게 갑니다. 응할지는 인재가 정합니다.",
    },
    {
        q: "한 회사에 담당자가 여러 명이어도 되나요?",
        a: "됩니다. 이미 등록된 기업 이름으로 신청하면 담당자 추가 요청이 되고, 기업 대표가 승인하면 함께 관리할 수 있습니다.",
    },
    {
        q: "인재의 이름이나 연락처를 볼 수 있나요?",
        a: "제안에 응한 인재만 볼 수 있습니다. 인재가 응하면서 이 기업에 정보 제공을 동의해야 이름·연락처·이력서가 보이고, 응답일로부터 180일이 지나면 다시 보이지 않습니다. 응하지 않은 인재는 인원수만 보입니다.",
    },
    {
        q: "작성한 내용은 어디에 쓰이나요?",
        a: "제안 내용은 조건에 맞는 인재에게만 보이고, 기업 고민 설문과 채용 공고는 HeRo의 검토와 제안에만 씁니다. 다른 기업에 공개하지 않습니다.",
    },
];

export default function HeroCompanyHubPage() {
    const { user, isLoading, isAuthenticated } = useAuth();
    const [myCompanies, setMyCompanies] = useState<MyCompany[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user?.id) {
            setLoading(false);
            return;
        }
        createClient()
            .from("hero_company_members")
            .select("id, role, status, position_title, joined_at, invited_at, hero_companies(id, company_name, industry, size_category)")
            .eq("member_id", user.id)
            .order("invited_at", { ascending: false })
            .then((res: { data: unknown[] | null }) => {
                setMyCompanies((res.data ?? []) as unknown as MyCompany[]);
                setLoading(false);
            });
    }, [user?.id]);

    const active = myCompanies.filter(c => c.status === "active");
    const pending = myCompanies.filter(c => c.status === "pending");
    const hasCompany = active.length > 0;

    return (
        <div className="bg-white">
            <PageHero
                label="기업 회원"
                title={<>좋은 사람을 찾고,<br />지금의 팀을 이해합니다</>}
                desc="기업을 등록하면 써치 라이트로 원하는 인재상에 맞는 HeRo 인재를 찾고, 팀 진단으로 우리 팀의 역할 분포와 빈자리를 확인할 수 있습니다."
                cta={hasCompany
                    ? { label: "좋은 사람 찾기", href: `/hero/search-light/people?company=${active[0].hero_companies?.id ?? ""}` }
                    : { label: "기업 등록하기", href: "/hero/company/register" }}
                secondary={{ label: "팀 진단 알아보기", href: "/hero/team" }}
            />

            {/* ── 내 기업 (로그인 회원) ── */}
            {isAuthenticated && (
                <section className="border-b border-neutral-100 bg-neutral-50">
                    <div className="mx-auto max-w-5xl px-6 lg:px-8 py-14">
                        <h2 className="text-xl font-bold tracking-tight mb-6">내 기업</h2>
                        {isLoading || loading ? (
                            <div className="py-12 flex items-center justify-center"><span className="text-sm text-mute">불러오는 중</span></div>
                        ) : (
                            <div className="space-y-6">
                                {active.map(c => (
                                    <div key={c.id} className="bg-white border border-neutral-200 rounded-xs p-6">
                                        <div className="flex items-start justify-between mb-4">
                                            <div>
                                                <h3 className="font-bold text-lg">{c.hero_companies?.company_name}</h3>
                                                <p className="text-xs text-neutral-500">
                                                    {c.hero_companies?.industry || "-"} · {c.hero_companies?.size_category || "-"}
                                                    {c.position_title && ` · ${c.position_title}`}
                                                </p>
                                            </div>
                                            <span className="text-[11px] px-2 py-0.5 rounded-none bg-neutral-100 text-neutral-600 font-normal flex items-center gap-1">
                                                <CheckCircle2 className="h-3 w-3" /> {roleLabel(c.role)}
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                            <HubLink href={`/hero/search-light/people?company=${c.hero_companies?.id}`} icon={Users} label="좋은 사람 찾기 · 보낸 제안" />
                                            <HubLink href="/hero/team" icon={Send} label="팀 진단" />
                                            <HubLink href={`/hero/company/${c.hero_companies?.id}/jd`} icon={FileText} label="채용 공고 관리" />
                                            <HubLink href={`/hero/search-light/tih?company=${c.hero_companies?.id}`} icon={Compass} label="기업 고민 설문" />
                                        </div>
                                    </div>
                                ))}

                                {pending.map(c => (
                                    <div key={c.id} className="bg-neutral-50 border border-neutral-200 rounded-xs p-4 flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-bold">{c.hero_companies?.company_name}</p>
                                            <p className="text-xs text-neutral-700">기업 대표의 승인을 기다리고 있습니다</p>
                                        </div>
                                        <Clock className="h-4 w-4 text-neutral-600" />
                                    </div>
                                ))}

                                <Link href="/hero/company/register"
                                    className="flex items-center justify-between p-5 bg-white border-2 border-dashed border-neutral-300 hover:border-neutral-500 rounded-xs transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xs bg-neutral-100 flex items-center justify-center">
                                            <Plus className="h-5 w-5 text-neutral-600" />
                                        </div>
                                        <div>
                                            <p className="font-bold">{myCompanies.length > 0 ? "다른 기업 등록" : "기업 등록"}</p>
                                            <p className="text-xs text-neutral-500">우리 회사를 등록하고 필요한 사람을 정리해 보세요</p>
                                        </div>
                                    </div>
                                    <ArrowRight className="h-4 w-4 text-neutral-400" />
                                </Link>
                            </div>
                        )}
                    </div>
                </section>
            )}

            {/* ── 진행 순서 ── */}
            <section className="border-b border-neutral-100">
                <div className="mx-auto max-w-5xl px-6 lg:px-8 py-20">
                    <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-3">기업 회원이 쓰는 서비스</h2>
                    <p className="text-neutral-600 mb-10 break-keep">리포트는 모두 묶음 통계입니다. 개인의 검사 내용은 기업에 가지 않습니다.</p>
                    <ol className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {STEPS.map((s, i) => (
                            <li key={s.title} className="border border-neutral-200 rounded-xs p-6">
                                <div className="flex items-center gap-3 mb-3">
                                    <span className="w-7 h-7 rounded-none bg-neutral-900 text-white text-xs font-bold flex items-center justify-center">{i + 1}</span>
                                    <s.icon className="h-5 w-5 text-neutral-400" />
                                    <h3 className="font-bold text-lg">{s.title}</h3>
                                </div>
                                <p className="text-sm text-neutral-600 leading-relaxed break-keep mb-3">{s.desc}</p>
                                <span className="inline-block text-xs px-2.5 py-1 rounded-none bg-neutral-100 text-neutral-600">{s.meta}</span>
                            </li>
                        ))}
                    </ol>
                </div>
            </section>


            {/* ── 인재 정보 보호 ── */}
            <section className="border-b border-neutral-100">
                <div className="mx-auto max-w-5xl px-6 lg:px-8 py-20">
                    <div className="flex items-center gap-2 mb-3">
                        <ShieldCheck className="h-6 w-6 text-neutral-400" />
                        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">인재 정보는 이렇게 다룹니다</h2>
                    </div>
                    <ul className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-5">
                        {[
                            { t: "인원수는 익명으로", d: "조건에 맞는 인재는 숫자로만 보여 드리고, 5명 미만이면 '5명 미만'으로만 표시합니다. 조건을 좁혀 특정인을 알아낼 수 없습니다." },
                            { t: "응한 인재만, 동의한 만큼", d: "인재가 제안에 응하면서 이 기업에 정보 제공을 동의해야 이름·연락처·이력서가 전달됩니다. HIT 검사 내용은 어떤 경우에도 보내지 않습니다." },
                            { t: "기한이 지나면 닫힙니다", d: "응한 인재의 정보는 응답일로부터 180일 동안만 볼 수 있습니다. 인재가 응답을 철회하면 그 즉시 볼 수 없습니다." },
                        ].map(x => (
                            <li key={x.t} className="border border-neutral-200 rounded-xs p-6">
                                <p className="font-bold mb-2">{x.t}</p>
                                <p className="text-sm text-neutral-600 leading-relaxed break-keep">{x.d}</p>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>

            {/* ── 자주 묻는 질문 ── */}
            <section className="border-b border-neutral-100 bg-neutral-50">
                <div className="mx-auto max-w-3xl px-6 lg:px-8 py-20">
                    <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-8">자주 묻는 질문</h2>
                    <div className="divide-y divide-neutral-200 border-y border-neutral-200 bg-white">
                        {FAQ.map(f => (
                            <details key={f.q} className="group px-5 py-4">
                                <summary className="flex items-center justify-between cursor-pointer list-none font-bold">
                                    {f.q}
                                    <ChevronDown className="h-4 w-4 text-neutral-400 transition-transform group-open:rotate-180" />
                                </summary>
                                <p className="mt-3 text-sm text-neutral-600 leading-relaxed break-keep">{f.a}</p>
                            </details>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── 마무리 ── */}
            <section>
                <div className="mx-auto max-w-5xl px-6 lg:px-8 py-20 text-center">
                    <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-3 break-keep">우리 회사에 맞는 인재, 몇 명인지 확인해 보세요</h2>
                    <p className="text-neutral-600 mb-8">{hasCompany ? "조건만 고르면 바로 보입니다." : "기업 등록부터 시작합니다."}</p>
                    <Link href={hasCompany ? `/hero/search-light/people?company=${active[0].hero_companies?.id ?? ""}` : "/hero/company/register"}
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-none border border-neutral-300 text-neutral-800 text-sm font-bold hover:border-neutral-500 transition-colors">
                        {hasCompany ? "좋은 사람 찾기" : "기업 등록하기"} <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>
            </section>
        </div>
    );
}

function HubLink({ href, icon: Icon, label }: { href: string; icon: typeof Compass; label: string }) {
    return (
        <Link href={href} className="flex items-center justify-between p-3 bg-neutral-50 hover:bg-neutral-100 rounded-xs transition-colors">
            <span className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-neutral-500" />
                <span className="text-sm font-normal">{label}</span>
            </span>
            <ArrowRight className="h-3.5 w-3.5 text-neutral-400" />
        </Link>
    );
}


function roleLabel(role: string) {
    switch (role) {
        case "representative": return "대표";
        case "hiring_manager": return "채용 담당";
        case "viewer": return "조회";
        default: return role;
    }
}
