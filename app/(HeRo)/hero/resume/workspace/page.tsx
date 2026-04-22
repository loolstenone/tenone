"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth-context";
import { LoginModal } from "@/components/LoginModal";
import { createClient } from "@/lib/supabase/client";
import {
    FileText, Plus, Trash2, Star, StarOff, Edit3,
    ChevronRight, Clock, ArrowLeft, Save, X,
} from "lucide-react";
import Link from "next/link";

interface Resume {
    id: string;
    member_id: string;
    title: string;
    content: { text?: string; [key: string]: unknown };
    is_primary: boolean;
    created_at: string;
    updated_at: string;
}

export default function ResumeWorkspacePage() {
    const { user, isAuthenticated, isLoading } = useAuth();
    const supabase = createClient();

    const [resumes, setResumes] = useState<Resume[]>([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState<"list" | "edit" | "new">("list");
    const [editing, setEditing] = useState<Resume | null>(null);
    const [formTitle, setFormTitle] = useState("");
    const [formText, setFormText] = useState("");
    const [saving, setSaving] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const loadResumes = useCallback(async () => {
        if (!user?.id) return;
        const { data } = await supabase
            .from("resumes")
            .select("*")
            .eq("member_id", user.id)
            .order("is_primary", { ascending: false })
            .order("created_at", { ascending: false });
        setResumes(data || []);
        setLoading(false);
    }, [user?.id]);

    useEffect(() => {
        if (isAuthenticated) loadResumes();
    }, [isAuthenticated, loadResumes]);

    const openNew = () => {
        setFormTitle("");
        setFormText("");
        setEditing(null);
        setView("new");
    };

    const openEdit = (r: Resume) => {
        setEditing(r);
        setFormTitle(r.title);
        setFormText(r.content?.text || "");
        setView("edit");
    };

    const cancelEdit = () => {
        setEditing(null);
        setView("list");
    };

    const handleSave = async () => {
        if (!user?.id || !formTitle.trim()) return;
        setSaving(true);
        try {
            if (view === "new") {
                const { error } = await supabase.from("resumes").insert({
                    member_id: user.id,
                    title: formTitle.trim(),
                    content: { text: formText },
                    is_primary: resumes.length === 0,
                });
                if (error) throw error;
            } else if (editing) {
                const { error } = await supabase
                    .from("resumes")
                    .update({
                        title: formTitle.trim(),
                        content: { text: formText },
                        updated_at: new Date().toISOString(),
                    })
                    .eq("id", editing.id);
                if (error) throw error;
            }
            await loadResumes();
            setView("list");
        } finally {
            setSaving(false);
        }
    };

    const setPrimary = async (id: string) => {
        if (!user?.id) return;
        await supabase
            .from("resumes")
            .update({ is_primary: false })
            .eq("member_id", user.id);
        await supabase
            .from("resumes")
            .update({ is_primary: true })
            .eq("id", id);
        await loadResumes();
    };

    const handleDelete = async (id: string) => {
        await supabase.from("resumes").delete().eq("id", id);
        setDeleteId(null);
        await loadResumes();
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="h-6 w-6 border-2 border-neutral-200 border-t-amber-500 rounded-full animate-spin" />
            </div>
        );
    }
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-white">
                <LoginModal isOpen onClose={() => {}} accentColor="#F59E0B" />
            </div>
        );
    }

    /* ── 편집 / 신규 뷰 ── */
    if (view === "edit" || view === "new") {
        return (
            <div className="min-h-screen bg-neutral-50 pt-20 pb-16 px-4">
                <div className="max-w-2xl mx-auto">
                    <button
                        onClick={cancelEdit}
                        className="flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-700 mb-6"
                    >
                        <ArrowLeft className="h-4 w-4" /> 목록으로
                    </button>

                    <h1 className="text-xl font-bold mb-6">
                        {view === "new" ? "새 이력서 등록" : "이력서 수정"}
                    </h1>

                    <div className="bg-white border border-neutral-200 rounded-2xl p-6 space-y-5">
                        <div>
                            <label className="text-sm font-medium text-neutral-700 mb-1.5 block">
                                이름 / 제목
                            </label>
                            <input
                                value={formTitle}
                                onChange={e => setFormTitle(e.target.value)}
                                placeholder="예) 홍길동 이력서 · 마케터 지원용"
                                className="w-full border border-neutral-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-amber-400"
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium text-neutral-700 mb-1.5 block">
                                이력서 내용 <span className="text-neutral-400 font-normal">(자유 양식 — 복사·붙여넣기 가능)</span>
                            </label>
                            <textarea
                                value={formText}
                                onChange={e => setFormText(e.target.value)}
                                placeholder={"이름: 홍길동\n연락처: 010-0000-0000\n\n[경력]\n2022~현재  ○○회사 마케팅팀\n\n[학력]\n○○대학교 경영학과 졸업\n\n[자기소개]\n..."}
                                rows={18}
                                className="w-full border border-neutral-300 rounded-lg px-3 py-2.5 text-sm font-mono focus:outline-none focus:border-amber-400 resize-y"
                            />
                        </div>

                        <div className="flex items-center gap-3 pt-2">
                            <button
                                onClick={handleSave}
                                disabled={saving || !formTitle.trim()}
                                className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600 disabled:opacity-50 transition-colors"
                            >
                                <Save className="h-4 w-4" />
                                {saving ? "저장 중..." : "저장"}
                            </button>
                            <button
                                onClick={cancelEdit}
                                className="flex items-center gap-2 px-5 py-2.5 border border-neutral-300 text-neutral-600 rounded-lg text-sm hover:bg-neutral-50 transition-colors"
                            >
                                <X className="h-4 w-4" /> 취소
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    /* ── 목록 뷰 ── */
    return (
        <div className="min-h-screen bg-neutral-50 pt-20 pb-16 px-4">
            <div className="max-w-2xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <Link href="/hero/resume" className="flex items-center gap-1 text-xs text-neutral-400 hover:text-neutral-600 mb-1">
                            <ArrowLeft className="h-3.5 w-3.5" /> 이력서 서비스
                        </Link>
                        <h1 className="text-xl font-bold">내 이력서</h1>
                    </div>
                    <button
                        onClick={openNew}
                        className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600 transition-colors"
                    >
                        <Plus className="h-4 w-4" /> 새 이력서
                    </button>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="h-6 w-6 border-2 border-neutral-200 border-t-amber-500 rounded-full animate-spin" />
                    </div>
                ) : resumes.length === 0 ? (
                    <div className="bg-white border-2 border-dashed border-neutral-200 rounded-2xl p-16 text-center">
                        <FileText className="h-12 w-12 text-neutral-200 mx-auto mb-4" />
                        <p className="text-sm font-medium text-neutral-600 mb-1">등록된 이력서가 없습니다</p>
                        <p className="text-xs text-neutral-400 mb-6">이력서를 등록하면 AI 분석 신청에 활용할 수 있습니다</p>
                        <button
                            onClick={openNew}
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600 transition-colors"
                        >
                            <Plus className="h-4 w-4" /> 첫 이력서 등록
                        </button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {resumes.map(r => (
                            <div
                                key={r.id}
                                className="bg-white border border-neutral-200 rounded-xl p-5 hover:border-amber-200 transition-colors"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            {r.is_primary && (
                                                <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full font-medium">
                                                    기본
                                                </span>
                                            )}
                                            <span className="text-sm font-semibold truncate">{r.title}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-xs text-neutral-400">
                                            <Clock className="h-3 w-3" />
                                            {new Date(r.updated_at || r.created_at).toLocaleDateString("ko-KR")}
                                            {r.content?.text && (
                                                <span className="ml-2 text-neutral-300">
                                                    {String(r.content.text).length.toLocaleString()} 자
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        {!r.is_primary && (
                                            <button
                                                onClick={() => setPrimary(r.id)}
                                                title="기본 이력서로 설정"
                                                className="p-1.5 text-neutral-300 hover:text-amber-500 transition-colors"
                                            >
                                                <StarOff className="h-4 w-4" />
                                            </button>
                                        )}
                                        {r.is_primary && (
                                            <span className="p-1.5 text-amber-400">
                                                <Star className="h-4 w-4" />
                                            </span>
                                        )}
                                        <button
                                            onClick={() => openEdit(r)}
                                            className="p-1.5 text-neutral-400 hover:text-neutral-700 transition-colors"
                                        >
                                            <Edit3 className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => setDeleteId(r.id)}
                                            className="p-1.5 text-neutral-300 hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                                {r.content?.text && (
                                    <p className="mt-3 text-xs text-neutral-400 line-clamp-2 font-mono">
                                        {String(r.content.text).slice(0, 200)}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {resumes.length > 0 && (
                    <div className="mt-8 bg-amber-50 border border-amber-100 rounded-xl p-5">
                        <p className="text-sm font-semibold text-amber-800 mb-1">AI 이력서 코칭 신청</p>
                        <p className="text-xs text-amber-600 mb-3">
                            등록된 이력서를 기반으로 AI가 개선점을 분석합니다. 결제 시스템 연동 후 이용 가능합니다.
                        </p>
                        <Link
                            href="/hero/resume"
                            className="flex items-center gap-1 text-xs font-medium text-amber-700 hover:text-amber-900"
                        >
                            서비스 안내 보기 <ChevronRight className="h-3.5 w-3.5" />
                        </Link>
                    </div>
                )}
            </div>

            {/* 삭제 확인 모달 */}
            {deleteId && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
                        <h3 className="text-base font-bold mb-2">이력서를 삭제할까요?</h3>
                        <p className="text-sm text-neutral-500 mb-5">삭제된 이력서는 복구할 수 없습니다.</p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => handleDelete(deleteId)}
                                className="flex-1 py-2.5 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600"
                            >
                                삭제
                            </button>
                            <button
                                onClick={() => setDeleteId(null)}
                                className="flex-1 py-2.5 border border-neutral-200 text-neutral-600 rounded-lg text-sm hover:bg-neutral-50"
                            >
                                취소
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
