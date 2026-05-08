"use client";

// 프로젝트 5F 회고 모달 — 완료 시 자동 트리거
// Fact / Feeling / Finding / Future / Feedback
// Finding은 Identity Key Results로 환류 제안

import { useEffect, useState } from "react";
import { Loader2, X, Sparkles, ArrowRight } from "lucide-react";
import type { MyverseProject, ProjectRetrospective } from "@/lib/myverse/types";

const FIELDS: Array<{ key: keyof Omit<ProjectRetrospective, "completed_at">; label: string; hint: string; rows: number }> = [
    { key: "fact",     label: "Fact (사실)",        hint: "이 프로젝트에서 실제로 무엇을 했는가? 구체적으로 1-3 문장.", rows: 3 },
    { key: "feeling",  label: "Feeling (감정)",     hint: "어떤 감정·경험이었는가? 어려웠던 순간·뿌듯했던 순간.",       rows: 3 },
    { key: "finding",  label: "Finding (배움)",     hint: "이 프로젝트로 무엇을 알게 됐는가? Identity 핵심 결과 후보.", rows: 4 },
    { key: "future",   label: "Future (다음 한 수)", hint: "이 배움을 어디에 어떻게 적용할 것인가?",                    rows: 3 },
    { key: "feedback", label: "Feedback (피드백)",  hint: "자기 자신·팀·세상에게 남기는 한 마디.",                     rows: 2 },
];

export function ProjectRetroModal({ open, project, onClose, onSaved }: {
    open: boolean;
    project: MyverseProject;
    onClose: () => void;
    onSaved: () => void;
}) {
    const [retro, setRetro] = useState<Omit<ProjectRetrospective, "completed_at">>({
        fact: "", feeling: "", finding: "", future: "", feedback: "",
    });
    const [saving, setSaving] = useState(false);
    const [savedRetro, setSavedRetro] = useState<ProjectRetrospective | null>(null);
    const [keyResultDrafts, setKeyResultDrafts] = useState<string[]>([]);
    const [pushingKr, setPushingKr] = useState(false);

    useEffect(() => {
        if (!open) return;
        if (project.retrospective) {
            const r = project.retrospective;
            setRetro({ fact: r.fact, feeling: r.feeling, finding: r.finding, future: r.future, feedback: r.feedback });
            setSavedRetro(r);
        } else {
            setRetro({ fact: "", feeling: "", finding: "", future: "", feedback: "" });
            setSavedRetro(null);
        }
        setKeyResultDrafts([]);
    }, [open, project.id, project.retrospective]);

    async function save() {
        if (!retro.fact.trim() && !retro.finding.trim()) {
            alert("최소한 Fact 또는 Finding은 작성해 주세요.");
            return;
        }
        setSaving(true);
        try {
            const full: ProjectRetrospective = {
                ...retro,
                completed_at: new Date().toISOString(),
            };
            const res = await fetch(`/api/myverse/projects/${project.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    project: {
                        retrospective: full,
                        status: "completed",
                        completed_at: full.completed_at,
                    },
                }),
            });
            if (!res.ok) {
                alert("저장 실패");
                return;
            }
            setSavedRetro(full);
            // Finding을 줄단위로 분리 → Key Results 후보 제안
            const drafts = full.finding
                .split(/\n+/)
                .map(l => l.trim().replace(/^[-·•*]\s*/, ""))
                .filter(l => l.length > 5);
            setKeyResultDrafts(drafts);
            onSaved();
        } finally {
            setSaving(false);
        }
    }

    async function pushToIdentity() {
        const selected = keyResultDrafts.filter(k => k.length > 0);
        if (selected.length === 0) {
            onClose();
            return;
        }
        setPushingKr(true);
        try {
            const idRes = await fetch(`/api/myverse/identity`);
            if (!idRes.ok) { alert("Identity 조회 실패"); return; }
            const idData = await idRes.json();
            const existing: Array<{ id: string; category: string; text: string }> = idData.identity?.key_results ?? [];
            const newKrs = selected.map(text => ({
                id: `kr_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
                category: "프로젝트 회고",
                text,
            }));
            const next = [...existing, ...newKrs];
            const upRes = await fetch(`/api/myverse/identity`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ key_results: next }),
            });
            if (upRes.ok) {
                onClose();
            } else {
                alert("Identity 저장 실패");
            }
        } finally {
            setPushingKr(false);
        }
    }

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={onClose}>
            <div
                className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh]"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 shrink-0">
                    <div>
                        <h2 className="text-lg font-serif text-neutral-900">프로젝트 회고 · 5F</h2>
                        <p className="text-xs text-neutral-500 mt-0.5 truncate">{project.title}</p>
                    </div>
                    <button onClick={onClose} className="p-1 text-neutral-400 hover:text-neutral-700">
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
                    {!savedRetro ? (
                        <>
                            <p className="text-xs text-neutral-500 leading-relaxed">
                                이 프로젝트의 의미를 5F 구조로 정리합니다. <span className="text-[#6366F1]">Finding</span>은 Identity의 Key Results 후보로 환류됩니다.
                            </p>
                            {FIELDS.map(({ key, label, hint, rows }) => (
                                <div key={key}>
                                    <label className="block text-[10px] uppercase tracking-widest text-neutral-400 mb-1">{label}</label>
                                    <textarea
                                        value={retro[key]}
                                        onChange={(e) => setRetro({ ...retro, [key]: e.target.value })}
                                        rows={rows}
                                        placeholder={hint}
                                        className="w-full text-sm border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#6366F1] resize-none placeholder:text-neutral-300 placeholder:italic"
                                    />
                                </div>
                            ))}
                        </>
                    ) : (
                        <>
                            {/* 저장 완료 — Identity 환류 단계 */}
                            <div className="bg-violet-50 border border-violet-200 rounded-xl p-4">
                                <p className="text-sm font-medium text-violet-900 mb-1 flex items-center gap-1.5">
                                    <Sparkles className="h-4 w-4" /> Identity Key Results 환류
                                </p>
                                <p className="text-xs text-violet-700 leading-relaxed">
                                    Finding을 줄 단위로 분리해 Identity의 Key Results 후보로 추가할 수 있습니다.
                                    필요 없는 항목은 비우세요.
                                </p>
                            </div>

                            {keyResultDrafts.length === 0 ? (
                                <p className="text-sm text-neutral-400 italic py-4 text-center">
                                    Finding에서 추출할 항목이 없습니다. 줄바꿈으로 구분된 한 줄짜리 학습을 작성해 주세요.
                                </p>
                            ) : (
                                <div className="space-y-2">
                                    {keyResultDrafts.map((kr, i) => (
                                        <div key={i} className="flex items-start gap-2">
                                            <ArrowRight className="h-4 w-4 text-violet-400 mt-2 shrink-0" />
                                            <textarea
                                                value={kr}
                                                onChange={(e) => {
                                                    const next = [...keyResultDrafts];
                                                    next[i] = e.target.value;
                                                    setKeyResultDrafts(next);
                                                }}
                                                rows={2}
                                                className="flex-1 text-sm border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:border-violet-400 resize-none"
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>

                <div className="flex items-center justify-end gap-2 px-6 py-3 border-t border-neutral-200 shrink-0">
                    {!savedRetro ? (
                        <>
                            <button
                                onClick={onClose}
                                className="px-3 py-1.5 text-sm text-neutral-500 hover:text-neutral-900"
                            >
                                나중에
                            </button>
                            <button
                                onClick={save}
                                disabled={saving}
                                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#6366F1] text-white text-sm rounded-lg hover:bg-[#4F46E5] disabled:opacity-50"
                            >
                                {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                                저장하고 완료
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={onClose}
                                className="px-3 py-1.5 text-sm text-neutral-500 hover:text-neutral-900"
                            >
                                건너뛰기
                            </button>
                            <button
                                onClick={pushToIdentity}
                                disabled={pushingKr || keyResultDrafts.filter(k => k.trim()).length === 0}
                                className="inline-flex items-center gap-1.5 px-4 py-2 bg-violet-600 text-white text-sm rounded-lg hover:bg-violet-700 disabled:opacity-50"
                            >
                                {pushingKr ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                                Identity에 추가 ({keyResultDrafts.filter(k => k.trim()).length})
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
