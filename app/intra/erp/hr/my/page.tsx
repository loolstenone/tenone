"use client";

import { useAuth } from "@/lib/auth-context";
import { User, Mail, Building2, Calendar, Shield, Target, BookOpen, Clock, FileCheck } from "lucide-react";
import Link from "next/link";

const myInfo = {
    employeeId: "2019-0001",
    department: "기업 총괄",
    position: "대표이사",
    hireDate: "2019-10-01",
    employmentType: "정규직",
    annualLeave: { total: 15, used: 3, remaining: 12 },
    recentEducation: [
        { name: "리더십 과정 3기", date: "2026-02", status: "수료" },
        { name: "AI 활용 실무", date: "2026-01", status: "수료" },
    ],
    certificates: [
        { name: "재직증명서", lastIssued: "2026-01-15" },
        { name: "경력증명서", lastIssued: "2025-12-20" },
    ],
};

export default function MyHrInfoPage() {
    const { user } = useAuth();
    if (!user) return null;

    return (
        <div className="max-w-4xl">
            <h1 className="text-2xl font-bold mb-2">나의 인사정보</h1>
            <p className="text-sm text-neutral-500 mb-8">내 인사 현황을 한눈에 확인합니다.</p>

            <div className="grid grid-cols-3 gap-4 mb-8">
                {[
                    { label: "잔여 연차", value: `${myInfo.annualLeave.remaining}일`, sub: `${myInfo.annualLeave.used}/${myInfo.annualLeave.total} 사용`, icon: Calendar },
                    { label: "교육 이수", value: `${myInfo.recentEducation.length}건`, sub: "최근 6개월", icon: BookOpen },
                    { label: "근속 기간", value: "6년 5개월", sub: `입사 ${myInfo.hireDate}`, icon: Clock },
                ].map(s => (
                    <div key={s.label} className="border border-neutral-200 bg-white p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <s.icon className="h-4 w-4 text-neutral-400" />
                            <span className="text-xs text-neutral-400">{s.label}</span>
                        </div>
                        <p className="text-xl font-bold">{s.value}</p>
                        <p className="text-[10px] text-neutral-400 mt-0.5">{s.sub}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-2 gap-6">
                {/* 기본 정보 */}
                <div className="border border-neutral-200 bg-white p-6">
                    <h2 className="text-sm font-bold mb-4 flex items-center gap-2">
                        <User className="h-4 w-4 text-neutral-400" /> 기본 정보
                    </h2>
                    <div className="space-y-3">
                        {[
                            { label: "이름", value: user.name },
                            { label: "이메일", value: user.email },
                            { label: "사번", value: myInfo.employeeId },
                            { label: "부서", value: myInfo.department },
                            { label: "직급", value: myInfo.position },
                            { label: "입사일", value: myInfo.hireDate },
                            { label: "근무 형태", value: myInfo.employmentType },
                        ].map(item => (
                            <div key={item.label} className="flex items-center justify-between">
                                <span className="text-xs text-neutral-400">{item.label}</span>
                                <span className="text-sm font-medium">{item.value}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 시스템 접근 권한 */}
                <div className="border border-neutral-200 bg-white p-6">
                    <h2 className="text-sm font-bold mb-4 flex items-center gap-2">
                        <Shield className="h-4 w-4 text-neutral-400" /> 시스템 접근 권한
                    </h2>
                    <div className="space-y-2 mb-6">
                        {(user.systemAccess || []).map(a => (
                            <div key={a} className="flex items-center gap-2">
                                <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                                <span className="text-sm">{a}</span>
                            </div>
                        ))}
                    </div>

                    <h2 className="text-sm font-bold mb-3 flex items-center gap-2">
                        <Target className="h-4 w-4 text-neutral-400" /> GPR 현황
                    </h2>
                    <div className="p-3 bg-neutral-50 rounded">
                        <p className="text-sm font-medium">2026 Q1 · 달성률 38%</p>
                        <p className="text-xs text-neutral-400 mt-1">다음 리뷰: 2026-03-31</p>
                    </div>
                    <Link href="/intra/erp/hr/gpr" className="text-xs text-neutral-400 hover:text-neutral-900 transition-colors mt-2 inline-block">
                        GPR 상세보기 →
                    </Link>
                </div>

                {/* 최근 교육 */}
                <div className="border border-neutral-200 bg-white p-6">
                    <h2 className="text-sm font-bold mb-4 flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-neutral-400" /> 최근 교육 이력
                    </h2>
                    <div className="space-y-2">
                        {myInfo.recentEducation.map(e => (
                            <div key={e.name} className="flex items-center justify-between py-1.5 border-b border-neutral-50 last:border-0">
                                <div>
                                    <p className="text-sm">{e.name}</p>
                                    <p className="text-[10px] text-neutral-400">{e.date}</p>
                                </div>
                                <span className="text-[10px] px-2 py-0.5 bg-green-50 text-green-600 rounded font-medium">{e.status}</span>
                            </div>
                        ))}
                    </div>
                    <Link href="/intra/erp/hr/education" className="text-xs text-neutral-400 hover:text-neutral-900 transition-colors mt-3 inline-block">
                        전체 교육 이력 →
                    </Link>
                </div>

                {/* 제증명서 */}
                <div className="border border-neutral-200 bg-white p-6">
                    <h2 className="text-sm font-bold mb-4 flex items-center gap-2">
                        <FileCheck className="h-4 w-4 text-neutral-400" /> 제증명서
                    </h2>
                    <div className="space-y-2">
                        {myInfo.certificates.map(c => (
                            <div key={c.name} className="flex items-center justify-between py-1.5 border-b border-neutral-50 last:border-0">
                                <p className="text-sm">{c.name}</p>
                                <div className="flex items-center gap-3">
                                    <span className="text-[10px] text-neutral-400">최근 발급: {c.lastIssued}</span>
                                    <button className="text-[10px] px-2 py-0.5 border border-neutral-200 rounded hover:bg-neutral-50 transition-colors">발급</button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <Link href="/intra/erp/hr/certificates" className="text-xs text-neutral-400 hover:text-neutral-900 transition-colors mt-3 inline-block">
                        전체 증명서 →
                    </Link>
                </div>
            </div>
        </div>
    );
}
