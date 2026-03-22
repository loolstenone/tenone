"use client";

import { useState } from "react";
import { useGpr } from "@/lib/gpr-context";
import { useStaff } from "@/lib/staff-context";
import { ratingLabels } from "@/lib/gpr-data";
import { EvaluationRating } from "@/types/gpr";
import { Star, MessageSquare } from "lucide-react";

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
                <h2 className="text-2xl font-bold">Evaluation</h2>
                <p className="mt-2 text-neutral-500">자기 평가 및 상사 평가</p>
            </div>

            {/* Pending Evaluation */}
            <div>
                <h3 className="text-sm font-semibold mb-3">평가 대상</h3>
                <div className="space-y-3">
                    {evaluableGoals.length === 0 && <p className="text-sm text-neutral-300 py-8 text-center">평가 대상 목표가 없습니다.</p>}
                    {evaluableGoals.map(goal => {
                        const member = staff.find(s => s.id === goal.staffId);
                        const canSelfEval = goal.status === 'In Progress' || goal.status === 'Agreed';
                        const canSupervisorEval = goal.status === 'Self Evaluated';
                        return (
                            <div key={goal.id} className="border border-neutral-200 bg-white p-5">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-mono text-neutral-300">{goal.level}</span>
                                            <h4 className="text-sm font-medium">{goal.title}</h4>
                                            <span className="text-xs px-1.5 py-0.5 bg-neutral-100 text-neutral-500 font-medium">{goal.status}</span>
                                        </div>
                                        <p className="text-xs text-neutral-400 mt-1">{member?.name} · KPI: {goal.kpi}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {canSelfEval && (
                                            <button onClick={() => setEvalModal({ goalId: goal.id, type: 'self' })} className="px-3 py-1.5 border border-neutral-200 text-xs text-neutral-500 hover:bg-neutral-50 transition-colors">
                                                자기 평가
                                            </button>
                                        )}
                                        {canSupervisorEval && (
                                            <button onClick={() => setEvalModal({ goalId: goal.id, type: 'supervisor' })} className="px-3 py-1.5 border border-neutral-200 text-xs text-neutral-500 hover:bg-neutral-50 transition-colors">
                                                상사 평가
                                            </button>
                                        )}
                                    </div>
                                </div>
                                {goal.selfRating && (
                                    <div className="mt-3 pt-3 border-t border-neutral-200 flex items-center gap-4">
                                        <span className="text-xs text-neutral-500">자기평가: {goal.selfRating}/5 ({ratingLabels[goal.selfRating]})</span>
                                        {goal.selfComment && <span className="text-xs text-neutral-400">&ldquo;{goal.selfComment}&rdquo;</span>}
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
                    <h3 className="text-sm font-semibold mb-3">평가 완료</h3>
                    <div className="space-y-3">
                        {evaluatedGoals.map(goal => {
                            const member = staff.find(s => s.id === goal.staffId);
                            return (
                                <div key={goal.id} className="border border-neutral-200 bg-neutral-50 p-5">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-xs font-mono text-neutral-300">{goal.level}</span>
                                        <h4 className="text-sm font-medium">{goal.title}</h4>
                                        <span className="text-xs px-1.5 py-0.5 bg-neutral-100 text-neutral-500 font-medium">Evaluated</span>
                                    </div>
                                    <p className="text-xs text-neutral-400">{member?.name}</p>
                                    <div className="grid grid-cols-2 gap-4 mt-3 pt-3 border-t border-neutral-200">
                                        <div>
                                            <p className="text-xs text-neutral-500 mb-1">자기 평가: {goal.selfRating}/5 ({goal.selfRating ? ratingLabels[goal.selfRating] : '-'})</p>
                                            {goal.selfComment && <p className="text-xs text-neutral-400">&ldquo;{goal.selfComment}&rdquo;</p>}
                                        </div>
                                        <div>
                                            <p className="text-xs text-neutral-500 mb-1">상사 평가: {goal.supervisorRating}/5 ({goal.supervisorRating ? ratingLabels[goal.supervisorRating] : '-'})</p>
                                            {goal.supervisorComment && <p className="text-xs text-neutral-400">&ldquo;{goal.supervisorComment}&rdquo;</p>}
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
                    <div className="relative w-full max-w-md border border-neutral-200 bg-white p-6 mx-4">
                        <h3 className="text-lg font-semibold mb-4">
                            {evalModal.type === 'self' ? '자기 평가' : '상사 평가'}
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-neutral-500 mb-2">평점</label>
                                <div className="flex gap-2">
                                    {([1, 2, 3, 4, 5] as EvaluationRating[]).map(r => (
                                        <button key={r} onClick={() => setRating(r)}
                                            className={`flex-1 border px-3 py-3 text-center transition-colors ${
                                                rating === r ? 'border-neutral-900 bg-neutral-100' : 'border-neutral-200 hover:border-neutral-400'
                                            }`}>
                                            <Star className={`h-5 w-5 mx-auto mb-1 ${rating >= r ? 'text-neutral-900 fill-neutral-900' : 'text-neutral-300'}`} />
                                            <p className={`text-xs ${rating === r ? 'text-neutral-900' : 'text-neutral-400'}`}>{ratingLabels[r]}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm text-neutral-500 mb-2">코멘트</label>
                                <textarea value={comment} onChange={e => setComment(e.target.value)} rows={3}
                                    placeholder="평가 의견을 작성해주세요"
                                    className="w-full border border-neutral-200 bg-white px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none resize-none" />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <button onClick={() => setEvalModal(null)} className="px-4 py-2 text-sm text-neutral-500 hover:text-neutral-900">취소</button>
                            <button onClick={handleSubmitEval} className="px-4 py-2 bg-neutral-900 text-sm font-medium text-white hover:bg-neutral-800">
                                평가 제출
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
