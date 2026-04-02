"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { usePoints } from "@/lib/point-context";
import { getDailyQuote } from "@/lib/daily-quotes";
import * as townityDb from "@/lib/supabase/townity";
import * as myverseDb from "@/lib/supabase/myverse";
import {
    Mail, Building2, Calendar, Target, Edit2, BookOpen, Clock,
    FileCheck, User, FolderKanban, ChevronRight, CreditCard,
    GraduationCap, Wallet, DollarSign, TrendingUp, AlertCircle, CheckCircle2,
    FileText, Palmtree, Stamp, FileSignature, Inbox
} from "lucide-react";
import Link from "next/link";
import clsx from "clsx";
import { PageHeader } from "@/components/intra/IntraUI";
import { SystemAccessInfo } from "@/types/auth";
import type { SystemAccess } from "@/types/auth";
import { gradeConfig, getPointsToNextGrade } from "@/types/point";

const MOCK_PROJECTS: { name: string; code: string; role: string; progress: number; status: "진행중" | "계획" | "완료" }[] = [];

// 빈 상태 컴포넌트
function EmptyState({ message }: { message: string }) {
    return (
        <div className="flex flex-col items-center justify-center py-6 text-neutral-300">
            <Inbox className="h-6 w-6 mb-2" />
            <p className="text-xs">{message}</p>
        </div>
    );
}

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
                <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">포인트 · 등급</h3>
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
    const [dbNotices, setDbNotices] = useState<{ title: string; badge: string; date: string }[]>([]);
    const [dbSchedule, setDbSchedule] = useState<{ time: string; title: string; type: string }[]>([]);
    const [dbApprovals, setDbApprovals] = useState<Awaited<ReturnType<typeof myverseDb.fetchMyApprovals>> | null>(null);
    const [dbProjects, setDbProjects] = useState<Awaited<ReturnType<typeof myverseDb.fetchMyProjects>> | null>(null);
    const [dbEducation, setDbEducation] = useState<Awaited<ReturnType<typeof myverseDb.fetchMyEnrollments>> | undefined>(undefined);
    const [dbAttendance, setDbAttendance] = useState<Awaited<ReturnType<typeof myverseDb.fetchMyAttendance>> | undefined>(undefined);

    useEffect(() => {
        // DB에서 공지사항 로드
        townityDb.fetchPosts({ board: 'notice', limit: 5 }).then(({ posts }) => {
            if (posts.length > 0) {
                setDbNotices(posts.map((p: Record<string, unknown>) => ({
                    title: p.title as string,
                    badge: (p.badge as string) || '공지',
                    date: ((p.created_at as string) || '').substring(5, 10),
                })));
            }
        }).catch(() => {});

        // DB에서 오늘 일정 로드
        const today = new Date().toISOString().split('T')[0];
        townityDb.fetchEvents({
            startAfter: `${today}T00:00:00`,
            endBefore: `${today}T23:59:59`,
            limit: 10,
        }).then((events) => {
            if (events.length > 0) {
                setDbSchedule(events.map((e: Record<string, unknown>) => ({
                    time: ((e.start_at as string) || '').substring(11, 16),
                    title: e.title as string,
                    type: (e.event_type as string) || '일반',
                })));
            }
        }).catch(() => {});
    }, []);

    // 로그인 사용자 기반 DB 데이터 로드
    useEffect(() => {
        if (!user?.id) return;
        const memberId = user.id;

        myverseDb.fetchMyApprovals(memberId).then(setDbApprovals).catch(() => {});
        myverseDb.fetchMyProjects(memberId).then(setDbProjects).catch(() => {});
        myverseDb.fetchMyEnrollments(memberId).then(setDbEducation).catch(() => {});
        myverseDb.fetchMyAttendance(memberId).then(setDbAttendance).catch(() => {});
    }, [user?.id]);

    if (!user) return null;

    // 프로필: DB members 테이블 → user 객체에서 직접 사용
    const hrPosition = user.position || '';
    const hrDepartment = user.department || '';
    const hrEmployeeId = user.employeeId || '';
    const hrHireDate = user.hireDate || '';

    // 근속 기간 계산
    let tenureText = '';
    if (hrHireDate) {
        const hireDate = new Date(hrHireDate);
        const now = new Date();
        const months = (now.getFullYear() - hireDate.getFullYear()) * 12 + (now.getMonth() - hireDate.getMonth());
        tenureText = `${Math.floor(months / 12)}년 ${months % 12}개월`;
    }

    const todayQuote = getDailyQuote(user.id);

    const myLeave = null as { total: number; used: number; remaining: number; sick: number; usedSick: number } | null;
    const myGPR = null as { quarter: string; rate: number; grade: string; goals: number; completed: number; nextReview: string; items: { name: string; progress: number; status: string }[] } | null;
    const mySalary = null as { thisMonth: { base: number; bonus: number; deductions: number; net: number; status: string }; pension: { type: string; total: number } } | null;
    const myExpenses = null as { pending: number; thisMonth: number; recentItems: { date: string; desc: string; amount: number; status: string }[] } | null;
    const myProjects = dbProjects && dbProjects.length > 0 ? dbProjects : MOCK_PROJECTS;
    const myEducation = dbEducation || null;
    const myAttendance = dbAttendance || null;
    const myApproval = dbApprovals && dbApprovals.pendingCount > 0 ? {
        pending: dbApprovals.pendingCount,
        inProgress: dbApprovals.inProgressCount,
        myDrafts: dbApprovals.draftsCount,
        recent: dbApprovals.pending.slice(0, 4).map((a: any) => ({
            id: a.id?.substring(0, 12) || '',
            title: a.title || '',
            type: a.factor || '일반',
            date: (a.created_at || '').substring(0, 10),
            from: a.requester_name || '',
            status: a.status === 'pending' ? '대기' as const : '승인' as const,
        })),
    } : null;

    const notices = dbNotices;
    const todaySchedule = dbSchedule;

    return (
        <div>
            {/* 인사말 + 격언 */}
            <PageHeader title={`안녕하세요, ${user.name}님`} description={todayQuote} />

            {/* 전체 현황: 공지 + 일정 (직원만) */}
            {isStaff && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    <div className="border border-neutral-200 bg-white p-4">
                        <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">공지사항</h3>
                        {notices.length > 0 ? (
                            <div className="space-y-2">
                                {notices.map((n, i) => (
                                    <div key={i} className="flex items-center gap-2 py-1 border-b border-neutral-50 last:border-0">
                                        <span className="text-[7px] px-1 py-0.5 bg-neutral-100 text-neutral-500 rounded shrink-0">{n.badge}</span>
                                        <span className="text-xs flex-1 truncate">{n.title}</span>
                                        <span className="text-[10px] text-neutral-300 shrink-0">{n.date}</span>
                                    </div>
                                ))}
                            </div>
                        ) : <EmptyState message="공지사항이 없습니다" />}
                    </div>
                    <div className="border border-neutral-200 bg-white p-4">
                        <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">오늘 일정</h3>
                        {todaySchedule.length > 0 ? (
                            <div className="space-y-2">
                                {todaySchedule.map((s, i) => (
                                    <div key={i} className="flex items-center gap-2 py-1 border-b border-neutral-50 last:border-0">
                                        <span className="text-[11px] text-neutral-400 w-10 shrink-0">{s.time}</span>
                                        <span className="text-xs flex-1">{s.title}</span>
                                        <span className="text-[7px] px-1 py-0.5 bg-neutral-100 text-neutral-400 rounded shrink-0">{s.type}</span>
                                    </div>
                                ))}
                            </div>
                        ) : <EmptyState message="오늘 일정이 없습니다" />}
                    </div>
                </div>
            )}

            {/* Profile Header */}
            <div className="border border-neutral-200 bg-white p-4 sm:p-5 mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5">
                <div className="h-14 w-14 rounded-full bg-neutral-900 text-white flex items-center justify-center text-lg font-bold shrink-0">
                    {user.avatarInitials}
                </div>
                <div className="flex-1">
                    <div className="flex items-center gap-3">
                        <h1 className="text-lg font-semibold tracking-tight">{user.name}</h1>
                        <span className="text-xs tracking-widest text-neutral-400 uppercase">Myverse</span>
                    </div>
                    <div className="flex items-center gap-4 mt-1">
                        {(hrPosition || hrDepartment) && (
                            <span className="text-xs text-neutral-500">
                                {[hrPosition, hrDepartment].filter(Boolean).join(' · ')}
                            </span>
                        )}
                        {hrEmployeeId && <span className="text-xs text-neutral-400">{hrEmployeeId}</span>}
                        {tenureText && <span className="text-xs text-neutral-400">{tenureText}</span>}
                    </div>
                </div>
                <Link href="/myverse" className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-neutral-200 text-neutral-500 hover:text-neutral-900 hover:border-neutral-400 transition-colors">
                    <Edit2 className="h-3 w-3" /> 정보 수정
                </Link>
            </div>

            {/* Row 1: 핵심 지표 */}
            <div className={clsx("grid gap-3 mb-6", isStaff ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-6" : "grid-cols-2 sm:grid-cols-3")}>
                {[
                    ...(isStaff ? [
                        { label: "오늘 출근", value: myAttendance?.today?.checkIn || '-', sub: myAttendance?.today?.status || '-', icon: Clock },
                        { label: "결재 대기", value: myApproval ? `${myApproval.pending}건` : '-', sub: myApproval ? `진행 ${myApproval.inProgress}건` : '-', icon: Stamp, href: "/intra/myverse/approval" },
                        { label: "잔여 연차", value: myLeave ? `${myLeave.remaining}일` : '-', sub: myLeave ? `${myLeave.used}/${myLeave.total}` : '-', icon: Palmtree },
                        { label: "GPR 달성률", value: myGPR ? `${myGPR.rate}%` : '-', sub: myGPR ? `${myGPR.quarter} · ${myGPR.grade}` : '-', icon: Target },
                        { label: "이번 달 실수령", value: mySalary ? formatKRW(mySalary.thisMonth.net) : '-', sub: mySalary?.thisMonth.status || '-', icon: Wallet },
                        { label: "경비 미처리", value: myExpenses ? `${myExpenses.pending}건` : '-', sub: myExpenses ? formatKRW(myExpenses.thisMonth) : '-', icon: CreditCard },
                    ] : [
                        { label: "HIT 검사", value: "-", sub: "-", icon: Target },
                        { label: "교육 이수", value: myEducation ? `${myEducation.mandatory.completed}/${myEducation.mandatory.total}` : "-", sub: "-", icon: GraduationCap },
                        { label: "프로젝트", value: myProjects.length > 0 ? `${myProjects.length}건` : "-", sub: "참여 중", icon: FolderKanban },
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                {/* HIT 검사 결과 */}
                <div className="border border-neutral-200 bg-white p-4">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">HeRo HIT</h3>
                        <Link href="/intra/hero/hit/report" className="text-[11px] text-neutral-400 hover:text-neutral-900">리포트 →</Link>
                    </div>
                    <EmptyState message="HIT 검사 결과가 없습니다" />
                </div>

                {/* Evolution School 이수 현황 */}
                <div className="border border-neutral-200 bg-white p-4">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Evolution School</h3>
                        <Link href="/intra/evolution-school" className="text-[11px] text-neutral-400 hover:text-neutral-900">전체 →</Link>
                    </div>
                    {myEducation ? (
                        <>
                        <div className="grid grid-cols-3 gap-2 mb-3">
                            <div className="text-center p-2 bg-green-50 rounded">
                                <p className="text-sm font-bold text-green-600">{myEducation.mandatory.completed}/{myEducation.mandatory.total || 7}</p>
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
                            {(myEducation.recent || []).map((c: { name: string; status: string }, i: number) => (
                                <div key={i} className="flex items-center gap-2 text-xs">
                                    <span className={`h-3.5 w-3.5 rounded-full flex items-center justify-center text-[7px] shrink-0 ${c.status === '수료' ? 'bg-green-500 text-white' : 'bg-neutral-200 text-neutral-400'}`}>
                                        {c.status === '수료' ? '✓' : i + 1}
                                    </span>
                                    <span className={`flex-1 ${c.status === '수료' ? 'text-neutral-400' : 'text-neutral-700'}`}>{c.name}</span>
                                    <span className={`text-[10px] ${c.status === '수료' ? 'text-green-600 font-medium' : 'text-neutral-300'}`}>
                                        {c.status === '수료' ? '수료' : c.status === '진행중' ? '진행중' : '미이수'}
                                    </span>
                                </div>
                            ))}
                        </div>
                        </>
                    ) : <EmptyState message="교육 이수 정보가 없습니다" />}
                </div>
            </div>

            {/* Row 1.5: 업무 현황 */}
            <div className="border border-neutral-200 bg-white p-4 mb-4">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">업무 현황</h3>
                    <Link href="/intra/myverse/todo" className="text-[11px] text-neutral-400 hover:text-neutral-900">전체 →</Link>
                </div>
                <EmptyState message="등록된 업무가 없습니다" />
            </div>

            {/* ── 직원 전용 섹션 시작 ── */}
            {isStaff && (<>
            {/* Row 1.6: 전자결재 */}
            <div className="border border-neutral-200 bg-white p-5 mb-4">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-neutral-700">전자결재</h3>
                    <div className="flex items-center gap-2">
                        <Link href="/intra/myverse/approval/draft" className="flex items-center gap-1 px-2.5 py-1 text-xs border border-neutral-200 text-neutral-500 hover:text-neutral-900 hover:border-neutral-400 transition-colors">
                            <FileSignature className="h-3 w-3" /> 새 기안
                        </Link>
                        <Link href="/intra/myverse/approval" className="text-xs text-neutral-400 hover:text-neutral-900 transition-colors">전체 →</Link>
                    </div>
                </div>
                {myApproval ? (
                    <>
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
                        {myApproval.recent.map((item: { id: string; title: string; type: string; date: string; from: string; status: string }) => (
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
                    </>
                ) : <EmptyState message="결재 내역이 없습니다" />}
            </div>

            {/* Row 2: GPR + 근태 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                {/* GPR */}
                <div className="border border-neutral-200 bg-white p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-neutral-700">GPR</h3>
                        <Link href="/intra/myverse/gpr" className="text-xs text-neutral-400 hover:text-neutral-900 transition-colors">상세 →</Link>
                    </div>
                    {myGPR ? (
                        <>
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
                        </>
                    ) : <EmptyState message="GPR 데이터가 없습니다" />}
                </div>

                {/* 근태 */}
                <div className="border border-neutral-200 bg-white p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-neutral-700">근태</h3>
                        <Link href="/intra/myverse/attendance" className="text-xs text-neutral-400 hover:text-neutral-900 transition-colors">상세 →</Link>
                    </div>
                    {myAttendance ? (
                        <>
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
                        {myLeave && (
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
                        )}
                        </>
                    ) : <EmptyState message="근태 데이터가 없습니다" />}
                </div>
            </div>

            {/* Row 3: 급여 + 경비 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                {/* 급여 */}
                <div className="border border-neutral-200 bg-white p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-neutral-700">급여</h3>
                        <Link href="/intra/myverse/payroll" className="text-xs text-neutral-400 hover:text-neutral-900 transition-colors">상세 →</Link>
                    </div>
                    {mySalary ? (
                        <>
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
                        </>
                    ) : <EmptyState message="급여 정보가 없습니다" />}
                </div>

                {/* 경비 */}
                <div className="border border-neutral-200 bg-white p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-neutral-700">경비</h3>
                        <Link href="/intra/myverse/expenses" className="text-xs text-neutral-400 hover:text-neutral-900 transition-colors">상세 →</Link>
                    </div>
                    {myExpenses ? (
                        <>
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
                        </>
                    ) : <EmptyState message="경비 내역이 없습니다" />}
                </div>
            </div>

            {/* Row 4: 프로젝트 + 교육 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                {/* 투입 프로젝트 */}
                <div className="border border-neutral-200 bg-white p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-neutral-700">투입 프로젝트</h3>
                        <Link href="/intra/project/management" className="text-xs text-neutral-400 hover:text-neutral-900 transition-colors">전체 →</Link>
                    </div>
                    {myProjects.length > 0 ? (
                        <div className="space-y-3">
                            {myProjects.map((p: { name: string; code: string; role: string; progress: number; status: string }) => (
                                <Link key={p.code} href={`/intra/project/management/${p.code}`}
                                    className="block hover:bg-neutral-50 -mx-2 px-2 py-1.5 rounded transition-colors">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-xs font-medium">{p.name}</span>
                                        <span className={`text-[11px] px-1.5 py-0.5 rounded font-medium ${
                                            p.status === '진행중' || p.status === 'in-progress' ? 'bg-blue-50 text-blue-600' : 'bg-neutral-100 text-neutral-500'
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
                    ) : <EmptyState message="투입된 프로젝트가 없습니다" />}
                </div>

                {/* 교육 */}
                <div className="border border-neutral-200 bg-white p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-neutral-700">교육</h3>
                        <Link href="/intra/erp/hr/education" className="text-xs text-neutral-400 hover:text-neutral-900 transition-colors">상세 →</Link>
                    </div>
                    {myEducation ? (
                        <>
                        {myEducation.mandatory.completed < myEducation.mandatory.total && (
                            <div className="flex items-center gap-2 p-2 mb-3 bg-red-50 border border-red-200 rounded text-xs text-red-600">
                                <AlertCircle className="h-3.5 w-3.5" />
                                필수과정 {myEducation.mandatory.completed}/{myEducation.mandatory.total} 이수
                            </div>
                        )}
                        <div className="space-y-2">
                            {(myEducation.recent || []).map((e: { name: string; status: string }) => (
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
                        </>
                    ) : <EmptyState message="교육 정보가 없습니다" />}
                </div>
            </div>

            </>)}
            {/* ── 직원 전용 섹션 끝 ── */}

            {/* Row 5: 시스템 접근 권한 (직원만) */}
            {isStaff && <div className="border border-neutral-200 bg-white p-5">
                <h3 className="text-sm font-medium text-neutral-700 mb-3">시스템 접근 권한</h3>
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
