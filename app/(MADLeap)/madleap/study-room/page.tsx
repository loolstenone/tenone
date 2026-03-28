"use client";

import { useState } from "react";
import Link from "next/link";
import {
    BookOpen,
    Brain,
    BarChart3,
    PenTool,
    Monitor,
    Megaphone,
    Users,
    Clock,
    Calendar,
    ChevronDown,
    ChevronUp,
    CheckCircle,
    ArrowRight,
    Sparkles,
} from "lucide-react";

/* ── Study Data ── */

type Study = {
    icon: typeof Brain;
    title: string;
    desc: string;
    tags: string[];
    capacity: number;
    current: number;
    schedule: string;
    day: string;
    leader: string;
    leaderSchool: string;
    status: "모집중" | "진행중" | "마감";
    curriculum: string[];
    semester: string;
};

const studies: Study[] = [
    {
        icon: Brain,
        title: "AI 마케팅 실전반",
        desc: "ChatGPT, Claude, MidJourney 등 AI 도구를 활용한 마케팅 기획부터 실행까지. 실제 캠페인에 AI를 적용하는 워크숍형 스터디.",
        tags: ["AI", "프롬프팅", "자동화", "ChatGPT"],
        capacity: 15,
        current: 11,
        schedule: "매주 토요일 14:00~16:00",
        day: "토",
        leader: "박지호",
        leaderSchool: "성균관대",
        status: "모집중",
        semester: "2026 상반기",
        curriculum: [
            "Week 1-2: AI 마케팅 개론 + 주요 도구 세팅",
            "Week 3-4: AI 카피라이팅 실습 (Claude, ChatGPT)",
            "Week 5-6: AI 이미지 생성 + 비주얼 마케팅",
            "Week 7-8: AI 기반 퍼포먼스 광고 최적화",
            "Week 9-10: 실전 프로젝트 — AI로 캠페인 기획·실행",
            "Week 11-12: 결과 분석 + 포트폴리오 정리",
        ],
    },
    {
        icon: Megaphone,
        title: "퍼포먼스 마케팅 심화",
        desc: "Meta Ads, Google Ads 실전 운영. 직접 광고를 돌리고, 데이터를 분석하고, ROAS를 개선하는 과정.",
        tags: ["Meta Ads", "Google Ads", "ROAS", "GA4"],
        capacity: 10,
        current: 10,
        schedule: "매주 화요일 19:30~21:30",
        day: "화",
        leader: "정민재",
        leaderSchool: "한양대",
        status: "마감",
        semester: "2026 상반기",
        curriculum: [
            "Week 1-2: 퍼포먼스 마케팅 프레임워크 + 계정 세팅",
            "Week 3-4: Meta Ads 캠페인 구조 설계 + 집행",
            "Week 5-6: Google Ads 검색/디스플레이 실습",
            "Week 7-8: A/B 테스트 + 크리에이티브 최적화",
            "Week 9-10: GA4 연동 + 전환 추적 설정",
            "Week 11-12: 실전 광고 운영 + ROAS 리포트",
        ],
    },
    {
        icon: PenTool,
        title: "브랜딩 전략 워크숍",
        desc: "브랜드 전략 수립부터 아이덴티티 디자인까지. 실제 로컬 브랜드를 대상으로 리브랜딩 프로젝트 수행.",
        tags: ["브랜딩", "BI", "포지셔닝", "전략"],
        capacity: 12,
        current: 8,
        schedule: "격주 일요일 13:00~16:00",
        day: "일(격주)",
        leader: "한소율",
        leaderSchool: "홍익대",
        status: "모집중",
        semester: "2026 상반기",
        curriculum: [
            "Session 1: 브랜드란 무엇인가 — 핵심 개념 정리",
            "Session 2: 시장 분석 + 포지셔닝 맵 작성",
            "Session 3: 브랜드 아이덴티티 요소 설계",
            "Session 4: 네이밍 + 비주얼 아이덴티티 워크숍",
            "Session 5: 브랜드 커뮤니케이션 전략 수립",
            "Session 6: 최종 발표 + 피드백",
        ],
    },
    {
        icon: Monitor,
        title: "콘텐츠 마케팅 Lab",
        desc: "인스타그램, 유튜브, 틱톡 콘텐츠 기획·제작·분석 실전 워크숍. 직접 계정을 운영하며 콘텐츠 감각을 키운다.",
        tags: ["인스타그램", "유튜브", "틱톡", "숏폼"],
        capacity: 15,
        current: 13,
        schedule: "매주 목요일 20:00~22:00",
        day: "목",
        leader: "최은서",
        leaderSchool: "중앙대",
        status: "모집중",
        semester: "2026 상반기",
        curriculum: [
            "Week 1-2: 콘텐츠 마케팅 트렌드 + 채널별 특성",
            "Week 3-4: 인스타그램 피드/릴스 기획 + 촬영",
            "Week 5-6: 유튜브 숏폼 콘텐츠 제작",
            "Week 7-8: 틱톡 트렌드 분석 + 챌린지 기획",
            "Week 9-10: 콘텐츠 성과 분석 + 인사이트 도출",
            "Week 11-12: 통합 콘텐츠 캘린더 운영 실습",
        ],
    },
    {
        icon: BarChart3,
        title: "데이터 분석 부트캠프",
        desc: "GA4, SQL, Python을 활용한 마케팅 데이터 분석. 실제 데이터셋으로 고객 세그먼트 분석, 퍼널 최적화 실습.",
        tags: ["GA4", "SQL", "Python", "세그먼트"],
        capacity: 10,
        current: 7,
        schedule: "매주 수요일 19:00~21:00",
        day: "수",
        leader: "이도현",
        leaderSchool: "서울대",
        status: "모집중",
        semester: "2026 상반기",
        curriculum: [
            "Week 1-2: 마케팅 데이터 분석 개론 + 환경 세팅",
            "Week 3-4: GA4 이벤트 설정 + 보고서 활용",
            "Week 5-6: SQL 기초 — 데이터 추출·가공",
            "Week 7-8: Python 기초 — 판다스로 데이터 분석",
            "Week 9-10: 고객 세그먼트 분석 실전 프로젝트",
            "Week 11-12: 대시보드 제작 + 인사이트 발표",
        ],
    },
    {
        icon: BookOpen,
        title: "마케팅 북클럽",
        desc: "마케팅·광고·경영 관련 필독서를 함께 읽고 토론. 이론적 깊이와 시야를 넓히는 월 1회 독서 모임.",
        tags: ["독서", "토론", "인사이트", "네트워킹"],
        capacity: 25,
        current: 18,
        schedule: "월 1회 일요일 14:00~16:00",
        day: "일(월1회)",
        leader: "김도윤",
        leaderSchool: "고려대",
        status: "진행중",
        semester: "상시 운영",
        curriculum: [
            "3월: 포지셔닝 (잭 트라우트)",
            "4월: 컨테이저스 (조나 버거)",
            "5월: 마케팅 불변의 법칙 (알 리스)",
            "6월: 브랜드 갭 (마티 뉴마이어)",
            "7월: 인스타 브레인 (안데르스 한센)",
            "8월: 그로스 해킹 (션 엘리스)",
        ],
    },
];

const statusConfig = {
    "모집중": { color: "bg-green-100 text-green-700", dot: "bg-green-500" },
    "진행중": { color: "bg-blue-100 text-blue-700", dot: "bg-blue-500" },
    "마감": { color: "bg-neutral-100 text-neutral-500", dot: "bg-neutral-400" },
};

export default function MadLeapStudyRoomPage() {
    const [expanded, setExpanded] = useState<string | null>(null);

    const openCount = studies.filter((s) => s.status === "모집중").length;
    const totalMembers = studies.reduce((sum, s) => sum + s.current, 0);

    return (
        <>
            {/* Hero */}
            <section className="bg-[#1a1a2e] text-white py-20 md:py-24">
                <div className="mx-auto max-w-4xl px-6 text-center">
                    <p className="text-[#4361ee] text-sm font-semibold tracking-wider uppercase mb-3">Study Room</p>
                    <h1 className="text-2xl md:text-4xl font-bold mb-4">함께 공부하고, 함께 성장합니다</h1>
                    <p className="text-neutral-400">2026 상반기 스터디 · {studies.length}개 운영 · {openCount}개 모집중</p>

                    <div className="flex items-center justify-center gap-8 mt-8">
                        <div className="text-center">
                            <div className="text-2xl font-black text-[#4361ee]">{studies.length}</div>
                            <div className="text-xs text-neutral-400">스터디</div>
                        </div>
                        <div className="w-px h-8 bg-white/10" />
                        <div className="text-center">
                            <div className="text-2xl font-black text-[#4361ee]">{totalMembers}</div>
                            <div className="text-xs text-neutral-400">참여 중</div>
                        </div>
                        <div className="w-px h-8 bg-white/10" />
                        <div className="text-center">
                            <div className="text-2xl font-black text-green-400">{openCount}</div>
                            <div className="text-xs text-neutral-400">모집중</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Study List */}
            <section className="py-12 md:py-20">
                <div className="mx-auto max-w-5xl px-6">
                    <div className="space-y-4">
                        {studies.map((s) => {
                            const isExpanded = expanded === s.title;
                            const fillPct = Math.round((s.current / s.capacity) * 100);
                            const sc = statusConfig[s.status];

                            return (
                                <div
                                    key={s.title}
                                    className={`border rounded-xl overflow-hidden transition-all ${
                                        isExpanded ? "border-[#4361ee]/30 shadow-md" : "border-neutral-200 hover:border-neutral-300"
                                    }`}
                                >
                                    {/* Header */}
                                    <button
                                        onClick={() => setExpanded(isExpanded ? null : s.title)}
                                        className="w-full text-left p-5 md:p-6 flex items-start gap-4"
                                    >
                                        <div className="w-12 h-12 bg-[#4361ee]/10 rounded-xl flex items-center justify-center shrink-0">
                                            <s.icon className="h-6 w-6 text-[#4361ee]" />
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap mb-1">
                                                <h3 className="font-bold text-lg">{s.title}</h3>
                                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium flex items-center gap-1 ${sc.color}`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${sc.dot} ${s.status === "모집중" ? "animate-pulse" : ""}`} />
                                                    {s.status}
                                                </span>
                                            </div>
                                            <p className="text-neutral-500 text-sm line-clamp-1 mb-3">{s.desc}</p>

                                            {/* Meta row */}
                                            <div className="flex items-center gap-4 flex-wrap text-xs text-neutral-400">
                                                <span className="flex items-center gap-1">
                                                    <Users className="h-3.5 w-3.5" />
                                                    {s.current}/{s.capacity}명
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Clock className="h-3.5 w-3.5" />
                                                    {s.schedule}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Sparkles className="h-3.5 w-3.5" />
                                                    리더: {s.leader} ({s.leaderSchool})
                                                </span>
                                            </div>

                                            {/* Capacity bar */}
                                            <div className="mt-3 flex items-center gap-3">
                                                <div className="flex-1 h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full transition-all ${
                                                            fillPct >= 100 ? "bg-neutral-400" : fillPct >= 80 ? "bg-orange-400" : "bg-[#4361ee]"
                                                        }`}
                                                        style={{ width: `${Math.min(fillPct, 100)}%` }}
                                                    />
                                                </div>
                                                <span className="text-[10px] text-neutral-400 shrink-0">{fillPct}%</span>
                                            </div>
                                        </div>

                                        <div className="shrink-0 mt-1">
                                            {isExpanded ? (
                                                <ChevronUp className="h-5 w-5 text-neutral-400" />
                                            ) : (
                                                <ChevronDown className="h-5 w-5 text-neutral-400" />
                                            )}
                                        </div>
                                    </button>

                                    {/* Expanded content */}
                                    {isExpanded && (
                                        <div className="border-t border-neutral-100 px-5 md:px-6 py-5 bg-neutral-50/50">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                {/* Curriculum */}
                                                <div>
                                                    <h4 className="text-sm font-bold mb-3 flex items-center gap-2">
                                                        <Calendar className="h-4 w-4 text-[#4361ee]" />
                                                        커리큘럼 미리보기
                                                    </h4>
                                                    <ul className="space-y-2">
                                                        {s.curriculum.map((item, i) => (
                                                            <li key={i} className="flex items-start gap-2 text-sm text-neutral-600">
                                                                <CheckCircle className="h-4 w-4 text-[#4361ee]/50 shrink-0 mt-0.5" />
                                                                {item}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>

                                                {/* Info + CTA */}
                                                <div className="space-y-4">
                                                    <div className="bg-white rounded-xl border border-neutral-200 p-4">
                                                        <h4 className="text-sm font-bold mb-3">스터디 정보</h4>
                                                        <div className="space-y-2 text-sm">
                                                            <div className="flex justify-between">
                                                                <span className="text-neutral-400">일정</span>
                                                                <span className="font-medium">{s.schedule}</span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span className="text-neutral-400">정원</span>
                                                                <span className="font-medium">{s.current} / {s.capacity}명</span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span className="text-neutral-400">운영기간</span>
                                                                <span className="font-medium">{s.semester}</span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span className="text-neutral-400">스터디 리더</span>
                                                                <span className="font-medium">{s.leader} ({s.leaderSchool})</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-wrap gap-1.5">
                                                        {s.tags.map((tag) => (
                                                            <span key={tag} className="text-xs px-2 py-0.5 bg-[#4361ee]/10 text-[#4361ee] rounded">
                                                                {tag}
                                                            </span>
                                                        ))}
                                                    </div>

                                                    {s.status === "모집중" ? (
                                                        <button className="w-full py-3 bg-[#4361ee] text-white font-medium rounded-lg hover:bg-[#3451de] transition-colors flex items-center justify-center gap-2">
                                                            스터디 신청하기
                                                            <ArrowRight className="h-4 w-4" />
                                                        </button>
                                                    ) : s.status === "마감" ? (
                                                        <button className="w-full py-3 bg-neutral-200 text-neutral-500 font-medium rounded-lg cursor-not-allowed" disabled>
                                                            모집 마감
                                                        </button>
                                                    ) : (
                                                        <button className="w-full py-3 bg-neutral-100 text-neutral-600 font-medium rounded-lg cursor-default" disabled>
                                                            진행중 (다음 기수에 신청 가능)
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* How to Join */}
            <section className="bg-neutral-50 py-16">
                <div className="mx-auto max-w-4xl px-6">
                    <h2 className="text-xl md:text-2xl font-bold text-center mb-4">스터디 참여 방법</h2>
                    <p className="text-neutral-500 text-center text-sm mb-10">매드립 리퍼라면 누구나 스터디에 참여할 수 있습니다</p>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {[
                            { step: "01", title: "매드립 가입", desc: "정규 기수 모집을 통해 리퍼가 됩니다" },
                            { step: "02", title: "스터디 탐색", desc: "관심 분야 스터디의 커리큘럼을 확인합니다" },
                            { step: "03", title: "신청", desc: "'스터디 신청하기' 버튼으로 바로 신청" },
                            { step: "04", title: "함께 성장", desc: "정기 모임에 참여하며 실력을 키웁니다" },
                        ].map((item) => (
                            <div key={item.step} className="bg-white p-6 rounded-xl border border-neutral-200 text-center">
                                <div className="text-2xl font-black text-[#4361ee] mb-2">{item.step}</div>
                                <h3 className="font-semibold mb-1">{item.title}</h3>
                                <p className="text-xs text-neutral-500">{item.desc}</p>
                            </div>
                        ))}
                    </div>

                    <div className="text-center mt-8">
                        <p className="text-sm text-neutral-500 mb-4">아직 매드립 리퍼가 아니라면?</p>
                        <Link
                            href="/madleap/apply"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-[#1a1a2e] text-white font-medium rounded-lg hover:bg-[#1a1a2e]/90 transition-colors"
                        >
                            5기 지원하기 <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                </div>
            </section>
        </>
    );
}
