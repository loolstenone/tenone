"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
    ArrowLeft, ChevronDown, ChevronRight, Plus, Trash2, Save, Send,
    Info, Search, X, DollarSign, Users, FileText, CheckCircle
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { categoryLabels, subTypeByCategory, type ProjectCategory, type ProjectSubType } from "@/types/project";

// ─── Staff mock (50명) ───
const staffList = [
    { id: "s1", name: "Cheonil Jeon", dept: "경영기획", position: "대표" },
    { id: "s2", name: "Sarah Kim", dept: "사업총괄", position: "이사" },
    { id: "s3", name: "김인사", dept: "인사총괄", position: "이사" },
    { id: "s4", name: "이재무", dept: "재무총괄", position: "이사" },
    { id: "s5", name: "박기획", dept: "경영기획", position: "팀장" },
    { id: "s6", name: "정전략", dept: "경영기획", position: "매니저" },
    { id: "s7", name: "한비서", dept: "경영기획", position: "사원" },
    { id: "s8", name: "박채용", dept: "인사", position: "팀장" },
    { id: "s9", name: "최교육", dept: "인사", position: "매니저" },
    { id: "s10", name: "윤인재", dept: "인사", position: "선임" },
    { id: "s11", name: "임노무", dept: "인사", position: "주임" },
    { id: "s12", name: "강회계", dept: "회계/재무", position: "팀장" },
    { id: "s13", name: "송세무", dept: "회계/재무", position: "매니저" },
    { id: "s14", name: "오경리", dept: "회계/재무", position: "사원" },
    { id: "s15", name: "조브랜", dept: "브랜드관리", position: "팀장" },
    { id: "s16", name: "나세계", dept: "브랜드관리", position: "매니저" },
    { id: "s17", name: "문스토", dept: "브랜드관리", position: "선임" },
    { id: "s18", name: "배비주", dept: "브랜드관리", position: "주임" },
    { id: "s19", name: "유파트", dept: "파트너십", position: "팀장" },
    { id: "s20", name: "김준호", dept: "파트너십", position: "매니저" },
    { id: "s21", name: "권제휴", dept: "파트너십", position: "사원" },
    { id: "s22", name: "한마케", dept: "영업", position: "팀장" },
    { id: "s23", name: "유광고", dept: "영업", position: "매니저" },
    { id: "s24", name: "서영업", dept: "영업", position: "선임" },
    { id: "s25", name: "장클라", dept: "영업", position: "주임" },
    { id: "s26", name: "안세일", dept: "영업", position: "사원" },
    { id: "s27", name: "김콘텐", dept: "콘텐츠제작", position: "팀장" },
    { id: "s28", name: "이영상", dept: "콘텐츠제작", position: "매니저" },
    { id: "s29", name: "진작가", dept: "콘텐츠제작", position: "선임" },
    { id: "s30", name: "백편집", dept: "콘텐츠제작", position: "선임" },
    { id: "s31", name: "양촬영", dept: "콘텐츠제작", position: "주임" },
    { id: "s32", name: "하카피", dept: "콘텐츠제작", position: "사원" },
    { id: "s33", name: "최디자", dept: "디자인", position: "팀장" },
    { id: "s34", name: "민그래", dept: "디자인", position: "매니저" },
    { id: "s35", name: "류웹디", dept: "디자인", position: "선임" },
    { id: "s36", name: "남일러", dept: "디자인", position: "주임" },
    { id: "s37", name: "구모션", dept: "디자인", position: "사원" },
    { id: "s38", name: "신테크", dept: "기술개발", position: "팀장" },
    { id: "s39", name: "엄프론", dept: "기술개발", position: "매니저" },
    { id: "s40", name: "노백엔", dept: "기술개발", position: "선임" },
    { id: "s41", name: "허인프", dept: "기술개발", position: "주임" },
    { id: "s42", name: "곽데이", dept: "기술개발", position: "사원" },
    { id: "s43", name: "변매니", dept: "교육사업", position: "팀장" },
    { id: "s44", name: "추커리", dept: "교육사업", position: "매니저" },
    { id: "s45", name: "석멘토", dept: "교육사업", position: "선임" },
    { id: "s46", name: "천운영", dept: "교육사업", position: "주임" },
    { id: "s47", name: "탁기획", dept: "교육사업", position: "사원" },
    { id: "s48", name: "방네트", dept: "네트워크사업", position: "팀장" },
    { id: "s49", name: "피플랫", dept: "네트워크사업", position: "매니저" },
    { id: "s50", name: "감커뮤", dept: "네트워크사업", position: "사원" },
];

// 승인자 목록 (사업부장급)
const approverList = [
    { id: "s2", name: "Sarah Kim", dept: "사업총괄", position: "이사" },
    { id: "s1", name: "Cheonil Jeon", dept: "경영기획", position: "대표" },
];

type MemberRole = "기획" | "디자인" | "개발" | "마케팅" | "콘텐츠" | "기타";

interface TeamMember {
    staffId: string;
    name: string;
    dept: string;
    role: MemberRole;
    startDate: string;
    endDate: string;
}

// ─── Helpers ───
const inputClass = "w-full border border-neutral-200 bg-white px-3 py-2 text-sm placeholder-neutral-300 focus:border-neutral-900 focus:outline-none";
const selectClass = "w-full border border-neutral-200 bg-white px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none appearance-none";

function formatKRW(val: string) {
    const num = val.replace(/[^0-9]/g, "");
    if (!num) return "";
    return Number(num).toLocaleString("ko-KR");
}

function generateCode() {
    const year = new Date().getFullYear();
    const seq = String(Math.floor(Math.random() * 9000) + 1000);
    return `PRJ-${year}-${seq}`;
}

// ─── Collapsible Section ───
function Section({ title, icon: Icon, defaultOpen = false, children }: {
    title: string; icon: React.ElementType; defaultOpen?: boolean; children: React.ReactNode;
}) {
    const [open, setOpen] = useState(defaultOpen);
    return (
        <div className="border border-neutral-200 bg-white mb-3">
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className="w-full flex items-center gap-2 px-4 py-3 text-sm font-semibold text-neutral-800 hover:bg-neutral-50 transition-colors"
            >
                {open ? <ChevronDown className="h-3.5 w-3.5 text-neutral-400" /> : <ChevronRight className="h-3.5 w-3.5 text-neutral-400" />}
                <Icon className="h-3.5 w-3.5 text-neutral-500" />
                {title}
            </button>
            {open && <div className="px-4 pb-4 border-t border-neutral-100">{children}</div>}
        </div>
    );
}

// ═══════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════
export default function ProjectNewPage() {
    const { user } = useAuth();

    // ── Section 1: 기본 정보 ──
    const [projectName, setProjectName] = useState("");
    const [projectCode] = useState(generateCode());
    const [category, setCategory] = useState<ProjectCategory | "">("");
    const [subType, setSubType] = useState<ProjectSubType | "">("");
    const [projectStatus] = useState("기획");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [description, setDescription] = useState("");

    // ── Section 2: PM 및 인원 ──
    const [members, setMembers] = useState<TeamMember[]>([]);
    const [showMemberAdd, setShowMemberAdd] = useState(false);
    const [memberSearch, setMemberSearch] = useState("");
    const memberRef = useRef<HTMLDivElement>(null);

    // 인원 추가용
    const [selectedStaffId, setSelectedStaffId] = useState("");
    const [selectedRole, setSelectedRole] = useState<MemberRole>("기획");
    const [memberStartDate, setMemberStartDate] = useState("");
    const [memberEndDate, setMemberEndDate] = useState("");

    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (memberRef.current && !memberRef.current.contains(e.target as Node)) setShowMemberAdd(false);
        }
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    const memberRoles: MemberRole[] = ["기획", "디자인", "개발", "마케팅", "콘텐츠", "기타"];

    const addMember = () => {
        if (!selectedStaffId) return;
        if (members.find(m => m.staffId === selectedStaffId)) return;
        const staff = staffList.find(s => s.id === selectedStaffId);
        if (!staff) return;
        setMembers([...members, {
            staffId: staff.id, name: staff.name, dept: staff.dept,
            role: selectedRole, startDate: memberStartDate, endDate: memberEndDate,
        }]);
        setSelectedStaffId("");
        setSelectedRole("기획");
        setMemberStartDate("");
        setMemberEndDate("");
        setShowMemberAdd(false);
        setMemberSearch("");
    };

    const removeMember = (staffId: string) => {
        setMembers(members.filter(m => m.staffId !== staffId));
    };

    // ── Section 3: 예산 ──
    const [estBilling, setEstBilling] = useState("");
    const [estExCost, setEstExCost] = useState("");
    const [estInCost, setEstInCost] = useState("");

    const revenue = (Number(estBilling) || 0) - (Number(estExCost) || 0);
    const profit = revenue - (Number(estInCost) || 0);

    // ── 등록 요청 모달 ──
    const [showApprovalModal, setShowApprovalModal] = useState(false);
    const [approverId, setApproverId] = useState("");
    const [approvalMemo, setApprovalMemo] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [saved, setSaved] = useState(false);

    const handleSaveDraft = () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const handleSubmit = () => {
        if (!projectName.trim()) { alert("프로젝트명은 필수입니다."); return; }
        if (!category) { alert("프로젝트 유형을 선택하세요."); return; }
        if (!startDate || !endDate) { alert("시작일과 종료일을 입력하세요."); return; }
        setShowApprovalModal(true);
    };

    const handleApprovalSubmit = () => {
        if (!approverId) { alert("승인자를 선택하세요."); return; }
        setShowApprovalModal(false);
        setSubmitted(true);
    };

    // 카테고리 변경 시 세부유형 리셋
    const handleCategoryChange = (val: string) => {
        setCategory(val as ProjectCategory);
        setSubType("");
    };

    return (
        <div className="max-w-4xl pb-20">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <Link href="/intra/project/management" className="text-neutral-400 hover:text-neutral-700 transition-colors">
                    <ArrowLeft className="h-4 w-4" />
                </Link>
                <div>
                    <h1 className="text-lg font-bold text-neutral-900">프로젝트 등록</h1>
                    <p className="text-xs text-neutral-400">새 프로젝트를 등록합니다. * 표시는 필수 입력 항목</p>
                </div>
            </div>

            {/* 등록 완료 배너 */}
            {submitted && (
                <div className="mb-4 bg-amber-50 border border-amber-200 px-4 py-3 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-amber-500" />
                    <div>
                        <p className="text-sm font-medium text-amber-700">등록 요청 완료</p>
                        <p className="text-xs text-amber-600">승인자({approverList.find(a => a.id === approverId)?.name})에게 결재 요청이 전송되었습니다.</p>
                    </div>
                </div>
            )}

            {/* ═══ Section 1: 기본 정보 ═══ */}
            <Section title="기본 정보" icon={FileText} defaultOpen={true}>
                <div className="grid grid-cols-2 gap-4 mt-3">
                    <div>
                        <label className="block text-xs text-neutral-500 mb-1">프로젝트명 *</label>
                        <input type="text" className={inputClass} value={projectName} onChange={e => setProjectName(e.target.value)} placeholder="프로젝트명을 입력하세요" disabled={submitted} />
                    </div>
                    <div>
                        <label className="block text-xs text-neutral-500 mb-1">프로젝트 코드</label>
                        <input type="text" className={`${inputClass} bg-neutral-50 text-neutral-500`} value={projectCode} readOnly />
                        <p className="text-xs text-neutral-400 mt-0.5">자동 생성</p>
                    </div>
                    <div>
                        <label className="block text-xs text-neutral-500 mb-1">프로젝트 유형 *</label>
                        <select className={selectClass} value={category} onChange={e => handleCategoryChange(e.target.value)} disabled={submitted}>
                            <option value="">유형 선택</option>
                            {Object.entries(categoryLabels).map(([k, v]) => (
                                <option key={k} value={k}>{v}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs text-neutral-500 mb-1">세부 유형</label>
                        <select className={selectClass} value={subType} onChange={e => setSubType(e.target.value as ProjectSubType)} disabled={!category || submitted}>
                            <option value="">세부 유형 선택</option>
                            {category && subTypeByCategory[category as ProjectCategory]?.map(st => (
                                <option key={st} value={st}>{st}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs text-neutral-500 mb-1">프로젝트 상태</label>
                        <input type="text" className={`${inputClass} bg-neutral-50 text-neutral-500`} value={projectStatus} readOnly />
                        <p className="text-xs text-neutral-400 mt-0.5">등록 시 기본 상태</p>
                    </div>
                    <div></div>
                    <div>
                        <label className="block text-xs text-neutral-500 mb-1">시작일 *</label>
                        <input type="date" className={inputClass} value={startDate} onChange={e => setStartDate(e.target.value)} disabled={submitted} />
                    </div>
                    <div>
                        <label className="block text-xs text-neutral-500 mb-1">종료일 *</label>
                        <input type="date" className={inputClass} value={endDate} onChange={e => setEndDate(e.target.value)} disabled={submitted} />
                    </div>
                </div>
                <div className="mt-4">
                    <label className="block text-xs text-neutral-500 mb-1">프로젝트 설명</label>
                    <textarea className={`${inputClass} h-20 resize-none`} value={description} onChange={e => setDescription(e.target.value)} placeholder="프로젝트 개요를 작성하세요" disabled={submitted} />
                </div>
            </Section>

            {/* ═══ Section 2: PM 및 투입 인원 ═══ */}
            <Section title="PM 및 투입 인원" icon={Users} defaultOpen={true}>
                <div className="mt-3 space-y-4">
                    {/* PM (자동: 로그인 사용자) */}
                    <div>
                        <label className="block text-xs text-neutral-500 mb-1">PM (작성자)</label>
                        <input
                            type="text"
                            className={`${inputClass} bg-neutral-50 text-neutral-500`}
                            value={user ? `${user.name} (${user.email})` : ""}
                            readOnly
                        />
                        <div className="flex items-center gap-1.5 mt-1">
                            <Info className="h-3 w-3 text-neutral-400 shrink-0" />
                            <p className="text-xs text-neutral-400">PM은 프로젝트 작성자로 자동 지정됩니다</p>
                        </div>
                    </div>

                    {/* 투입 인원 */}
                    <div ref={memberRef}>
                        <div className="flex items-center justify-between mb-2">
                            <label className="block text-xs text-neutral-500">투입 인원</label>
                            {!submitted && (
                                <button type="button" onClick={() => setShowMemberAdd(true)}
                                    className="flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-800">
                                    <Plus className="h-3 w-3" /> 인원 추가
                                </button>
                            )}
                        </div>

                        {/* 인원 추가 패널 */}
                        {showMemberAdd && (
                            <div className="border border-neutral-200 bg-neutral-50 p-3 mb-3 space-y-3">
                                <p className="text-xs font-medium text-neutral-700">인원 추가</p>
                                {/* 직원 검색 */}
                                <div>
                                    <label className="block text-xs text-neutral-500 mb-1">직원 선택 *</label>
                                    <div className="relative">
                                        <div className="flex items-center gap-1.5 border border-neutral-200 bg-white px-2 py-1.5">
                                            <Search className="h-3 w-3 text-neutral-400" />
                                            <input
                                                type="text" value={memberSearch} onChange={e => setMemberSearch(e.target.value)}
                                                placeholder="이름 또는 부서 검색" className="flex-1 text-xs outline-none bg-transparent placeholder-neutral-300" autoFocus
                                            />
                                        </div>
                                        {memberSearch && (
                                            <div className="absolute z-20 mt-1 w-full bg-white border border-neutral-200 shadow-lg max-h-40 overflow-y-auto">
                                                {staffList
                                                    .filter(s => !members.find(m => m.staffId === s.id))
                                                    .filter(s => s.name.toLowerCase().includes(memberSearch.toLowerCase()) || s.dept.toLowerCase().includes(memberSearch.toLowerCase()))
                                                    .map(s => (
                                                        <button key={s.id} type="button"
                                                            onClick={() => { setSelectedStaffId(s.id); setMemberSearch(s.name); }}
                                                            className={`w-full text-left px-3 py-2 text-xs hover:bg-neutral-50 flex justify-between ${selectedStaffId === s.id ? "bg-neutral-100 font-medium" : ""}`}>
                                                            <span>{s.name}</span>
                                                            <span className="text-neutral-400">{s.dept} · {s.position}</span>
                                                        </button>
                                                    ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                    <div>
                                        <label className="block text-xs text-neutral-500 mb-1">역할</label>
                                        <select className={selectClass} value={selectedRole} onChange={e => setSelectedRole(e.target.value as MemberRole)}>
                                            {memberRoles.map(r => <option key={r} value={r}>{r}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs text-neutral-500 mb-1">투입 시작일</label>
                                        <input type="date" className={inputClass} value={memberStartDate} onChange={e => setMemberStartDate(e.target.value)} />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-neutral-500 mb-1">투입 종료일</label>
                                        <input type="date" className={inputClass} value={memberEndDate} onChange={e => setMemberEndDate(e.target.value)} />
                                    </div>
                                </div>
                                <div className="flex justify-end gap-2">
                                    <button type="button" onClick={() => { setShowMemberAdd(false); setMemberSearch(""); setSelectedStaffId(""); }}
                                        className="px-3 py-1.5 text-xs text-neutral-500 hover:text-neutral-700">취소</button>
                                    <button type="button" onClick={addMember}
                                        className="px-3 py-1.5 text-xs bg-neutral-900 text-white hover:bg-neutral-800">추가</button>
                                </div>
                            </div>
                        )}

                        {/* 투입 인원 테이블 */}
                        {members.length > 0 ? (
                            <div className="border border-neutral-200">
                                <div className="grid grid-cols-[1fr_80px_70px_130px_32px] gap-0 bg-neutral-50 text-xs text-neutral-500 font-medium">
                                    <span className="px-3 py-2 border-r border-neutral-200">이름 / 부서</span>
                                    <span className="px-3 py-2 border-r border-neutral-200">역할</span>
                                    <span className="px-3 py-2 border-r border-neutral-200 hidden sm:block">투입 기간</span>
                                    <span className="px-3 py-2 border-r border-neutral-200 sm:hidden">기간</span>
                                    <span className="px-3 py-2"></span>
                                </div>
                                {members.map(m => (
                                    <div key={m.staffId} className="grid grid-cols-[1fr_80px_70px_130px_32px] gap-0 border-t border-neutral-100 text-xs">
                                        <span className="px-3 py-2 border-r border-neutral-100">
                                            <span className="font-medium text-neutral-800">{m.name}</span>
                                            <span className="text-neutral-400 ml-1">{m.dept}</span>
                                        </span>
                                        <span className="px-3 py-2 border-r border-neutral-100 text-neutral-600">{m.role}</span>
                                        <span className="px-3 py-2 border-r border-neutral-100 text-neutral-400 truncate col-span-1">
                                            {m.startDate && m.endDate ? `${m.startDate} ~ ${m.endDate}` : "-"}
                                        </span>
                                        {!submitted && (
                                            <button type="button" onClick={() => removeMember(m.staffId)}
                                                className="flex items-center justify-center text-neutral-300 hover:text-red-400">
                                                <X className="h-3 w-3" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="border border-dashed border-neutral-200 p-6 text-center">
                                <Users className="h-5 w-5 text-neutral-300 mx-auto mb-1" />
                                <p className="text-xs text-neutral-400">투입 인원을 추가하세요</p>
                            </div>
                        )}
                    </div>
                </div>
            </Section>

            {/* ═══ Section 3: 예산 (손익 구조) ═══ */}
            <Section title="예상 손익" icon={DollarSign}>
                <div className="mt-3 space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs text-neutral-500 mb-1">예상 취급액 (Billing)</label>
                            <input type="text" className={inputClass} value={formatKRW(estBilling)}
                                onChange={e => setEstBilling(e.target.value.replace(/[^0-9]/g, ""))} placeholder="0" disabled={submitted} />
                        </div>
                        <div>
                            <label className="block text-xs text-neutral-500 mb-1">예상 외부비 (Ex-Cost)</label>
                            <input type="text" className={inputClass} value={formatKRW(estExCost)}
                                onChange={e => setEstExCost(e.target.value.replace(/[^0-9]/g, ""))} placeholder="0" disabled={submitted} />
                        </div>
                        <div>
                            <label className="block text-xs text-neutral-500 mb-1">예상 내부비 (In-Cost)</label>
                            <input type="text" className={inputClass} value={formatKRW(estInCost)}
                                onChange={e => setEstInCost(e.target.value.replace(/[^0-9]/g, ""))} placeholder="0" disabled={submitted} />
                        </div>
                    </div>

                    {/* 손익 요약 */}
                    {(estBilling || estExCost || estInCost) && (
                        <div className="bg-neutral-50 border border-neutral-200 p-4">
                            <p className="text-xs font-medium text-neutral-700 mb-3">예상 손익 구조</p>
                            <div className="flex items-center gap-2 text-xs flex-wrap">
                                <div className="text-center">
                                    <p className="text-neutral-400">취급액</p>
                                    <p className="font-semibold text-neutral-800">{formatKRW(estBilling) || "0"}원</p>
                                </div>
                                <span className="text-neutral-300">−</span>
                                <div className="text-center">
                                    <p className="text-neutral-400">외부비</p>
                                    <p className="font-semibold text-neutral-800">{formatKRW(estExCost) || "0"}원</p>
                                </div>
                                <span className="text-neutral-300">=</span>
                                <div className="text-center">
                                    <p className="text-neutral-400">매출</p>
                                    <p className={`font-semibold ${revenue >= 0 ? "text-blue-600" : "text-red-500"}`}>{revenue.toLocaleString("ko-KR")}원</p>
                                </div>
                                <span className="text-neutral-300">−</span>
                                <div className="text-center">
                                    <p className="text-neutral-400">내부비</p>
                                    <p className="font-semibold text-neutral-800">{formatKRW(estInCost) || "0"}원</p>
                                </div>
                                <span className="text-neutral-300">=</span>
                                <div className="text-center">
                                    <p className="text-neutral-400">이익</p>
                                    <p className={`font-bold ${profit >= 0 ? "text-green-600" : "text-red-500"}`}>{profit.toLocaleString("ko-KR")}원</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </Section>

            {/* ═══ Bottom Buttons ═══ */}
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-neutral-200">
                <p className="text-xs text-neutral-400">승인자에게 결재 요청 후 프로젝트가 활성화됩니다</p>
                <div className="flex items-center gap-2">
                    {saved && (
                        <span className="text-xs text-green-600 flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" /> 임시저장 완료
                        </span>
                    )}
                    <button type="button" onClick={handleSaveDraft} disabled={submitted}
                        className="flex items-center gap-1.5 px-4 py-2 text-sm border border-neutral-200 text-neutral-600 hover:bg-neutral-50 transition-colors disabled:opacity-40">
                        <Save className="h-3.5 w-3.5" />
                        임시저장
                    </button>
                    <button type="button" onClick={handleSubmit} disabled={submitted}
                        className="flex items-center gap-1.5 px-4 py-2 text-sm bg-neutral-900 text-white hover:bg-neutral-800 transition-colors disabled:opacity-40">
                        <Send className="h-3.5 w-3.5" />
                        등록 요청
                    </button>
                </div>
            </div>

            {/* ═══ 결재 요청 모달 ═══ */}
            {showApprovalModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="bg-white w-full max-w-md mx-4 shadow-xl">
                        <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-neutral-900">등록 요청 — 결재</h3>
                            <button onClick={() => setShowApprovalModal(false)} className="text-neutral-400 hover:text-neutral-700">
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                        <div className="px-5 py-4 space-y-4">
                            <div>
                                <p className="text-xs text-neutral-500 mb-1">프로젝트</p>
                                <p className="text-sm font-medium text-neutral-800">{projectName || "(프로젝트명 미입력)"}</p>
                                <p className="text-xs text-neutral-400 mt-0.5">{projectCode}</p>
                            </div>
                            <div>
                                <label className="block text-xs text-neutral-500 mb-1">승인자 선택 *</label>
                                <select className={selectClass} value={approverId} onChange={e => setApproverId(e.target.value)}>
                                    <option value="">승인자 선택</option>
                                    {approverList.map(a => (
                                        <option key={a.id} value={a.id}>{a.name} ({a.dept} · {a.position})</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs text-neutral-500 mb-1">메모 (선택)</label>
                                <textarea className={`${inputClass} h-16 resize-none`} value={approvalMemo}
                                    onChange={e => setApprovalMemo(e.target.value)} placeholder="승인자에게 전달할 메모" />
                            </div>
                        </div>
                        <div className="px-5 py-3 border-t border-neutral-100 flex justify-end gap-2">
                            <button onClick={() => setShowApprovalModal(false)}
                                className="px-4 py-2 text-sm text-neutral-500 hover:text-neutral-700">취소</button>
                            <button onClick={handleApprovalSubmit}
                                className="px-4 py-2 text-sm bg-neutral-900 text-white hover:bg-neutral-800">결재 요청</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
