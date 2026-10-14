import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ProgramBoard } from "@/features/programs/ProgramBoard";
import { PROGRAM_THEMES } from "@/features/programs/ProgramTheme";
import { PlannersPageHero, PlannersSectionTitle, PLANNERS_CONTAINER, PLANNERS_SECTION, PLANNERS_SPACE, heroPrimaryBtn, heroSecondaryBtn } from "@/features/planners/PageHero";

export const metadata: Metadata = {
    title: "기획자 과정",
    description: "우리는 모두 기획자다, 자기 인생에서만큼은. Planner's 기획자 과정, 신청하고, 팀을 꾸려 실제 과제를 기획하고, 참여 이력을 확인서로 남깁니다.",
};

// 진행 방식 — 코어 프로그램 모듈(program_*)의 실제 흐름 그대로 (신청 → 선발 → 팀 → 결과 발표 → 확인서)
// ❌ 회차마다 다른 것(기간·인원·비용·과제)은 여기에 단정해 적지 않는다 — 모집 공고에서 안내
const STEPS = [
    { no: "01", title: "신청", desc: "모집 중인 과정에서 과제와 일정을 보고 신청합니다. Ten:One™ 계정 하나면 됩니다." },
    { no: "02", title: "선발", desc: "운영진이 신청서를 검토해 참가자를 정하고 결과를 알려 드립니다." },
    { no: "03", title: "팀 구성", desc: "참가자끼리 팀을 꾸립니다. 초대 코드로 함께할 사람을 부를 수 있습니다." },
    { no: "04", title: "기획 · 실행", desc: "문제를 정의하고(Plan) 실행하고(Do) 돌아봅니다(See). 프로젝트 북 하나에 과정을 모읍니다." },
    { no: "05", title: "발표 · 확인서", desc: "결과를 발표하면 참여 이력이 남고, 고유 코드로 진위를 확인할 수 있는 참여 확인서를 직접 발급합니다." },
];

const GAINS = [
    { title: "실제 과제를 기획한 경험", desc: "연습 문제가 아니라 답이 정해지지 않은 과제를 끝까지 기획해 봅니다." },
    { title: "함께 일하는 법", desc: "역할을 나누고, 의견이 부딪히고, 그래도 결과를 내는 과정을 팀으로 겪습니다." },
    { title: "남는 기록", desc: "프로젝트 북과 결과물, 그리고 누구나 진위를 확인할 수 있는 참여 확인서." },
];

const FOR_WHOM = [
    "기획자가 되고 싶지만 무엇부터 해야 할지 모르는 사람",
    "지금 하는 일을 기획의 언어로 다시 정리해 보고 싶은 사람",
    "혼자 세운 계획이 늘 흐지부지되어 함께 끝까지 가 보고 싶은 사람",
    "자기 인생을 스스로 기획하고 싶은 누구나",
];

/** Planner's 기획자 과정 (부수 서비스, 2026-10-14 AI 중심 개편) — 코어 프로그램 모듈(주인 brand planners) 회차 목록·신청. MADLeague 창구에도 같은 회차가 보일 수 있다 */
export default function PlannersProjectsPage() {
    const t = { ...PROGRAM_THEMES.planners, accent: "#0F766E" }; // 흰 배경용 진한 틸
    return (
        <>
            <PlannersPageHero
                eyebrow="기획자 과정"
                title={<>우리는 모두 기획자다<span className="mt-3 block text-xl font-bold text-neutral-500 md:text-2xl">자기 인생에서만큼은</span></>}
                description="기획은 해 봐야 늡니다. 실제 과제를 팀으로 기획하고, 끝까지 해 낸 기록을 확인서로 남깁니다. 읽고 배우는 기획이 아니라 손으로 익히는 기획입니다."
            >
                <a href="#open" className={heroPrimaryBtn}>모집 중인 과정</a>
                <Link href="/planners/about" className={heroSecondaryBtn}>기획이란</Link>
            </PlannersPageHero>

            {/* 진행 방식 */}
            <section className={PLANNERS_SECTION}>
                <PlannersSectionTitle title="이렇게 진행됩니다" description="신청부터 확인서까지, 한 과정은 다섯 단계를 거칩니다." />
                <ol className="grid gap-px bg-neutral-200 md:grid-cols-5">
                    {STEPS.map((s) => (
                        <li key={s.no} className="bg-white p-8 md:p-10">
                            <p className="text-sm font-bold text-[#0F766E]">{s.no}</p>
                            <h3 className="mt-4 text-xl font-bold">{s.title}</h3>
                            <p className="mt-3 break-keep leading-relaxed text-neutral-600">{s.desc}</p>
                        </li>
                    ))}
                </ol>
            </section>

            {/* 얻는 것 · 누구를 위한 */}
            <section className="bg-neutral-50">
                <div className={`${PLANNERS_SECTION} grid gap-16 md:grid-cols-2 md:gap-24`}>
                    <div>
                        <h2 className="text-3xl font-bold md:text-4xl">무엇이 남나요</h2>
                        <ul className="mt-10 space-y-8">
                            {GAINS.map((g) => (
                                <li key={g.title}>
                                    <p className="text-lg font-bold">{g.title}</p>
                                    <p className="mt-2 break-keep leading-relaxed text-neutral-600">{g.desc}</p>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold md:text-4xl">이런 분께 맞습니다</h2>
                        <ul className="mt-10 space-y-5">
                            {FOR_WHOM.map((w) => (
                                <li key={w} className="flex gap-4 break-keep leading-relaxed text-neutral-700 md:text-lg">
                                    <span className="mt-2.5 h-1.5 w-1.5 shrink-0 bg-[#0F766E]" />
                                    {w}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </section>

            {/* 모집 중 */}
            <section id="open" className={`${PLANNERS_SECTION} scroll-mt-24`}>
                <PlannersSectionTitle title="모집 중인 과정" description="회차마다 과제·기간·인원이 다릅니다. 자세한 내용은 각 모집 공고에서 확인하세요." />
                <ProgramBoard theme={t} brands={["planners"]} dark={false} emptyText="지금 모집 중인 과정이 없습니다. 새 과정이 열리면 이곳과 '이야기 › 공지'에 안내합니다." />
            </section>

            {/* 도구와 함께 */}
            <section className="bg-neutral-50">
                <div className={PLANNERS_SECTION}>
                    <PlannersSectionTitle title="기다리는 동안, 혼자서도" description="과정에서 쓰는 도구를 지금 바로 쓸 수 있습니다." />
                    <div className="grid gap-6 md:grid-cols-2 md:gap-12">
                        <Link href="/planners/pad" className="group bg-white p-10 md:p-14">
                            <p className="text-sm font-bold text-[#0F766E]">플래너'스 PAD</p>
                            <h3 className="mt-2 text-2xl font-bold md:text-3xl">프로젝트 북 · 프레임워크 서식</h3>
                            <p className="mt-3 break-keep leading-relaxed text-neutral-600">Frame + Work + Book, 프로젝트 하나를 한 권에 담는 손글씨 서식과 기획 프레임워크.</p>
                            <span className="mt-8 inline-flex items-center gap-1 text-sm font-bold text-[#0F766E]">PAD 받기 <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span>
                        </Link>
                        <Link href="/planners/ai" className="group bg-white p-10 md:p-14">
                            <p className="text-sm font-bold text-[#0F766E]">플래너'스 AI</p>
                            <h3 className="mt-2 text-2xl font-bold md:text-3xl">프로젝트 · 마일스톤 · 할 일</h3>
                            <p className="mt-3 break-keep leading-relaxed text-neutral-600">목표부터 할 일까지 디지털로, 리스트·칸반·간트로 프로젝트를 끌고 갑니다.</p>
                            <span className="mt-8 inline-flex items-center gap-1 text-sm font-bold text-[#0F766E]">AI 알아보기 <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span>
                        </Link>
                    </div>
                </div>
            </section>

            {/* 확인서 */}
            <section className={`${PLANNERS_CONTAINER} ${PLANNERS_SPACE} text-center`}>
                <h2 className="text-3xl font-bold md:text-4xl">참여 확인서</h2>
                <p className="mx-auto mt-5 max-w-2xl break-keep leading-relaxed text-neutral-600 md:text-lg">
                    결과가 발표된 프로젝트는 직접 확인서를 발급합니다. 확인서마다 고유 코드가 있어 누구나 진위를 확인할 수 있습니다.
                </p>
                <div className="mt-10 flex flex-wrap justify-center gap-3">
                    <Link href={t.certificateHref} className={heroPrimaryBtn}>내 참여 확인서</Link>
                    <Link href={t.verifyBase} className={heroSecondaryBtn}>확인서 진위 확인</Link>
                </div>
            </section>
        </>
    );
}
