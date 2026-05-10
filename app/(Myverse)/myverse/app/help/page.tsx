"use client";

import { useEffect, useState } from "react";
import {
    Compass, Sunrise, CalendarDays, Clock, FileText, FolderKanban, User, Sparkles,
    Activity, Link2, MapPin, Mic, Bell, Palette, Smartphone, Search, Download, CreditCard,
    Mail, BookOpen, ChevronRight,
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

const SECTIONS: Section[] = [
    {
        id: "start",
        icon: Compass,
        title: "시작하기",
        intro: "마이버스 AI는 당신이 매일 자신의 기획자로 살아가도록 곁에 둔 도구입니다. 가입과 온보딩을 한 번 마치면, 이후엔 페이지를 넘기듯 머물기만 하면 됩니다.",
        steps: [
            { label: "회원가입", detail: "이메일로 가입하면 곧장 온보딩이 시작됩니다." },
            { label: "사용 수준 선택", detail: "Easy mode — 일·주·월·연 스케줄에만 집중. All in one mode — 프로젝트·캔버스·템플릿까지 모두 사용." },
            { label: "+ 시간 (선택)", detail: "Time Tracking을 켜면 상단 메뉴에 「시간」 탭이 추가되어 30분 단위 행동 기록이 가능합니다." },
            { label: "역할 · 정체성", detail: "직장인·대학생·연구원 등 한 가지를 고르면 추천 템플릿과 AI 톤이 맞춰집니다. 정체성 입력은 비워 둬도 됩니다." },
        ],
        tip: "사용 수준은 언제든 Settings → 사용 수준에서 바꿀 수 있고, 기존 데이터는 그대로 유지됩니다.",
    },
    {
        id: "daily",
        icon: Sunrise,
        title: "일간 — 하루의 흐름",
        intro: "오늘이라는 한 페이지. 일정·할 일·메모·자기 점검이 한 화면에 모입니다.",
        steps: [
            { label: "상단 날짜·날씨", detail: "현재 위치 기반의 날씨가 자동으로 채워집니다. 날짜 좌우 화살표로 이동, 「오늘로」 아이콘으로 즉시 복귀." },
            { label: "할 일", detail: "체크박스로 완료 처리. 미완료는 다음 날 자동으로 이월 후보가 됩니다." },
            { label: "노트", detail: "텍스트로 메모하거나 「녹음」 버튼으로 음성을 텍스트로 변환. 노트 카드 헤더의 🎤 아이콘은 기존 노트에 음성 메모를 덧붙입니다." },
            { label: "데일리 트래킹", detail: "Settings에서 켠 항목(에너지·만족도·기분·공부·신앙·운동·건강)이 슬라이더·메모로 표시됩니다." },
        ],
        tip: "일간 페이지는 매일 자동으로 새 페이지가 됩니다. 어제 기록은 사라지지 않고, 인덱스에서 언제든 다시 펼칠 수 있습니다.",
    },
    {
        id: "scopes",
        icon: CalendarDays,
        title: "주 · 월 · 연 · 인덱스",
        intro: "같은 시간을 다른 거리에서 보는 네 가지 시점. 줌인·줌아웃하며 흐름을 잡습니다.",
        steps: [
            { label: "주간", detail: "월요일 시작. 카테고리별 색으로 칠해진 7일 그리드 + 주 회고 노트." },
            { label: "월간", detail: "한 달 캘린더 + 월간 목표·회고. 달의 큰 리듬을 잡습니다." },
            { label: "연간", detail: "12개월 × 31일 표. 기념일은 빨강, 행사는 액센트. 존재하지 않는 날(2/30 등)은 미세 사선으로 자연스럽게 처리." },
            { label: "인덱스", detail: "전 페이지의 목차. 모바일은 12개월 평면 2열, 데스크톱은 분기별 3개월. 클릭하면 해당 시점으로 이동." },
        ],
    },
    {
        id: "time",
        icon: Clock,
        title: "시간 트래커",
        intro: "하루를 30분으로 잘라 기록합니다. 점이 모이면 흐름이 보이고, 흐름이 보이면 다음을 설계할 수 있습니다.",
        steps: [
            { label: "활성화", detail: "Settings → 사용 수준 → + Time Tracking ON. 상단 메뉴에 「시간」 탭이 나타납니다." },
            { label: "슬롯 추가", detail: "각 30분 슬롯의 「+ 추가」를 누르면 활동·카테고리·시작·종료를 한 번에 입력. 카테고리는 11종(일반·업무·운동·식사·학습·여가·휴식·모임·신앙·건강·이동)." },
            { label: "24시간 타임라인", detail: "상단 가로 바에 하루 전체가 색 블록으로 시각화. 블록 클릭으로 편집, 호버 시 활동·시간 툴팁." },
            { label: "범례", detail: "타임라인 아래에 카테고리 색 사각형 + 라벨 + 시간 + %. 막대 색이 무엇을 의미하는지 즉시 확인." },
            { label: "컨텍스트 스트립", detail: "헤더 바로 아래 한 줄에 📍 현재 위치 · 🌅 일출 · 🌇 일몰 · 🕒 현재 시각. 위치 권한 허용 시 자동 채움." },
        ],
        tip: "스마트폰에서도 전체 슬롯이 항상 보이도록 「+ 추가」 버튼이 항상 노출됩니다. 기록 채우는 마찰을 최소화했습니다.",
    },
    {
        id: "notes",
        icon: FileText,
        title: "노트와 음성 메모",
        intro: "흐르는 생각을 잡아두는 종이. 키보드가 거추장스러울 땐 말하면 됩니다.",
        steps: [
            { label: "텍스트 노트", detail: "일간 페이지 노트 도구에서 새 노트를 생성하거나 기존 노트를 펼쳐 작성." },
            { label: "음성 녹음", detail: "「녹음」 버튼 클릭 → ko-KR 음성 인식이 텍스트로 전사. 화면 하단 토스트로 진행 상황·실시간 자막 표시." },
            { label: "기존 노트에 덧붙이기", detail: "노트 카드 헤더의 🎤 아이콘으로 기존 내용 끝에 추가." },
        ],
        tip: "Web Speech API(Chrome·Edge·Safari)를 사용합니다. 음성 데이터는 저장되지 않고, 변환된 텍스트만 노트에 보관됩니다.",
    },
    {
        id: "projects",
        icon: FolderKanban,
        title: "프로젝트 · 캔버스 · 템플릿",
        intro: "혼자서 마무리하지 않는 일은 프로젝트로, 한 호흡으로 풀어야 할 생각은 캔버스로, 반복되는 형식은 템플릿으로.",
        steps: [
            { label: "프로젝트", detail: "기간이 있는 작업 묶음. Daily 트래킹 항목과 연결해 진행도 자동 합산. 완료된 프로젝트는 자동으로 인덱스에서 회고 가능." },
            { label: "캔버스", detail: "한 화면에서 자유롭게 쓰고 그리는 무지(無紙) 공간. 글·체크리스트·인용을 한 흐름으로 배치." },
            { label: "템플릿", detail: "회의록·주간보고·아이디어메모 등 자주 쓰는 형식 저장. 새 노트 생성 시 한 번에 불러오기." },
        ],
    },
    {
        id: "identity",
        icon: User,
        title: "퍼스널",
        intro: "매일 흔들리지 않기 위해 닻을 내리는 곳. 미션·비전·핵심결과(KR)·올해의 한 줄을 정리합니다.",
        steps: [
            { label: "어디서 쓰는가", detail: "AI 브리핑이 이 내용을 참조해 더 맥락 있는 조언을 만들어 냅니다." },
            { label: "한 줄로도 충분", detail: "처음부터 완결할 필요 없습니다. 한 줄로 시작하고 분기마다 다듬으세요." },
        ],
    },
    {
        id: "ai",
        icon: Sparkles,
        title: "AI 비서 · 브리핑",
        intro: "당신을 잘 아는 비서가 매일 두 번, 짧고 정확한 메모를 건넵니다.",
        steps: [
            { label: "아침 브리핑", detail: "오늘의 일정·이번 주 목표·진행 중 프로젝트를 바탕으로 하루를 설계." },
            { label: "저녁 정리", detail: "오늘 달성한 것 + 내일 이월할 항목 요약." },
            { label: "톤 선택", detail: "Settings → AI 비서 → AI 톤. 전문적 / 친근함 / 간결함 중 하나. 다음 브리핑부터 즉시 적용." },
            { label: "참조 범위", detail: "퍼스널 · 이번 주 · 이번 달 · 프로젝트 · 오늘 할 일 중 원하는 항목만 체크." },
            { label: "수동 생성", detail: "AI Briefing 탭에서 「아침 브리핑 생성 / 저녁 정리 생성」 버튼으로 즉시 호출." },
        ],
    },
    {
        id: "tracking",
        icon: Activity,
        title: "데일리 트래킹",
        intro: "삶에서 매일 한 번씩 들여다보고 싶은 항목을 일간 페이지에 띄워둡니다.",
        steps: [
            { label: "항목 선택", detail: "Settings → 데일리 트래킹에서 에너지·만족도·기분·공부·신앙·운동·건강 7종 중 켜기." },
            { label: "프로젝트 연결", detail: "각 항목의 「프로젝트화」로 트래킹 데이터를 특정 프로젝트 컨텍스트로 묶을 수 있습니다." },
            { label: "기록 방식", detail: "1~5 슬라이더 + 메모. 운동·건강은 분/거리/혈압 등 정량 필드." },
        ],
    },
    {
        id: "integrations",
        icon: Link2,
        title: "외부 연동",
        intro: "이미 쓰고 있는 도구의 데이터를 가져옵니다. 입력은 한 곳, 보기는 여러 곳에서.",
        steps: [
            { label: "Google Calendar", detail: "Settings → 연동 → Google. OAuth로 연결되며 일정이 일·주·월에 자동 표시. AI 브리핑도 참조." },
            { label: "Todoist", detail: "Todoist 설정 → Integrations → API token 복사 → 연동 입력. 오늘 태스크가 일간에 합쳐집니다." },
            { label: "Notion", detail: "Notion API 토큰 입력 시 미완 할 일을 가져옵니다." },
            { label: "Slack", detail: "Webhook URL을 등록하면 아침·저녁 브리핑이 채널로 자동 전송됩니다." },
            { label: "iCal", detail: "구독 URL(.ics)을 입력하면 외부 캘린더가 일정으로 들어옵니다." },
        ],
    },
    {
        id: "location",
        icon: MapPin,
        title: "위치 서비스",
        intro: "현재 위치 한 번을 기반으로 네 가지가 자연스럽게 채워집니다.",
        steps: [
            { label: "날씨", detail: "오늘 날짜 상단에 기온·체감·아이콘·습도·풍속·강수확률·UV. (Open-Meteo)" },
            { label: "일출 / 일몰", detail: "시간 페이지 컨텍스트 스트립과 우측 패널에 자동 표시. (Open-Meteo)" },
            { label: "타임존 자동 감지", detail: "다른 지역에서 접속하면 일간 헤더에 홈 타임존 변경 제안." },
            { label: "장소 태깅", detail: "시간 트래커 입력란의 「📍」 버튼 → 현재 도로명·동/구가 활동·메모에 자동 채움. (OpenStreetMap Nominatim)" },
        ],
        tip: "권한이 거부된 상태라면 「권한 다시 켜기」 버튼이 단계별 가이드 모달을 열어 드립니다. 브라우저·OS를 자동 감지해 정확한 경로를 안내하고, 외부에서 권한을 허용하면 모달이 자동으로 닫힙니다.",
    },
    {
        id: "mic",
        icon: Mic,
        title: "마이크 · 음성 입력",
        intro: "키보드 없이도 생각을 잡아두기 위해.",
        steps: [
            { label: "지원 환경", detail: "Web Speech API 기반 — Chrome · Edge · Safari 권장. Firefox는 미지원." },
            { label: "사용처", detail: "일간 노트 도구의 「녹음」 버튼, 각 노트 카드 🎤 아이콘." },
            { label: "권한", detail: "최초 사용 시 브라우저가 마이크 권한을 묻습니다. 거부 후에는 Settings → 마이크 → 「권한 다시 켜기」 가이드를 따라 허용." },
        ],
    },
    {
        id: "notifications",
        icon: Bell,
        title: "알림",
        intro: "필요한 만큼만, 원하는 곳에서.",
        steps: [
            { label: "이메일", detail: "아침·저녁 브리핑 도착 알림. Settings → 알림 → 이메일 토글." },
            { label: "푸시 (PWA)", detail: "홈 화면에 설치된 마이버스 AI에 즉시 푸시. 브라우저별 권한 허용 후 작동." },
        ],
    },
    {
        id: "personalize",
        icon: Palette,
        title: "개인화 — 색·글꼴·모서리·모드",
        intro: "노트를 손에 맞게 다듬는 시간. Settings → 스타일에서 모두 즉시 미리보기.",
        steps: [
            { label: "컬러 테마", detail: "Teal · Mono · Walnut · Crimson 등 12종. 다크 모드에서도 자동으로 가독성을 보정합니다." },
            { label: "글꼴", detail: "Serif · Playfair · Sans · 고딕 · Mono · 둥근. 화면 글꼴과 입력 글꼴을 따로 지정 가능." },
            { label: "모서리", detail: "Sharp(각짐) / Subtle / Soft(기본) — 카드 모서리 곡률 일괄 조정." },
            { label: "라이트 / 다크 / 시스템", detail: "원하는 모드 선택. System은 OS 설정을 따라갑니다." },
        ],
    },
    {
        id: "install",
        icon: Smartphone,
        title: "PWA 설치 · 오프라인",
        intro: "별도 앱 스토어 없이, 한 번 설치로 홈 화면에 들어갑니다.",
        steps: [
            { label: "Android", detail: "Chrome으로 접속 → 주소창 우측 「설치」 또는 햄버거 메뉴 → 앱 설치." },
            { label: "iPhone · iPad", detail: "Safari로 접속 → 공유 아이콘 → 「홈 화면에 추가」." },
            { label: "PC (Windows · macOS)", detail: "Chrome · Edge · 웨일 주소창 우측 설치 아이콘 클릭." },
            { label: "오프라인", detail: "이미 불러온 페이지는 인터넷 없이도 열람 가능. 새 입력은 연결 시 자동 동기화." },
        ],
    },
    {
        id: "search",
        icon: Search,
        title: "검색 · 단축키",
        intro: "쌓일수록 가벼워야 합니다.",
        steps: [
            { label: "전역 검색", detail: "상단 우측 🔍 또는 Cmd/Ctrl+K. 노트·할 일·일정·프로젝트를 한 입력창으로 탐색." },
            { label: "명령 팔레트", detail: "검색창에 명령어 슬래시(/)를 붙이면 「오늘로 이동」·「새 프로젝트」 같은 액션이 즉시 실행." },
            { label: "주요 단축키", detail: "T = 오늘 / D·W·M·Y = 일·주·월·연 / I = 인덱스 / Cmd+K = 검색 / Esc = 모달 닫기." },
        ],
    },
    {
        id: "export",
        icon: Download,
        title: "데이터 내보내기 · 백업",
        intro: "당신의 기록은 언제든 당신의 것.",
        paragraphs: [
            "Settings → 데이터에서 JSON 형태로 전체 데이터를 내보낼 수 있습니다. 일·주·월·연 기록, 노트, 프로젝트, 정체성, 트래킹이 모두 포함됩니다.",
            "탈퇴를 선택하시는 경우, 동일 화면에서 데이터 영구 삭제 요청이 가능합니다. 삭제는 30일 유예 후 복구 불가능하게 진행됩니다.",
        ],
    },
    {
        id: "billing",
        icon: CreditCard,
        title: "구독 · 결제",
        intro: "연간 단일 플랜. 종이 플래너 구매자에겐 1년 무료.",
        steps: [
            { label: "요금", detail: "연 19,000원. 모든 기능 포함." },
            { label: "PDF 플래너 혜택", detail: "구매 이메일을 lools@tenone.biz로 보내주시면 1년 무료 활성화." },
            { label: "결제 실패 시", detail: "카드 정보 재확인 또는 다른 카드 시도. 지속되면 lools@tenone.biz로 문의." },
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
                    <BookOpen className="h-6 w-6 text-[#6366F1] myverse-dark:text-[#A5B4FC]" />
                    <h1 className="font-serif text-2xl md:text-3xl text-neutral-900 myverse-dark:text-neutral-100">
                        사용 가이드
                    </h1>
                </div>
                <p className="text-sm text-neutral-500 myverse-dark:text-neutral-400 leading-relaxed max-w-xl">
                    마이버스 AI의 모든 기능을 한 권으로 정리했습니다.
                    필요한 곳을 펼쳐보세요 — 머무르며 다음 페이지를 만들어 가세요.
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
                                                ? "text-[#6366F1] myverse-dark:text-[#A5B4FC] font-medium bg-[#6366F1]/5"
                                                : "text-neutral-500 myverse-dark:text-neutral-400 hover:text-[#6366F1]"
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
                                <span className="shrink-0 mt-1 text-[#6366F1] myverse-dark:text-[#A5B4FC]">
                                    <s.icon className="h-5 w-5" />
                                </span>
                                <div className="min-w-0">
                                    <h2 className="font-serif text-lg md:text-xl text-neutral-900 myverse-dark:text-neutral-100 leading-tight">
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
                                                <ChevronRight className="h-3.5 w-3.5 text-[#6366F1] myverse-dark:text-[#A5B4FC] mt-1 shrink-0" />
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
                                <div className="mt-5 ml-8 px-3 py-2.5 bg-[#6366F1]/5 border-l-2 border-[#6366F1]/40 rounded-r text-xs text-neutral-700 myverse-dark:text-neutral-300 leading-relaxed">
                                    <span className="font-medium text-[#6366F1] myverse-dark:text-[#A5B4FC] mr-1.5">팁</span>
                                    {s.tip}
                                </div>
                            )}
                        </section>
                    ))}

                    <section className="bg-[#6366F1]/5 border border-[#6366F1]/20 rounded-xl px-5 py-6 md:px-7 md:py-7">
                        <div className="flex items-start gap-3">
                            <Mail className="h-5 w-5 text-[#6366F1] myverse-dark:text-[#A5B4FC] mt-0.5 shrink-0" />
                            <div>
                                <h2 className="font-serif text-lg text-neutral-900 myverse-dark:text-neutral-100">
                                    더 궁금한 것이 있다면
                                </h2>
                                <p className="text-sm text-neutral-600 myverse-dark:text-neutral-300 mt-2 leading-relaxed">
                                    이 가이드에 없는 질문, 아이디어, 불편함은 직접 만든 사람에게 전해주세요.
                                    영업일 기준 1~2일 안에 답장드립니다.
                                </p>
                                <a
                                    href="mailto:lools@tenone.biz"
                                    className="inline-flex items-center gap-1.5 mt-3 text-sm text-[#6366F1] myverse-dark:text-[#A5B4FC] hover:underline font-medium"
                                >
                                    <Mail className="h-3.5 w-3.5" />
                                    lools@tenone.biz
                                </a>
                            </div>
                        </div>
                    </section>
                </main>
            </div>
        </div>
    );
}
