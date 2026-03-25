"use client";

import { useState } from "react";
import { Plus, Settings, Trash2, Pencil, ChevronRight, CheckCircle2, X } from "lucide-react";

type DraftType = "기안" | "품의" | "보고";
type ApprovalFactor = "일반" | "프로젝트" | "타임시트" | "경비" | "구매" | "인사" | "계약";

interface ApprovalStep {
    role: string;
}

interface ApprovalTemplate {
    id: string;
    name: string;
    type: DraftType;
    factor: ApprovalFactor;
    steps: ApprovalStep[];
    active: boolean;
}

const mockTemplates: ApprovalTemplate[] = [
    { id: "1", name: "일반 기안", type: "기안", factor: "일반", steps: [{ role: "기안자" }, { role: "팀장" }, { role: "부서장" }], active: true },
    { id: "2", name: "경비 품의", type: "품의", factor: "경비", steps: [{ role: "기안자" }, { role: "팀장" }, { role: "CFO" }], active: true },
    { id: "3", name: "구매 품의 (100만원 이상)", type: "품의", factor: "구매", steps: [{ role: "기안자" }, { role: "팀장" }, { role: "CFO" }, { role: "CEO" }], active: true },
    { id: "4", name: "업무 보고", type: "보고", factor: "일반", steps: [{ role: "기안자" }, { role: "팀장" }], active: true },
    { id: "5", name: "타임시트 마감 승인", type: "보고", factor: "타임시트", steps: [{ role: "기안자" }, { role: "PM" }], active: true },
    { id: "6", name: "프로젝트 기안", type: "기안", factor: "프로젝트", steps: [{ role: "기안자" }, { role: "PM" }, { role: "부서장" }, { role: "CEO" }], active: true },
    { id: "7", name: "채용 기안", type: "기안", factor: "인사", steps: [{ role: "기안자" }, { role: "HR 검토" }, { role: "CEO" }], active: true },
    { id: "8", name: "계약 체결", type: "기안", factor: "계약", steps: [{ role: "기안자" }, { role: "법무검토" }, { role: "CEO" }], active: true },
];

const typeColor: Record<DraftType, string> = {
    "기안": "bg-blue-50 text-blue-600",
    "품의": "bg-amber-50 text-amber-600",
    "보고": "bg-neutral-100 text-neutral-600",
};

const factorColor: Record<ApprovalFactor, string> = {
    "일반": "bg-neutral-100 text-neutral-500",
    "프로젝트": "bg-violet-50 text-violet-600",
    "타임시트": "bg-blue-50 text-blue-600",
    "경비": "bg-amber-50 text-amber-600",
    "구매": "bg-green-50 text-green-600",
    "인사": "bg-pink-50 text-pink-600",
    "계약": "bg-slate-100 text-slate-600",
};

const factorOptions: ApprovalFactor[] = ["일반", "프로젝트", "타임시트", "경비", "구매", "인사", "계약"];
const typeOptions: DraftType[] = ["기안", "품의", "보고"];

export default function ApprovalLinePage() {
    const [templates, setTemplates] = useState<ApprovalTemplate[]>(mockTemplates);
    const [showModal, setShowModal] = useState(false);
    const [newName, setNewName] = useState("");
    const [newType, setNewType] = useState<DraftType>("기안");
    const [newFactor, setNewFactor] = useState<ApprovalFactor>("일반");
    const [newSteps, setNewSteps] = useState("기안자, 팀장, 부서장");

    const handleAdd = () => {
        if (!newName.trim()) return;
        const steps = newSteps.split(",").map(s => ({ role: s.trim() })).filter(s => s.role);
        const newTemplate: ApprovalTemplate = {
            id: String(Date.now()),
            name: newName,
            type: newType,
            factor: newFactor,
            steps,
            active: true,
        };
        setTemplates(prev => [...prev, newTemplate]);
        setShowModal(false);
        setNewName("");
        setNewSteps("기안자, 팀장, 부서장");
    };

    return (
        <div className="max-w-5xl">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-xl font-bold mb-1">결재라인 설정</h1>
                    <p className="text-xs text-neutral-400">기안 유형별 · 요인별 결재 승인 라인 관리</p>
                </div>
                <button onClick={() => setShowModal(true)} className="flex items-center gap-1.5 px-4 py-2 text-sm bg-neutral-900 text-white hover:bg-neutral-800 transition-colors rounded">
                    <Plus className="h-3.5 w-3.5" /> 결재라인 추가
                </button>
            </div>

            {/* 요인별 라우팅 안내 */}
            <div className="border border-neutral-200 bg-neutral-50 p-4 mb-4">
                <p className="text-xs font-medium text-neutral-600 mb-2">요인별 자동 라우팅 가이드</p>
                <div className="flex flex-wrap gap-3 text-xs text-neutral-500">
                    <span>타임시트 → PM 승인</span>
                    <span className="text-neutral-300">|</span>
                    <span>경비 → 팀장 + CFO</span>
                    <span className="text-neutral-300">|</span>
                    <span>프로젝트 → PM + 부서장 + CEO</span>
                    <span className="text-neutral-300">|</span>
                    <span>인사 → HR + CEO</span>
                    <span className="text-neutral-300">|</span>
                    <span>계약 → 법무 + CEO</span>
                </div>
            </div>

            <div className="border border-neutral-200 bg-white overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-neutral-100 text-xs text-neutral-400">
                            <th className="text-left p-3 font-medium">템플릿명</th>
                            <th className="text-left p-3 font-medium">기안 유형</th>
                            <th className="text-left p-3 font-medium">요인</th>
                            <th className="text-left p-3 font-medium">결재라인</th>
                            <th className="text-center p-3 font-medium">상태</th>
                            <th className="text-center p-3 font-medium">관리</th>
                        </tr>
                    </thead>
                    <tbody>
                        {templates.map((t) => (
                            <tr key={t.id} className="border-b border-neutral-50 hover:bg-neutral-50/50 transition-colors">
                                <td className="p-3">
                                    <div className="flex items-center gap-2">
                                        <Settings className="h-3.5 w-3.5 text-neutral-300" />
                                        <span className="text-xs font-medium text-neutral-800">{t.name}</span>
                                    </div>
                                </td>
                                <td className="p-3">
                                    <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded ${typeColor[t.type]}`}>
                                        {t.type}
                                    </span>
                                </td>
                                <td className="p-3">
                                    <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded ${factorColor[t.factor]}`}>
                                        {t.factor}
                                    </span>
                                </td>
                                <td className="p-3">
                                    <div className="flex items-center gap-1 text-xs text-neutral-500">
                                        {t.steps.map((step, i) => (
                                            <span key={i} className="flex items-center gap-1">
                                                <span className="text-neutral-700">{step.role}</span>
                                                {i < t.steps.length - 1 && <ChevronRight className="h-3 w-3 text-neutral-300" />}
                                            </span>
                                        ))}
                                    </div>
                                </td>
                                <td className="p-3 text-center">
                                    {t.active ? (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-green-50 text-green-600 rounded">
                                            <CheckCircle2 className="h-3 w-3" /> 활성
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-neutral-100 text-neutral-400 rounded">비활성</span>
                                    )}
                                </td>
                                <td className="p-3 text-center">
                                    <div className="flex items-center justify-center gap-1">
                                        <button className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded transition-colors" title="수정">
                                            <Pencil className="h-3.5 w-3.5" />
                                        </button>
                                        <button className="p-1.5 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors" title="삭제">
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* 추가 모달 */}
            {showModal && (
                <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
                    <div className="bg-white border border-neutral-200 rounded w-full max-w-md p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-sm font-bold">결재라인 추가</h2>
                            <button onClick={() => setShowModal(false)}><X className="h-4 w-4 text-neutral-400" /></button>
                        </div>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-xs text-neutral-500 mb-1">템플릿명 *</label>
                                <input value={newName} onChange={e => setNewName(e.target.value)} className="w-full px-3 py-2 text-sm border border-neutral-200 rounded focus:outline-none focus:border-neutral-400" placeholder="예: 경비 품의 (50만원 이하)" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs text-neutral-500 mb-1">기안 유형 *</label>
                                    <select value={newType} onChange={e => setNewType(e.target.value as DraftType)} className="w-full px-3 py-2 text-sm border border-neutral-200 rounded focus:outline-none focus:border-neutral-400">
                                        {typeOptions.map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs text-neutral-500 mb-1">요인 *</label>
                                    <select value={newFactor} onChange={e => setNewFactor(e.target.value as ApprovalFactor)} className="w-full px-3 py-2 text-sm border border-neutral-200 rounded focus:outline-none focus:border-neutral-400">
                                        {factorOptions.map(f => <option key={f} value={f}>{f}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs text-neutral-500 mb-1">결재라인 (쉼표 구분) *</label>
                                <input value={newSteps} onChange={e => setNewSteps(e.target.value)} className="w-full px-3 py-2 text-sm border border-neutral-200 rounded focus:outline-none focus:border-neutral-400" placeholder="기안자, 팀장, 부서장" />
                                <p className="text-[10px] text-neutral-300 mt-1">예: 기안자, PM, CFO, CEO</p>
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 mt-5">
                            <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-neutral-500 hover:text-neutral-700">취소</button>
                            <button onClick={handleAdd} className="px-4 py-2 text-sm bg-neutral-900 text-white hover:bg-neutral-800">추가</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
