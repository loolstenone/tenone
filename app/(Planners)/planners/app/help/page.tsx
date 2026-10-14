"use client";

import { useEffect, useState } from "react";
import {
    Compass, Sunrise, CalendarDays, FileText, FolderKanban, User, Sparkles,
    Link2, Mic, Palette, Search, Download, BookOpen, ChevronRight, Mail,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Section {
    id: string;
    icon: LucideIcon;
    title: string;
    intro: string;
    steps?: { label: string; detail?: string }[];
    paragraphs?: string[];
    tip?: string;
}

// 도움말 내용 (2026-10-14 현재 기능 기준으로 다시 씀). ❌ 가격·결제 문구 금지(통신판매업 신고 전) · 긴 줄표 금지
const SECTIONS: Section[] = [
    {
        id: "start",
        icon: Compass,
        title: "시작하기",
        intro: "플래너'스 AI는 종이 플래너처럼 자유롭게 적고, 비서처럼 정리하고, 코치처럼 돌아보게 돕는 플래너입니다. Ten:One™ 계정으로 로그인하면 바로 시작합니다.",
        steps: [
            { label: "첫 설정", detail: "처음 들어오면 역할(직장인·대학생 등)과 정체성(비전·미션)을 묻습니다. 비워 둬도 되고, 나중에 정체성 메뉴에서 채울 수 있습니다." },
            { label: "메뉴", detail: "계획(오늘·주간·월간·연간) · 실행(프로젝트·할 일) · 생각(캔버스·템플릿·정체성) · 연결(연락처). 패드 세로나 작은 화면에서는 왼쪽 위 ☰로 엽니다." },
            { label: "Planner's 사이트와 오가기", detail: "왼쪽 위 Planner's 로고를 누르면 사이트(기획이란·PAD·프로젝트)로, 사이트 오른쪽 위 '내 플래너'를 누르면 다시 여기로 옵니다." },
        ],
    },
    {
        id: "daily",
        icon: Sunrise,
        title: "오늘",
        intro: "하루를 시작하고 마치는 곳입니다. 위에서부터 생각 쏟아내기, 오늘의 Top 3와 저녁 회고, 그리고 할 일·노트가 있습니다.",
        steps: [
            { label: "생각 쏟아내기", detail: "\"내일 2시 외근 끝나면 카페에서 보고서, 저녁엔 운동\"처럼 생각나는 대로 적거나 '말로 하기'로 말하면, AI가 할 일과 일정으로 나눠 줍니다. 넣을 것만 골라 넣습니다." },
            { label: "사진으로", detail: "종이 플래너나 굿노트 페이지를 찍으면 할 일·일정·메모로 읽어 줍니다. 아래 '손글씨와 종이 플래너'를 참고하세요." },
            { label: "못 끝낸 일 자동 재배치", detail: "하루에 한 번 오늘 화면을 처음 열 때, 지난 2주 동안 못 끝낸 일을 오늘로 옮기고 일정이 없는 빈 시간(09~21시)에 중요한 것부터 넣습니다. 옮겨 적을 필요가 없습니다." },
            { label: "오늘의 Top 3", detail: "오늘 할 일 가운데 꼭 끝낼 세 가지를 마감·밀린 기간·중요도를 보고 이유와 함께 골라 줍니다." },
            { label: "저녁 회고", detail: "그날 끝낸 일과 못 끝낸 일을 보고 돌아볼 질문 세 개를 건넵니다. 답을 적어 두면 주간 회고에 쓰입니다." },
            { label: "할 일과 노트", detail: "할 일은 체크로 끝냅니다. 노트는 글(기본 노트)·템플릿·캔버스·손글씨·녹음으로 남길 수 있습니다." },
        ],
        tip: "생각 쏟아내기·Top 3·저녁 회고·사진 읽기는 인공지능 기능입니다. 아래 '인공지능 기능'을 참고하세요.",
    },
    {
        id: "calendar",
        icon: CalendarDays,
        title: "주간 · 월간 · 연간",
        intro: "같은 기록을 더 넓게 봅니다. 일정(약속·기념일)도 이 화면들과 오늘에서 보고 넣습니다.",
        steps: [
            { label: "주간", detail: "맨 위 주간 회고에서 요일별 완료율, Top 3 달성, 컨디션이 좋은 날과 낮은 날의 완료율을 숫자로 봅니다. '한 주 읽기'를 누르면 코치가 잘한 점·패턴·다음 주 실험을 돌려줍니다." },
            { label: "월간", detail: "한 달 캘린더와 이달의 방향·집중 영역. 날짜를 눌러 일정을 넣습니다." },
            { label: "연간", detail: "12개월을 한눈에. 기념일과 행사, 월별 컨디션 흐름을 봅니다." },
        ],
    },
    {
        id: "projects",
        icon: FolderKanban,
        title: "프로젝트 · 할 일 · 캔버스 · 템플릿",
        intro: "기간이 있는 일은 프로젝트로 묶고, 생각은 캔버스와 템플릿으로 정리합니다.",
        steps: [
            { label: "프로젝트", detail: "마일스톤·업무·노트로 구성. 업무는 리스트·칸반·간트로 봅니다." },
            { label: "AI로 목표 쪼개기", detail: "프로젝트 업무 탭에서 \"Q3 마케팅 전략 수립\" 같은 큰 목표를 넣으면, 조사 2h · 정리 1.5h처럼 실행 단위와 예상 시간으로 쪼개고 평일 하루 시간에 맞춰 날짜까지 제안합니다." },
            { label: "할 일", detail: "날짜별 할 일을 한곳에 모아 미완료·완료·이월·취소로 나눠 봅니다." },
            { label: "캔버스", detail: "자유롭게 쓰고 그리는 무지 공간. 펜슬로도 씁니다." },
            { label: "템플릿", detail: "회의록·5W1H·SWOT 같은 기획 서식을 불러와 노트나 프로젝트에 씁니다." },
        ],
    },
    {
        id: "identity",
        icon: User,
        title: "정체성",
        intro: "비전 하우스: 지붕(비전) · 벽(미션) · 기초(본질) · 주변(맥락). 나는 누구이고 무엇을 위해 일하는지 적어 두는 곳입니다.",
        steps: [
            { label: "어디에 쓰이나", detail: "Top 3와 회고 같은 인공지능 기능이 이 내용을 참고해 내 방향에 맞게 돕습니다." },
            { label: "한 줄이면 충분", detail: "처음부터 완성할 필요 없습니다. 한 줄로 시작해 분기마다 다듬으세요." },
        ],
    },
    {
        id: "handwriting",
        icon: FileText,
        title: "손글씨와 종이 플래너",
        intro: "종이에 쓰는 몰입감은 그대로, 관리는 디지털로. 종이·PAD 플래너를 찍거나 앱 안 손글씨 노트를 글자로 바꿉니다.",
        steps: [
            { label: "사진으로 읽기", detail: "오늘 › 생각 쏟아내기 › 사진으로. 페이지 전체가 밝게 나오도록 찍으면 날짜·할 일·일정·메모를 읽습니다." },
            { label: "불렛 저널 기호", detail: "• 할 일 · × 끝냄 · > 다음으로 미룸 · < 일정으로 옮김 · ○ 일정 · − 메모 · ★ 또는 ! 중요 · 취소선은 취소(처음부터 선택 해제)." },
            { label: "손글씨 노트를 글자로", detail: "오늘의 손글씨 노트를 펼쳐 '글자로 바꾸기'를 누르면 같은 방식으로 읽어 생각 쏟아내기에 보여 줍니다." },
            { label: "메모", detail: "할 일이 아닌 줄은 그날 노트로 남길 수 있습니다." },
        ],
        tip: "사진과 손글씨 그림은 읽은 뒤 저장하지 않습니다. 남는 것은 내가 고른 글자뿐입니다.",
    },
    {
        id: "search",
        icon: Search,
        title: "검색",
        intro: "단어로 바로 찾거나, 날짜를 몰라도 일상어로 물어봅니다.",
        steps: [
            { label: "단어로 찾기", detail: "오른쪽 위 🔍. 노트·프로젝트·정체성 등에서 바로 찾습니다." },
            { label: "AI로 찾기", detail: "\"작년 가을쯤 팀장님과 얘기한 신규 프로젝트 아이디어\"처럼 물으면, 기간과 낱말을 알아서 잡아 할 일·메모·회고·일정에서 찾아 한 줄로 알려 줍니다." },
        ],
    },
    {
        id: "ai",
        icon: Sparkles,
        title: "인공지능 기능",
        intro: "생각 쏟아내기, 오늘의 Top 3, 저녁 회고, 한 주 읽기, 목표 쪼개기, AI로 찾기, 손글씨 읽기는 유료 회원 전용입니다. 할 일·일정·노트 기록과 자동 재배치, 주간 숫자는 누구나 씁니다.",
        steps: [
            { label: "처리", detail: "버튼을 누를 때만 그 일에 필요한 기록을 인공지능(Anthropic, 미국)에 보내 처리합니다. 누르지 않으면 보내지 않습니다." },
            { label: "결과", detail: "인공지능이 만든 Top 3·회고 질문·주간 읽기는 내 플래너에 남고, 같은 날 다시 열면 그대로 보여 줍니다." },
        ],
    },
    {
        id: "connect-ai",
        icon: Link2,
        title: "내 AI에 연결",
        intro: "쓰고 있는 Claude·ChatGPT에 플래너를 연결하면, 대화 중에 플래너를 보고 할 일을 넣을 수 있습니다. 연결은 무료이고 AI 사용료는 각자의 AI 서비스에서 냅니다.",
        steps: [
            { label: "연결 주소", detail: "설정 › 연동 › 내 AI에 연결에서 주소를 복사합니다." },
            { label: "Claude", detail: "설정 › 커넥터 › 사용자 지정 커넥터 추가 → 주소 붙여 넣기 → Ten:One™ 계정으로 로그인 후 허용." },
            { label: "ChatGPT", detail: "설정 › 앱과 커넥터 › 커넥터 만들기(개발자 모드) → 주소 → 로그인 후 허용." },
            { label: "할 수 있는 일", detail: "읽기(하루·할 일·기록 찾기·주간 숫자·프로젝트)와 할 일 추가뿐입니다. 지우거나 고치지 못합니다. 연결은 설정 › 연동에서 언제든 끊을 수 있습니다." },
        ],
    },
    {
        id: "integrations",
        icon: Link2,
        title: "다른 서비스 연동",
        intro: "설정 › 연동에서 외부 일정과 할 일을 가져옵니다.",
        steps: [
            { label: "Google 캘린더 · Gmail", detail: "Google 계정으로 연결하면 일정이 오늘·주간·월간에 함께 보입니다." },
            { label: "Todoist · Notion", detail: "각 서비스의 개인 토큰을 넣으면 남은 할 일을 가져옵니다." },
            { label: "Slack", detail: "Webhook 주소를 넣으면 알림을 채널로 보냅니다." },
            { label: "iCal", detail: "구독 주소(.ics)를 넣으면 다른 캘린더의 일정이 들어옵니다." },
        ],
    },
    {
        id: "voice",
        icon: Mic,
        title: "음성 입력",
        intro: "'말로 하기'와 노트의 '녹음'은 브라우저 음성 인식으로 글자를 받아 적습니다.",
        steps: [
            { label: "지원 환경", detail: "Chrome · Edge · Safari 권장. Firefox는 지원하지 않습니다." },
            { label: "권한", detail: "처음 쓸 때 브라우저가 마이크 권한을 묻습니다. 거부했다면 주소창의 자물쇠 아이콘에서 다시 허용하세요." },
        ],
        tip: "음성은 저장하지 않고 받아 적은 글자만 남습니다.",
    },
    {
        id: "style",
        icon: Palette,
        title: "개인화",
        intro: "설정 › 스타일에서 화면 모드·색·글꼴·모서리를 바꿉니다.",
        steps: [
            { label: "스타일 프리셋", detail: "한 번에 모드·색·모서리·글꼴을 바꿉니다." },
            { label: "라이트 · 다크 · 시스템", detail: "시스템은 기기 설정을 따릅니다." },
        ],
    },
    {
        id: "shortcuts",
        icon: BookOpen,
        title: "단축키",
        intro: "키보드로 빠르게 오갑니다. 입력 중에는 작동하지 않습니다.",
        steps: [
            { label: "이동", detail: "T 오늘 · W 주간 · M 월간 · Y 연간 · P 프로젝트 · C 연락처 · S 검색 · I 인덱스" },
            { label: "기록", detail: "/ 빠른 기록(오늘에 추가) · Ctrl+K 또는 ⌘K 명령 팔레트 · ? 단축키 보기" },
        ],
    },
    {
        id: "privacy",
        icon: Download,
        title: "내 데이터",
        intro: "내 기록은 나만 봅니다. 설정 › 사생활에서 무엇이 어디로 가는지 확인할 수 있습니다.",
        steps: [
            { label: "내려받기", detail: "설정 › 사생활 › 내 데이터 내려받기로 기록을 한 파일(JSON)로 받습니다." },
            { label: "탈퇴", detail: "이 서비스만 그만두거나 계정 전체를 지울 수 있습니다. 탈퇴하면 플래너 기록은 지체 없이 지웁니다." },
        ],
    },
];

export default function HelpPage() {
    const [activeId, setActiveId] = useState<string>(SECTIONS[0].id);

    useEffect(() => {
        const observers: IntersectionObserver[] = [];
        SECTIONS.forEach(s => {
            const el = document.getElementById(s.id);
            if (!el) return;
            const obs = new IntersectionObserver(
                (entries) => entries.forEach(e => { if (e.isIntersecting) setActiveId(s.id); }),
                { rootMargin: "-30% 0px -60% 0px" }
            );
            obs.observe(el);
            observers.push(obs);
        });
        return () => observers.forEach(o => o.disconnect());
    }, []);

    return (
        <div className="max-w-6xl mx-auto px-4 md:px-10 py-6 md:py-12">
            <header className="mb-8 md:mb-12">
                <div className="flex items-center gap-2 mb-2">
                    <BookOpen className="h-6 w-6 text-[var(--pp-accent)] myverse-dark:text-[#A5B4FC]" />
                    <h1 className="text-[28px] sm:text-[32px] font-medium tracking-tight text-neutral-900 leading-tight myverse-dark:text-neutral-100">
                        사용 가이드
                    </h1>
                </div>
                <p className="text-sm text-neutral-500 myverse-dark:text-neutral-400 leading-relaxed max-w-xl">
                    플래너'스 AI의 모든 기능을 한 권으로 정리했습니다.
                    필요한 곳을 펼쳐보세요, 머무르며 다음 페이지를 만들어 가세요.
                </p>
            </header>

            <div className="lg:grid lg:grid-cols-[200px_minmax(0,1fr)] lg:gap-10 lg:items-start">
                <nav className="hidden lg:block sticky top-6 self-start">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400 mb-3">
                        목차
                    </p>
                    <ul className="space-y-0.5">
                        {SECTIONS.map(s => {
                            const active = s.id === activeId;
                            return (
                                <li key={s.id}>
                                    <a
                                        href={`#${s.id}`}
                                        className={`flex items-center gap-2 text-xs py-1.5 px-2 -mx-2 rounded transition-colors ${
                                            active
                                                ? "text-[var(--pp-accent)] myverse-dark:text-[#A5B4FC] font-medium bg-[var(--pp-accent)]/5"
                                                : "text-neutral-500 myverse-dark:text-neutral-400 hover:text-[var(--pp-accent)]"
                                        }`}
                                    >
                                        <s.icon className="h-3 w-3 shrink-0" />
                                        <span className="truncate">{s.title}</span>
                                    </a>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                <main className="space-y-8 md:space-y-10">
                    {SECTIONS.map(s => (
                        <section
                            key={s.id}
                            id={s.id}
                            className="scroll-mt-24 bg-white myverse-dark:bg-white/[0.03] border border-neutral-200 myverse-dark:border-white/8 rounded-xl px-5 py-6 md:px-7 md:py-7"
                        >
                            <div className="flex items-start gap-3 mb-3">
                                <span className="shrink-0 mt-1 text-[var(--pp-accent)] myverse-dark:text-[#A5B4FC]">
                                    <s.icon className="h-5 w-5" />
                                </span>
                                <div className="min-w-0">
                                    <h2 className="font-bold text-lg md:text-xl text-neutral-900 myverse-dark:text-neutral-100 leading-tight">
                                        {s.title}
                                    </h2>
                                    <p className="text-sm text-neutral-600 myverse-dark:text-neutral-300 leading-relaxed mt-2">
                                        {s.intro}
                                    </p>
                                </div>
                            </div>

                            {s.steps && (
                                <ul className="mt-4 space-y-2.5 pl-8">
                                    {s.steps.map((step, i) => (
                                        <li key={i} className="text-sm">
                                            <div className="flex items-start gap-2">
                                                <ChevronRight className="h-3.5 w-3.5 text-[var(--pp-accent)] myverse-dark:text-[#A5B4FC] mt-1 shrink-0" />
                                                <div className="min-w-0">
                                                    <span className="font-medium text-neutral-800 myverse-dark:text-neutral-200">{step.label}</span>
                                                    {step.detail && (
                                                        <p className="text-neutral-600 myverse-dark:text-neutral-400 text-xs mt-0.5 leading-relaxed">
                                                            {step.detail}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}

                            {s.paragraphs && (
                                <div className="mt-4 pl-8 space-y-2 text-sm text-neutral-600 myverse-dark:text-neutral-300 leading-relaxed">
                                    {s.paragraphs.map((p, i) => <p key={i}>{p}</p>)}
                                </div>
                            )}

                            {s.tip && (
                                <div className="mt-5 ml-8 px-3 py-2.5 bg-[var(--pp-accent)]/5 border-l-2 border-[var(--pp-accent)]/40 rounded-r text-xs text-neutral-700 myverse-dark:text-neutral-300 leading-relaxed">
                                    <span className="font-medium text-[var(--pp-accent)] myverse-dark:text-[#A5B4FC] mr-1.5">팁</span>
                                    {s.tip}
                                </div>
                            )}
                        </section>
                    ))}

                    <section className="bg-[var(--pp-accent)]/5 border border-[var(--pp-accent)]/20 rounded-xl px-5 py-6 md:px-7 md:py-7">
                        <div className="flex items-start gap-3">
                            <Mail className="h-5 w-5 text-[var(--pp-accent)] myverse-dark:text-[#A5B4FC] mt-0.5 shrink-0" />
                            <div>
                                <h2 className="text-lg font-semibold text-neutral-900 myverse-dark:text-neutral-100">
                                    더 궁금한 것이 있다면
                                </h2>
                                <p className="text-sm text-neutral-600 myverse-dark:text-neutral-300 mt-2 leading-relaxed">
                                    이 가이드에 없는 질문, 아이디어, 불편함은 Planner&apos;s 이야기 게시판의 &lsquo;질문&rsquo;에 남겨 주세요. 운영진이 답합니다.
                                </p>
                                <a
                                    href="/planners/stories"
                                    className="inline-flex items-center gap-1.5 mt-3 text-sm text-[var(--pp-accent)] myverse-dark:text-[#A5B4FC] hover:underline font-medium"
                                >
                                    <Mail className="h-3.5 w-3.5" />
                                    이야기 › 질문 남기기
                                </a>
                            </div>
                        </div>
                    </section>
                </main>
            </div>
        </div>
    );
}
