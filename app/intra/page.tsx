"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import {
    Palette, BarChart3, Megaphone, BookOpen, FileEdit,
    Bell, Calendar, ArrowRight,
    Users, TrendingUp, Target,
} from "lucide-react";

const dailyQuotes = [
    // Principle 10 & Core Value
    "본질에 집중하라. 나머지는 따라온다.",
    "어설픈 완벽주의는 일을 출발시키지 못한다.",
    "실현되지 않으면 아이디어가 아니다.",
    "길바닥 동전은 먼저 줍는 사람이 임자다.",
    "반복되는 우연은 계획된 우연이다.",
    "속도는 방향이 맞을 때만 의미가 있다.",
    "약속한 것은 반드시 이행하라.",
    "본질(Essence), 속도(Speed), 이행(Carry Out).",
    "말보다 실행, 실행보다 결과.",
    "원칙은 지키되, 방법은 유연하게.",
    // Vrief & 일하는 방식
    "브리프를 쓰는 것이 일의 절반이다.",
    "목적 없는 회의는 시간을 훔치는 것이다.",
    "프로세스가 사람을 자유롭게 한다.",
    "좋은 질문이 좋은 기획의 시작이다.",
    "피드백은 선물이다. 빨리 받을수록 좋다.",
    "복잡한 것을 단순하게 만드는 것이 전문가다.",
    "기획서 한 장이 회의 열 번을 대신한다.",
    "데이터는 거짓말하지 않는다. 해석이 거짓말한다.",
    "문제를 정의하면 답의 절반은 나온 것이다.",
    "결과물로 말하라. 과정은 스스로 증명된다.",
    // 연결 & 네트워크
    "가치로 연결되면 거리는 의미가 없다.",
    "약한 연결고리가 강력한 기회를 만든다.",
    "경쟁하지 말고, 연결하라.",
    "네트워크의 가치는 연결의 질이 결정한다.",
    "혼자 빠른 것보다 함께 멀리 가는 것.",
    "동료의 성장이 나의 성장이다.",
    "사람이 곧 플랫폼이다.",
    "신뢰는 느리게 쌓이고, 빠르게 무너진다.",
    "좋은 사람 옆에 좋은 사람이 모인다.",
    "커뮤니티는 관리하는 것이 아니라 함께 만드는 것이다.",
    // 실행 & 도전
    "빠르게 실패하고, 더 빠르게 배워라.",
    "오늘의 실험이 내일의 사업이 된다.",
    "먼저 움직이는 사람이 판을 바꾼다.",
    "시장은 기다려주지 않는다. 오늘 시작하라.",
    "모든 위대한 일은 작은 시도에서 시작되었다.",
    "작게 시작하되, 크게 설계하라.",
    "완벽한 타이밍은 없다. 지금이 최선이다.",
    "실패의 기록이 성공의 레시피가 된다.",
    "한 번의 실행이 백 번의 계획을 이긴다.",
    "두려움은 시작 전에만 존재한다.",
    // 기획 & 전략
    "기획하고, 연결하고, 확장한다.",
    "생각의 크기가 결과의 크기를 결정한다.",
    "10,000명의 기획자를 발굴하고 연결한다.",
    "전략은 선택이다. 무엇을 안 할지 정하라.",
    "큰 그림을 그리되, 오늘 할 일에 집중하라.",
    "기획자의 무기는 관점이다.",
    "트렌드를 따라가지 말고, 맥락을 읽어라.",
    "시장의 빈틈이 곧 기회다.",
    "경쟁사를 보지 말고, 고객을 보라.",
    "포지셔닝은 다르게 하는 것이 아니라 의미 있게 하는 것이다.",
    // 콘텐츠 & 브랜드
    "콘텐츠는 한 번 만들고, 열 번 활용하라.",
    "브랜드는 약속이다. 매일 지켜야 하는.",
    "이야기가 없는 브랜드는 기억되지 않는다.",
    "좋은 콘텐츠는 팔지 않아도 퍼진다.",
    "일관성이 브랜드를 만든다.",
    "세계관은 하루아침에 만들어지지 않는다.",
    "매력적인 브랜드는 매력적인 문화에서 나온다.",
    "콘텐츠의 가치는 공감의 깊이에 비례한다.",
    "디테일이 브랜드의 품격을 결정한다.",
    "메시지는 단순할수록 강력하다.",
    // 성장 & 학습
    "수첩 속 아이디어를 세상에 꺼내라.",
    "배움을 멈추면 성장도 멈춘다.",
    "어제의 나와 경쟁하라.",
    "불편함 속에서 성장이 일어난다.",
    "모르는 것을 모른다고 말하는 것이 용기다.",
    "실수를 숨기지 마라. 공유하면 자산이 된다.",
    "메모하지 않은 아이디어는 사라진다.",
    "독서는 가장 저렴한 투자다.",
    "전문가는 매일 기본기를 연습하는 사람이다.",
    "한 분야를 깊이 파되, 시야는 넓게 가져라.",
    // 리더십 & 조직
    "리더의 역할은 답을 주는 것이 아니라 질문을 던지는 것이다.",
    "조직의 속도는 가장 느린 소통에 맞춰진다.",
    "투명한 소통이 신뢰를 만든다.",
    "위임은 믿음의 표현이다.",
    "문화가 전략을 이긴다.",
    "칭찬은 공개로, 피드백은 개인으로.",
    "좋은 조직은 실패를 허용하되 같은 실패를 반복하지 않는다.",
    "의사결정은 빠르게, 실행은 정확하게.",
    "규칙보다 원칙을, 통제보다 자율을.",
    "사람에게 투자하는 것이 가장 높은 수익률이다.",
    // GPR & 목표
    "목표 없는 노력은 방향 없는 항해다.",
    "계획은 변할 수 있다. 목표는 변하지 않는다.",
    "측정할 수 없으면 개선할 수 없다.",
    "작은 승리를 축하하라. 큰 승리의 연료가 된다.",
    "결과를 리뷰하지 않으면 같은 실수를 반복한다.",
    "높은 기준이 높은 성과를 만든다.",
    "목표는 도전적이되, 계획은 현실적이어야 한다.",
    "매일 1%씩 나아지면 1년 후 37배가 된다.",
    "분기마다 돌아보고, 매일 실행하라.",
    "성과는 습관의 총합이다.",
    // 텐원 정신
    "하마터면 열심히 안 살 뻔 했다.",
    "수첩 속에 묻어뒀던 아이디어를 세상에 꺼내놓겠다.",
    "우리는 기획자를 발굴하고, 연결하고, 성장시킨다.",
    "Plan. Connect. Expand.",
    "가치로 연결된 거대한 세계관을 만들기로 했다.",
    "정답은 현장에 있다. 책상 위에는 가설만 있다.",
    "너, 나의 동료가 되라.",
    "세상을 바꾸는 건 거창한 것이 아니라 꾸준한 것이다.",
    "오늘 심은 씨앗이 내일의 숲이 된다.",
    "끝까지 해내는 사람이 결국 이긴다.",
];

const quickLinks = [
    { name: "Studio", description: "콘텐츠 제작 포털", href: "/intra/studio", icon: Palette },
    { name: "ERP", description: "사내 관리 포털", href: "/intra/erp", icon: BarChart3 },
    { name: "Marketing", description: "마케팅 포털", href: "/intra/marketing", icon: Megaphone },
    { name: "Wiki", description: "교육/온보딩", href: "/intra/wiki", icon: BookOpen },
    { name: "CMS", description: "사이트 콘텐츠 관리", href: "/intra/cms", icon: FileEdit },
];

const notices = [
    { id: 1, title: "MADLeague 인사이트 투어링 참가자 모집", date: "2025-09-15", badge: "중요" },
    { id: 2, title: "Vrief 프레임워크 교육 일정 안내 (10월)", date: "2025-09-14", badge: "교육" },
    { id: 3, title: "LUKI 2nd Single 관련 콘텐츠 가이드라인", date: "2025-09-12", badge: "공지" },
    { id: 4, title: "Badak 밋업 10월 일정 확정", date: "2025-09-10", badge: "일정" },
    { id: 5, title: "GPR 3분기 자기 평가 마감 안내", date: "2025-09-08", badge: "HR" },
];

const schedule = [
    { id: 1, title: "주간 팀 회의", time: "10:00", date: "오늘", type: "회의" },
    { id: 2, title: "MADLeap 5기 정기 모임", time: "14:00", date: "오늘", type: "행사" },
    { id: 3, title: "CJ ENM 콜라보 미팅", time: "11:00", date: "내일", type: "미팅" },
    { id: 4, title: "콘텐츠 파이프라인 리뷰", time: "15:00", date: "내일", type: "리뷰" },
    { id: 5, title: "Badak 월간 밋업", time: "19:00", date: "9/25", type: "행사" },
];

const stats = [
    { label: "Active Staff", value: "3", icon: Users },
    { label: "Active Campaigns", value: "3", icon: Megaphone },
    { label: "Active Leads", value: "4", icon: TrendingUp },
    { label: "GPR Goals", value: "9", icon: Target },
];

export default function IntraPage() {
    const { user } = useAuth();
    const todayQuote = useMemo(() => {
        const today = new Date();
        const dayIndex = (today.getFullYear() * 400 + today.getMonth() * 31 + today.getDate()) % dailyQuotes.length;
        return dailyQuotes[dayIndex];
    }, []);

    return (
        <div className="space-y-8">
            {/* Welcome */}
            <div>
                <h1 className="text-2xl font-bold">안녕하세요, {user?.name ?? 'User'}님</h1>
                <p className="mt-1 text-sm text-neutral-500">{todayQuote}</p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-4 gap-4">
                {stats.map(s => (
                    <div key={s.label} className="border border-neutral-200 bg-white p-4 flex items-center gap-3">
                        <s.icon className="h-5 w-5 text-neutral-400" />
                        <div>
                            <p className="text-xl font-bold">{s.value}</p>
                            <p className="text-xs text-neutral-500">{s.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-2 gap-6">
                {/* Notices */}
                <div className="border border-neutral-200 bg-white">
                    <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Bell className="h-4 w-4 text-neutral-400" />
                            <h2 className="text-sm font-semibold">공지사항</h2>
                        </div>
                        <span className="text-xs text-neutral-400">전체보기</span>
                    </div>
                    <ul className="divide-y divide-neutral-100">
                        {notices.map(notice => (
                            <li key={notice.id} className="px-6 py-3 hover:bg-neutral-50 cursor-pointer transition-colors">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-[10px] px-1.5 py-0.5 bg-neutral-100 text-neutral-500 font-medium">{notice.badge}</span>
                                    <span className="text-xs text-neutral-400">{notice.date}</span>
                                </div>
                                <p className="text-sm">{notice.title}</p>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Schedule */}
                <div className="border border-neutral-200 bg-white">
                    <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-neutral-400" />
                            <h2 className="text-sm font-semibold">일정</h2>
                        </div>
                        <span className="text-xs text-neutral-400">캘린더</span>
                    </div>
                    <ul className="divide-y divide-neutral-100">
                        {schedule.map(event => (
                            <li key={event.id} className="px-6 py-3 flex items-center gap-3 hover:bg-neutral-50 transition-colors">
                                <div className="text-right w-12">
                                    <p className="text-xs text-neutral-400">{event.date}</p>
                                    <p className="text-sm font-mono">{event.time}</p>
                                </div>
                                <div className="w-px h-8 bg-neutral-200" />
                                <div>
                                    <p className="text-sm">{event.title}</p>
                                    <p className="text-[10px] text-neutral-400">{event.type}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}
