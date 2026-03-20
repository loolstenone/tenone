"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import {
    Bell, Calendar, ArrowRight, Target, CheckCircle2, Clock,
    FolderKanban, TrendingUp, AlertCircle, Users, Zap,
    MessageSquare, User, Building2, Flame, Newspaper,
} from "lucide-react";

const dailyQuotes = [
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
    "가치로 연결되면 거리는 의미가 없다.",
    "약한 연결고리가 강력한 기회를 만든다.",
    "경쟁하지 말고, 연결하라.",
    "빠르게 실패하고, 더 빠르게 배워라.",
    "오늘의 실험이 내일의 사업이 된다.",
    "먼저 움직이는 사람이 판을 바꾼다.",
    "작게 시작하되, 크게 설계하라.",
    "완벽한 타이밍은 없다. 지금이 최선이다.",
    "한 번의 실행이 백 번의 계획을 이긴다.",
    "기획하고, 연결하고, 확장한다.",
    "전략은 선택이다. 무엇을 안 할지 정하라.",
    "큰 그림을 그리되, 오늘 할 일에 집중하라.",
    "콘텐츠는 한 번 만들고, 열 번 활용하라.",
    "브랜드는 약속이다. 매일 지켜야 하는.",
    "일관성이 브랜드를 만든다.",
    "메시지는 단순할수록 강력하다.",
    "배움을 멈추면 성장도 멈춘다.",
    "어제의 나와 경쟁하라.",
    "투명한 소통이 신뢰를 만든다.",
    "문화가 전략을 이긴다.",
    "의사결정은 빠르게, 실행은 정확하게.",
    "목표 없는 노력은 방향 없는 항해다.",
    "측정할 수 없으면 개선할 수 없다.",
    "매일 1%씩 나아지면 1년 후 37배가 된다.",
    "성과는 습관의 총합이다.",
    "Plan. Connect. Expand.",
    "끝까지 해내는 사람이 결국 이긴다.",
];

// ── Mock data ──
const myProjects = [
    { name: "LUKI 2nd Single", status: "진행중", progress: 72, deadline: "2026-04-15", role: "기획 총괄" },
    { name: "MADLeap 5기 운영", status: "진행중", progress: 45, deadline: "2026-06-30", role: "PM" },
    { name: "Badak 네트워크 확장", status: "계획", progress: 10, deadline: "2026-05-01", role: "파트너십" },
];

const teamActivity = [
    { name: "Sarah Kim", action: "LUKI 콘텐츠 가이드라인 공유", time: "2시간 전" },
    { name: "김준호", action: "MADLeap 커리큘럼 초안 업로드", time: "4시간 전" },
    { name: "이수진", action: "Badak 밋업 장소 예약 완료", time: "어제" },
    { name: "박민서", action: "GPR 자기평가 제출", time: "어제" },
];

const myGPR = {
    period: "2026 Q1",
    totalGoals: 4,
    completed: 1,
    inProgress: 2,
    notStarted: 1,
    overallProgress: 38,
    nextReview: "2026-03-31",
};

const myTasks = [
    { title: "LUKI MV 컨셉 기획서 작성", project: "LUKI 2nd Single", priority: "높음", due: "2026-03-22" },
    { title: "MADLeap 5기 커리큘럼 검토", project: "MADLeap 5기 운영", priority: "보통", due: "2026-03-25" },
    { title: "GPR 자기 평가 작성", project: "HR", priority: "높음", due: "2026-03-31" },
    { title: "Badak 4월 밋업 기획", project: "Badak 네트워크 확장", priority: "낮음", due: "2026-04-01" },
];

const todaySchedule = [
    { time: "10:00", title: "주간 팀 회의", type: "회의" },
    { time: "14:00", title: "MADLeap 5기 정기 모임", type: "행사" },
    { time: "16:00", title: "콘텐츠 리뷰", type: "리뷰" },
];

const recentNotices = [
    { title: "GPR 자기 평가 마감 안내 (3/31)", badge: "HR", date: "03-15" },
    { title: "MADLeague 인사이트 투어링 모집", badge: "중요", date: "03-10" },
    { title: "Vrief 교육 일정 안내 (4월)", badge: "교육", date: "03-08" },
];

const recentFree = [
    { title: "LUKI 2nd Single 어떻게 생각하세요?", author: "Sarah Kim", comments: 2 },
    { title: "금요일 점심 같이 드실 분", author: "김준호", comments: 0 },
    { title: "재택근무 팁 공유합니다", author: "Sarah Kim", comments: 1 },
];

const hotContent = [
    { title: "LUKI — AI 4인조 걸그룹 데뷔", views: "12.4K", channel: "Works" },
    { title: "MAD League X 지평주조 — 경쟁 PT", views: "8.2K", channel: "Newsroom" },
    { title: "RooK — AI 크리에이터 플랫폼 런칭", views: "6.7K", channel: "Works" },
];

const latestNews = [
    { title: "DAM Be — MAD League 캐릭터 개발", date: "2025-03-31" },
    { title: "전국 5개 권역 네트워크 완성", date: "2025-01-13" },
];

export default function IntraPage() {
    const { user } = useAuth();
    const todayQuote = useMemo(() => {
        const today = new Date();
        const dayIndex = (today.getFullYear() * 400 + today.getMonth() * 31 + today.getDate()) % dailyQuotes.length;
        return dailyQuotes[dayIndex];
    }, []);

    return (
        <div className="space-y-5">
            {/* ═══ Welcome ═══ */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-2xl font-bold">안녕하세요, {user?.name ?? 'User'}님</h1>
                    <p className="mt-1 text-sm text-neutral-400 italic">&ldquo;{todayQuote}&rdquo;</p>
                </div>
                <div className="flex items-center gap-3">
                    <Link href="/intra/profile" className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-neutral-900 border border-neutral-200 px-3 py-1.5 rounded hover:border-neutral-400 transition-colors">
                        <User className="h-3 w-3" /> 프로필 보기
                    </Link>
                    <Link href="/intra/erp/hr/people/org" className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-neutral-900 border border-neutral-200 px-3 py-1.5 rounded hover:border-neutral-400 transition-colors">
                        <Building2 className="h-3 w-3" /> 조직도
                    </Link>
                    <span className="text-xs text-neutral-300">
                        {new Date().toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' })}
                    </span>
                </div>
            </div>

            {/* ═══ Row 1: Quick Stats ═══ */}
            <div className="grid grid-cols-5 gap-3">
                {[
                    { label: "내 프로젝트", value: myProjects.length, icon: FolderKanban, color: "text-blue-600" },
                    { label: "대기 업무", value: myTasks.length, icon: AlertCircle, color: "text-amber-600" },
                    { label: "GPR 달성률", value: `${myGPR.overallProgress}%`, icon: Target, color: "text-green-600" },
                    { label: "오늘 일정", value: todaySchedule.length, icon: Calendar, color: "text-purple-600" },
                    { label: "새 공지", value: recentNotices.length, icon: Bell, color: "text-red-500" },
                ].map(s => (
                    <div key={s.label} className="border border-neutral-200 bg-white p-3 flex items-center gap-3">
                        <s.icon className={`h-5 w-5 ${s.color}`} />
                        <div>
                            <p className="text-xl font-bold">{s.value}</p>
                            <p className="text-[10px] text-neutral-500">{s.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* ═══ Row 2: 내 프로젝트 | 팀 활동 + GPR ═══ */}
            <div className="grid grid-cols-3 gap-5">
                {/* 내 프로젝트 */}
                <div className="col-span-1 border border-neutral-200 bg-white">
                    <div className="px-4 py-3 border-b border-neutral-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <FolderKanban className="h-4 w-4 text-neutral-400" />
                            <h2 className="text-sm font-semibold">내 프로젝트</h2>
                        </div>
                        <Link href="/intra/project/management" className="text-[10px] text-neutral-400 hover:text-neutral-900 flex items-center gap-0.5">
                            전체 <ArrowRight className="h-2.5 w-2.5" />
                        </Link>
                    </div>
                    <div className="divide-y divide-neutral-50">
                        {myProjects.map(p => (
                            <div key={p.name} className="px-4 py-3">
                                <div className="flex items-center justify-between mb-1">
                                    <p className="text-sm font-medium truncate">{p.name}</p>
                                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-medium ${
                                        p.status === '진행중' ? 'bg-blue-50 text-blue-600' : 'bg-neutral-100 text-neutral-500'
                                    }`}>{p.status}</span>
                                </div>
                                <p className="text-[10px] text-neutral-400 mb-1.5">{p.role} · 마감 {p.deadline}</p>
                                <div className="flex items-center gap-2">
                                    <div className="flex-1 h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-neutral-900 rounded-full" style={{ width: `${p.progress}%` }} />
                                    </div>
                                    <span className="text-[10px] text-neutral-400 w-7 text-right">{p.progress}%</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 팀 활동 */}
                <div className="border border-neutral-200 bg-white">
                    <div className="px-4 py-3 border-b border-neutral-100 flex items-center gap-2">
                        <Zap className="h-4 w-4 text-neutral-400" />
                        <h2 className="text-sm font-semibold">팀 활동</h2>
                    </div>
                    <ul className="divide-y divide-neutral-50">
                        {teamActivity.map((a, i) => (
                            <li key={i} className="px-4 py-2.5">
                                <div className="flex items-center gap-2 mb-0.5">
                                    <div className="h-5 w-5 rounded-full bg-neutral-200 flex items-center justify-center text-[8px] font-bold text-neutral-500 shrink-0">
                                        {a.name[0]}
                                    </div>
                                    <span className="text-xs font-medium">{a.name}</span>
                                    <span className="text-[10px] text-neutral-300 ml-auto">{a.time}</span>
                                </div>
                                <p className="text-xs text-neutral-500 pl-7">{a.action}</p>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* GPR */}
                <div className="border border-neutral-200 bg-white">
                    <div className="px-4 py-3 border-b border-neutral-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Target className="h-4 w-4 text-neutral-400" />
                            <h2 className="text-sm font-semibold">내 GPR</h2>
                        </div>
                        <span className="text-[10px] text-neutral-400">{myGPR.period}</span>
                    </div>
                    <div className="p-4">
                        <div className="flex items-center justify-center mb-3">
                            <div className="relative w-20 h-20">
                                <svg className="w-20 h-20 -rotate-90" viewBox="0 0 36 36">
                                    <circle cx="18" cy="18" r="15.91" fill="none" stroke="#f5f5f5" strokeWidth="3" />
                                    <circle cx="18" cy="18" r="15.91" fill="none" stroke="#171717"
                                        strokeWidth="3" strokeDasharray={`${myGPR.overallProgress} ${100 - myGPR.overallProgress}`}
                                        strokeLinecap="round" />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-lg font-bold">{myGPR.overallProgress}%</span>
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-center mb-3">
                            <div>
                                <p className="text-base font-bold text-green-600">{myGPR.completed}</p>
                                <p className="text-[9px] text-neutral-400">완료</p>
                            </div>
                            <div>
                                <p className="text-base font-bold text-blue-600">{myGPR.inProgress}</p>
                                <p className="text-[9px] text-neutral-400">진행</p>
                            </div>
                            <div>
                                <p className="text-base font-bold text-neutral-300">{myGPR.notStarted}</p>
                                <p className="text-[9px] text-neutral-400">미시작</p>
                            </div>
                        </div>
                        <div className="text-center text-[10px] text-neutral-400 border-t border-neutral-50 pt-2">
                            다음 리뷰: {myGPR.nextReview}
                        </div>
                        <Link href="/intra/erp/hr/gpr" className="block mt-2 text-center text-xs text-neutral-400 hover:text-neutral-900 transition-colors">
                            GPR 상세보기 →
                        </Link>
                    </div>
                </div>
            </div>

            {/* ═══ Row 3: 내 업무 | 오늘 일정 | 공지사항 | 자유게시판 ═══ */}
            <div className="grid grid-cols-4 gap-5">
                {/* 내 업무 */}
                <div className="border border-neutral-200 bg-white">
                    <div className="px-4 py-3 border-b border-neutral-100 flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-neutral-400" />
                        <h2 className="text-sm font-semibold">내 업무</h2>
                    </div>
                    <ul className="divide-y divide-neutral-50">
                        {myTasks.map((t, i) => (
                            <li key={i} className="px-4 py-2.5">
                                <div className="flex items-start gap-2">
                                    <div className={`mt-1 h-2 w-2 rounded-full shrink-0 ${
                                        t.priority === '높음' ? 'bg-red-400' : t.priority === '보통' ? 'bg-amber-400' : 'bg-neutral-300'
                                    }`} />
                                    <div className="min-w-0">
                                        <p className="text-xs truncate">{t.title}</p>
                                        <div className="flex items-center gap-1.5 mt-0.5">
                                            <span className="text-[9px] text-neutral-400">{t.project}</span>
                                            <span className="text-[9px] text-neutral-300 flex items-center gap-0.5">
                                                <Clock className="h-2 w-2" /> {t.due}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* 오늘 일정 */}
                <div className="border border-neutral-200 bg-white">
                    <div className="px-4 py-3 border-b border-neutral-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-neutral-400" />
                            <h2 className="text-sm font-semibold">오늘 일정</h2>
                        </div>
                        <Link href="/intra/comm/calendar" className="text-[10px] text-neutral-400 hover:text-neutral-900">
                            캘린더 →
                        </Link>
                    </div>
                    <ul className="divide-y divide-neutral-50">
                        {todaySchedule.map((ev, i) => (
                            <li key={i} className="px-4 py-2.5 flex items-center gap-3">
                                <span className="text-xs font-mono font-medium w-10 shrink-0">{ev.time}</span>
                                <div className="w-px h-6 bg-neutral-200" />
                                <div>
                                    <p className="text-xs">{ev.title}</p>
                                    <p className="text-[9px] text-neutral-400">{ev.type}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* 공지사항 */}
                <div className="border border-neutral-200 bg-white">
                    <div className="px-4 py-3 border-b border-neutral-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Bell className="h-4 w-4 text-neutral-400" />
                            <h2 className="text-sm font-semibold">공지사항</h2>
                        </div>
                        <Link href="/intra/comm/notice" className="text-[10px] text-neutral-400 hover:text-neutral-900">
                            전체 →
                        </Link>
                    </div>
                    <ul className="divide-y divide-neutral-50">
                        {recentNotices.map((n, i) => (
                            <li key={i} className="px-4 py-2.5">
                                <div className="flex items-center gap-1.5 mb-0.5">
                                    <span className="text-[8px] px-1 py-0.5 bg-neutral-100 text-neutral-500 font-medium">{n.badge}</span>
                                    <span className="text-[9px] text-neutral-300">{n.date}</span>
                                </div>
                                <p className="text-xs truncate">{n.title}</p>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* 자유게시판 */}
                <div className="border border-neutral-200 bg-white">
                    <div className="px-4 py-3 border-b border-neutral-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <MessageSquare className="h-4 w-4 text-neutral-400" />
                            <h2 className="text-sm font-semibold">자유게시판</h2>
                        </div>
                        <Link href="/intra/comm/free" className="text-[10px] text-neutral-400 hover:text-neutral-900">
                            전체 →
                        </Link>
                    </div>
                    <ul className="divide-y divide-neutral-50">
                        {recentFree.map((p, i) => (
                            <li key={i} className="px-4 py-2.5">
                                <p className="text-xs truncate mb-0.5">{p.title}</p>
                                <div className="flex items-center gap-2 text-[9px] text-neutral-400">
                                    <span>{p.author}</span>
                                    {p.comments > 0 && (
                                        <span className="flex items-center gap-0.5">
                                            <MessageSquare className="h-2 w-2" /> {p.comments}
                                        </span>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* ═══ Row 4: HOT 콘텐츠 | 최신 뉴스 ═══ */}
            <div className="grid grid-cols-2 gap-5">
                {/* HOT 콘텐츠 */}
                <div className="border border-neutral-200 bg-white">
                    <div className="px-4 py-3 border-b border-neutral-100 flex items-center gap-2">
                        <Flame className="h-4 w-4 text-neutral-400" />
                        <h2 className="text-sm font-semibold">HOT 콘텐츠</h2>
                        <span className="text-[9px] text-neutral-300 ml-auto">인기 콘텐츠 (추후 실 데이터 연동)</span>
                    </div>
                    <ul className="divide-y divide-neutral-50">
                        {hotContent.map((c, i) => (
                            <li key={i} className="px-4 py-2.5 flex items-center justify-between">
                                <div className="flex items-center gap-2 min-w-0">
                                    <span className="text-sm font-bold text-neutral-200 w-5">{i + 1}</span>
                                    <p className="text-xs truncate">{c.title}</p>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <span className="text-[9px] text-neutral-400">{c.views}</span>
                                    <span className="text-[8px] px-1.5 py-0.5 bg-neutral-100 text-neutral-500">{c.channel}</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* 최신 뉴스 */}
                <div className="border border-neutral-200 bg-white">
                    <div className="px-4 py-3 border-b border-neutral-100 flex items-center gap-2">
                        <Newspaper className="h-4 w-4 text-neutral-400" />
                        <h2 className="text-sm font-semibold">최신 뉴스</h2>
                        <span className="text-[9px] text-neutral-300 ml-auto">Newsroom 최신 (추후 실 데이터 연동)</span>
                    </div>
                    <ul className="divide-y divide-neutral-50">
                        {latestNews.map((n, i) => (
                            <li key={i} className="px-4 py-2.5 flex items-center justify-between">
                                <p className="text-xs truncate">{n.title}</p>
                                <span className="text-[9px] text-neutral-400 shrink-0">{n.date}</span>
                            </li>
                        ))}
                        <li className="px-4 py-6 text-center text-[10px] text-neutral-300">
                            실 데이터 연동 시 자동 갱신됩니다
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
