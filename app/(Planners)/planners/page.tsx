import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Compass, Hammer, BadgeCheck } from "lucide-react";
import { ProgramBoard } from "@/features/programs/ProgramBoard";
import { PROGRAM_THEMES } from "@/features/programs/ProgramTheme";

export const metadata: Metadata = {
    title: "우리는 모두 기획자다",
    description: "기획은 꾀하는 것이고, 계획은 세우는 것이다. Why를 찾고 What을 만드는 사람, 그것이 기획자다. 실전 전략 기획 훈련과 실전 프로젝트.",
};

const WHAT = [
    { icon: Compass, title: "실전 전략 기획 훈련", desc: "이론이 아니라 실제 과제로 배웁니다. 문제의 Why를 찾고, 해법의 What을 만드는 기획의 기본기를 훈련합니다." },
    { icon: Hammer, title: "실전 프로젝트", desc: "팀을 꾸려 실제 과제를 기획합니다. 선발된 참가자는 팀 안에서 역할을 맡아 결과물을 완성합니다." },
    { icon: BadgeCheck, title: "참여 확인서", desc: "결과가 발표되면 참여 이력을 확인서로 남깁니다. 고유 코드로 누구나 진위를 확인할 수 있습니다." },
];

export default function PlannersHome() {
    // 흰 배경에서 읽히는 진한 틸 (카드 버튼 대비)
    const t = { ...PROGRAM_THEMES.planners, accent: "#0F766E" };
    return (
        <>
            <section className="bg-[#134E4A] text-white">
                <div className="mx-auto max-w-[980px] px-4 py-20 md:px-[15px] md:py-28">
                    <p className="text-sm font-bold tracking-widest text-teal-300">Planner&apos;s</p>
                    <h1 className="mt-4 text-4xl font-black leading-tight md:text-6xl">우리는 모두 기획자다</h1>
                    <p className="mt-8 max-w-2xl break-keep text-lg leading-relaxed text-teal-50">
                        기획은 꾀하는 것이고, 계획은 세우는 것이다.<br />
                        Why를 찾고 What을 만드는 사람, 그것이 기획자다.
                    </p>
                    <div className="mt-10 flex flex-wrap gap-3">
                        <Link href="/planners/projects" className="inline-flex items-center gap-2 bg-[#14B8A6] px-6 py-3 font-bold text-[#042F2E] hover:bg-teal-300">
                            훈련 프로젝트 보기 <ArrowRight className="h-4 w-4" />
                        </Link>
                        <Link href="/planners/certificate" className="inline-flex items-center gap-2 border border-white/30 px-6 py-3 font-bold text-white hover:bg-white/10">
                            내 참여 확인서
                        </Link>
                    </div>
                </div>
            </section>

            <section className="mx-auto max-w-[980px] px-4 py-16 md:px-[15px] md:py-20">
                <h2 className="text-[32px] font-bold">Planner&apos;s가 하는 일</h2>
                <p className="mt-3 max-w-2xl break-keep text-neutral-600">기획자는 타고나는 게 아니라 훈련으로 만들어집니다. 함께 해보며 늘어나는 기획력을 믿습니다.</p>
                <div className="mt-10 grid gap-6 md:grid-cols-3">
                    {WHAT.map(({ icon: Icon, title, desc }) => (
                        <div key={title} className="border border-neutral-200 p-6">
                            <Icon className="h-7 w-7 text-[#0F766E]" />
                            <h3 className="mt-4 text-lg font-bold">{title}</h3>
                            <p className="mt-2 break-keep text-sm leading-relaxed text-neutral-600">{desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section className="bg-neutral-50">
                <div className="mx-auto max-w-[980px] px-4 py-16 md:px-[15px] md:py-20">
                    <h2 className="text-[32px] font-bold">지금 모집 중인 프로젝트</h2>
                    <div className="mt-8">
                        <ProgramBoard theme={t} brands={["planners"]} dark={false} emptyText="지금 모집 중인 프로젝트가 없습니다. 새 프로젝트가 열리면 이곳에 안내합니다." />
                    </div>
                    <div className="mt-8">
                        <Link href="/planners/projects" className="inline-flex items-center gap-2 font-bold text-[#0F766E] hover:underline">
                            전체 프로젝트 보기 <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                </div>
            </section>
        </>
    );
}
