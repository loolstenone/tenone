import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PlannersPageHero, PlannersSectionTitle, PLANNERS_SECTION } from "@/features/planners/PageHero";

// 플래너'스 AI 소개 = 사이트의 주인공 (2026-10-14 AI 중심 개편) — 앱 본체 /planners/app
// 기능 이름·설명은 실제 기능 그대로 (app/(Planners)/CLAUDE.md 플래너'스 AI 1~3단계 · 내 AI에 연결)
// ❌ 가격·요금 표기 금지 (베타 테스트) · ❌ '열기' 버튼 (앱 입구 = 유틸리티바 '내 플래너', 사용자 "중복으로 또 묻는 느낌")
export const metadata: Metadata = {
    title: "AI",
    description: "생각하고, 기록하고, 계획하고, 꾸려 가는 사람을 돕는 인공지능 플래너. 생각 쏟아내기, 손글씨 옮기기, 목표 나누기, 못 끝낸 일 다시 놓기, 하루와 한 주 돌아보기.",
};

const CHAPTERS = [
    {
        verb: "생각하다",
        lead: "머릿속을 그대로 쏟아 내세요",
        items: [
            { title: "생각 쏟아내기", desc: "떠오르는 대로 적으면 AI가 할 일·일정·메모로 나눠 제안합니다. 확인한 것만 플래너에 들어갑니다." },
            { title: "캔버스 · 마인드맵", desc: "생각을 펼쳐 놓고 구조를 잡은 뒤, 필요한 가지를 바로 할 일로 보냅니다." },
        ],
    },
    {
        verb: "기록하다",
        lead: "손으로 쓰던 습관 그대로",
        items: [
            { title: "손글씨를 글자로", desc: "펜슬로 쓴 노트나 종이 플래너 사진을 글자로 옮깁니다. 불렛 저널 기호와 취소선도 알아봅니다. 사진은 저장하지 않습니다." },
            { title: "일상어로 찾기", desc: "\"지난달 그 회의에서 뭐라고 했더라\"처럼 물으면 지난 기록에서 찾아 줍니다." },
        ],
    },
    {
        verb: "계획하다",
        lead: "큰 목표가 오늘 할 일이 되도록",
        items: [
            { title: "연간 · 월간 · 주간 · 오늘", desc: "플래너'스 PAD와 같은 단위로 이어집니다. 정체성(비전·미션)을 세워 두면 모든 계획의 기준이 됩니다." },
            { title: "목표 나누기", desc: "프로젝트 목표를 AI가 할 일로 나누고 걸릴 시간과 날짜를 제안합니다. 마감을 넘기면 미리 알려 줍니다." },
        ],
    },
    {
        verb: "꾸려 가다",
        lead: "밀려도 다시 이어 가도록",
        items: [
            { title: "못 끝낸 일 다시 놓기", desc: "끝내지 못한 일을 일정 사이 빈 시간에 다시 배치합니다. 밀린 일을 손으로 옮겨 적다 지치지 않게." },
            { title: "오늘의 세 가지 · 돌아보기", desc: "아침엔 오늘 꼭 할 세 가지를, 저녁과 주말엔 하루와 한 주를 함께 돌아봅니다." },
            { title: "프로젝트", desc: "목표·마일스톤·할 일을 리스트·칸반·간트로. 혼자 하는 일도, 함께 하는 일도." },
        ],
    },
];

const PRINCIPLES = [
    { title: "정하는 것은 나", desc: "AI는 제안하고, 등록은 내가 확인한 뒤에. 내 하루를 AI가 마음대로 바꾸지 않습니다." },
    { title: "내 기록은 내 것", desc: "기록은 나만 봅니다. 손글씨 사진은 글자로 옮긴 뒤 저장하지 않습니다." },
    { title: "쓰던 AI와도", desc: "Claude·ChatGPT 같은 내 AI에 플래너'스를 연결해, 일정과 할 일을 묻고 할 일을 더할 수 있습니다." },
];

export default function PlannersAiPage() {
    return (
        <>
            <PlannersPageHero
                eyebrow="플래너'스 AI"
                title={<>내 손으로, 내 뜻대로<span className="mt-3 block text-xl font-bold text-neutral-500 md:text-2xl">곁에서 돕는 인공지능 플래너</span></>}
                description={<>스스로 생각하고 기록하고 계획하고 꾸려 가고 싶은 사람을 위한 플래너입니다. 플래너'스 AI는 대신 살아 주지 않습니다. 흩어진 생각을 정리하고, 밀린 일을 다시 놓아 주고, 돌아보는 시간을 함께할 뿐입니다.</>}
            />

            {CHAPTERS.map((c, k) => (
                <section key={c.verb} className={k % 2 === 1 ? "bg-neutral-50" : ""}>
                    <div className={`${PLANNERS_SECTION} grid gap-10 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] md:gap-24`}>
                        <div>
                            <p className="text-sm font-bold text-[#0F766E]">{c.verb}</p>
                            <h2 className="mt-4 break-keep text-3xl font-bold md:text-4xl">{c.lead}</h2>
                        </div>
                        <div className="grid gap-px bg-neutral-200 sm:grid-cols-2">
                            {c.items.map((it) => (
                                <div key={it.title} className="bg-white p-8 md:p-10">
                                    <h3 className="text-lg font-bold md:text-xl">{it.title}</h3>
                                    <p className="mt-3 break-keep leading-relaxed text-neutral-600">{it.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            ))}

            <section className="bg-[#134E4A] text-white">
                <div className={PLANNERS_SECTION}>
                    <h2 className="text-center text-3xl font-bold md:text-4xl">세 가지 약속</h2>
                    <div className="mt-16 grid gap-12 md:grid-cols-3">
                        {PRINCIPLES.map((p) => (
                            <div key={p.title}>
                                <p className="text-xl font-bold text-teal-200">{p.title}</p>
                                <p className="mt-4 break-keep leading-relaxed text-teal-50">{p.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className={PLANNERS_SECTION}>
                <PlannersSectionTitle title="지금은 베타 테스트 중" description="로그인하면 플래너는 바로 쓸 수 있습니다. 인공지능 기능은 베타 테스터에게 먼저 열고 있습니다. 시작은 오른쪽 위 '내 플래너'에서." />
                <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2">
                    <Link href="/planners/pad" className="group bg-neutral-50 p-10">
                        <p className="text-sm font-bold text-[#0F766E]">PAD</p>
                        <p className="mt-3 break-keep text-xl font-bold">펜슬로 쓰는 쪽이 좋다면</p>
                        <p className="mt-2 break-keep text-neutral-600">같은 구조의 손글씨 플래너. 쓴 페이지는 사진으로 AI에 옮깁니다.</p>
                        <span className="mt-6 inline-flex items-center gap-1 text-sm font-bold text-[#0F766E]">PAD 받기 <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span>
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
