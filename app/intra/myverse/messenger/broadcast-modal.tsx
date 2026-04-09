"use client";

import clsx from "clsx";
import { divisions } from "@/lib/staff-data";
import { initialStaff } from "@/lib/staff-data";
import { currentUserId } from "./messenger-data";

interface BroadcastModalProps {
    broadcastTarget: 'all' | 'division' | 'department';
    setBroadcastTarget: (v: 'all' | 'division' | 'department') => void;
    broadcastDivision: string;
    setBroadcastDivision: (v: string) => void;
    broadcastDept: string;
    setBroadcastDept: (v: string) => void;
    broadcastMessage: string;
    setBroadcastMessage: (v: string) => void;
    allDepartments: string[];
    onClose: () => void;
    onSend: () => void;
}

export default function BroadcastModal({
    broadcastTarget,
    setBroadcastTarget,
    broadcastDivision,
    setBroadcastDivision,
    broadcastDept,
    setBroadcastDept,
    broadcastMessage,
    setBroadcastMessage,
    allDepartments,
    onClose,
    onSend,
}: BroadcastModalProps) {
    return (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-white w-[420px] max-w-[95vw]" onClick={e => e.stopPropagation()}>
                <div className="px-5 py-3 border-b border-neutral-100">
                    <h3 className="text-sm font-semibold">일괄 메시지</h3>
                    <p className="text-xs text-neutral-400">대상을 선택하고 메시지를 보내세요</p>
                </div>
                <div className="px-5 py-4 space-y-3">
                    <div>
                        <p className="text-xs font-medium text-neutral-500 mb-1.5">대상</p>
                        <div className="flex gap-1.5">
                            {[
                                { key: 'all' as const, label: `전 직원 (${initialStaff.length - 1}명)` },
                                { key: 'division' as const, label: '부문별' },
                                { key: 'department' as const, label: '부서별' },
                            ].map(t => (
                                <button key={t.key} onClick={() => setBroadcastTarget(t.key)}
                                    className={clsx("px-3 py-1.5 text-xs border transition-colors",
                                        broadcastTarget === t.key ? 'border-neutral-900 bg-neutral-900 text-white' : 'border-neutral-200 hover:border-neutral-400')}>
                                    {t.label}
                                </button>
                            ))}
                        </div>
                    </div>
                    {broadcastTarget === 'division' && (
                        <div>
                            <p className="text-xs font-medium text-neutral-500 mb-1.5">부문 선택</p>
                            <div className="flex gap-1.5 flex-wrap">
                                {divisions.map(d => (
                                    <button key={d.id} onClick={() => setBroadcastDivision(d.id)}
                                        className={clsx("px-3 py-1 text-xs border transition-colors",
                                            broadcastDivision === d.id ? 'border-neutral-900 bg-neutral-900 text-white' : 'border-neutral-200 hover:border-neutral-400')}>
                                        {d.name} ({initialStaff.filter(s => s.division === d.id && s.id !== currentUserId).length}명)
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                    {broadcastTarget === 'department' && (
                        <div>
                            <p className="text-xs font-medium text-neutral-500 mb-1.5">부서 선택</p>
                            <div className="flex gap-1 flex-wrap">
                                {allDepartments.map(dept => {
                                    const count = initialStaff.filter(s => s.department === dept && s.id !== currentUserId).length;
                                    if (count === 0) return null;
                                    return (
                                        <button key={dept} onClick={() => setBroadcastDept(dept)}
                                            className={clsx("px-2.5 py-1 text-[11px] border transition-colors",
                                                broadcastDept === dept ? 'border-neutral-900 bg-neutral-900 text-white' : 'border-neutral-200 hover:border-neutral-400')}>
                                            {dept} ({count})
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                    <div>
                        <p className="text-xs font-medium text-neutral-500 mb-1.5">메시지</p>
                        <textarea value={broadcastMessage} onChange={e => setBroadcastMessage(e.target.value)}
                            placeholder="전달할 메시지를 입력하세요..."
                            rows={4}
                            className="w-full px-3 py-2 text-xs border border-neutral-200 resize-none focus:outline-none focus:border-neutral-400" />
                    </div>
                </div>
                <div className="px-5 py-3 border-t border-neutral-100 flex justify-end gap-2">
                    <button onClick={onClose} className="px-4 py-1.5 text-xs text-neutral-500 hover:bg-neutral-100">취소</button>
                    <button onClick={onSend}
                        disabled={!broadcastMessage.trim()}
                        className="px-4 py-1.5 text-xs bg-neutral-900 text-white disabled:opacity-30 disabled:cursor-not-allowed">
                        전송
                    </button>
                </div>
            </div>
        </div>
    );
}
