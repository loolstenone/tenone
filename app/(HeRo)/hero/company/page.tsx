"use client";

/**
 * 기업 허브 (2026-10-13 확장)
 * - 첫 화면 PageHero → (로그인) 내 기업·승인 대기 → 하는 일 4단계 → 4방향으로 보는 법 → 인재 정보 보호 → 자주 묻는 질문
 * - 비로그인도 소개는 볼 수 있다. 등록·설문·공고 작성은 각 페이지가 로그인 확인
 * - 직업소개 표현 금지: '연결·매칭해 드립니다' 대신 '분석해 알려 드립니다' · 가격·요금 문구 금지
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import {
    Building2, Plus, Loader2, ArrowRight, Clock, CheckCircle2, FileText, Compass,
    BarChart3, ShieldCheck, Brain, Target, ChevronDown,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { createClient } from "@/lib/supabase/client";
import MatchingInbox from "@/features/hero/MatchingInbox";
import { PageHero } from "@/features/hero/PageHero";

const HERO_RED = "#E53935";

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

/* ── 기업 허브에서 하는 일 — 실제 화면이 있는 것만 ── */
const STEPS = [
    {
        icon: Building2,
        title: "기업 등록",
        desc: "기업명·산업·규모와 담당자 정보를 등록합니다. 등록하면 바로 기업 고민 설문과 채용 공고를 쓸 수 있습니다.",
        meta: "약 3분",
    },
    {
        icon: Compass,
        title: "기업 고민 설문",
        desc: "조직이 지금 풀어야 할 고민과 어떤 사람이 필요한지를 정리합니다. 채용 공고에 다 담기 어려운 속사정을 적는 곳입니다.",
        meta: "22문항 · 약 7~8분",
    },
    {
        icon: FileText,
        title: "채용 공고",
        desc: "맡을 일, 필요한 역량, 일하는 방식과 조건을 항목별로 씁니다. 같은 틀로 쓰기 때문에 비교와 분석이 쉬워집니다.",
        meta: "7개 항목 · 500~800자",
    },
    {
        icon: BarChart3,
        title: "인재 풀 분석",
        desc: "두 문서를 바탕으로, 조건에 맞는 인재 풀이 어떤 성향·역량 분포를 보이는지 분석해 알려 드립니다.",
        meta: "익명 통계",
    },
];

/* ── 4방향으로 보는 법 — 기업 문서 2 × 인재 문서 2 ── */
const TETRAD = {
    company: [
        { icon: Compass, title: "기업 고민 설문", desc: "조직의 상황과 원하는 사람" },
        { icon: FileText, title: "채용 공고", desc: "맡을 일과 조건" },
    ],
    talent: [
        { icon: Brain, title: "HIT 검사", desc: "성향·역량·생애주기" },
        { icon: Target, title: "희망 직무 설문", desc: "하고 싶은 일과 조건" },
    ],
};

const FAQ = [
    {
        q: "누가 기업 허브를 쓸 수 있나요?",
        a: "기업 대표나 채용 담당자라면 회원 가입 후 기업을 등록할 수 있습니다. 등록하면 바로 기업 고민 설문과 채용 공고를 쓸 수 있습니다.",
    },
    {
        q: "써치 라이트와는 무엇이 다른가요?",
        a: "써치 라이트는 기업 고민 설문을 소개하고 바로 써 볼 수 있는 곳입니다. 기업 허브는 등록한 기업의 설문·채용 공고·분석 현황을 한곳에서 관리하는 곳입니다.",
    },
    {
        q: "한 회사에 담당자가 여러 명이어도 되나요?",
        a: "됩니다. 이미 등록된 기업 이름으로 신청하면 담당자 추가 요청이 되고, 기업 대표가 승인하면 함께 관리할 수 있습니다.",
    },
    {
        q: "인재의 이름이나 연락처를 볼 수 있나요?",
        a: "아니요. 기업 허브에서 보는 것은 조건에 맞는 인재 풀의 익명 분석입니다. 인재 개인의 정보는 본인이 동의하지 않는 한 기업에 공개하지 않습니다.",
    },
    {
        q: "작성한 내용은 어디에 쓰이나요?",
        a: "기업이 쓴 설문과 채용 공고는 인재 풀 분석에만 씁니다. 다른 기업에 공개하지 않습니다.",
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
                label="기업 허브"
                title={<>어떤 사람이 필요한지 정리하면<br />맞는 인재가 보입니다</>}
                desc="기업 고민 설문에 조직의 상황과 필요한 사람을, 채용 공고에 맡을 일을 적어 주세요. HeRo가 조건에 맞는 인재 풀의 현황을 분석해 알려 드립니다."
                cta={hasCompany
                    ? { label: "기업 고민 설문 작성", href: `/hero/search-light/tih?company=${active[0].hero_companies?.id ?? ""}` }
                    : { label: "기업 등록하기", href: "/hero/company/register" }}
                secondary={{ label: "써치 라이트 알아보기", href: "/hero/search-light" }}
            />

            {/* ── 내 기업 (로그인 회원) ── */}
            {isAuthenticated && (
                <section className="border-b border-neutral-100 bg-neutral-50">
                    <div className="mx-auto max-w-5xl px-6 lg:px-8 py-14">
                        <h2 className="text-xl font-extrabold tracking-tight mb-6">내 기업</h2>
                        {isLoading || loading ? (
                            <div className="py-12 flex items-center justify-center"><Loader2 className="h-5 w-5 animate-spin text-neutral-300" /></div>
                        ) : (
                            <div className="space-y-6">
                                {active.map(c => (
                                    <div key={c.id} className="bg-white border border-neutral-200 rounded-xl p-6">
                                        <div className="flex items-start justify-between mb-4">
                                            <div>
                                                <h3 className="font-bold text-lg">{c.hero_companies?.company_name}</h3>
                                                <p className="text-xs text-neutral-500">
                                                    {c.hero_companies?.industry || "-"} · {c.hero_companies?.size_category || "-"}
                                                    {c.position_title && ` · ${c.position_title}`}
                                                </p>
                                            </div>
                                            <span className="text-[11px] px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600 font-medium flex items-center gap-1">
                                                <CheckCircle2 className="h-3 w-3" /> {roleLabel(c.role)}
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                                            <HubLink href={`/hero/search-light/tih?company=${c.hero_companies?.id}`} icon={Compass} label="기업 고민 설문 작성" />
                                            <HubLink href={`/hero/company/${c.hero_companies?.id}/jd`} icon={FileText} label="채용 공고 관리" />
                                        </div>
                                        {user?.id && c.hero_companies?.id && (
                                            <div className="pt-4 border-t border-neutral-100">
                                                <p className="text-xs font-bold text-neutral-500 mb-2">분석 현황</p>
                                                <MatchingInbox side="company" memberId={user.id} companyId={c.hero_companies.id} accentColor={HERO_RED} />
                                            </div>
                                        )}
                                    </div>
                                ))}

                                {pending.map(c => (
                                    <div key={c.id} className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-semibold">{c.hero_companies?.company_name}</p>
                                            <p className="text-xs text-amber-700">기업 대표의 승인을 기다리고 있습니다</p>
                                        </div>
                                        <Clock className="h-4 w-4 text-amber-600" />
                                    </div>
                                ))}

                                <Link href="/hero/company/register"
                                    className="flex items-center justify-between p-5 bg-white border-2 border-dashed border-neutral-300 hover:border-neutral-500 rounded-xl transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center">
                                            <Plus className="h-5 w-5 text-neutral-600" />
                                        </div>
                                        <div>
                                            <p className="font-semibold">{myCompanies.length > 0 ? "다른 기업 등록" : "기업 등록"}</p>
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

            {/* ── 기업 허브에서 하는 일 ── */}
            <section className="border-b border-neutral-100">
                <div className="mx-auto max-w-5xl px-6 lg:px-8 py-20">
                    <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-3">기업 허브에서 하는 일</h2>
                    <p className="text-neutral-600 mb-10 break-keep">네 단계로 진행합니다. 두 문서를 모두 써 주시면 더 정확하게 분석할 수 있습니다.</p>
                    <ol className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {STEPS.map((s, i) => (
                            <li key={s.title} className="border border-neutral-200 rounded-xl p-6">
                                <div className="flex items-center gap-3 mb-3">
                                    <span className="w-7 h-7 rounded-full bg-neutral-900 text-white text-xs font-bold flex items-center justify-center">{i + 1}</span>
                                    <s.icon className="h-5 w-5 text-neutral-400" />
                                    <h3 className="font-bold text-lg">{s.title}</h3>
                                </div>
                                <p className="text-sm text-neutral-600 leading-relaxed break-keep mb-3">{s.desc}</p>
                                <span className="inline-block text-xs px-2.5 py-1 rounded-full bg-neutral-100 text-neutral-600">{s.meta}</span>
                            </li>
                        ))}
                    </ol>
                </div>
            </section>

            {/* ── 4방향으로 봅니다 ── */}
            <section className="border-b border-neutral-100 bg-neutral-50">
                <div className="mx-auto max-w-5xl px-6 lg:px-8 py-20">
                    <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-3">4방향으로 봅니다</h2>
                    <p className="text-neutral-600 mb-10 break-keep max-w-2xl">
                        채용 공고 한 장으로는 조직이 정말 원하는 사람이 다 드러나지 않습니다.
                        기업이 쓴 두 문서와 인재가 쓴 두 문서를 마주 놓고, 겉으로 드러난 조건과 속에 있는 바람을 함께 봅니다.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 items-center">
                        <TetradSide title="기업이 쓰는 것" items={TETRAD.company} />
                        <div className="flex md:flex-col items-center justify-center gap-1 text-neutral-400 text-xs font-semibold py-2">
                            <span className="hidden md:block">↔</span>
                            <span>마주 놓고 비교</span>
                        </div>
                        <TetradSide title="인재가 쓰는 것" items={TETRAD.talent} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 text-sm text-neutral-600">
                        <p className="bg-white border border-neutral-200 rounded-lg p-4 break-keep"><strong className="text-neutral-900">속마음끼리</strong> — 기업 고민 설문 ↔ HIT 검사: 조직이 바라는 사람과 인재의 성향·역량</p>
                        <p className="bg-white border border-neutral-200 rounded-lg p-4 break-keep"><strong className="text-neutral-900">조건끼리</strong> — 채용 공고 ↔ 희망 직무 설문: 맡을 일·조건과 하고 싶은 일·조건</p>
                    </div>
                </div>
            </section>

            {/* ── 인재 정보 보호 ── */}
            <section className="border-b border-neutral-100">
                <div className="mx-auto max-w-5xl px-6 lg:px-8 py-20">
                    <div className="flex items-center gap-2 mb-3">
                        <ShieldCheck className="h-6 w-6 text-neutral-400" />
                        <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">인재 정보는 이렇게 다룹니다</h2>
                    </div>
                    <ul className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-5">
                        {[
                            { t: "익명 분석", d: "기업에 보여 드리는 것은 인재 풀의 성향·역량 분포입니다. 개인을 알아볼 수 있는 정보는 넣지 않습니다." },
                            { t: "본인 동의 우선", d: "인재 개인의 정보는 본인이 동의한 범위 안에서만 다룹니다. 동의 없이 기업에 공개하지 않습니다." },
                            { t: "목적 밖 사용 금지", d: "기업이 쓴 설문과 채용 공고는 인재 풀 분석에만 쓰고, 다른 기업에 공개하지 않습니다." },
                        ].map(x => (
                            <li key={x.t} className="border border-neutral-200 rounded-xl p-6">
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
                    <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-8">자주 묻는 질문</h2>
                    <div className="divide-y divide-neutral-200 border-y border-neutral-200 bg-white">
                        {FAQ.map(f => (
                            <details key={f.q} className="group px-5 py-4">
                                <summary className="flex items-center justify-between cursor-pointer list-none font-semibold">
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
                    <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-3 break-keep">필요한 사람, 먼저 정리해 보세요</h2>
                    <p className="text-neutral-600 mb-8">기업 등록부터 시작합니다.</p>
                    <Link href={hasCompany ? `/hero/company/${active[0].hero_companies?.id ?? ""}/jd` : "/hero/company/register"}
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-neutral-300 text-neutral-800 text-sm font-semibold hover:border-neutral-500 transition-colors">
                        {hasCompany ? "채용 공고 관리" : "기업 등록하기"} <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>
            </section>
        </div>
    );
}

function HubLink({ href, icon: Icon, label }: { href: string; icon: typeof Compass; label: string }) {
    return (
        <Link href={href} className="flex items-center justify-between p-3 bg-neutral-50 hover:bg-neutral-100 rounded-lg transition-colors">
            <span className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-neutral-500" />
                <span className="text-sm font-medium">{label}</span>
            </span>
            <ArrowRight className="h-3.5 w-3.5 text-neutral-400" />
        </Link>
    );
}

function TetradSide({ title, items }: { title: string; items: { icon: typeof Compass; title: string; desc: string }[] }) {
    return (
        <div className="bg-white border border-neutral-200 rounded-xl p-5">
            <p className="text-xs font-bold text-neutral-500 mb-3">{title}</p>
            <div className="space-y-3">
                {items.map(it => (
                    <div key={it.title} className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-neutral-100 flex items-center justify-center shrink-0">
                            <it.icon className="h-4 w-4 text-neutral-500" />
                        </div>
                        <div>
                            <p className="font-semibold text-sm">{it.title}</p>
                            <p className="text-xs text-neutral-500">{it.desc}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
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
