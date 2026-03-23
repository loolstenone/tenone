"use client";

import { useAuth } from "@/lib/auth-context";
import { usePoints } from "@/lib/point-context";
import { getDailyQuote } from "@/lib/daily-quotes";
import {
    Mail, Building2, Calendar, Target, Edit2, Shield, BookOpen, Clock,
    FileCheck, User, FolderKanban, ChevronRight, CalendarCheck, CreditCard,
    GraduationCap, Wallet, DollarSign, TrendingUp, AlertCircle, CheckCircle2,
    FileText, Palmtree, Stamp, FileSignature, Trophy
} from "lucide-react";
import Link from "next/link";
import clsx from "clsx";
import { SystemAccessInfo } from "@/types/auth";
import type { SystemAccess } from "@/types/auth";
import { gradeConfig, getPointsToNextGrade } from "@/types/point";

// --- 개인 Mock 데이터 ---
const myHR = {
    employeeId: "2019-0001",
    department: "기업 총괄",
    position: "대표이사",
    hireDate: "2019-10-01",
    employmentType: "정규직",
};

const myLeave = { total: 15, used: 3, remaining: 12, sick: 3, usedSick: 0 };

const myGPR = {
    quarter: "2026 Q1",
    rate: 38,
    grade: "B+",
    goals: 5,
    completed: 2,
    nextReview: "2026-03-31",
    items: [
        { name: "10,000명의 기획자 발굴 네트워크 구축", progress: 25, status: "진행중" },
        { name: "MADLeague 인사이트 투어링 성공적 운영", progress: 60, status: "진행중" },
        { name: "LUKI 데뷔 캠페인 완료", progress: 100, status: "완료" },
    ],
};

const mySalary = {
    thisMonth: { base: 5000000, bonus: 0, deductions: 820000, net: 4180000, status: "지급예정" },
    pension: { type: "확정급여(DB)", total: 18500000 },
};

const myExpenses = {
    pending: 2,
    thisMonth: 350000,
    recentItems: [
        { date: "2026-03-18", desc: "파트너사 미팅 식비", amount: 85000, status: "승인대기" },
        { date: "2026-03-15", desc: "출장 교통비", amount: 120000, status: "승인" },
        { date: "2026-03-10", desc: "사무용품 구매", amount: 45000, status: "지급완료" },
    ],
};

const myProjects = [
    { name: "LUKI 2nd Single", code: "PRJ-2026-001", role: "기획 총괄", progress: 45, status: "진행중" as const },
    { name: "MADLeap 5기 운영", code: "PRJ-2026-002", role: "PM", progress: 25, status: "진행중" as const },
    { name: "Badak 네트워크 확장", code: "PRJ-2026-004", role: "파트너십", progress: 0, status: "계획" as const },
];

const myEducation = {
    mandatory: { total: 6, completed: 2 },
    recent: [
        { name: "VRIEF Orientation", status: "수료" as const },
        { name: "GPR 프레임워크 이해", status: "수료" as const },
        { name: "Mind Set: 본질·속도·이행", status: "진행중" as const },
    ],
};

const myAttendance = {
    thisMonth: { workDays: 14, avgHours: "9h 12m", overtime: "4h 30m" },
    today: { checkIn: "08:55", checkOut: "-", status: "정상" },
};

const myApproval = {
    pending: 3,
    inProgress: 2,
    myDrafts: 1,
    recent: [
        { id: "AP-2026-042", title: "MADLeague 인사이트 투어링 예산 품의", type: "품의", date: "2026-03-19", from: "한마케", status: "대기" as const },
        { id: "AP-2026-041", title: "콘텐츠팀 장비 구매 품의", type: "품의", date: "2026-03-18", from: "김콘텐", status: "대기" as const },
        { id: "AP-2026-040", title: "3월 주간 업무보고", type: "보고", date: "2026-03-17", from: "Sarah Kim", status: "대기" as const },
        { id: "AP-2026-038", title: "Badak 밋업 경비 정산", type: "품의", date: "2026-03-15", from: "이수진", status: "승인" as const },
    ],
};

function formatKRW(n: number) { return new Intl.NumberFormat("ko-KR").format(n) + "원"; }

function PointWidget() {
    const { getMemberSummary } = usePoints();
    const summary = getMemberSummary('staff-001');
    if (!summary) return null;
    const gc = gradeConfig[summary.grade];
    const next = getPointsToNextGrade(summary.totalPoints);
    const currentMin = gc.minPoints;
    const currentMax = gc.maxPoints ?? summary.totalPoints;
    const pct = summary.grade === 'Diamond' ? 100 : Math.round(((summary.totalPoints - currentMin) / (currentMax - currentMin + 1)) * 100);
    return (
        <div className="border border-neutral-200 bg-white p-4 mb-4">
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold flex items-center gap-1.5"><Trophy className="h-3.5 w-3.5" /> 포인트 · 등급</h3>
                <Link href="/intra/myverse/points" className="text-[11px] text-neutral-400 hover:text-neutral-900">상세 →</Link>
            </div>
            <div className="flex items-center gap-5">
                <div className={`h-12 w-12 rounded-full ${gc.bgColor} flex items-center justify-center`}>
                    <span className="text-xl">{gc.icon}</span>
                </div>
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <span className={`text-lg font-bold ${gc.color}`}>{gc.label}</span>
                        <span className="text-xl font-black">{new Intl.NumberFormat("ko-KR").format(summary.totalPoints)}P</span>
                    </div>
                    <div className="mt-1.5">
                        <div className="flex items-center justify-between text-[10px] text-neutral-400 mb-0.5">
                            <span>{summary.grade}</span>
                            <span>{next.nextGrade ? `${next.nextGrade}까지 ${new Intl.NumberFormat("ko-KR").format(next.remaining)}P` : 'MAX'}</span>
                        </div>
                        <div className="h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                            <div className="h-full bg-neutral-400 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-[10px] text-neutral-400">이번 달</div>
                    <div className="text-sm font-bold text-green-600">+{new Intl.NumberFormat("ko-KR").format(summary.thisMonthPoints)}P</div>
                </div>
            </div>
        </div>
    );
}

export default function MyversePage() {
    const { user, isStaff } = useAuth();
    if (!user) return null;

    const hireDate = new Date(myHR.hireDate);
    const now = new Date();
    const months = (now.getFullYear() - hireDate.getFullYear()) * 12 + (now.getMonth() - hireDate.getMonth());
    const tenureYears = Math.floor(months / 12);
    const tenureMonths = months % 12;

    const todayQuote = getDailyQuote(user.id);

    const notices = [
        { title: "MADLeague 인사이트 투어링 참가자 모집", badge: "중요", date: "03-15" },
        { title: "LUKI 2nd Single 관련 콘텐츠 가이드라인", badge: "공지", date: "03-12" },
        { title: "3월 Badak 밋업 일정 확정", badge: "일정", date: "03-10" },
    ];

    const todaySchedule = [
        { time: "10:00", title: "주간 팀 회의", type: "회의" },
        { time: "14:00", title: "LUKI 컨셉 회의", type: "프로젝트" },
        { time: "16:00", title: "Badak 밋업 준비", type: "이벤트" },
    ];

    return (
        <div>
            {/* 인사말 + 격언 */}
            <div className="mb-6">
                <h1 className="text-xl font-bold">안녕하세요, {user.name}님</h1>
                <p className="text-sm text-neutral-500 mt-1 italic">{todayQuote}</p>
            </div>

            {/* 전체 현황: 공지 + 일정 (직원만) */}
            {isStaff && (
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="border border-neutral-200 bg-white p-4">
                        <h3 className="text-xs font-bold mb-3">공지사항</h3>
                        <div className="space-y-2">
                            {notices.map((n, i) => (
                                <div key={i} className="flex items-center gap-2 py-1 border-b border-neutral-50 last:border-0">
                                    <span className="text-[7px] px-1 py-0.5 bg-neutral-100 text-neutral-500 rounded shrink-0">{n.badge}</span>
                                    <span className="text-xs flex-1 truncate">{n.title}</span>
                                    <span className="text-[10px] text-neutral-300 shrink-0">{n.date}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="border border-neutral-200 bg-white p-4">
                        <h3 className="text-xs font-bold mb-3">오늘 일정</h3>
                        <div className="space-y-2">
                            {todaySchedule.map((s, i) => (
                                <div key={i} className="flex items-center gap-2 py-1 border-b border-neutral-50 last:border-0">
                                    <span className="text-[11px] text-neutral-400 w-10 shrink-0">{s.time}</span>
                                    <span className="text-xs flex-1">{s.title}</span>
                                    <span className="text-[7px] px-1 py-0.5 bg-neutral-100 text-neutral-400 rounded shrink-0">{s.type}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Profile Header */}
            <div className="border border-neutral-200 bg-white p-5 mb-6 flex items-center gap-5">
                <div className="h-14 w-14 rounded-full bg-neutral-900 text-white flex items-center justify-center text-lg font-bold shrink-0">
                    {user.avatarInitials}
                </div>
                <div className="flex-1">
                    <div className="flex items-center gap-3">
                        <h1 className="text-lg font-bold">{user.name}</h1>
                        <span className="text-xs tracking-widest text-neutral-400 uppercase">Myverse</span>
                    </div>
                    <div className="flex items-center gap-4 mt-1">
                        <span className="text-xs text-neutral-500">{myHR.position} · {myHR.department}</span>
                        <span className="text-xs text-neutral-400">{myHR.employeeId}</span>
                        <span className="text-xs text-neutral-400">{tenureYears}년 {tenureMonths}개월</span>
                    </div>
                </div>
                <Link href="/myverse" className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-neutral-200 text-neutral-500 hover:text-neutral-900 hover:border-neutral-400 transition-colors">
                    <Edit2 className="h-3 w-3" /> 정보 수정
                </Link>
            </div>

            {/* Row 1: 핵심 지표 */}
            <div className={clsx("grid gap-3 mb-6", isStaff ? "grid-cols-6" : "grid-cols-3")}>
                {[
                    ...(isStaff ? [
                        { label: "오늘 출근", value: myAttendance.today.checkIn, sub: myAttendance.today.status, icon: Clock },
                        { label: "결재 대기", value: `${myApproval.pending}건`, sub: `진행 ${myApproval.inProgress}건`, icon: Stamp, href: "/intra/myverse/approval" },
                        { label: "잔여 연차", value: `${myLeave.remaining}일`, sub: `${myLeave.used}/${myLeave.total}`, icon: Palmtree },
                        { label: "GPR 달성률", value: `${myGPR.rate}%`, sub: `${myGPR.quarter} · ${myGPR.grade}`, icon: Target },
                        { label: "이번 달 실수령", value: formatKRW(mySalary.thisMonth.net), sub: mySalary.thisMonth.status, icon: Wallet },
                        { label: "경비 미처리", value: `${myExpenses.pending}건`, sub: formatKRW(myExpenses.thisMonth), icon: CreditCard },
                    ] : [
                        { label: "HIT 검사", value: "완료", sub: "Visionary Strategist", icon: Target },
                        { label: "교육 이수", value: "2/20", sub: "필수 2/7", icon: GraduationCap },
                        { label: "프로젝트", value: "2건", sub: "참여 중", icon: FolderKanban },
                    ]),
                ].map(s => (
                    <div key={s.label} className="border border-neutral-200 bg-white p-3.5">
                        <div className="flex items-center gap-1.5 mb-1.5">
                            <s.icon className="h-3.5 w-3.5 text-neutral-400" />
                            <span className="text-xs text-neutral-400">{s.label}</span>
                        </div>
                        <p className="text-base font-bold">{s.value}</p>
                        <p className="text-xs text-neutral-400 mt-0.5">{s.sub}</p>
                    </div>
                ))}
            </div>

            {/* Row 1.3: 포인트 현황 */}
            <PointWidget />

            {/* Row 1.4: HIT + Evolution School */}
            <div className="grid grid-cols-2 gap-4 mb-4">
                {/* HIT 검사 결과 */}
                <div className="border border-neutral-200 bg-white p-4">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-xs font-bold flex items-center gap-1.5">🦸 HeRo HIT</h3>
                        <Link href="/intra/hero/hit/report" className="text-[11px] text-neutral-400 hover:text-neutral-900">리포트 →</Link>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-center">
                            <div className="h-14 w-14 rounded-full bg-neutral-100 flex items-center justify-center mx-auto mb-1">
                                <span className="text-lg font-bold text-neutral-700">VS</span>
                            </div>
                            <p className="text-[10px] text-neutral-400">Visionary Strategist</p>
                        </div>
                        <div className="flex-1 space-y-1.5">
                            {[
                                { label: 'D (주도)', value: 85 },
                                { label: 'I (사교)', value: 60 },
                                { label: 'S (안정)', value: 30 },
                                { label: 'C (신중)', value: 45 },
                            ].map(d => (
                                <div key={d.label} className="flex items-center gap-2">
                                    <span className="text-[10px] text-neutral-400 w-14 shrink-0">{d.label}</span>
                                    <div className="flex-1 h-1.5 bg-neutral-100 rounded-full">
                                        <div className="h-1.5 bg-neutral-400 rounded-full" style={{ width: `${d.value}%` }} />
                                    </div>
                                    <span className="text-[10px] text-neutral-500 w-7 text-right">{d.value}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="flex gap-2 mt-3 pt-2 border-t border-neutral-50">
                        <span className="text-[10px] px-1.5 py-0.5 bg-neutral-100 text-neutral-500 rounded">ENTJ</span>
                        <span className="text-[10px] px-1.5 py-0.5 bg-neutral-100 text-neutral-500 rounded">전략적 사고</span>
                        <span className="text-[10px] px-1.5 py-0.5 bg-neutral-100 text-neutral-500 rounded">네트워크 빌딩</span>
                    </div>
                </div>

                {/* Evolution School 이수 현황 */}
                <div className="border border-neutral-200 bg-white p-4">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-xs font-bold flex items-center gap-1.5">🎓 Evolution School</h3>
                        <Link href="/intra/evolution-school" className="text-[11px] text-neutral-400 hover:text-neutral-900">전체 →</Link>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mb-3">
                        <div className="text-center p-2 bg-green-50 rounded">
                            <p className="text-sm font-bold text-green-600">2/7</p>
                            <p className="text-[10px] text-green-500">필수</p>
                        </div>
                        <div className="text-center p-2 bg-neutral-50 rounded">
                            <p className="text-sm font-bold text-neutral-600">0/7</p>
                            <p className="text-[10px] text-neutral-400">전문</p>
                        </div>
                        <div className="text-center p-2 bg-neutral-50 rounded">
                            <p className="text-sm font-bold text-neutral-600">0/6</p>
                            <p className="text-[10px] text-neutral-400">심화</p>
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        {[
                            { name: 'VRIEF 프레임워크', score: 100, done: true },
                            { name: 'GPR', score: 90, done: true },
                            { name: 'Culture & Mind Set', score: null, done: false },
                            { name: 'Principle 10', score: null, done: false },
                            { name: '정보보안', score: null, done: false },
                        ].map((c, i) => (
                            <div key={i} className="flex items-center gap-2 text-xs">
                                <span className={`h-3.5 w-3.5 rounded-full flex items-center justify-center text-[7px] shrink-0 ${c.done ? 'bg-green-500 text-white' : 'bg-neutral-200 text-neutral-400'}`}>
                                    {c.done ? '✓' : i + 1}
                                </span>
                                <span className={`flex-1 ${c.done ? 'text-neutral-400' : 'text-neutral-700'}`}>{c.name}</span>
                                {c.score ? (
                                    <span className="text-[10px] text-green-600 font-medium">{c.score}점</span>
                                ) : (
                                    <span className="text-[10px] text-neutral-300">미이수</span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Row 1.5: 업무 현황 */}
            <div className="border border-neutral-200 bg-white p-4 mb-4">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-bold flex items-center gap-1.5">📋 업무 현황</h3>
                    <Link href="/intra/myverse/todo" className="text-[11px] text-neutral-400 hover:text-neutral-900">전체 →</Link>
                </div>
                <div className="space-y-1.5">
                    {[
                        { title: 'LUKI 2nd Single 컨셉 기획안 작성', cat: '프로젝트' as const, due: '3/25', status: '진행중' as const },
                        { title: 'Q2 사업계획서 최종 검토', cat: '일반' as const, due: '3/28', status: '진행중' as const },
                        { title: '뮤직비디오 스토리보드 리뷰', cat: '프로젝트' as const, due: '3/23', status: '진행중' as const },
                        { title: 'MADLeague 스폰서 제안서', cat: '프로젝트' as const, due: '3/22', status: '승인대기' as const },
                        { title: 'GPR Q1 자기평가 작성', cat: '기타' as const, due: '3/31', status: '진행중' as const },
                    ].map((t, i) => (
                        <div key={i} className="flex items-center gap-2 py-1.5 border-b border-neutral-50 last:border-0">
                            <span className={`text-[7px] px-1 py-0.5 rounded shrink-0 ${
                                t.cat === '일반' ? 'bg-neutral-100 text-neutral-500' :
                                t.cat === '프로젝트' ? 'bg-violet-50 text-violet-500' :
                                'bg-sky-50 text-sky-500'
                            }`}>{t.cat}</span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded shrink-0 ${
                                t.status === '진행중' ? 'bg-blue-50 text-blue-500' :
                                t.status === '승인대기' ? 'bg-amber-50 text-amber-500' :
                                'bg-neutral-100 text-neutral-500'
                            }`}>{t.status}</span>
                            <span className="text-xs flex-1 truncate">{t.title}</span>
                            <span className="text-[10px] text-neutral-300 shrink-0">{t.due}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── 직원 전용 섹션 시작 ── */}
            {isStaff && (<>
            {/* Row 1.6: 전자결재 */}
            <div className="border border-neutral-200 bg-white p-5 mb-4">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold flex items-center gap-2">
                        <Stamp className="h-4 w-4 text-neutral-400" /> 전자결재
                    </h3>
                    <div className="flex items-center gap-2">
                        <Link href="/intra/myverse/approval/draft" className="flex items-center gap-1 px-2.5 py-1 text-xs border border-neutral-200 text-neutral-500 hover:text-neutral-900 hover:border-neutral-400 transition-colors">
                            <FileSignature className="h-3 w-3" /> 새 기안
                        </Link>
                        <Link href="/intra/myverse/approval" className="text-xs text-neutral-400 hover:text-neutral-900 transition-colors">전체 →</Link>
                    </div>
                </div>
                <div className="grid grid-cols-3 gap-3 mb-4">
                    <Link href="/intra/myverse/approval" className="flex items-center gap-3 p-3 border border-neutral-100 hover:border-neutral-300 transition-colors">
                        <div className="h-8 w-8 rounded bg-red-50 flex items-center justify-center">
                            <span className="text-sm font-bold text-red-500">{myApproval.pending}</span>
                        </div>
                        <div>
                            <p className="text-xs font-medium">결재 대기</p>
                            <p className="text-[11px] text-neutral-400">승인 필요</p>
                        </div>
                    </Link>
                    <Link href="/intra/myverse/approval/progress" className="flex items-center gap-3 p-3 border border-neutral-100 hover:border-neutral-300 transition-colors">
                        <div className="h-8 w-8 rounded bg-amber-50 flex items-center justify-center">
                            <span className="text-sm font-bold text-amber-500">{myApproval.inProgress}</span>
                        </div>
                        <div>
                            <p className="text-xs font-medium">결재 진행</p>
                            <p className="text-[11px] text-neutral-400">진행 중</p>
                        </div>
                    </Link>
                    <Link href="/intra/myverse/approval/draft" className="flex items-center gap-3 p-3 border border-neutral-100 hover:border-neutral-300 transition-colors">
                        <div className="h-8 w-8 rounded bg-blue-50 flex items-center justify-center">
                            <span className="text-sm font-bold text-blue-500">{myApproval.myDrafts}</span>
                        </div>
                        <div>
                            <p className="text-xs font-medium">내 기안</p>
                            <p className="text-[11px] text-neutral-400">작성 중</p>
                        </div>
                    </Link>
                </div>
                <div className="space-y-0">
                    {myApproval.recent.map(item => (
                        <Link key={item.id} href="/intra/myverse/approval" className="flex items-center gap-3 py-2 px-1 border-b border-neutral-50 last:border-0 hover:bg-neutral-50 transition-colors">
                            <span className="text-[11px] font-mono text-neutral-300 w-20 shrink-0">{item.id}</span>
                            <span className="text-xs flex-1 truncate">{item.title}</span>
                            <span className="text-[11px] text-neutral-400 shrink-0">{item.from}</span>
                            <span className="text-[11px] text-neutral-300 shrink-0">{item.date}</span>
                            <span className={`text-[11px] px-1.5 py-0.5 rounded shrink-0 ${
                                item.status === '대기' ? 'bg-red-50 text-red-500' :
                                item.status === '승인' ? 'bg-green-50 text-green-600' : 'bg-neutral-100 text-neutral-500'
                            }`}>{item.status}</span>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Row 2: GPR + 근태 */}
            <div className="grid grid-cols-2 gap-4 mb-4">
                {/* GPR */}
                <div className="border border-neutral-200 bg-white p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold flex items-center gap-2">
                            <Target className="h-4 w-4 text-neutral-400" /> GPR
                        </h3>
                        <Link href="/intra/myverse/gpr" className="text-xs text-neutral-400 hover:text-neutral-900 transition-colors">상세 →</Link>
                    </div>
                    <div className="flex items-center gap-4 mb-4">
                        <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-xs text-neutral-400">달성률</span>
                                <span className="text-xs font-bold">{myGPR.rate}%</span>
                            </div>
                            <div className="h-2 bg-neutral-100 rounded-full">
                                <div className="h-2 bg-neutral-900 rounded-full" style={{ width: `${myGPR.rate}%` }} />
                            </div>
                        </div>
                        <div className="text-center px-3">
                            <p className="text-lg font-bold">{myGPR.grade}</p>
                            <p className="text-xs text-neutral-400">등급</p>
                        </div>
                    </div>
                    <div className="space-y-2">
                        {myGPR.items.map(g => (
                            <div key={g.name} className="flex items-center gap-3">
                                {g.status === "완료"
                                    ? <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" />
                                    : <div className="h-3.5 w-3.5 rounded-full border border-neutral-300 shrink-0" />
                                }
                                <span className={`text-xs flex-1 ${g.status === "완료" ? "text-neutral-400 line-through" : ""}`}>{g.name}</span>
                                <span className="text-xs text-neutral-400">{g.progress}%</span>
                            </div>
                        ))}
                    </div>
                    <p className="text-xs text-neutral-300 mt-3">다음 리뷰: {myGPR.nextReview}</p>
                </div>

                {/* 근태 */}
                <div className="border border-neutral-200 bg-white p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold flex items-center gap-2">
                            <CalendarCheck className="h-4 w-4 text-neutral-400" /> 근태
                        </h3>
                        <Link href="/intra/myverse/attendance" className="text-xs text-neutral-400 hover:text-neutral-900 transition-colors">상세 →</Link>
                    </div>
                    <div className="grid grid-cols-3 gap-3 mb-4">
                        <div className="bg-neutral-50 rounded p-3 text-center">
                            <p className="text-lg font-bold">{myAttendance.thisMonth.workDays}</p>
                            <p className="text-xs text-neutral-400">이번 달 근무일</p>
                        </div>
                        <div className="bg-neutral-50 rounded p-3 text-center">
                            <p className="text-lg font-bold">{myAttendance.thisMonth.avgHours}</p>
                            <p className="text-xs text-neutral-400">평균 근무시간</p>
                        </div>
                        <div className="bg-neutral-50 rounded p-3 text-center">
                            <p className="text-lg font-bold">{myAttendance.thisMonth.overtime}</p>
                            <p className="text-xs text-neutral-400">초과근무</p>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-neutral-400">연차</span>
                            <div className="flex items-center gap-2">
                                <div className="h-1.5 w-24 bg-neutral-100 rounded-full">
                                    <div className="h-1.5 bg-blue-500 rounded-full" style={{ width: `${(myLeave.used / myLeave.total) * 100}%` }} />
                                </div>
                                <span className="text-xs font-medium">{myLeave.remaining}/{myLeave.total}</span>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-neutral-400">병가</span>
                            <div className="flex items-center gap-2">
                                <div className="h-1.5 w-24 bg-neutral-100 rounded-full">
                                    <div className="h-1.5 bg-blue-500 rounded-full" style={{ width: `${(myLeave.usedSick / myLeave.sick) * 100}%` }} />
                                </div>
                                <span className="text-xs font-medium">{myLeave.sick - myLeave.usedSick}/{myLeave.sick}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Row 3: 급여 + 경비 */}
            <div className="grid grid-cols-2 gap-4 mb-4">
                {/* 급여 */}
                <div className="border border-neutral-200 bg-white p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold flex items-center gap-2">
                            <Wallet className="h-4 w-4 text-neutral-400" /> 급여
                        </h3>
                        <Link href="/intra/myverse/payroll" className="text-xs text-neutral-400 hover:text-neutral-900 transition-colors">상세 →</Link>
                    </div>
                    <div className="space-y-2 mb-4">
                        {[
                            { label: "기본급", value: formatKRW(mySalary.thisMonth.base) },
                            { label: "상여", value: mySalary.thisMonth.bonus > 0 ? formatKRW(mySalary.thisMonth.bonus) : "-" },
                            { label: "공제", value: formatKRW(mySalary.thisMonth.deductions), color: "text-red-500" },
                        ].map(r => (
                            <div key={r.label} className="flex items-center justify-between">
                                <span className="text-xs text-neutral-400">{r.label}</span>
                                <span className={`text-sm ${r.color || ''}`}>{r.value}</span>
                            </div>
                        ))}
                        <div className="border-t border-neutral-100 pt-2 flex items-center justify-between">
                            <span className="text-xs font-medium">실수령액</span>
                            <span className="text-sm font-bold">{formatKRW(mySalary.thisMonth.net)}</span>
                        </div>
                    </div>
                    <div className="flex items-center justify-between bg-neutral-50 rounded p-3">
                        <div>
                            <p className="text-xs text-neutral-400">퇴직연금 ({mySalary.pension.type})</p>
                            <p className="text-sm font-bold mt-0.5">{formatKRW(mySalary.pension.total)}</p>
                        </div>
                        <TrendingUp className="h-4 w-4 text-neutral-300" />
                    </div>
                </div>

                {/* 경비 */}
                <div className="border border-neutral-200 bg-white p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold flex items-center gap-2">
                            <CreditCard className="h-4 w-4 text-neutral-400" /> 경비
                        </h3>
                        <Link href="/intra/myverse/expenses" className="text-xs text-neutral-400 hover:text-neutral-900 transition-colors">상세 →</Link>
                    </div>
                    {myExpenses.pending > 0 && (
                        <div className="flex items-center gap-2 p-2 mb-3 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-700">
                            <AlertCircle className="h-3.5 w-3.5" />
                            승인 대기 {myExpenses.pending}건
                        </div>
                    )}
                    <div className="space-y-2">
                        {myExpenses.recentItems.map((e, i) => (
                            <div key={i} className="flex items-center justify-between py-1.5 border-b border-neutral-50 last:border-0">
                                <div>
                                    <p className="text-xs font-medium">{e.desc}</p>
                                    <p className="text-xs text-neutral-400">{e.date}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-medium">{formatKRW(e.amount)}</span>
                                    <span className={`text-[11px] px-1.5 py-0.5 rounded font-medium ${
                                        e.status === "승인대기" ? "bg-yellow-50 text-yellow-600" :
                                        e.status === "승인" ? "bg-blue-50 text-blue-600" :
                                        "bg-green-50 text-green-600"
                                    }`}>{e.status}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Row 4: 프로젝트 + 교육 */}
            <div className="grid grid-cols-2 gap-4 mb-4">
                {/* 투입 프로젝트 */}
                <div className="border border-neutral-200 bg-white p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold flex items-center gap-2">
                            <FolderKanban className="h-4 w-4 text-neutral-400" /> 투입 프로젝트
                        </h3>
                        <Link href="/intra/project/management" className="text-xs text-neutral-400 hover:text-neutral-900 transition-colors">전체 →</Link>
                    </div>
                    <div className="space-y-3">
                        {myProjects.map(p => (
                            <Link key={p.code} href={`/intra/project/management/${p.code}`}
                                className="block hover:bg-neutral-50 -mx-2 px-2 py-1.5 rounded transition-colors">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs font-medium">{p.name}</span>
                                    <span className={`text-[11px] px-1.5 py-0.5 rounded font-medium ${
                                        p.status === '진행중' ? 'bg-blue-50 text-blue-600' : 'bg-neutral-100 text-neutral-500'
                                    }`}>{p.status}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="font-mono text-xs text-neutral-400">{p.code}</span>
                                    <span className="text-xs text-neutral-400">{p.role}</span>
                                    {p.progress > 0 && (
                                        <div className="flex items-center gap-1 flex-1">
                                            <div className="h-1 flex-1 bg-neutral-100 rounded-full">
                                                <div className="h-1 bg-neutral-900 rounded-full" style={{ width: `${p.progress}%` }} />
                                            </div>
                                            <span className="text-xs text-neutral-400">{p.progress}%</span>
                                        </div>
                                    )}
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* 교육 */}
                <div className="border border-neutral-200 bg-white p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold flex items-center gap-2">
                            <GraduationCap className="h-4 w-4 text-neutral-400" /> 교육
                        </h3>
                        <Link href="/intra/erp/hr/education" className="text-xs text-neutral-400 hover:text-neutral-900 transition-colors">상세 →</Link>
                    </div>
                    {myEducation.mandatory.completed < myEducation.mandatory.total && (
                        <div className="flex items-center gap-2 p-2 mb-3 bg-red-50 border border-red-200 rounded text-xs text-red-600">
                            <AlertCircle className="h-3.5 w-3.5" />
                            필수과정 {myEducation.mandatory.completed}/{myEducation.mandatory.total} 이수
                        </div>
                    )}
                    <div className="space-y-2">
                        {myEducation.recent.map(e => (
                            <div key={e.name} className="flex items-center justify-between py-1.5 border-b border-neutral-50 last:border-0">
                                <span className="text-xs">{e.name}</span>
                                <span className={`text-[11px] px-1.5 py-0.5 rounded font-medium ${
                                    e.status === "수료" ? "bg-green-50 text-green-600" :
                                    e.status === "진행중" ? "bg-blue-50 text-blue-600" :
                                    "bg-neutral-100 text-neutral-500"
                                }`}>{e.status}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            </>)}
            {/* ── 직원 전용 섹션 끝 ── */}

            {/* Row 5: 시스템 접근 권한 (직원만) */}
            {isStaff && <div className="border border-neutral-200 bg-white p-5">
                <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
                    <Shield className="h-4 w-4 text-neutral-400" /> 시스템 접근 권한
                </h3>
                <div className="flex flex-wrap gap-3">
                    {(user.systemAccess || []).map(access => {
                        const info = SystemAccessInfo[access as SystemAccess];
                        return (
                            <div key={access} className="flex items-center gap-2 bg-neutral-50 rounded px-3 py-2">
                                <span className="h-1.5 w-1.5 rounded-full bg-green-500 shrink-0" />
                                <div>
                                    <p className="text-xs font-medium">{info?.label || access}</p>
                                    <p className="text-xs text-neutral-400">{info?.description || ''}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>}
        </div>
    );
}
