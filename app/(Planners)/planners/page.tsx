import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ProgramBoard } from "@/features/programs/ProgramBoard";
import { PROGRAM_THEMES } from "@/features/programs/ProgramTheme";

// 첫 화면 문구는 사용자 확정 (Planners_Dev_Guide_v1 '히어로 카피는 확정') — 바꾸지 않는다
export const metadata: Metadata = {
    title: "우리는 모두 기획자다",
    description: "인공지능 시대, 더욱 기획자가 되어야 한다. AI가 실행을 대신할수록 방향을 정하는 힘이 곧 경쟁력이다. 기획자의 플래너·템플릿·AI 플래너·실전 프로젝트.",
};

// 사이트 세 겹: 정체성 · 도구 · 훈련 (app/(Planners)/CLAUDE.md '이전 계획')
const PILLARS = [
    {
        label: "정체성",
        title: "기획하다",
        desc: "기획은 꾀하는 것이고, 계획은 세우는 것이다. 이상과 현실의 차이를 문제로 보고 일이 되게 하는 방법을 찾는 사람, 그것이 기획자다.",
        href: "/planners/about",
        cta: "기획이란",
    },
    {
        label: "도구",
        title: "손으로, 그리고 AI로",
        desc: "아이패드·갤럭시 탭에서 쓰는 PAD 플래너와 100여 종의 노트·프레임워크 템플릿. 같은 구조를 AI 플래너로도 이어 씁니다.",
        href: "/planners/planner",
        cta: "플래너 보기",
    },
    {
        label: "훈련",
        title: "실전 프로젝트",
        desc: "팀을 꾸려 실제 과제를 기획합니다. 결과가 발표되면 참여 이력을 확인서로 남기고, 누구나 고유 코드로 진위를 확인할 수 있습니다.",
        href: "/planners/projects",
        cta: "프로젝트 보기",
    },
];

// Planner's Planner 작동 방식 — 구글 사이트 planners-planner 원문 (Plan · Do · See)
const PDS = [
    { step: "Plan", desc: "현실과 이상의 차이를 극복하기 위한 목표를 세운다" },
    { step: "Do", desc: "목표를 이루기 위해 치밀하게 실행한다" },
    { step: "See", desc: "꾸준히 점검해 목표와 실행에 다시 반영한다" },
];

export default function PlannersHome() {
    // 흰 배경에서 읽히는 진한 틸 (카드 버튼 대비)
    const t = { ...PROGRAM_THEMES.planners, accent: "#0F766E" };
    return (
        <>
            <section className="bg-[#134E4A] text-white">
                <div className="mx-auto max-w-[980px] px-4 py-20 md:px-[15px] md:py-28">
                    <h1 className="text-4xl font-black leading-tight md:text-6xl">우리는 모두 기획자다</h1>
                    <p className="mt-3 text-2xl font-bold text-teal-200 md:text-3xl">자기 인생에서만큼은</p>
                    <p className="mt-10 max-w-2xl break-keep text-lg leading-relaxed text-teal-50">
                        인공지능 시대, 더욱 기획자가 되어야 한다.<br />
                        AI가 실행을 대신할수록, 방향을 정하는 힘이 곧 경쟁력이다.
                    </p>
                    <div className="mt-10 flex flex-wrap gap-3">
                        <Link href="/planners/about" className="inline-flex items-center gap-2 bg-[#14B8A6] px-6 py-3 font-bold text-[#042F2E] hover:bg-teal-300">
                            기획자가 되는 법 <ArrowRight className="h-4 w-4" />
                        </Link>
                        <Link href="/planners/planner" className="inline-flex items-center gap-2 border border-white/30 px-6 py-3 font-bold text-white hover:bg-white/10">
                            플래너 받기
                        </Link>
                    </div>
                </div>
            </section>

            <section className="mx-auto max-w-[980px] px-4 py-16 md:px-[15px] md:py-20">
                <div className="grid gap-6 md:grid-cols-3">
                    {PILLARS.map((p) => (
                        <div key={p.label} className="flex flex-col border border-neutral-200 p-6">
                            <p className="text-sm font-bold text-[#0F766E]">{p.label}</p>
                            <h2 className="mt-2 text-xl font-bold">{p.title}</h2>
                            <p className="mt-3 flex-1 break-keep text-sm leading-relaxed text-neutral-600">{p.desc}</p>
                            <Link href={p.href} className="mt-5 inline-flex items-center gap-1 text-sm font-bold text-[#0F766E] hover:underline">
                                {p.cta} <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>
                    ))}
                </div>
            </section>

            <section className="bg-neutral-50">
                <div className="mx-auto max-w-[980px] px-4 py-16 md:px-[15px] md:py-20">
                    <h2 className="text-[32px] font-bold">모든 일의 방식, Plan · Do · See</h2>
                    <p className="mt-3 max-w-2xl break-keep text-neutral-600">
                        플래너&apos;스 플래너는 일의 기본 방식인 P-D-S를 연간·월간·주간·일간, 그리고 프로젝트 단위로 계속 반복하도록 짜여 있습니다.
                    </p>
                    <ol className="mt-10 grid gap-px border border-neutral-200 bg-neutral-200 md:grid-cols-3">
                        {PDS.map((s) => (
                            <li key={s.step} className="bg-white p-6">
                                <p className="text-2xl font-black text-[#0F766E]">{s.step}</p>
                                <p className="mt-2 break-keep text-neutral-700">{s.desc}</p>
                            </li>
                        ))}
                    </ol>
                </div>
            </section>

            <section className="mx-auto max-w-[980px] px-4 py-16 md:px-[15px] md:py-20">
                <h2 className="text-[32px] font-bold">지금 모집 중인 프로젝트</h2>
                <div className="mt-8">
                    <ProgramBoard theme={t} brands={["planners"]} dark={false} emptyText="지금 모집 중인 프로젝트가 없습니다. 새 프로젝트가 열리면 이곳에 안내합니다." />
                </div>
                <div className="mt-8">
                    <Link href="/planners/projects" className="inline-flex items-center gap-2 font-bold text-[#0F766E] hover:underline">
                        전체 프로젝트 보기 <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>
            </section>
        </>
    );
}
