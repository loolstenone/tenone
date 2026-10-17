import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ChevronDown } from "lucide-react";
import { PlannersPageHero, PlannersSectionTitle, PLANNERS_SECTION } from "@/features/planners/PageHero";
import { PAIN_SCENES, SceneRow } from "@/features/planners/home/Scenes";

// 플래너'스 AI 소개 (2026-10-18 핸드오프 - 3장면 구조) - 앱 본체 /planners/app
// 앞에 = 플래너를 포기했던 사람의 세 가지 고통과 장면(다시 놓기 · 손글씨 → 할 일 · 돌아보기)
// 접힘 '더 많은 기능' = 기획자용(캔버스·마인드맵, 칸반·간트, 정체성 기준, 내 AI 연결) - 없애지 않고 첫 진입에서만 숨긴다
// 기능 이름·설명은 실제 기능 그대로 (app/(Planners)/CLAUDE.md 플래너'스 AI 1~3단계 · 내 AI에 연결)
// ❌ 가격·요금 표기 금지 (베타 테스트) · ❌ '열기' 버튼 (앱 입구 = 유틸리티바 '내 플래너', 사용자 "중복으로 또 묻는 느낌")
export const metadata: Metadata = {
    title: "플래너'스 AI",
    description: "못 끝낸 일은 빈 시간에 다시 놓고, 손글씨는 사진 한 장으로 할 일이 되고, 저녁과 주말엔 함께 돌아보는 인공지능 플래너.",
};

const MORE = [
    { title: "생각 쏟아내기", desc: "떠오르는 대로 적거나 말하면 AI가 할 일·일정·메모로 나눠 제안합니다. 확인한 것만 플래너에 들어갑니다." },
    { title: "일상어로 찾기", desc: "\"지난달 그 회의에서 뭐라고 했더라\"처럼 물으면 지난 기록에서 찾아 줍니다." },
    { title: "연간 · 월간 · 주간 · 오늘", desc: "플래너'스 PAD와 같은 단위로 이어집니다." },
    { title: "정체성 기준", desc: "비전·미션·가치를 세워 두면 모든 계획의 기준이 됩니다. PAD의 Personal Identity와 같은 틀입니다." },
    { title: "목표 나누기", desc: "프로젝트 목표를 AI가 할 일로 나누고 걸릴 시간과 날짜를 제안합니다. 마감을 넘기면 미리 알려 줍니다." },
    { title: "프로젝트 · 칸반 · 간트", desc: "목표·마일스톤·할 일을 리스트·칸반·간트로. 혼자 하는 일도, 함께 하는 일도." },
    { title: "캔버스 · 마인드맵", desc: "생각을 펼쳐 놓고 구조를 잡은 뒤, 필요한 가지를 바로 할 일로 보냅니다." },
    { title: "쓰던 AI와도", desc: "Claude·ChatGPT 같은 내 AI에 플래너'스를 연결해, 일정과 할 일을 묻고 할 일을 더할 수 있습니다. 앱 설정 › 연동에서 켭니다." },
];

const PRINCIPLES = [
    { title: "정하는 것은 나", desc: "AI는 제안하고, 등록은 내가 확인한 뒤에. 내 하루를 AI가 마음대로 바꾸지 않습니다." },
    { title: "내 기록은 내 것", desc: "기록은 나만 봅니다. 손글씨 사진은 글자로 옮긴 뒤 저장하지 않습니다." },
];

export default function PlannersAiPage() {
    return (
        <>
            <PlannersPageHero
                eyebrow="플래너'스 AI"
                title={<>내 손으로, 내 뜻대로<span className="mt-3 block text-xl font-bold text-neutral-500 md:text-2xl">곁에서 돕는 인공지능 플래너</span></>}
                description={<>플래너를 쓰다 그만두게 되는 이유는 대개 셋입니다. 밀린 일을 다시 옮겨 적다 지치고, 손으로 쓴 것을 다시 옮기기 번거롭고, 혼자 돌아보다 다 못 했다는 기분만 남습니다. 플래너'스 AI는 그 세 가지를 덜어 줍니다.</>}
            />

            <section className={PLANNERS_SECTION}>
                <div className="space-y-20 md:space-y-32">
                    {PAIN_SCENES.map((s, k) => <SceneRow key={s.key} scene={s} reverse={k % 2 === 1} />)}
                </div>
            </section>

            <section className="bg-[#134E4A] text-white">
                <div className={PLANNERS_SECTION}>
                    <h2 className="text-center text-3xl font-bold md:text-4xl">두 가지 약속</h2>
                    <div className="mx-auto mt-16 grid max-w-4xl gap-12 md:grid-cols-2">
                        {PRINCIPLES.map((p) => (
                            <div key={p.title}>
                                <p className="text-xl font-bold text-teal-200">{p.title}</p>
                                <p className="mt-4 break-keep leading-relaxed text-teal-50">{p.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 더 많은 기능 - 기획자용, 첫 진입에서는 접어 둔다 */}
            <section className="bg-neutral-50">
                <div className={PLANNERS_SECTION}>
                    <details className="group mx-auto max-w-5xl">
                        <summary className="flex cursor-pointer list-none items-center justify-center gap-2 text-center text-2xl font-bold md:text-3xl [&::-webkit-details-marker]:hidden">
                            더 많은 기능
                            <ChevronDown className="h-6 w-6 transition-transform group-open:rotate-180" />
                        </summary>
                        <p className="mt-4 text-center text-neutral-500">계획을 더 깊이 세우는 분을 위한 기능입니다.</p>
                        <div className="mt-12 grid gap-px bg-neutral-200 sm:grid-cols-2">
                            {MORE.map((it) => (
                                <div key={it.title} className="bg-white p-8 md:p-10">
                                    <h3 className="text-lg font-bold md:text-xl">{it.title}</h3>
                                    <p className="mt-3 break-keep leading-relaxed text-neutral-600">{it.desc}</p>
                                </div>
                            ))}
                        </div>
                    </details>
                </div>
            </section>

            <section className={PLANNERS_SECTION}>
                <PlannersSectionTitle title="지금은 베타 테스트 중" description="로그인하면 플래너는 바로 쓸 수 있습니다. 인공지능 기능은 베타 테스터에게 먼저 열고 있습니다. 시작은 위쪽 '내 플래너'에서 (휴대폰은 오른쪽 위 메뉴 ☰ 안)." />
                <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2">
                    <Link href="/planners/pad" className="group bg-neutral-50 p-10">
                        <p className="text-sm font-bold text-[#0F766E]">플래너'스 PAD</p>
                        <p className="mt-3 break-keep text-xl font-bold">펜슬로 쓰는 쪽이 좋다면</p>
                        <p className="mt-2 break-keep text-neutral-600">같은 연간·월간·주간·오늘 구조의 손글씨 플래너입니다.</p>
                        <span className="mt-6 inline-flex items-center gap-1 text-sm font-bold text-[#0F766E]">플래너'스 PAD 받기 <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span>
                    </Link>
                    <Link href="/planners/stories" className="group bg-neutral-50 p-10">
                        <p className="text-sm font-bold text-[#0F766E]">이야기</p>
                        <p className="mt-3 break-keep text-xl font-bold">써 본 이야기, 궁금한 점</p>
                        <p className="mt-2 break-keep text-neutral-600">나만의 사용법을 나누고, 질문을 남기면 운영진이 답합니다.</p>
                        <span className="mt-6 inline-flex items-center gap-1 text-sm font-bold text-[#0F766E]">이야기 보기 <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span>
                    </Link>
                </div>
            </section>
        </>
    );
}
