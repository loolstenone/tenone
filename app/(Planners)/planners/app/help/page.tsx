"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, BookOpen, Sparkles, CreditCard, Settings, Smartphone, Link2 } from "lucide-react";

const SECTIONS = [
    {
        icon: BookOpen,
        title: "시작하기",
        items: [
            {
                q: "Planner's Planner AI는 어떻게 시작하나요?",
                a: "회원가입 후 온보딩 4단계(모드 선택 → AI 설정 → 정체성 입력 → 완료)를 거치면 바로 앱에 진입합니다. 모드는 언제든 Settings에서 변경할 수 있습니다.",
            },
            {
                q: "Weekly 모드와 All in One 모드의 차이는 무엇인가요?",
                a: "Weekly 모드는 Today · Weekly · Personal Identity · Projects · AI Briefing 탭으로 구성된 가벼운 시작입니다. All in One 모드는 Yearly · Monthly · Templates 탭이 추가되어 기획자·경영자·대학원생에게 적합한 전체 구조를 제공합니다.",
            },
            {
                q: "나중에 모드를 바꿀 수 있나요?",
                a: "네. Settings → 플래너 모드 섹션에서 언제든지 전환할 수 있습니다. 기존 데이터는 모두 보존됩니다.",
            },
        ],
    },
    {
        icon: Sparkles,
        title: "AI 브리핑",
        items: [
            {
                q: "아침 브리핑과 저녁 정리는 어떻게 작동하나요?",
                a: "매일 설정한 시간에 자동으로 브리핑이 생성됩니다. 아침 브리핑은 오늘의 일정·Weekly 목표·프로젝트 현황을 바탕으로 하루를 설계해 드립니다. 저녁 정리는 오늘 달성한 것과 내일 이월할 항목을 요약합니다.",
            },
            {
                q: "AI 브리핑이 참조하는 데이터 범위를 조정할 수 있나요?",
                a: "네. Settings → AI 비서 설정에서 '참조 범위'를 선택할 수 있습니다. 아이덴티티·이번 주·이번 달·프로젝트·오늘 할 일 중 원하는 항목만 체크하세요.",
            },
            {
                q: "AI 톤(말투)을 바꾸고 싶습니다.",
                a: "Settings → AI 비서 설정에서 전문적 / 친근함 / 간결함 중 선택하세요. 다음 브리핑부터 즉시 적용됩니다.",
            },
            {
                q: "브리핑을 직접 지금 생성할 수 있나요?",
                a: "AI Briefing 탭에서 '아침 브리핑 생성' 또는 '저녁 정리 생성' 버튼을 눌러 언제든 수동으로 생성할 수 있습니다.",
            },
        ],
    },
    {
        icon: CreditCard,
        title: "구독 & 결제",
        items: [
            {
                q: "요금제는 어떻게 되나요?",
                a: "연간 19,000원 단일 플랜입니다. PDF 플래너 구매자는 1년 무료로 이용하실 수 있습니다.",
            },
            {
                q: "PDF 플래너 구매자는 어떻게 무료 혜택을 받나요?",
                a: "구매 이메일을 lools@tenone.biz로 보내주시면 수동으로 활성화해 드립니다. 자동 연동은 추후 지원 예정입니다.",
            },
            {
                q: "결제가 실패했습니다.",
                a: "카드 정보를 다시 확인하거나 다른 카드를 시도해 보세요. 문제가 지속되면 lools@tenone.biz로 문의해 주세요.",
            },
        ],
    },
    {
        icon: Settings,
        title: "설정 & 개인화",
        items: [
            {
                q: "알림을 받고 싶지 않습니다.",
                a: "Settings → 알림 설정에서 이메일 알림과 푸시 알림을 개별로 끌 수 있습니다.",
            },
            {
                q: "Personal Identity(정체성)는 무엇에 쓰이나요?",
                a: "Vision·Mission·KR(Key Results) 등을 정리하는 공간입니다. AI 브리핑이 이 내용을 참조해 더 맥락 있는 조언을 드립니다. '나는 무엇을 도모하는가'를 매일 상기시켜 주는 닻 역할을 합니다.",
            },
        ],
    },
    {
        icon: Link2,
        title: "외부 연동",
        items: [
            {
                q: "Google Calendar와 연동하면 무엇이 달라지나요?",
                a: "Settings → 연동에서 Google 계정을 연결하면, 오늘·이번 주 일정이 Today·Weekly 탭에 자동으로 표시됩니다. AI 브리핑도 일정을 참조합니다.",
            },
            {
                q: "Todoist 연동은 어떻게 하나요?",
                a: "Settings → 연동 → Todoist에서 API 토큰을 입력하면 오늘 태스크를 가져올 수 있습니다. Todoist 계정 설정 → Integrations → API token에서 토큰을 확인하세요.",
            },
        ],
    },
    {
        icon: Smartphone,
        title: "PWA & 오프라인",
        items: [
            {
                q: "앱을 홈 화면에 추가하는 방법은?",
                a: "모바일 브라우저(Safari/Chrome)에서 공유 버튼 → '홈 화면에 추가'를 선택하세요. 이후 앱처럼 실행됩니다.",
            },
            {
                q: "인터넷이 없어도 사용할 수 있나요?",
                a: "오프라인에서도 이미 불러온 페이지를 열람할 수 있습니다. 새 내용 저장은 네트워크 연결 시 동기화됩니다.",
            },
        ],
    },
];

function AccordionItem({ q, a }: { q: string; a: string }) {
    const [open, setOpen] = useState(false);
    return (
        <div className="border-b border-neutral-100 last:border-0">
            <button
                onClick={() => setOpen(!open)}
                className="w-full flex items-start gap-3 py-4 text-left hover:text-[#0F766E] transition-colors"
            >
                <span className="mt-0.5 text-[#0F766E] shrink-0">
                    {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </span>
                <span className="text-sm font-medium text-neutral-900">{q}</span>
            </button>
            {open && (
                <p className="pl-7 pb-4 text-sm text-neutral-600 leading-relaxed">{a}</p>
            )}
        </div>
    );
}

export default function HelpPage() {
    return (
        <div className="max-w-2xl mx-auto px-6 py-10 space-y-10">
            <div>
                <h1 className="font-serif text-2xl text-neutral-900">사용 가이드 & FAQ</h1>
                <p className="text-sm text-neutral-500 mt-2">궁금한 점이 있으면 lools@tenone.biz로 문의해 주세요.</p>
            </div>

            {SECTIONS.map((section) => {
                const Icon = section.icon;
                return (
                    <div key={section.title}>
                        <div className="flex items-center gap-2 mb-3">
                            <Icon className="h-4 w-4 text-[#0F766E]" />
                            <h2 className="text-sm font-semibold text-neutral-900 uppercase tracking-wider">{section.title}</h2>
                        </div>
                        <div className="bg-white rounded-xl border border-neutral-200 divide-y divide-neutral-100 px-4">
                            {section.items.map((item) => (
                                <AccordionItem key={item.q} q={item.q} a={item.a} />
                            ))}
                        </div>
                    </div>
                );
            })}

            <div className="bg-[#0F766E]/5 border border-[#0F766E]/20 rounded-xl px-5 py-4 text-sm text-neutral-700 leading-relaxed">
                <p className="font-medium text-[#0F766E] mb-1">추가 문의</p>
                <p>
                    위 FAQ에서 해결되지 않으면{" "}
                    <a href="mailto:lools@tenone.biz" className="underline hover:text-[#0F766E]">
                        lools@tenone.biz
                    </a>
                    로 메일 주세요. 영업일 기준 1~2일 내 답변드립니다.
                </p>
            </div>
        </div>
    );
}
