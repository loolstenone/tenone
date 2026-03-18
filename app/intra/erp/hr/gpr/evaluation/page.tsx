"use client";

import { useState } from "react";
import { useGpr } from "@/lib/gpr-context";
import { useStaff } from "@/lib/staff-context";
import { ratingLabels } from "@/lib/gpr-data";
import { EvaluationRating } from "@/types/gpr";
import { Star, MessageSquare } from "lucide-react";

const statusColor: Record<string, string> = { 'In Progress': 'bg-blue-500/10 text-blue-400', Agreed: 'bg-blue-500/10 text-blue-400', 'Self Evaluated': 'bg-purple-500/10 text-purple-400', Evaluated: 'bg-emerald-500/10 text-emerald-400' };

export default function EvaluationPage() {
    const { goals, selfEvaluate, supervisorEvaluate } = useGpr();
    const { staff } = useStaff();
    const [evalModal, setEvalModal] = useState<{ goalId: string; type: 'self' | 'supervisor' } | null>(null);
    const [rating, setRating] = useState<EvaluationRating>(3);
    const [comment, setComment] = useState('');

    const evaluableGoals = goals.filter(g => ['In Progress', 'Agreed', 'Self Evaluated'].includes(g.status));
    const evaluatedGoals = goals.filter(g => g.status === 'Evaluated');

    const handleSubmitEval = () => {
        if (!evalModal) return;
        if (evalModal.type === 'self') selfEvaluate(evalModal.goalId, rating, comment);
        else supervisorEvaluate(evalModal.goalId, 's1', rating, comment);
        setEvalModal(null);
        setRating(3);
        setComment('');
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-white">Evaluation</h2>
                <p className="mt-2 text-zinc-400">자기 평가 및 상사 평가</p>
            </div>

            {/* Pending Evaluation */}
            <div>
                <h3 className="text-sm font-semibold text-zinc-300 mb-3">평가 대상</h3>
                <div className="space-y-3">
                    {evaluableGoals.length === 0 && <p className="text-sm text-zinc-600 py-8 text-center">평가 대상 목표가 없습니다.</p>}
                    {evaluableGoals.map(goal => {
                        const member = staff.find(s => s.id === goal.staffId);
                        const canSelfEval = goal.status === 'In Progress' || goal.status === 'Agreed';
                        const canSupervisorEval = goal.status === 'Self Evaluated';
                        return (
                            <div key={goal.id} className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-5">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-mono text-zinc-600">{goal.level}</span>
                                            <h4 className="text-sm font-medium text-white">{goal.title}</h4>
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full ${statusColor[goal.status] ?? 'bg-zinc-800 text-zinc-400'}`}>{goal.status}</span>
                                        </div>
                                        <p className="text-xs text-zinc-500 mt-1">{member?.name} · KPI: {goal.kpi}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {canSelfEval && (
                                            <button onClick={() => setEvalModal({ goalId: goal.id, type: 'self' })} className="px-3 py-1.5 rounded-lg border border-purple-500/30 text-xs text-purple-400 hover:bg-purple-500/10 transition-colors">
                                                자기 평가
                                            </button>
                                        )}
                                        {canSupervisorEval && (
                                            <button onClick={() => setEvalModal({ goalId: goal.id, type: 'supervisor' })} className="px-3 py-1.5 rounded-lg border border-emerald-500/30 text-xs text-emerald-400 hover:bg-emerald-500/10 transition-colors">
                                                상사 평가
                                            </button>
                                        )}
                                    </div>
                                </div>
                                {goal.selfRating && (
                                    <div className="mt-3 pt-3 border-t border-zinc-800 flex items-center gap-4">
                                        <span className="text-xs text-purple-400">자기평가: {goal.selfRating}/5 ({ratingLabels[goal.selfRating]})</span>
                                        {goal.selfComment && <span className="text-xs text-zinc-500">&ldquo;{goal.selfComment}&rdquo;</span>}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Completed Evaluations */}
            {evaluatedGoals.length > 0 && (
                <div>
                    <h3 className="text-sm font-semibold text-zinc-300 mb-3">평가 완료</h3>
                    <div className="space-y-3">
                        {evaluatedGoals.map(goal => {
                            const member = staff.find(s => s.id === goal.staffId);
                            return (
                                <div key={goal.id} className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-5">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-xs font-mono text-zinc-600">{goal.level}</span>
                                        <h4 className="text-sm font-medium text-white">{goal.title}</h4>
                                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400">Evaluated</span>
                                    </div>
                                    <p className="text-xs text-zinc-500">{member?.name}</p>
                                    <div className="grid grid-cols-2 gap-4 mt-3 pt-3 border-t border-zinc-800/50">
                                        <div>
                                            <p className="text-xs text-purple-400 mb-1">자기 평가: {goal.selfRating}/5 ({goal.selfRating ? ratingLabels[goal.selfRating] : '-'})</p>
                                            {goal.selfComment && <p className="text-xs text-zinc-500">&ldquo;{goal.selfComment}&rdquo;</p>}
                                        </div>
                                        <div>
                                            <p className="text-xs text-emerald-400 mb-1">상사 평가: {goal.supervisorRating}/5 ({goal.supervisorRating ? ratingLabels[goal.supervisorRating] : '-'})</p>
                                            {goal.supervisorComment && <p className="text-xs text-zinc-500">&ldquo;{goal.supervisorComment}&rdquo;</p>}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Evaluation Modal */}
            {evalModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setEvalModal(null)} />
                    <div className="relative w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl mx-4">
                        <h3 className="text-lg font-semibold text-white mb-4">
                            {evalModal.type === 'self' ? '자기 평가' : '상사 평가'}
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-zinc-400 mb-2">평점</label>
                                <div className="flex gap-2">
                                    {([1, 2, 3, 4, 5] as EvaluationRating[]).map(r => (
                                        <button key={r} onClick={() => setRating(r)}
                                            className={`flex-1 rounded-lg border px-3 py-3 text-center transition-colors ${
                                                rating === r ? 'border-indigo-500 bg-indigo-500/10' : 'border-zinc-700 hover:border-zinc-600'
                                            }`}>
                                            <Star className={`h-5 w-5 mx-auto mb-1 ${rating >= r ? 'text-amber-400 fill-amber-400' : 'text-zinc-600'}`} />
                                            <p className={`text-[10px] ${rating === r ? 'text-indigo-400' : 'text-zinc-500'}`}>{ratingLabels[r]}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm text-zinc-400 mb-2">코멘트</label>
                                <textarea value={comment} onChange={e => setComment(e.target.value)} rows={3}
                                    placeholder="평가 의견을 작성해주세요"
                                    className="w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none resize-none" />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <button onClick={() => setEvalModal(null)} className="px-4 py-2 text-sm text-zinc-400 hover:text-white">취소</button>
                            <button onClick={handleSubmitEval} className="px-4 py-2 rounded-lg bg-indigo-600 text-sm font-medium text-white hover:bg-indigo-500">
                                평가 제출
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
