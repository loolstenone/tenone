"use client";

/**
 * 팀 진단 (2026-10-13) — 기업용 팀 빌딩 서비스, 자동 리포트
 * 팀장(기업 회원)이 신청 → 초대 링크로 팀장·팀원이 동시에 팀 설문 (+ HIT 기본 성향 검사)
 * → 팀원 5명 이상이면 단합·문제점·인식 차이 리포트, 검사 완료 5명 이상이면 성향 구성(케미) — 팀장·참여 팀원이 함께 본다
 * '개인 HIT 결과는 본인만' 원칙의 예외 (사용자 결정) — 참여 동의, 묶음 통계만. ❌ 개인 응답·결과·이름
 */
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Users, Puzzle, MessagesSquare, Loader2, Copy, Check, ArrowRight, Plus } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { PageHero } from "@/features/hero/PageHero";
import { hitStageMinutes } from "@/lib/hit/stages";

interface Diagnosis {
    id: string; company_id: string; name: string; invite_code: string; status: string; created_at: string;
    participants: number; tested: number; surveyed: number; leaderJoined: boolean; ready: boolean;
}

const DELIVERABLES = [
    { icon: MessagesSquare, title: "말하기 어려웠던 것", desc: "신뢰·솔직함·역할·갈등·업무 부담·인정·팀장과의 관계를 팀원 평균으로 보고, 이름 없는 이야기로 바뀌었으면 하는 것을 듣습니다." },
    { icon: Puzzle, title: "팀장과 팀원의 인식 차이", desc: "팀장과 팀원이 같은 질문에 답해, 서로 보는 눈이 다른 곳과 문제점, 팀 빌딩 방법을 짚어 드립니다." },
    { icon: Users, title: "팀 케미", desc: "HIT 기본 성향 검사로 팀의 역할 분포, 비어 있는 역할, 일하는 방식이 쏠린 곳을 봅니다." },
];

const STEPS = [
    { title: "팀장이 신청", desc: "기업 회원인 팀장이 팀 이름을 정하면 초대 링크가 만들어집니다." },
    { title: "팀장·팀원 동시 설문", desc: `링크로 들어와 동의하고 같은 설문(약 5분)에 답합니다. HIT 기본 성향 검사(약 ${hitStageMinutes("a")}분)도 받으면 팀 케미까지 봅니다.` },
    { title: "자동 리포트", desc: "팀원 5명이 설문을 마치면 리포트가 열리고, 팀장과 참여한 팀원이 함께 봅니다. 참여자가 늘수록 자동으로 갱신됩니다." },
];

const PRINCIPLES = [
    { title: "누가 답했는지 모릅니다", desc: "팀 전체의 평균과 이름 없는 이야기(무작위 순서)만 보입니다. 팀장도 누가 어떻게 답했는지 볼 수 없습니다." },
    { title: "5명부터", desc: "결과가 특정인으로 짐작되지 않도록 팀원 5명 이상이 답했을 때만 리포트를 만듭니다." },
    { title: "참여는 자유, 평가엔 쓰지 않기", desc: "참여하지 않아도 불이익이 없어야 하고, 성향 검사는 맞고 틀림이 없으니 인사 평가에 쓰지 않습니다." },
];

export default function TeamDiagnosisPage() {
    const { isAuthenticated } = useAuth();
    const [data, setData] = useState<{ companies: { id: string; name: string }[]; items: Diagnosis[] } | null>(null);

    const load = useCallback(async () => {
        const res = await fetch("/api/hero/team");
        setData(res.ok ? await res.json() : { companies: [], items: [] });
    }, []);

    useEffect(() => { if (isAuthenticated) load(); }, [isAuthenticated, load]);

    const hasCompany = (data?.companies.length ?? 0) > 0;

    return (
        <div className="bg-white">
            <PageHero
                label="팀 진단"
                title={<>서로 말하기 어려웠던 것을<br />팀이 함께 봅니다</>}
                desc="팀장이 신청하면 팀원들과 동시에 설문하고 검사합니다. 팀의 케미와 단합, 문제점, 팀장과 팀원의 인식 차이를 자동 리포트로 보여 드리고 팀 빌딩 방법을 제안합니다."
                cta={hasCompany ? { label: "팀 진단 만들기", href: "#my-teams" } : { label: "기업 등록하기", href: "/hero/company/register" }}
                secondary={{ label: "기업 회원", href: "/hero/company" }}
            />

            {isAuthenticated && hasCompany && data && (
                <section id="my-teams" className="scroll-mt-24 border-b border-neutral-100 bg-neutral-50">
                    <div className="mx-auto max-w-5xl px-6 lg:px-8 py-14 space-y-5">
                        <h2 className="text-xl font-extrabold tracking-tight">우리 회사 팀 진단</h2>
                        <CreateForm companies={data.companies} onCreated={load} />
                        {data.items.length === 0 ? (
                            <p className="text-sm text-neutral-500">아직 만든 팀 진단이 없습니다.</p>
                        ) : (
                            <ul className="space-y-3">
                                {data.items.map(d => (
                                    <DiagnosisRow key={d.id} d={d} company={data.companies.find(c => c.id === d.company_id)?.name ?? ""} multi={data.companies.length > 1} />
                                ))}
                            </ul>
                        )}
                    </div>
                </section>
            )}

            <section className="border-b border-neutral-100">
                <div className="mx-auto max-w-5xl px-6 lg:px-8 py-20">
                    <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-10">리포트에 담기는 것</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        {DELIVERABLES.map(x => (
                            <div key={x.title} className="border border-neutral-200 rounded-xl p-6">
                                <x.icon className="h-6 w-6 text-neutral-400 mb-3" />
                                <p className="font-bold mb-2">{x.title}</p>
                                <p className="text-sm text-neutral-600 leading-relaxed break-keep">{x.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="border-b border-neutral-100 bg-neutral-50">
                <div className="mx-auto max-w-5xl px-6 lg:px-8 py-20">
                    <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-10">이렇게 진행됩니다</h2>
                    <ol className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        {STEPS.map((s, i) => (
                            <li key={s.title} className="bg-white border border-neutral-200 rounded-xl p-6">
                                <span className="w-7 h-7 rounded-full bg-neutral-900 text-white text-xs font-bold flex items-center justify-center mb-3">{i + 1}</span>
                                <p className="font-bold mb-2">{s.title}</p>
                                <p className="text-sm text-neutral-600 leading-relaxed break-keep">{s.desc}</p>
                            </li>
                        ))}
                    </ol>
                </div>
            </section>

            <section>
                <div className="mx-auto max-w-5xl px-6 lg:px-8 py-20">
                    <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-10">팀원의 정보는 이렇게 다룹니다</h2>
                    <ul className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        {PRINCIPLES.map(p => (
                            <li key={p.title} className="border border-neutral-200 rounded-xl p-6">
                                <p className="font-bold mb-2">{p.title}</p>
                                <p className="text-sm text-neutral-600 leading-relaxed break-keep">{p.desc}</p>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>
        </div>
    );
}

function CreateForm({ companies, onCreated }: { companies: { id: string; name: string }[]; onCreated: () => void }) {
    const [companyId, setCompanyId] = useState(companies[0]?.id ?? "");
    const [name, setName] = useState("");
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function create() {
        setBusy(true);
        setError(null);
        try {
            const res = await fetch("/api/hero/team", {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ companyId, name }),
            });
            const d = await res.json();
            if (!res.ok) throw new Error(d.error || "만들지 못했습니다.");
            setName("");
            onCreated();
        } catch (e) {
            setError(e instanceof Error ? e.message : "만들지 못했습니다.");
        } finally {
            setBusy(false);
        }
    }

    return (
        <div className="bg-white border border-neutral-200 rounded-xl p-5">
            <div className="flex flex-col sm:flex-row gap-2">
                {companies.length > 1 && (
                    <select value={companyId} onChange={e => setCompanyId(e.target.value)} className="px-3 py-2 text-sm border border-neutral-200 rounded-lg bg-white">
                        {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                )}
                <input value={name} onChange={e => setName(e.target.value)} maxLength={50} placeholder="팀 이름 (예: 마케팅팀)"
                    className="flex-1 px-3 py-2 text-sm border border-neutral-200 rounded-lg" />
                <button onClick={create} disabled={busy || !name.trim()}
                    className="inline-flex items-center justify-center gap-1.5 px-5 py-2 rounded-lg bg-[#E53935] text-white text-sm font-bold disabled:opacity-40">
                    {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} 만들기
                </button>
            </div>
            {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
        </div>
    );
}

function DiagnosisRow({ d, company, multi }: { d: Diagnosis; company: string; multi: boolean }) {
    const [copied, setCopied] = useState(false);

    async function copy() {
        const link = `${window.location.origin}/hero/team/join/${d.invite_code}`;
        try {
            await navigator.clipboard.writeText(link);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        } catch {
            window.prompt("초대 링크를 복사해 팀원에게 보내 주세요", link);
        }
    }

    return (
        <li className="bg-white border border-neutral-200 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1 min-w-0">
                <p className="font-bold">{d.name}{multi && <span className="ml-2 text-xs font-normal text-neutral-500">{company}</span>}</p>
                <p className="text-xs text-neutral-500 mt-1">
                    참여 {d.participants}명 · 팀원 설문 {d.surveyed}명 · 검사 완료 {d.tested}명{d.status !== "open" && " · 참여 마감"}
                    {!d.ready && ` · 리포트까지 팀원 ${Math.max(0, 5 - d.surveyed)}명 더`}
                </p>
            </div>
            <div className="flex flex-wrap gap-2">
                {d.status === "open" && !d.leaderJoined && (
                    <Link href={`/hero/team/join/${d.invite_code}`} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#E53935] text-[#E53935] text-sm font-semibold hover:bg-red-50">
                        팀장 설문하기
                    </Link>
                )}
                {d.status === "open" && (
                    <button onClick={copy} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-neutral-200 text-sm hover:bg-neutral-50">
                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} {copied ? "복사됨" : "초대 링크"}
                    </button>
                )}
                <Link href={`/hero/team/${d.id}`} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-neutral-900 text-white text-sm font-semibold">
                    {d.ready ? "리포트" : "현황"} <ArrowRight className="h-4 w-4" />
                </Link>
            </div>
        </li>
    );
}
