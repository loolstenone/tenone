"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import clsx from "clsx";
import {
    ArrowLeft, Plus, Calendar, Users, Briefcase, TrendingUp,
    CheckCircle2, X, Clock, User,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";

/* ═══════════════════════════════════════════════
   Types
   ═══════════════════════════════════════════════ */

type ProjectType = "커뮤니티" | "클라이언트" | "내부";
type ProjectStatus = "기획" | "진행" | "완료" | "보류";
type JobType = "PR" | "ME" | "PT";
type JobDetail = "PL" | "DO" | "RE";
type JobStatus = "대기" | "진행" | "완료" | "보류";

interface Job {
    code: string;
    name: string;
    type: JobType;
    detail: JobDetail;
    assignee: string;
    startDate: string;
    endDate: string;
    estimatedHours: number;
    actualHours: number;
    status: JobStatus;
    estimatedAmount?: number; // 만원 단위
}

interface StaffMember {
    name: string;
    role: string;
    estimatedHours: number;
    actualHours: number;
    period: string;
}

interface ProjectData {
    code: string;
    name: string;
    type: ProjectType;
    status: ProjectStatus;
    pm: string;
    startDate: string;
    endDate: string;
    memberCount: number;
    approved: boolean;
    description: string;
    milestones: { name: string; date: string; done: boolean }[];
    // 프로젝트 레벨 예상 손익 (만원)
    estBilling: number;
    estExCost: number;
    estGrossProfit: number;
    // 실제 (확정 시)
    actualBilling?: number;
    actualGrossProfit?: number;
    jobs: Job[];
    staff: StaffMember[];
}

/* ═══════════════════════════════════════════════
   Mock Data
   ═══════════════════════════════════════════════ */

const projectsDB: Record<string, ProjectData> = {
    "PRJ-2026-0001": {
        code: "PRJ-2026-0001", name: "LUKI 2nd Single", type: "클라이언트", status: "진행",
        pm: "Sarah Kim", startDate: "2026-02-01", endDate: "2026-05-31",
        memberCount: 5, approved: true,
        description: "LUKI 2번째 싱글 앨범 기획·제작·발매 프로젝트. MV 제작, 미디어 플래닝, 비주얼 디자인, 성과 리포트 포함.",
        milestones: [
            { name: "컨셉 확정", date: "2026-02-15", done: true },
            { name: "MV 촬영 완료", date: "2026-03-30", done: false },
            { name: "음원 발매", date: "2026-04-15", done: false },
            { name: "성과 리포트 제출", date: "2026-05-31", done: false },
        ],
        estBilling: 20000, estExCost: 13000, estGrossProfit: 7000,
        actualBilling: 21000, actualGrossProfit: 7500,
        jobs: [
            { code: "PRJ-2026-0001-PR-PL0001", name: "컨셉 기획", type: "PR", detail: "PL", assignee: "Cheonil Jeon", startDate: "2026-02-01", endDate: "2026-02-28", estimatedHours: 15, actualHours: 11, status: "완료", estimatedAmount: 3000 },
            { code: "PRJ-2026-0001-PR-DO0001", name: "MV 제작", type: "PR", detail: "DO", assignee: "이영상", startDate: "2026-03-01", endDate: "2026-04-15", estimatedHours: 40, actualHours: 12, status: "진행", estimatedAmount: 8000 },
            { code: "PRJ-2026-0001-ME-PL0001", name: "미디어 플래닝", type: "ME", detail: "PL", assignee: "유광고", startDate: "2026-03-01", endDate: "2026-04-30", estimatedHours: 20, actualHours: 8, status: "진행", estimatedAmount: 2500 },
            { code: "PRJ-2026-0001-PR-DO0002", name: "비주얼 디자인", type: "PR", detail: "DO", assignee: "박디자", startDate: "2026-03-01", endDate: "2026-04-10", estimatedHours: 30, actualHours: 15, status: "진행", estimatedAmount: 4000 },
            { code: "PRJ-2026-0001-PR-RE0001", name: "성과 리포트", type: "PR", detail: "RE", assignee: "한마케", startDate: "2026-05-01", endDate: "2026-05-31", estimatedHours: 10, actualHours: 0, status: "대기", estimatedAmount: 1000 },
        ],
        staff: [
            { name: "Cheonil Jeon", role: "기획 총괄", estimatedHours: 15, actualHours: 11, period: "2026-02 ~ 2026-02" },
            { name: "이영상", role: "영상 PD", estimatedHours: 40, actualHours: 12, period: "2026-03 ~ 2026-04" },
            { name: "유광고", role: "미디어 플래너", estimatedHours: 20, actualHours: 8, period: "2026-03 ~ 2026-04" },
            { name: "박디자", role: "디자이너", estimatedHours: 30, actualHours: 15, period: "2026-03 ~ 2026-04" },
            { name: "한마케", role: "마케터", estimatedHours: 10, actualHours: 0, period: "2026-05 ~ 2026-05" },
        ],
    },
    "PRJ-2026-0002": {
        code: "PRJ-2026-0002", name: "MADLeap 5기 운영", type: "커뮤니티", status: "진행",
        pm: "김준호", startDate: "2026-03-01", endDate: "2026-06-30",
        memberCount: 3, approved: true,
        description: "대학 연합 크리에이터 인턴십 MADLeap 5기 운영. 커리큘럼 설계, 멘토링, 결과물 제작 지원.",
        milestones: [
            { name: "5기 모집 완료", date: "2026-03-15", done: true },
            { name: "중간 발표", date: "2026-05-01", done: false },
        ],
        estBilling: 5000, estExCost: 3000, estGrossProfit: 2000,
        jobs: [
            { code: "PRJ-2026-0002-PR-PL0001", name: "커리큘럼 설계", type: "PR", detail: "PL", assignee: "김준호", startDate: "2026-03-01", endDate: "2026-03-20", estimatedHours: 20, actualHours: 18, status: "완료" },
            { code: "PRJ-2026-0002-PR-DO0001", name: "멘토링 운영", type: "PR", detail: "DO", assignee: "이수진", startDate: "2026-03-20", endDate: "2026-06-15", estimatedHours: 50, actualHours: 12, status: "진행" },
            { code: "PRJ-2026-0002-PR-RE0001", name: "결과 리포트", type: "PR", detail: "RE", assignee: "한마케", startDate: "2026-06-15", endDate: "2026-06-30", estimatedHours: 10, actualHours: 0, status: "대기" },
        ],
        staff: [
            { name: "김준호", role: "PM / 기획", estimatedHours: 20, actualHours: 18, period: "2026-03 ~ 2026-03" },
            { name: "이수진", role: "멘토링 매니저", estimatedHours: 50, actualHours: 12, period: "2026-03 ~ 2026-06" },
            { name: "한마케", role: "리포트", estimatedHours: 10, actualHours: 0, period: "2026-06 ~ 2026-06" },
        ],
    },
    "PRJ-2026-0003": {
        code: "PRJ-2026-0003", name: "리제로스 시즌2", type: "커뮤니티", status: "기획",
        pm: "마리그", startDate: "2026-04-01", endDate: "2026-09-30",
        memberCount: 4, approved: false,
        description: "리제로스 커뮤니티 시즌2 론칭 프로젝트. 콘텐츠 기획, 이벤트 운영, 파트너십 확보.",
        milestones: [],
        estBilling: 10000, estExCost: 6500, estGrossProfit: 3500,
        jobs: [
            { code: "PRJ-2026-0003-PR-PL0001", name: "시즌2 기획", type: "PR", detail: "PL", assignee: "마리그", startDate: "2026-04-01", endDate: "2026-05-15", estimatedHours: 30, actualHours: 0, status: "대기" },
            { code: "PRJ-2026-0003-ME-PL0001", name: "미디어 전략", type: "ME", detail: "PL", assignee: "유광고", startDate: "2026-05-01", endDate: "2026-06-30", estimatedHours: 25, actualHours: 0, status: "대기" },
        ],
        staff: [
            { name: "마리그", role: "PM / 기획", estimatedHours: 30, actualHours: 0, period: "2026-04 ~ 2026-05" },
            { name: "유광고", role: "미디어 플래너", estimatedHours: 25, actualHours: 0, period: "2026-05 ~ 2026-06" },
            { name: "이영상", role: "영상 PD", estimatedHours: 20, actualHours: 0, period: "2026-06 ~ 2026-09" },
            { name: "박디자", role: "디자이너", estimatedHours: 15, actualHours: 0, period: "2026-06 ~ 2026-08" },
        ],
    },
    "PRJ-2026-0004": {
        code: "PRJ-2026-0004", name: "Brand Gravity 컨설팅", type: "클라이언트", status: "진행",
        pm: "조브랜", startDate: "2026-03-15", endDate: "2026-06-15",
        memberCount: 3, approved: true,
        description: "Brand Gravity 외부 클라이언트 브랜드 컨설팅 프로젝트.",
        milestones: [
            { name: "진단 보고서 제출", date: "2026-04-10", done: false },
            { name: "전략 수립 완료", date: "2026-05-15", done: false },
        ],
        estBilling: 8000, estExCost: 5000, estGrossProfit: 3000,
        jobs: [
            { code: "PRJ-2026-0004-PR-PL0001", name: "브랜드 진단", type: "PR", detail: "PL", assignee: "조브랜", startDate: "2026-03-15", endDate: "2026-04-10", estimatedHours: 25, actualHours: 10, status: "진행" },
            { code: "PRJ-2026-0004-PR-PL0002", name: "전략 기획", type: "PR", detail: "PL", assignee: "조브랜", startDate: "2026-04-10", endDate: "2026-05-15", estimatedHours: 30, actualHours: 0, status: "대기" },
            { code: "PRJ-2026-0004-PR-DO0001", name: "비주얼 아이덴티티", type: "PR", detail: "DO", assignee: "박디자", startDate: "2026-05-01", endDate: "2026-06-01", estimatedHours: 35, actualHours: 0, status: "대기" },
            { code: "PRJ-2026-0004-PR-RE0001", name: "최종 리포트", type: "PR", detail: "RE", assignee: "한마케", startDate: "2026-06-01", endDate: "2026-06-15", estimatedHours: 10, actualHours: 0, status: "대기" },
        ],
        staff: [
            { name: "조브랜", role: "PM / 컨설턴트", estimatedHours: 55, actualHours: 10, period: "2026-03 ~ 2026-05" },
            { name: "박디자", role: "디자이너", estimatedHours: 35, actualHours: 0, period: "2026-05 ~ 2026-06" },
            { name: "한마케", role: "리포트", estimatedHours: 10, actualHours: 0, period: "2026-06 ~ 2026-06" },
        ],
    },
    "PRJ-2026-0005": {
        code: "PRJ-2026-0005", name: "Badak 네트워크 확장", type: "내부", status: "기획",
        pm: "이수진", startDate: "2026-05-01", endDate: "2026-10-31",
        memberCount: 2, approved: false,
        description: "Badak 네트워크의 대학 커뮤니티 확장 전략 수립 및 실행.",
        milestones: [],
        estBilling: 3000, estExCost: 1500, estGrossProfit: 1500,
        jobs: [
            { code: "PRJ-2026-0005-PR-PL0001", name: "확장 전략 수립", type: "PR", detail: "PL", assignee: "이수진", startDate: "2026-05-01", endDate: "2026-06-30", estimatedHours: 40, actualHours: 0, status: "대기" },
        ],
        staff: [
            { name: "이수진", role: "PM / 전략", estimatedHours: 40, actualHours: 0, period: "2026-05 ~ 2026-06" },
            { name: "김준호", role: "네트워크 지원", estimatedHours: 15, actualHours: 0, period: "2026-06 ~ 2026-10" },
        ],
    },
};

/* ═══════════════════════════════════════════════
   Helpers
   ═══════════════════════════════════════════════ */

function fmt(manwon: number): string {
    if (manwon >= 10000) return `${(manwon / 10000).toFixed(1)}억`;
    return `${manwon.toLocaleString("ko-KR")}만`;
}

function fmtKRW(manwon: number): string {
    return `${(manwon * 10000).toLocaleString("ko-KR")}원`;
}

const typeBadge: Record<ProjectType, string> = {
    "커뮤니티": "bg-violet-50 text-violet-600",
    "클라이언트": "bg-blue-50 text-blue-600",
    "내부": "bg-neutral-100 text-neutral-500",
};
const statusBadge: Record<ProjectStatus, string> = {
    "기획": "bg-neutral-100 text-neutral-500",
    "진행": "bg-emerald-50 text-emerald-600",
    "완료": "bg-blue-50 text-blue-600",
    "보류": "bg-yellow-50 text-yellow-600",
};
const jobStatusBadge: Record<JobStatus, string> = {
    "대기": "bg-neutral-100 text-neutral-400",
    "진행": "bg-emerald-50 text-emerald-600",
    "완료": "bg-blue-50 text-blue-600",
    "보류": "bg-yellow-50 text-yellow-600",
};
const jobTypeName: Record<JobType, string> = { PR: "제작", ME: "Media", PT: "PT" };
const jobDetailName: Record<JobDetail, string> = { PL: "기획", DO: "실행", RE: "Report" };

const tabs = ["개요", "Job 관리", "손익", "인력", "파일"] as const;

/* ── 프로젝트 파일 Mock 데이터 ── */
type PFileType = "RFP" | "제안서" | "보고서" | "계약서" | "기타";
interface ProjectFile {
    id: string; name: string; type: PFileType; format: string; fileSize: string;
    uploadedBy: string; uploadedAt: string;
}
const projectFiles: Record<string, ProjectFile[]> = {
    "PRJ-2026-0001": [
        { id: "f1", name: "LUKI_2nd_Single_RFP_v2.pdf", type: "RFP", format: "PDF", fileSize: "4.2 MB", uploadedBy: "Sarah Kim", uploadedAt: "2026-02-03" },
        { id: "f2", name: "LUKI_2nd_Single_제안서_Draft.pptx", type: "제안서", format: "PPTX", fileSize: "12.8 MB", uploadedBy: "Cheonil Jeon", uploadedAt: "2026-02-10" },
        { id: "f3", name: "2월_월간_보고서.docx", type: "보고서", format: "DOCX", fileSize: "1.1 MB", uploadedBy: "한마케", uploadedAt: "2026-03-05" },
        { id: "f4", name: "MV_제작_계약서.pdf", type: "계약서", format: "PDF", fileSize: "890 KB", uploadedBy: "Sarah Kim", uploadedAt: "2026-02-20" },
    ],
    "PRJ-2026-0002": [
        { id: "f5", name: "MADLeap_5기_운영계획서.pdf", type: "기타", format: "PDF", fileSize: "2.3 MB", uploadedBy: "마리그", uploadedAt: "2026-02-15" },
    ],
};
const fileFormatColor: Record<string, string> = {
    PDF: "bg-red-50 text-red-600", DOCX: "bg-blue-50 text-blue-600",
    PPTX: "bg-orange-50 text-orange-600", XLSX: "bg-green-50 text-green-600",
};
const fileTypeOptions: ("전체" | PFileType)[] = ["전체", "RFP", "제안서", "보고서", "계약서", "기타"];
type Tab = (typeof tabs)[number];

/* ═══════════════════════════════════════════════
   Component
   ═══════════════════════════════════════════════ */

export default function ProjectDetailPage() {
    const params = useParams();
    const code = (params.code as string) || "";
    const { isStaff } = useAuth();

    const [activeTab, setActiveTab] = useState<Tab>("개요");
    const [showJobModal, setShowJobModal] = useState(false);

    // Job 등록 모달 state
    const [jobName, setJobName] = useState("");
    const [jobType, setJobType] = useState<JobType>("PR");
    const [jobDetail, setJobDetail] = useState<JobDetail>("PL");
    const [jobAssignee, setJobAssignee] = useState("");
    const [jobStart, setJobStart] = useState("");
    const [jobEnd, setJobEnd] = useState("");
    const [jobEstHours, setJobEstHours] = useState("");
    const [jobEstAmount, setJobEstAmount] = useState("");

    const project = projectsDB[code];

    if (!project) {
        return (
            <div className="max-w-4xl py-20 text-center">
                <p className="text-sm text-neutral-400">프로젝트를 찾을 수 없습니다.</p>
                <Link href="/intra/project/management" className="text-xs text-neutral-400 hover:text-neutral-900 mt-2 inline-block">
                    <ArrowLeft className="h-3 w-3 inline mr-1" />목록으로
                </Link>
            </div>
        );
    }

    const jobSum = project.jobs.reduce((s, j) => s + (j.estimatedAmount || 0), 0);
    const jobDiff = project.estBilling - jobSum;
    const gpJobSum = project.jobs.reduce((s, j) => s + (j.estimatedAmount || 0), 0); // simplified: treat job amount as billing portion
    const accuracy = project.actualBilling ? Math.round((project.actualBilling / project.estBilling) * 100) : null;

    function nextJobCode(): string {
        const prefix = `${project.code}-${jobType}-${jobDetail}`;
        const existing = project.jobs.filter((j) => j.code.startsWith(prefix));
        const next = String(existing.length + 1).padStart(4, "0");
        return `${prefix}${next}`;
    }

    function handleCreateJob() {
        // In real app, would dispatch to context/API
        // For mock, just close modal
        setShowJobModal(false);
        setJobName("");
        setJobType("PR");
        setJobDetail("PL");
        setJobAssignee("");
        setJobStart("");
        setJobEnd("");
        setJobEstHours("");
        setJobEstAmount("");
    }

    return (
        <div className="max-w-5xl">
            {/* Back link */}
            <Link href="/intra/project/management" className="flex items-center gap-1 text-xs text-neutral-400 hover:text-neutral-900 transition-colors mb-3">
                <ArrowLeft className="h-3 w-3" /> 프로젝트 목록
            </Link>

            {/* ── Project Header ── */}
            <div className="mb-6">
                <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs text-neutral-400 bg-neutral-50 px-1.5 py-0.5">{project.code}</span>
                    <span className={clsx("text-xs px-1.5 py-0.5 font-medium", typeBadge[project.type])}>{project.type}</span>
                    <span className={clsx("text-xs px-1.5 py-0.5 font-medium", statusBadge[project.status])}>{project.status}</span>
                    {project.approved && (
                        <span className="flex items-center gap-0.5 text-xs px-1.5 py-0.5 bg-emerald-50 text-emerald-600 font-medium">
                            <CheckCircle2 className="h-3 w-3" /> 승인됨
                        </span>
                    )}
                </div>
                <h1 className="text-xl font-bold">{project.name}</h1>
                <div className="flex items-center gap-4 mt-1 text-xs text-neutral-400">
                    <span>PM: {project.pm}</span>
                    <span className="flex items-center gap-0.5"><Calendar className="h-3 w-3" /> {project.startDate} ~ {project.endDate}</span>
                    <span className="flex items-center gap-0.5"><Users className="h-3 w-3" /> {project.memberCount}명</span>
                </div>
            </div>

            {/* ── Tab Navigation ── */}
            <div className="flex gap-0 border-b border-neutral-200 mb-6">
                {tabs.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={clsx(
                            "px-5 py-2.5 text-xs transition-all border-b-2 -mb-px",
                            activeTab === tab
                                ? "border-neutral-900 font-medium text-neutral-900"
                                : "border-transparent text-neutral-400 hover:text-neutral-600"
                        )}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* ══════════════════════════════════════
               Tab 1: 개요
               ══════════════════════════════════════ */}
            {activeTab === "개요" && (
                <div className="space-y-5">
                    {/* Description */}
                    <div className="border border-neutral-200 bg-white p-4">
                        <h3 className="text-xs font-medium text-neutral-400 uppercase tracking-wider mb-2">프로젝트 설명</h3>
                        <p className="text-sm text-neutral-600 leading-relaxed">{project.description}</p>
                    </div>

                    {/* P&L Summary Card (isStaff only) */}
                    {isStaff && (
                        <div className="border border-neutral-200 bg-white p-4">
                            <h3 className="text-xs font-medium text-neutral-400 uppercase tracking-wider mb-3">예상 손익 요약</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-neutral-400">프로젝트 예상 취급액</span>
                                        <span className="font-bold">{fmt(project.estBilling)}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-neutral-400">Job 예상 취급액 합</span>
                                        <span className="font-medium">{fmt(jobSum)}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-xs border-t border-neutral-100 pt-1.5">
                                        <span className="text-neutral-400">차이</span>
                                        <span className={clsx("font-bold", jobDiff >= 0 ? "text-emerald-600" : "text-red-500")}>
                                            {jobDiff >= 0 ? "+" : ""}{fmt(jobDiff)}
                                        </span>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-neutral-400">프로젝트 예상 매총</span>
                                        <span className="font-bold">{fmt(project.estGrossProfit)}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-neutral-400">실제 청구/지급 금액</span>
                                        <span className="font-medium">
                                            {project.actualBilling ? fmt(project.actualBilling) : "미확정"}
                                        </span>
                                    </div>
                                    {accuracy !== null && (
                                        <div className="flex items-center justify-between text-xs border-t border-neutral-100 pt-1.5">
                                            <span className="text-neutral-400">예상 정확도</span>
                                            <span className="font-bold text-blue-600">{accuracy}%</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Milestones */}
                    <div className="border border-neutral-200 bg-white p-4">
                        <h3 className="text-xs font-medium text-neutral-400 uppercase tracking-wider mb-3">마일스톤</h3>
                        {project.milestones.length === 0 ? (
                            <p className="text-xs text-neutral-400">등록된 마일스톤이 없습니다.</p>
                        ) : (
                            <div className="space-y-2">
                                {project.milestones.map((m, i) => (
                                    <div key={i} className="flex items-center gap-3 text-xs">
                                        {m.done ? (
                                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                                        ) : (
                                            <Clock className="h-3.5 w-3.5 text-neutral-300 shrink-0" />
                                        )}
                                        <span className={clsx(m.done ? "text-neutral-400 line-through" : "text-neutral-700 font-medium")}>{m.name}</span>
                                        <span className="text-neutral-400 ml-auto">{m.date}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ══════════════════════════════════════
               Tab 2: Job 관리
               ══════════════════════════════════════ */}
            {activeTab === "Job 관리" && (
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <p className="text-xs text-neutral-500">
                                Job <span className="font-bold text-neutral-900">{project.jobs.length}건</span>
                            </p>
                            <p className="text-xs text-neutral-500">
                                총 예상 시수 <span className="font-bold text-neutral-900">{project.jobs.reduce((s, j) => s + j.estimatedHours, 0)}h</span>
                            </p>
                        </div>
                        <button
                            onClick={() => setShowJobModal(true)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-neutral-900 text-white hover:bg-neutral-800 transition-colors"
                        >
                            <Plus className="h-3 w-3" /> Job 등록
                        </button>
                    </div>

                    {/* Job Table */}
                    <div className="border border-neutral-200 bg-white overflow-x-auto">
                        <table className="w-full text-xs">
                            <thead>
                                <tr className="border-b border-neutral-100 text-xs text-neutral-400">
                                    <th className="text-left p-3 font-medium">Job 코드</th>
                                    <th className="text-left p-3 font-medium">Job명</th>
                                    <th className="text-center p-3 font-medium">유형</th>
                                    <th className="text-center p-3 font-medium">세부</th>
                                    <th className="text-left p-3 font-medium">담당자</th>
                                    <th className="text-left p-3 font-medium">기간</th>
                                    <th className="text-center p-3 font-medium">예상(h)</th>
                                    <th className="text-center p-3 font-medium">실제(h)</th>
                                    <th className="text-center p-3 font-medium">상태</th>
                                    {isStaff && <th className="text-right p-3 font-medium">예상 금액</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {project.jobs.map((j) => (
                                    <tr key={j.code} className="border-b border-neutral-50 hover:bg-neutral-50 transition-colors">
                                        <td className="p-3 font-mono text-xs text-neutral-400">{j.code}</td>
                                        <td className="p-3 font-medium text-neutral-800">{j.name}</td>
                                        <td className="p-3 text-center">
                                            <span className="text-xs px-1.5 py-0.5 bg-blue-50 text-blue-600 font-medium">
                                                {jobTypeName[j.type]}
                                            </span>
                                        </td>
                                        <td className="p-3 text-center">
                                            <span className="text-xs px-1.5 py-0.5 bg-neutral-100 text-neutral-500 font-medium">
                                                {jobDetailName[j.detail]}
                                            </span>
                                        </td>
                                        <td className="p-3 text-neutral-600">{j.assignee}</td>
                                        <td className="p-3 text-xs text-neutral-400">{j.startDate} ~ {j.endDate}</td>
                                        <td className="p-3 text-center font-medium">{j.estimatedHours}h</td>
                                        <td className="p-3 text-center">
                                            <span className={clsx(j.actualHours > j.estimatedHours ? "text-red-500 font-bold" : "text-neutral-600")}>
                                                {j.actualHours}h
                                            </span>
                                        </td>
                                        <td className="p-3 text-center">
                                            <span className={clsx("text-xs px-1.5 py-0.5 font-medium", jobStatusBadge[j.status])}>{j.status}</span>
                                        </td>
                                        {isStaff && (
                                            <td className="p-3 text-right text-neutral-600">
                                                {j.estimatedAmount ? fmt(j.estimatedAmount) : "-"}
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* ── Job 등록 Modal ── */}
                    {showJobModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
                            <div className="bg-white border border-neutral-200 shadow-lg w-full max-w-lg mx-4 p-5">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-sm font-bold">Job 등록</h2>
                                    <button onClick={() => setShowJobModal(false)} className="text-neutral-400 hover:text-neutral-600">
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    {/* Job 코드 미리보기 */}
                                    <div>
                                        <label className="text-xs text-neutral-400 block mb-1">Job 코드 (자동 생성)</label>
                                        <p className="text-xs font-mono bg-neutral-50 px-3 py-2 text-neutral-500">{nextJobCode()}</p>
                                    </div>

                                    {/* Job명 */}
                                    <div>
                                        <label className="text-xs text-neutral-400 block mb-1">Job명</label>
                                        <input
                                            value={jobName} onChange={(e) => setJobName(e.target.value)}
                                            className="w-full border border-neutral-200 px-3 py-2 text-xs focus:outline-none focus:border-neutral-400"
                                            placeholder="Job 이름 입력"
                                        />
                                    </div>

                                    {/* 유형 + 세부 */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-xs text-neutral-400 block mb-1">유형</label>
                                            <select
                                                value={jobType} onChange={(e) => setJobType(e.target.value as JobType)}
                                                className="w-full border border-neutral-200 px-3 py-2 text-xs focus:outline-none focus:border-neutral-400 bg-white"
                                            >
                                                <option value="PR">PR (제작)</option>
                                                <option value="ME">ME (Media)</option>
                                                <option value="PT">PT</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-xs text-neutral-400 block mb-1">세부</label>
                                            <select
                                                value={jobDetail} onChange={(e) => setJobDetail(e.target.value as JobDetail)}
                                                className="w-full border border-neutral-200 px-3 py-2 text-xs focus:outline-none focus:border-neutral-400 bg-white"
                                            >
                                                <option value="PL">PL (기획)</option>
                                                <option value="DO">DO (실행)</option>
                                                <option value="RE">RE (Report)</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* 담당자 */}
                                    <div>
                                        <label className="text-xs text-neutral-400 block mb-1">담당자</label>
                                        <input
                                            value={jobAssignee} onChange={(e) => setJobAssignee(e.target.value)}
                                            className="w-full border border-neutral-200 px-3 py-2 text-xs focus:outline-none focus:border-neutral-400"
                                            placeholder="담당자 이름"
                                        />
                                    </div>

                                    {/* 기간 */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-xs text-neutral-400 block mb-1">시작일</label>
                                            <input
                                                type="date" value={jobStart} onChange={(e) => setJobStart(e.target.value)}
                                                className="w-full border border-neutral-200 px-3 py-2 text-xs focus:outline-none focus:border-neutral-400"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs text-neutral-400 block mb-1">종료일</label>
                                            <input
                                                type="date" value={jobEnd} onChange={(e) => setJobEnd(e.target.value)}
                                                className="w-full border border-neutral-200 px-3 py-2 text-xs focus:outline-none focus:border-neutral-400"
                                            />
                                        </div>
                                    </div>

                                    {/* 예상 투입 시수 */}
                                    <div>
                                        <label className="text-xs text-neutral-400 block mb-1">예상 투입 시수 (h)</label>
                                        <input
                                            type="number" value={jobEstHours} onChange={(e) => setJobEstHours(e.target.value)}
                                            className="w-full border border-neutral-200 px-3 py-2 text-xs focus:outline-none focus:border-neutral-400"
                                            placeholder="예: 20"
                                        />
                                    </div>

                                    {/* 예상 금액 (optional) */}
                                    <div>
                                        <label className="text-xs text-neutral-400 block mb-1">예상 금액 (만원, 선택사항)</label>
                                        <input
                                            type="number" value={jobEstAmount} onChange={(e) => setJobEstAmount(e.target.value)}
                                            className="w-full border border-neutral-200 px-3 py-2 text-xs focus:outline-none focus:border-neutral-400"
                                            placeholder="없으면 비워두세요"
                                        />
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex justify-end gap-2 mt-5">
                                    <button
                                        onClick={() => setShowJobModal(false)}
                                        className="px-4 py-2 text-xs text-neutral-500 border border-neutral-200 hover:bg-neutral-50 transition-colors"
                                    >
                                        취소
                                    </button>
                                    <button
                                        onClick={handleCreateJob}
                                        className="px-4 py-2 text-xs bg-neutral-900 text-white hover:bg-neutral-800 transition-colors"
                                    >
                                        등록
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ══════════════════════════════════════
               Tab 3: 손익 (isStaff only)
               ══════════════════════════════════════ */}
            {activeTab === "손익" && (
                <div>
                    {!isStaff ? (
                        <div className="border border-neutral-200 bg-white p-12 text-center">
                            <TrendingUp className="h-6 w-6 mx-auto mb-2 text-neutral-300" />
                            <p className="text-xs text-neutral-400">손익 정보는 Staff 이상만 열람할 수 있습니다.</p>
                        </div>
                    ) : (
                        <div className="space-y-5">
                            {/* 프로젝트 레벨 예상 손익 */}
                            <div className="border border-neutral-200 bg-white p-4">
                                <h3 className="text-xs font-medium text-neutral-400 uppercase tracking-wider mb-3">프로젝트 레벨 예상 손익</h3>
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <p className="text-xs text-neutral-400 mb-1">예상 취급액 (Billing)</p>
                                        <p className="text-sm font-bold">{fmt(project.estBilling)}</p>
                                        <p className="text-xs text-neutral-400">{fmtKRW(project.estBilling)}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-neutral-400 mb-1">예상 외부비 (Ex-Cost)</p>
                                        <p className="text-sm font-bold">{fmt(project.estExCost)}</p>
                                        <p className="text-xs text-neutral-400">{fmtKRW(project.estExCost)}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-neutral-400 mb-1">예상 매출총이익 (Revenue)</p>
                                        <p className="text-sm font-bold text-emerald-600">{fmt(project.estGrossProfit)}</p>
                                        <p className="text-xs text-neutral-400">{fmtKRW(project.estGrossProfit)}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Job 레벨 예상 합산 */}
                            <div className="border border-neutral-200 bg-white p-4">
                                <h3 className="text-xs font-medium text-neutral-400 uppercase tracking-wider mb-3">Job 레벨 예상 합산</h3>
                                <div className="space-y-2">
                                    {project.jobs.map((j) => (
                                        <div key={j.code} className="flex items-center justify-between text-xs">
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono text-xs text-neutral-400">{j.code}</span>
                                                <span className="text-neutral-600">{j.name}</span>
                                            </div>
                                            <span className="font-medium">{j.estimatedAmount ? fmt(j.estimatedAmount) : "-"}</span>
                                        </div>
                                    ))}
                                    <div className="flex items-center justify-between text-xs border-t border-neutral-100 pt-2 mt-2">
                                        <span className="font-medium text-neutral-600">Job 예상 합계</span>
                                        <span className="font-bold">{fmt(jobSum)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* 차이값 */}
                            <div className="border border-neutral-200 bg-white p-4">
                                <h3 className="text-xs font-medium text-neutral-400 uppercase tracking-wider mb-3">프로젝트 예상 vs Job 합산</h3>
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-neutral-500">프로젝트 예상 취급액 - Job 합산</span>
                                    <span className={clsx("text-sm font-bold", jobDiff >= 0 ? "text-emerald-600" : "text-red-500")}>
                                        {jobDiff >= 0 ? "+" : ""}{fmt(jobDiff)}
                                    </span>
                                </div>
                            </div>

                            {/* 실제 손익 */}
                            <div className="border border-neutral-200 bg-white p-4">
                                <h3 className="text-xs font-medium text-neutral-400 uppercase tracking-wider mb-3">실제 손익 (확정)</h3>
                                {project.actualBilling ? (
                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <p className="text-xs text-neutral-400 mb-1">실제 취급액</p>
                                            <p className="text-sm font-bold">{fmt(project.actualBilling)}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-neutral-400 mb-1">실제 매출총이익</p>
                                            <p className="text-sm font-bold text-emerald-600">{fmt(project.actualGrossProfit || 0)}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-neutral-400 mb-1">예상 정확도</p>
                                            <p className="text-sm font-bold text-blue-600">{accuracy}%</p>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-xs text-neutral-400">아직 확정된 금액이 없습니다.</p>
                                )}
                            </div>

                            {/* Note */}
                            <p className="text-xs text-neutral-400 text-center">
                                최종 확정 금액은 ERP 프로젝트 손익에서 관리됩니다
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* ══════════════════════════════════════
               Tab 4: 인력
               ══════════════════════════════════════ */}
            {activeTab === "인력" && (
                <div>
                    <div className="flex items-center gap-4 mb-4">
                        <p className="text-xs text-neutral-500">
                            투입 인력 <span className="font-bold text-neutral-900">{project.staff.length}명</span>
                        </p>
                        <p className="text-xs text-neutral-500">
                            예상 총 시수 <span className="font-bold text-neutral-900">{project.staff.reduce((s, m) => s + m.estimatedHours, 0)}h</span>
                        </p>
                        <p className="text-xs text-neutral-500">
                            실제 총 시수 <span className="font-bold text-neutral-900">{project.staff.reduce((s, m) => s + m.actualHours, 0)}h</span>
                        </p>
                    </div>

                    <div className="border border-neutral-200 bg-white">
                        <table className="w-full text-xs">
                            <thead>
                                <tr className="border-b border-neutral-100 text-xs text-neutral-400">
                                    <th className="text-left p-3 font-medium">이름</th>
                                    <th className="text-left p-3 font-medium">역할</th>
                                    <th className="text-center p-3 font-medium">예상 시수</th>
                                    <th className="text-center p-3 font-medium">실제 시수</th>
                                    <th className="text-left p-3 font-medium">기간</th>
                                </tr>
                            </thead>
                            <tbody>
                                {project.staff.map((m, i) => (
                                    <tr key={i} className="border-b border-neutral-50 hover:bg-neutral-50 transition-colors">
                                        <td className="p-3">
                                            <div className="flex items-center gap-1.5">
                                                <User className="h-3.5 w-3.5 text-neutral-400" />
                                                <span className="font-medium text-neutral-800">{m.name}</span>
                                            </div>
                                        </td>
                                        <td className="p-3 text-neutral-500">{m.role}</td>
                                        <td className="p-3 text-center font-medium">{m.estimatedHours}h</td>
                                        <td className="p-3 text-center">
                                            <span className={clsx(m.actualHours > m.estimatedHours ? "text-red-500 font-bold" : "text-neutral-600")}>
                                                {m.actualHours}h
                                            </span>
                                        </td>
                                        <td className="p-3 text-neutral-400">{m.period}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ─── 파일 탭 ─── */}
            {activeTab === "파일" && (() => {
                const files = projectFiles[project.code] || [];
                const [fileFilter, setFileFilter] = [activeTab, () => {}]; // placeholder — real filter below
                return <FileTabPanel files={files} />;
            })()}
        </div>
    );
}

/* ── 파일 탭 패널 (별도 컴포넌트) ── */
function FileTabPanel({ files: initialFiles }: { files: ProjectFile[] }) {
    const [filter, setFilter] = useState<"전체" | PFileType>("전체");
    const [showUpload, setShowUpload] = useState(false);

    const filtered = filter === "전체" ? initialFiles : initialFiles.filter(f => f.type === filter);

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <p className="text-xs text-neutral-500">
                        파일 <span className="font-bold text-neutral-900">{initialFiles.length}개</span>
                    </p>
                    <div className="flex gap-1 ml-3">
                        {fileTypeOptions.map(t => (
                            <button key={t} onClick={() => setFilter(t)}
                                className={clsx("px-2 py-1 text-xs rounded transition-colors",
                                    filter === t ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200")}>
                                {t}
                            </button>
                        ))}
                    </div>
                </div>
                <button onClick={() => setShowUpload(true)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-neutral-900 text-white rounded hover:bg-neutral-800">
                    <Plus className="h-3 w-3" /> 파일 업로드
                </button>
            </div>

            {filtered.length === 0 ? (
                <div className="border border-neutral-200 bg-white p-8 text-center text-xs text-neutral-400">등록된 파일이 없습니다.</div>
            ) : (
                <div className="border border-neutral-200 bg-white overflow-hidden">
                    <table className="w-full text-xs">
                        <thead>
                            <tr className="border-b border-neutral-100 text-neutral-400">
                                <th className="text-left p-3 font-medium">파일명</th>
                                <th className="text-left p-3 font-medium">유형</th>
                                <th className="text-center p-3 font-medium">형식</th>
                                <th className="text-center p-3 font-medium">크기</th>
                                <th className="text-left p-3 font-medium">업로드자</th>
                                <th className="text-left p-3 font-medium">날짜</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(f => (
                                <tr key={f.id} className="border-b border-neutral-50 hover:bg-neutral-50 transition-colors">
                                    <td className="p-3 font-medium text-neutral-800">{f.name}</td>
                                    <td className="p-3"><span className="px-1.5 py-0.5 bg-neutral-100 text-neutral-500 rounded">{f.type}</span></td>
                                    <td className="p-3 text-center"><span className={`px-1.5 py-0.5 rounded text-xs ${fileFormatColor[f.format] || 'bg-neutral-100 text-neutral-500'}`}>{f.format}</span></td>
                                    <td className="p-3 text-center text-neutral-400">{f.fileSize}</td>
                                    <td className="p-3 text-neutral-500">{f.uploadedBy}</td>
                                    <td className="p-3 text-neutral-400">{f.uploadedAt}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* 업로드 모달 */}
            {showUpload && (
                <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
                    <div className="bg-white border border-neutral-200 rounded w-full max-w-md p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-sm font-bold">파일 업로드</h2>
                            <button onClick={() => setShowUpload(false)}><X className="h-4 w-4 text-neutral-400" /></button>
                        </div>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-xs text-neutral-500 mb-1">파일 유형 *</label>
                                <select className="w-full px-3 py-2 text-sm border border-neutral-200 rounded focus:outline-none focus:border-neutral-400">
                                    <option>RFP</option><option>제안서</option><option>보고서</option><option>계약서</option><option>기타</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs text-neutral-500 mb-1">파일 선택 *</label>
                                <div className="border-2 border-dashed border-neutral-200 rounded p-6 text-center cursor-pointer hover:bg-neutral-50 transition-colors">
                                    <p className="text-xs text-neutral-400">클릭하여 파일을 선택하거나 드래그하세요</p>
                                    <p className="text-[10px] text-neutral-300 mt-1">PDF, DOCX, PPTX, XLSX (최대 50MB)</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 mt-5">
                            <button onClick={() => setShowUpload(false)} className="px-4 py-2 text-sm text-neutral-500 hover:text-neutral-700">취소</button>
                            <button onClick={() => { setShowUpload(false); alert('파일이 업로드되었습니다. (Mock)'); }} className="px-4 py-2 text-sm bg-neutral-900 text-white rounded hover:bg-neutral-800">업로드</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
