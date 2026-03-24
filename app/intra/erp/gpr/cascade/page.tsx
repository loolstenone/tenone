"use client";

import { useState, useEffect } from "react";
import { Target, ChevronDown, ChevronRight, CheckCircle2, Clock, AlertCircle, Building2, Users, User } from "lucide-react";
import { getMemberStats } from "@/lib/supabase/members";

type GoalStatus = "확정" | "승인대기" | "초안" | "반려";

interface Goal {
    id: string;
    title: string;
    weight: number;
    progress: number;
    status: GoalStatus;
    krs: string[];
}

interface PersonNode {
    name: string;
    position: string;
    rate: number;
    goals: Goal[];
}

interface TeamNode {
    name: string;
    head: string;
    rate: number;
    members: PersonNode[];
}

interface DivisionNode {
    name: string;
    head: string;
    rate: number;
    teams: TeamNode[];
}

const companyGoals: Goal[] = [
    { id: "C-1", title: "10,000명의 기획자 발굴·연결 네트워크 구축", weight: 30, progress: 25, status: "확정", krs: ["MADLeague 5개 지역 확장", "HeRo 커뮤니티 1,000명 달성"] },
    { id: "C-2", title: "AI 그룹 LUKI 데뷔 및 글로벌 노출", weight: 25, progress: 60, status: "확정", krs: ["2nd Single 발매", "스트리밍 100만 달성"] },
    { id: "C-3", title: "Badak 파트너 네트워크 10개사 확보", weight: 20, progress: 15, status: "확정", krs: ["제조사 5개 계약", "유통사 5개 계약"] },
    { id: "C-4", title: "분기 매출 목표 달성 (1.2억)", weight: 25, progress: 40, status: "확정", krs: ["외주 프로젝트 3건 수주", "자체 콘텐츠 수익 3,000만"] },
];

const cascadeData: DivisionNode[] = [
    {
        name: "경영기획", head: "Cheonil Jeon", rate: 59,
        teams: [{
            name: "경영기획팀", head: "Cheonil Jeon", rate: 59,
            members: [{
                name: "Cheonil Jeon", position: "대표", rate: 59,
                goals: [
                    { id: "G-111", title: "10,000명 기획자 발굴 네트워크 구축", weight: 25, progress: 25, status: "확정", krs: [] },
                    { id: "G-112", title: "MADLeague 인사이트 투어링 성공적 운영", weight: 20, progress: 60, status: "확정", krs: [] },
                    { id: "G-113", title: "LUKI 데뷔 캠페인 완료", weight: 20, progress: 100, status: "확정", krs: [] },
                    { id: "G-114", title: "주간 콘텐츠 파이프라인 운영", weight: 15, progress: 70, status: "확정", krs: [] },
                    { id: "G-115", title: "VRIEF 프레임워크 매드리그 교육 적용", weight: 20, progress: 40, status: "확정", krs: [] },
                ],
            }],
        }],
    },
    {
        name: "브랜드관리", head: "Sarah Kim", rate: 15,
        teams: [{
            name: "브랜드관리팀", head: "Sarah Kim", rate: 15,
            members: [{
                name: "Sarah Kim", position: "매니저", rate: 15,
                goals: [
                    { id: "G-211", title: "LUKI 브랜드 파트너십 3건 확보", weight: 50, progress: 0, status: "승인대기", krs: [] },
                    { id: "G-212", title: "Badak 밋업 월 1회 운영", weight: 50, progress: 30, status: "확정", krs: [] },
                ],
            }],
        }],
    },
    {
        name: "커뮤니티운영", head: "김준호", rate: 28,
        teams: [{
            name: "커뮤니티팀", head: "김준호", rate: 28,
            members: [{
                name: "김준호", position: "주임", rate: 28,
                goals: [
                    { id: "G-311", title: "MADLeap 5기 운영 관리", weight: 60, progress: 55, status: "확정", krs: [] },
                    { id: "G-312", title: "경쟁PT 프로그램 기획", weight: 40, progress: 0, status: "초안", krs: [] },
                ],
            }],
        }],
    },
];

const statusStyle: Record<GoalStatus, string> = {
    "확정": "bg-green-50 text-green-600",
    "승인대기": "bg-yellow-50 text-yellow-600",
    "초안": "bg-neutral-100 text-neutral-500",
    "반려": "bg-red-50 text-red-600",
};

const statusIcon: Record<GoalStatus, typeof CheckCircle2> = {
    "확정": CheckCircle2,
    "승인대기": Clock,
    "초안": Target,
    "반려": AlertCircle,
};

export default function GPRCascadePage() {
    const [expandedDivs, setExpandedDivs] = useState<Set<string>>(new Set(["경영기획"]));
    const [expandedTeams, setExpandedTeams] = useState<Set<string>>(new Set(["경영기획팀"]));
    const [expandedMembers, setExpandedMembers] = useState<Set<string>>(new Set(["Cheonil Jeon"]));
    const [dbMemberTotal, setDbMemberTotal] = useState<number | null>(null);

    useEffect(() => {
        getMemberStats()
            .then(stats => setDbMemberTotal(stats.total))
            .catch(() => { /* DB 실패 시 Mock 유지 */ });
    }, []);

    const toggle = (set: Set<string>, key: string, setter: (s: Set<string>) => void) => {
        const next = new Set(set);
        next.has(key) ? next.delete(key) : next.add(key);
        setter(next);
    };

    return (
        <div className="max-w-5xl">
            <h1 className="text-2xl font-bold mb-2">목표 캐스케이드</h1>
            <p className="text-sm text-neutral-500 mb-6">
                회사 → 사업부 → 팀 → 개인으로 이어지는 목표 설정 및 승인 흐름
                {dbMemberTotal !== null && <span className="ml-2 text-neutral-400">· 전체 멤버 {dbMemberTotal}명</span>}
            </p>

            {/* Company Level */}
            <div className="border border-neutral-200 bg-white p-5 mb-6">
                <div className="flex items-center gap-2 mb-4">
                    <Building2 className="h-4 w-4 text-neutral-400" />
                    <h2 className="text-sm font-bold">전사 목표 (CEO)</h2>
                    <span className="text-xs px-2 py-0.5 bg-neutral-900 text-white rounded ml-auto">2026 Q1</span>
                </div>
                <div className="space-y-3">
                    {companyGoals.map(g => (
                        <div key={g.id} className="flex items-center gap-3 py-2 border-b border-neutral-50 last:border-0">
                            <span className="font-mono text-xs text-neutral-400 w-8">{g.id}</span>
                            <span className="text-sm flex-1">{g.title}</span>
                            <span className="text-xs text-neutral-400 w-12 text-right">{g.weight}%</span>
                            <div className="w-20 h-1.5 bg-neutral-100 rounded-full">
                                <div className="h-1.5 bg-neutral-900 rounded-full" style={{ width: `${g.progress}%` }} />
                            </div>
                            <span className="text-xs text-neutral-500 w-8 text-right">{g.progress}%</span>
                            <span className={`text-[11px] px-1.5 py-0.5 rounded font-medium ${statusStyle[g.status]}`}>{g.status}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Division → Team → Person cascade */}
            <div className="space-y-2">
                {cascadeData.map(div => (
                    <div key={div.name} className="border border-neutral-200 bg-white">
                        {/* Division header */}
                        <button
                            onClick={() => toggle(expandedDivs, div.name, setExpandedDivs)}
                            className="w-full flex items-center gap-3 p-4 hover:bg-neutral-50 transition-colors"
                        >
                            {expandedDivs.has(div.name) ? <ChevronDown className="h-4 w-4 text-neutral-400" /> : <ChevronRight className="h-4 w-4 text-neutral-400" />}
                            <Users className="h-4 w-4 text-neutral-400" />
                            <span className="text-sm font-bold flex-1 text-left">{div.name}</span>
                            <span className="text-xs text-neutral-500">{div.head}</span>
                            <div className="w-20 h-1.5 bg-neutral-100 rounded-full mx-3">
                                <div className="h-1.5 bg-neutral-900 rounded-full" style={{ width: `${div.rate}%` }} />
                            </div>
                            <span className="text-xs font-bold w-10 text-right">{div.rate}%</span>
                        </button>

                        {expandedDivs.has(div.name) && (
                            <div className="border-t border-neutral-100">
                                {div.teams.map(team => (
                                    <div key={team.name} className="ml-6 border-l border-neutral-100">
                                        {/* Team header */}
                                        <button
                                            onClick={() => toggle(expandedTeams, team.name, setExpandedTeams)}
                                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-neutral-50 transition-colors"
                                        >
                                            {expandedTeams.has(team.name) ? <ChevronDown className="h-3.5 w-3.5 text-neutral-400" /> : <ChevronRight className="h-3.5 w-3.5 text-neutral-400" />}
                                            <span className="text-xs font-medium flex-1 text-left">{team.name}</span>
                                            <span className="text-xs text-neutral-400">{team.head}</span>
                                        </button>

                                        {expandedTeams.has(team.name) && (
                                            <div className="ml-6 border-l border-neutral-50">
                                                {team.members.map(member => (
                                                    <div key={member.name}>
                                                        {/* Person header */}
                                                        <button
                                                            onClick={() => toggle(expandedMembers, member.name, setExpandedMembers)}
                                                            className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-neutral-50 transition-colors"
                                                        >
                                                            {expandedMembers.has(member.name) ? <ChevronDown className="h-3 w-3 text-neutral-400" /> : <ChevronRight className="h-3 w-3 text-neutral-400" />}
                                                            <User className="h-3.5 w-3.5 text-neutral-400" />
                                                            <span className="text-xs flex-1 text-left">{member.name}</span>
                                                            <span className="text-xs text-neutral-400">{member.position}</span>
                                                            <span className="text-xs font-bold w-10 text-right">{member.rate}%</span>
                                                        </button>

                                                        {expandedMembers.has(member.name) && (
                                                            <div className="ml-10 pb-3 space-y-1">
                                                                {member.goals.map(g => {
                                                                    const Icon = statusIcon[g.status];
                                                                    return (
                                                                        <div key={g.id} className="flex items-center gap-2 px-4 py-1.5">
                                                                            <Icon className={`h-3 w-3 shrink-0 ${g.status === "확정" ? "text-green-500" : g.status === "승인대기" ? "text-yellow-500" : "text-neutral-400"}`} />
                                                                            <span className="font-mono text-[11px] text-neutral-400">{g.id}</span>
                                                                            <span className="text-xs flex-1">{g.title}</span>
                                                                            <span className="text-xs text-neutral-400">{g.weight}%</span>
                                                                            <div className="w-16 h-1 bg-neutral-100 rounded-full">
                                                                                <div className="h-1 bg-neutral-900 rounded-full" style={{ width: `${g.progress}%` }} />
                                                                            </div>
                                                                            <span className="text-xs text-neutral-500 w-8 text-right">{g.progress}%</span>
                                                                            <span className={`text-[11px] px-1.5 py-0.5 rounded font-medium ${statusStyle[g.status]}`}>{g.status}</span>
                                                                            {g.status === "승인대기" && (
                                                                                <div className="flex gap-1">
                                                                                    <button className="text-[11px] px-1.5 py-0.5 bg-green-50 text-green-600 rounded hover:bg-green-100">승인</button>
                                                                                    <button className="text-[11px] px-1.5 py-0.5 bg-red-50 text-red-600 rounded hover:bg-red-100">반려</button>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Flow explanation */}
            <div className="mt-8 border border-neutral-200 bg-neutral-50 p-5">
                <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-3">GPR 설정 흐름</h3>
                <div className="flex items-center gap-3 text-xs text-neutral-600">
                    <span className="bg-white border border-neutral-200 px-3 py-1.5 rounded font-medium">CEO 전사목표 설정</span>
                    <ChevronRight className="h-3 w-3 text-neutral-400" />
                    <span className="bg-white border border-neutral-200 px-3 py-1.5 rounded font-medium">사업부장 GPR 설정</span>
                    <ChevronRight className="h-3 w-3 text-neutral-400" />
                    <span className="bg-white border border-neutral-200 px-3 py-1.5 rounded font-medium">팀장 GPR 설정</span>
                    <ChevronRight className="h-3 w-3 text-neutral-400" />
                    <span className="bg-white border border-neutral-200 px-3 py-1.5 rounded font-medium">팀원 GPR 설정</span>
                    <ChevronRight className="h-3 w-3 text-neutral-400" />
                    <span className="bg-neutral-900 text-white px-3 py-1.5 rounded font-medium">상부 승인</span>
                </div>
            </div>
        </div>
    );
}
