"use client";

import { useState } from "react";
import { DollarSign, Edit2, Save, Info } from "lucide-react";
import clsx from "clsx";

interface StandardRate {
    position: string;
    hourlyRate: number; // 시간당 단가 (원)
}

interface ActualRate {
    id: string;
    name: string;
    position: string;
    department: string;
    monthlySalary: number; // 월 급여 (원)
    workHoursPerMonth: number; // 월 근무시간
    hourlyRate: number; // 시간당 실제 단가 (자동 계산)
}

const initialStandardRates: StandardRate[] = [
    { position: '대표', hourlyRate: 200000 },
    { position: '이사', hourlyRate: 150000 },
    { position: '팀장', hourlyRate: 120000 },
    { position: '매니저', hourlyRate: 100000 },
    { position: '선임', hourlyRate: 80000 },
    { position: '주임', hourlyRate: 65000 },
    { position: '사원', hourlyRate: 50000 },
    { position: '인턴', hourlyRate: 30000 },
];

const initialActualRates: ActualRate[] = [
    { id: 'a1', name: 'Cheonil Jeon', position: '대표', department: '경영기획', monthlySalary: 10000000, workHoursPerMonth: 176, hourlyRate: 56818 },
    { id: 'a2', name: 'Sarah Kim', position: '이사', department: '사업총괄', monthlySalary: 7000000, workHoursPerMonth: 176, hourlyRate: 39773 },
    { id: 'a3', name: '김인사', position: '이사', department: '인사총괄', monthlySalary: 7000000, workHoursPerMonth: 176, hourlyRate: 39773 },
    { id: 'a4', name: '이재무', position: '이사', department: '재무총괄', monthlySalary: 7000000, workHoursPerMonth: 176, hourlyRate: 39773 },
    { id: 'a5', name: '박기획', position: '팀장', department: '경영기획', monthlySalary: 5500000, workHoursPerMonth: 176, hourlyRate: 31250 },
    { id: 'a6', name: '김콘텐', position: '팀장', department: '콘텐츠제작', monthlySalary: 5500000, workHoursPerMonth: 176, hourlyRate: 31250 },
    { id: 'a7', name: '한마케', position: '팀장', department: '영업', monthlySalary: 5500000, workHoursPerMonth: 176, hourlyRate: 31250 },
    { id: 'a8', name: '조에이', position: '팀장', department: 'AI크리에이티브', monthlySalary: 6000000, workHoursPerMonth: 176, hourlyRate: 34091 },
    { id: 'a9', name: '이영상', position: '매니저', department: '콘텐츠제작', monthlySalary: 4500000, workHoursPerMonth: 176, hourlyRate: 25568 },
    { id: 'a10', name: '유광고', position: '매니저', department: '영업', monthlySalary: 4200000, workHoursPerMonth: 176, hourlyRate: 23864 },
];

function formatKRW(n: number) { return new Intl.NumberFormat('ko-KR').format(n); }

export default function RatesPage() {
    const [tab, setTab] = useState<'standard' | 'actual'>('standard');
    const [standardRates, setStandardRates] = useState(initialStandardRates);
    const [actualRates] = useState(initialActualRates);
    const [editingIdx, setEditingIdx] = useState<number | null>(null);
    const [editValue, setEditValue] = useState('');

    const saveStandardRate = (idx: number) => {
        const val = Number(editValue);
        if (val > 0) {
            setStandardRates(prev => prev.map((r, i) => i === idx ? { ...r, hourlyRate: val } : r));
        }
        setEditingIdx(null);
    };

    return (
        <div className="max-w-4xl">
            <div className="mb-5">
                <h1 className="text-xl font-bold">투입인원단가 관리</h1>
                <p className="text-xs text-neutral-400 mt-0.5">프로젝트 손익 산출을 위한 인력 단가 관리</p>
            </div>

            {/* 안내 */}
            <div className="bg-neutral-50 border border-neutral-200 p-4 mb-5 flex gap-3">
                <Info className="h-4 w-4 text-neutral-400 shrink-0 mt-0.5" />
                <div className="text-xs text-neutral-500 space-y-1">
                    <p><span className="font-medium text-neutral-700">표준단가</span>: 직급별 시간당 단가. 프로젝트 예상 손익(In-Cost) 산출에 사용됩니다.</p>
                    <p><span className="font-medium text-neutral-700">실제단가</span>: 실제 임금 기반 시간당 단가. 프로젝트 실제 손익 확정 시 사용됩니다.</p>
                    <p>실제단가 = 월 급여 ÷ 월 근무시간 (기본 176h = 22일 × 8h)</p>
                </div>
            </div>

            {/* 탭 */}
            <div className="flex border-b border-neutral-200 mb-5">
                <button onClick={() => setTab('standard')}
                    className={clsx("px-4 py-2.5 text-xs font-medium border-b-2 transition-colors",
                        tab === 'standard' ? "border-neutral-900 text-neutral-900" : "border-transparent text-neutral-400")}>
                    표준단가 (직급별)
                </button>
                <button onClick={() => setTab('actual')}
                    className={clsx("px-4 py-2.5 text-xs font-medium border-b-2 transition-colors",
                        tab === 'actual' ? "border-neutral-900 text-neutral-900" : "border-transparent text-neutral-400")}>
                    실제단가 (개인별)
                </button>
            </div>

            {/* 표준단가 */}
            {tab === 'standard' && (
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-xs text-neutral-500">직급별 시간당 표준 단가 → <span className="font-medium">예상 손익</span>에 적용</p>
                    </div>
                    <div className="border border-neutral-200 bg-white">
                        <div className="grid grid-cols-4 gap-2 px-4 py-2 border-b border-neutral-100 text-[11px] text-neutral-400 uppercase tracking-wider">
                            <span>직급</span>
                            <span>시간당 단가</span>
                            <span>일 단가 (8h)</span>
                            <span></span>
                        </div>
                        {standardRates.map((rate, idx) => (
                            <div key={rate.position} className="grid grid-cols-4 gap-2 px-4 py-2.5 border-b border-neutral-50 last:border-0 items-center hover:bg-neutral-50">
                                <span className="text-xs font-medium">{rate.position}</span>
                                {editingIdx === idx ? (
                                    <div className="flex items-center gap-1">
                                        <input type="number" value={editValue} onChange={e => setEditValue(e.target.value)}
                                            className="w-24 px-2 py-1 text-xs border border-neutral-300 rounded focus:outline-none focus:border-neutral-500" autoFocus
                                            onKeyDown={e => { if (e.key === 'Enter') saveStandardRate(idx); if (e.key === 'Escape') setEditingIdx(null); }} />
                                        <button onClick={() => saveStandardRate(idx)} className="p-1 hover:bg-neutral-200 rounded">
                                            <Save className="h-3 w-3 text-neutral-500" />
                                        </button>
                                    </div>
                                ) : (
                                    <span className="text-xs font-mono">{formatKRW(rate.hourlyRate)}원</span>
                                )}
                                <span className="text-xs text-neutral-400 font-mono">{formatKRW(rate.hourlyRate * 8)}원</span>
                                <div className="flex justify-end">
                                    {editingIdx !== idx && (
                                        <button onClick={() => { setEditingIdx(idx); setEditValue(String(rate.hourlyRate)); }}
                                            className="p-1 hover:bg-neutral-100 rounded">
                                            <Edit2 className="h-3 w-3 text-neutral-400" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* 적용 예시 */}
                    <div className="mt-4 border border-neutral-100 bg-neutral-50 p-4">
                        <p className="text-xs font-medium text-neutral-500 mb-2">적용 예시</p>
                        <div className="text-xs text-neutral-500 space-y-1">
                            <p>• 팀장이 프로젝트에 40시간 투입 시: 40h × {formatKRW(standardRates[2].hourlyRate)}원 = <span className="font-bold text-neutral-700">{formatKRW(standardRates[2].hourlyRate * 40)}원</span> (예상 In-Cost)</p>
                            <p>• 매니저 20시간 + 사원 30시간: (20×{formatKRW(standardRates[3].hourlyRate)}) + (30×{formatKRW(standardRates[6].hourlyRate)}) = <span className="font-bold text-neutral-700">{formatKRW(standardRates[3].hourlyRate * 20 + standardRates[6].hourlyRate * 30)}원</span></p>
                        </div>
                    </div>
                </div>
            )}

            {/* 실제단가 */}
            {tab === 'actual' && (
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-xs text-neutral-500">실제 임금 기반 시간당 단가 → <span className="font-medium">실제 손익</span>에 적용</p>
                    </div>
                    <div className="border border-neutral-200 bg-white">
                        <div className="grid grid-cols-7 gap-2 px-4 py-2 border-b border-neutral-100 text-[11px] text-neutral-400 uppercase tracking-wider">
                            <span>이름</span>
                            <span>직급</span>
                            <span>부서</span>
                            <span>월 급여</span>
                            <span>월 근무시간</span>
                            <span>시간당 실제단가</span>
                            <span>표준단가 대비</span>
                        </div>
                        {actualRates.map(rate => {
                            const standardRate = standardRates.find(s => s.position === rate.position)?.hourlyRate || 0;
                            const diff = rate.hourlyRate - standardRate;
                            const diffPct = standardRate > 0 ? ((diff / standardRate) * 100).toFixed(0) : '0';
                            return (
                                <div key={rate.id} className="grid grid-cols-7 gap-2 px-4 py-2.5 border-b border-neutral-50 last:border-0 items-center hover:bg-neutral-50 text-xs">
                                    <span className="font-medium">{rate.name}</span>
                                    <span className="text-neutral-500">{rate.position}</span>
                                    <span className="text-neutral-400">{rate.department}</span>
                                    <span className="font-mono">{formatKRW(rate.monthlySalary)}</span>
                                    <span className="text-neutral-400">{rate.workHoursPerMonth}h</span>
                                    <span className="font-mono font-medium">{formatKRW(Math.round(rate.hourlyRate))}원</span>
                                    <span className={clsx("font-mono", diff < 0 ? "text-green-600" : diff > 0 ? "text-red-500" : "text-neutral-400")}>
                                        {diff > 0 ? '+' : ''}{diffPct}%
                                        <span className="text-neutral-300 ml-1">({diff > 0 ? '+' : ''}{formatKRW(Math.round(diff))})</span>
                                    </span>
                                </div>
                            );
                        })}
                    </div>

                    {/* 요약 */}
                    <div className="mt-4 grid grid-cols-3 gap-3">
                        <div className="border border-neutral-200 bg-white p-3.5">
                            <p className="text-xs text-neutral-400 mb-1">평균 실제단가</p>
                            <p className="text-lg font-bold">{formatKRW(Math.round(actualRates.reduce((s, r) => s + r.hourlyRate, 0) / actualRates.length))}원/h</p>
                        </div>
                        <div className="border border-neutral-200 bg-white p-3.5">
                            <p className="text-xs text-neutral-400 mb-1">평균 표준단가</p>
                            <p className="text-lg font-bold">{formatKRW(Math.round(standardRates.reduce((s, r) => s + r.hourlyRate, 0) / standardRates.length))}원/h</p>
                        </div>
                        <div className="border border-neutral-200 bg-white p-3.5">
                            <p className="text-xs text-neutral-400 mb-1">표준 대비 실제</p>
                            <p className="text-lg font-bold text-green-600">
                                {Math.round(((actualRates.reduce((s, r) => s + r.hourlyRate, 0) / actualRates.length) / (standardRates.reduce((s, r) => s + r.hourlyRate, 0) / standardRates.length)) * 100)}%
                            </p>
                            <p className="text-[11px] text-neutral-400">실제가 낮을수록 이익률 ↑</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
