import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PlannersPageHero, PlannersSectionTitle, PLANNERS_CONTAINER, PLANNERS_SECTION } from "@/features/planners/PageHero";

// About = 플래너를 만들게 된 이야기 (2026-10-15 사용자: "플래너를 만들게 된 스토리부터 시작해야")
// 원문: 구글 사이트 sites.google.com/tenone.biz/planners/planners-planner "플래너를 다시 만들다" (2020~) — 문장만 다듬음
// 연표 숫자 = 바닥상회 출시 공지(이야기 › 공지로 옮긴 8건) 그대로. 지어낸 사실·숫자를 넣지 않는다
// 기획론(기획이란)은 /planners/planning
export const metadata: Metadata = {
    title: "About",
    description: "고등학교 시절 하드보드지와 한지로 만들던 다이어리에서, 태블릿 손글씨 플래너를 거쳐 플래너'스 AI까지. 플래너를 다시 만든 이야기.",
};

const TIMELINE = [
    { when: "90년대 초", what: "고등학교 시절, 하드보드지와 한지로 시스템 다이어리 표지와 속지를 만들어 주변에 선물하다" },
    { when: "2021", what: "태블릿용 플래너'스 플래너를 처음 무료로 나누다 · 프로젝트 하나를 한 권에 담는 프로젝트 북(Frame + Work + Book)" },
    { when: "2022", what: "All in One 판을 1,200여 명이, 개별 플래너까지 2,000여 명이 내려받다" },
    { when: "2023", what: "사용자 의견을 반영해 All in One · 연력 · 주력 · 일력 네 가지 판으로" },
    { when: "2024 ~ 2026", what: "해마다 새 판, 기획·크리에이티브·학습 템플릿 160종 이상" },
    { when: "2026", what: "플래너'스 AI, 손으로 쓰던 플래너에 인공지능을 더하다" },
];

const PDS = [
    { key: "Plan", desc: "현실과 이상의 차이를 극복하기 위해 목표를 세운다." },
    { key: "Do", desc: "목표를 달성하기 위해 치밀하게 실행한다." },
    { key: "See", desc: "꾸준히 점검하고, 목표와 실행에 다시 반영한다." },
];

export default function PlannersAboutPage() {
    return (
        <>
            <PlannersPageHero
                eyebrow="About"
                title="플래너를 다시 만들다"
                description="손으로 정리하는 것에 대한 미련에서 시작했습니다."
            />

            {/* 이야기 */}
            <article className={`${PLANNERS_CONTAINER} pb-24 md:pb-32`}>
                <div className="mx-auto max-w-[760px] space-y-10 break-keep text-lg leading-[2] text-neutral-700 md:text-xl">
                    <p>
                        90년대 초, 고등학교 시절부터 하드보드지와 한지로 시스템 다이어리 표지와 속지를 만들어
                        주변 지인들에게 선물하고는 했다.
                    </p>
                    <p>
                        사회에 나와서는 MS 아웃룩, 구글 등 여러 스케줄러 프로그램을 썼다.
                        다양한 앱도 써 봤지만 어느 것 하나 정착하지 못했다.
                    </p>
                    <p className="text-2xl font-bold text-neutral-900 md:text-3xl">손으로 정리하는 것에 대한 미련이 남았다.</p>
                    <p>
                        그래서 태블릿용으로 한번 만들어 보았다. 써 보니 괜찮다 싶어 나누기 시작했고,
                        해마다 새 판을 만들며 지금까지 이어 오고 있다.
                    </p>
                    <p>
                        그리고 이제, 손으로 쓰는 즐거움은 그대로 두고 손으로 하기 번거로운 일을 덜어 줄 차례다.
                        밀린 일을 다시 옮겨 적는 일, 지난 기록을 뒤적이는 일, 혼자 돌아보는 일.
                        기록은 아날로그처럼 자유롭게, 관리는 비서처럼 똑똑하게, 회고는 코치처럼 따뜻하게.
                        그렇게 <strong className="text-neutral-900">플래너&apos;스 AI</strong>를 만들었다.
                    </p>
                </div>
            </article>

            {/* 연표 */}
            <section className="bg-neutral-50">
                <div className={PLANNERS_SECTION}>
                    <PlannersSectionTitle title="지나온 길" />
                    <ol className="mx-auto max-w-4xl">
                        {TIMELINE.map((t) => (
                            <li key={t.when} className="grid gap-2 border-t border-neutral-200 py-8 md:grid-cols-[200px_1fr] md:gap-10">
                                <p className="text-lg font-bold text-[#0F766E]">{t.when}</p>
                                <p className="break-keep text-lg leading-relaxed text-neutral-800">{t.what}</p>
                            </li>
                        ))}
                    </ol>
                </div>
            </section>

            {/* 일하는 방식 */}
            <section className={PLANNERS_SECTION}>
                <PlannersSectionTitle title="모든 일의 방식, Plan · Do · See" description="이상과 현실의 차이를 극복하기 위한 끊임없는 개선. 플래너'스 PAD도, 플래너'스 AI도 이 순환을 반복할 수 있게 만들었습니다." />
                <div className="grid gap-px bg-neutral-200 md:grid-cols-3">
                    {PDS.map((p) => (
                        <div key={p.key} className="bg-white p-10 md:p-14">
                            <p className="text-3xl font-black text-[#0F766E]">{p.key}</p>
                            <p className="mt-5 break-keep text-lg leading-relaxed text-neutral-700">{p.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* 맺음 */}
            <section className="bg-[#134E4A] text-white">
                <div className={`${PLANNERS_SECTION} text-center`}>
                    <p className="mx-auto max-w-3xl break-keep text-2xl font-bold leading-snug md:text-4xl">
                        생각한 대로 행동하라.<br />그렇지 않으면 행동한 대로 생각하게 된다.
                    </p>
                    <p className="mx-auto mt-10 max-w-2xl break-keep leading-relaxed text-teal-50 md:text-lg">
                        정답은 없습니다. 모두 각자의 방법을 찾을 수 있습니다. 플래너&apos;스도 참고할 만한 하나의 방법이라 생각해 주세요.
                        아직 방법을 찾지 못했다면 한번 써 보고, 자신만의 더 나은 방법을 찾으시길 바랍니다.
                    </p>
                    <p className="mt-14 text-xl font-black md:text-2xl">우리는 모두 기획자다</p>
                    <p className="mt-2 font-bold text-teal-200 md:text-lg">자기 인생에서만큼은</p>
                    <div className="mt-12 flex flex-wrap justify-center gap-3">
                        <Link href="/planners/ai" className="inline-flex items-center gap-2 bg-[#14B8A6] px-7 py-3.5 font-bold text-[#042F2E] hover:bg-teal-300">플래너&apos;스 AI <ArrowRight className="h-4 w-4" /></Link>
                        <Link href="/planners/pad" className="inline-flex items-center gap-2 border border-white/30 px-7 py-3.5 font-bold hover:bg-white/10">플래너&apos;스 PAD</Link>
                        <Link href="/planners/planning" className="inline-flex items-center gap-2 border border-white/30 px-7 py-3.5 font-bold hover:bg-white/10">기획이란</Link>
                    </div>
                </div>
            </section>
        </>
    );
}
