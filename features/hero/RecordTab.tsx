"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Trash2, BookOpen, Plus, X } from "lucide-react";

const RED = "#E53935";

const PRESET_TAGS = ["성과", "학습", "도전", "협업", "성장", "완료", "피드백", "아이디어"];
const MAX_TAGS = 5;
const MAX_CONTENT = 200;

interface Achievement {
    id: string;
    content: string;
    tags: string[];
    achieved_at: string;
    created_at: string;
}

function dateLabelKo(dateStr: string): string {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const d = new Date(dateStr);
    d.setHours(0, 0, 0, 0);
    const diff = Math.round((today.getTime() - d.getTime()) / 86400000);
    if (diff === 0) return "오늘";
    if (diff === 1) return "어제";
    if (diff < 7) return `${diff}일 전`;
    return `${d.getMonth() + 1}월 ${d.getDate()}일`;
}

export function RecordTab({ memberId }: { memberId: string }) {
    const [items, setItems] = useState<Achievement[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [content, setContent] = useState("");
    const [tags, setTags] = useState<string[]>([]);
    const [customTag, setCustomTag] = useState("");
    const [showCustomInput, setShowCustomInput] = useState(false);
    const [saving, setSaving] = useState(false);
    const [hovered, setHovered] = useState<string | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const customInputRef = useRef<HTMLInputElement>(null);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const r = await fetch(`/api/hero/achievements?memberId=${memberId}&limit=20`);
            if (r.ok) {
                const data = await r.json();
                setItems(data.items ?? []);
                setTotal(data.total ?? 0);
            }
        } finally {
            setLoading(false);
        }
    }, [memberId]);

    useEffect(() => { load(); }, [load]);

    function toggleTag(tag: string) {
        setTags(prev =>
            prev.includes(tag)
                ? prev.filter(t => t !== tag)
                : prev.length < MAX_TAGS ? [...prev, tag] : prev
        );
    }

    function addCustomTag() {
        const t = customTag.trim();
        if (!t || tags.includes(t) || tags.length >= MAX_TAGS) return;
        setTags(prev => [...prev, t]);
        setCustomTag("");
        setShowCustomInput(false);
    }

    async function handleSave() {
        if (!content.trim() || saving) return;
        setSaving(true);
        try {
            const r = await fetch("/api/hero/achievements", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ memberId, content: content.trim(), tags }),
            });
            if (r.ok) {
                const { item } = await r.json();
                setItems(prev => [item, ...prev]);
                setTotal(prev => prev + 1);
                setContent("");
                setTags([]);
                setShowCustomInput(false);
                setCustomTag("");
            }
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete(id: string) {
        const prev = items;
        setItems(items.filter(i => i.id !== id));
        setTotal(t => t - 1);
        const r = await fetch(`/api/hero/achievements?id=${id}&memberId=${memberId}`, { method: "DELETE" });
        if (!r.ok) {
            setItems(prev);
            setTotal(t => t + 1);
        }
    }

    function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
        if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
            e.preventDefault();
            handleSave();
        }
    }

    const canSave = content.trim().length > 0 && !saving;

    return (
        <div className="space-y-5">
            {/* 입력 박스 */}
            <div className="bg-white border border-neutral-200 rounded-2xl p-6 space-y-4">
                <textarea
                    ref={textareaRef}
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    onKeyDown={onKeyDown}
                    placeholder="오늘 이룬 것, 배운 것을 한 줄로 기록하세요."
                    maxLength={MAX_CONTENT}
                    rows={3}
                    className="w-full px-3 py-2.5 text-sm border border-neutral-200 rounded-xl resize-none focus:outline-none focus:border-[#E53935] transition-colors leading-relaxed"
                />
                <div className="flex items-center justify-between">
                    <span className="text-[11px] text-neutral-300">{content.length}/{MAX_CONTENT}</span>
                    <span className="text-[11px] text-neutral-300">⌘ + Enter로 저장</span>
                </div>

                {/* 태그 */}
                <div className="space-y-2">
                    <div className="flex flex-wrap gap-1.5">
                        {PRESET_TAGS.map(tag => (
                            <button
                                key={tag}
                                onClick={() => toggleTag(tag)}
                                disabled={!tags.includes(tag) && tags.length >= MAX_TAGS}
                                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors disabled:opacity-30 ${
                                    tags.includes(tag)
                                        ? "text-white"
                                        : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                                }`}
                                style={tags.includes(tag) ? { backgroundColor: RED } : undefined}
                            >
                                #{tag}
                            </button>
                        ))}
                        {tags.filter(t => !PRESET_TAGS.includes(t)).map(t => (
                            <span
                                key={t}
                                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold text-white"
                                style={{ backgroundColor: RED }}
                            >
                                #{t}
                                <button onClick={() => setTags(prev => prev.filter(x => x !== t))}>
                                    <X className="w-3 h-3" />
                                </button>
                            </span>
                        ))}
                        {!showCustomInput && tags.length < MAX_TAGS && (
                            <button
                                onClick={() => { setShowCustomInput(true); setTimeout(() => customInputRef.current?.focus(), 0); }}
                                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-neutral-100 text-neutral-500 hover:bg-neutral-200"
                            >
                                <Plus className="w-3 h-3" /> 직접 입력
                            </button>
                        )}
                        {showCustomInput && (
                            <input
                                ref={customInputRef}
                                value={customTag}
                                onChange={e => setCustomTag(e.target.value)}
                                onKeyDown={e => { if (e.key === "Enter") addCustomTag(); if (e.key === "Escape") { setShowCustomInput(false); setCustomTag(""); } }}
                                onBlur={addCustomTag}
                                placeholder="태그 입력"
                                maxLength={10}
                                className="px-2.5 py-1 text-xs border border-neutral-300 rounded-lg focus:outline-none focus:border-[#E53935] w-24"
                            />
                        )}
                    </div>
                    {tags.length > 0 && (
                        <p className="text-[11px] text-neutral-400">{tags.length}/{MAX_TAGS} 태그 선택됨</p>
                    )}
                </div>

                <button
                    onClick={handleSave}
                    disabled={!canSave}
                    className="w-full py-2.5 rounded-xl text-white text-sm font-bold disabled:opacity-40 hover:opacity-90 transition-opacity"
                    style={{ backgroundColor: RED }}
                >
                    {saving ? "저장 중..." : "기록하기"}
                </button>
            </div>

            {/* 목록 */}
            {loading ? (
                <div className="space-y-3 animate-pulse">
                    {[1, 2, 3].map(i => <div key={i} className="h-16 bg-neutral-100 rounded-2xl" />)}
                </div>
            ) : items.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-neutral-200 rounded-2xl">
                    <BookOpen className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
                    <p className="text-sm text-neutral-400">첫 성과를 기록해보세요.</p>
                    <p className="text-xs text-neutral-300 mt-1">작은 것도 괜찮습니다. 매일 쌓이면 힘이 됩니다.</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {total > 0 && (
                        <p className="text-xs text-neutral-400 px-1">총 {total}개 기록</p>
                    )}
                    {items.map(item => (
                        <div
                            key={item.id}
                            onMouseEnter={() => setHovered(item.id)}
                            onMouseLeave={() => setHovered(null)}
                            className="bg-white border border-neutral-200 rounded-2xl px-5 py-4 flex items-start gap-3 group"
                        >
                            <div className="flex-1 min-w-0">
                                <p className="text-sm text-neutral-800 leading-relaxed">{item.content}</p>
                                {item.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-2">
                                        {item.tags.map(t => (
                                            <span key={t} className="px-2 py-0.5 bg-neutral-100 text-neutral-500 rounded-md text-[11px] font-medium">
                                                #{t}
                                            </span>
                                        ))}
                                    </div>
                                )}
                                <p className="text-[11px] text-neutral-300 mt-1.5">{dateLabelKo(item.achieved_at)}</p>
                            </div>
                            <button
                                onClick={() => handleDelete(item.id)}
                                className={`shrink-0 p-1.5 rounded-lg transition-all ${hovered === item.id ? "opacity-100" : "opacity-0"} hover:bg-red-50`}
                                aria-label="삭제"
                            >
                                <Trash2 className="w-3.5 h-3.5 text-red-400" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
