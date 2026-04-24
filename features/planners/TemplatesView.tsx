"use client";

import { useEffect, useMemo, useState } from "react";
import { LayoutTemplate, Search, Loader2 } from "lucide-react";

interface Template {
    id: string;
    key: string;
    category: string;
    subcategory: string | null;
    label: string;
    description: string | null;
    body_md: string;
}

const CATEGORY_LABEL: Record<string, string> = {
    framework: "FrameWorkBook",
    schedule: "Schedule",
    note: "Note",
};

export function TemplatesView() {
    const [templates, setTemplates] = useState<Template[]>([]);
    const [loading, setLoading] = useState(true);
    const [cat, setCat] = useState<"all" | "framework" | "schedule" | "note">("all");
    const [query, setQuery] = useState("");
    const [selected, setSelected] = useState<Template | null>(null);

    useEffect(() => {
        (async () => {
            setLoading(true);
            const res = await fetch(`/api/planners/templates`);
            if (res.ok) {
                const d = await res.json();
                setTemplates(d.templates || []);
            }
            setLoading(false);
        })();
    }, []);

    const filtered = useMemo(() => {
        let list = templates;
        if (cat !== "all") list = list.filter((t) => t.category === cat);
        if (query.trim()) {
            const q = query.toLowerCase();
            list = list.filter(
                (t) =>
                    t.label.toLowerCase().includes(q) ||
                    (t.description ?? "").toLowerCase().includes(q) ||
                    (t.subcategory ?? "").toLowerCase().includes(q)
            );
        }
        return list;
    }, [templates, cat, query]);

    const counts = useMemo(() => {
        const c = { all: templates.length, framework: 0, schedule: 0, note: 0 };
        templates.forEach((t) => {
            if (t.category === "framework") c.framework++;
            else if (t.category === "schedule") c.schedule++;
            else if (t.category === "note") c.note++;
        });
        return c;
    }, [templates]);

    return (
        <div className="max-w-5xl mx-auto px-6 md:px-10 py-8 md:py-12">
            <div className="flex items-center gap-3 mb-2">
                <LayoutTemplate className="h-6 w-6 text-[#0F766E]" />
                <h1 className="font-serif text-3xl text-neutral-900">Templates</h1>
            </div>
            <p className="text-sm text-neutral-500 mb-8">
                기획자의 사고 틀. Schedule · Note · FrameWorkBook. 프로젝트 노트에 삽입해 바로 쓸 수 있습니다.
            </p>

            {/* Search + Filter */}
            <div className="flex flex-col md:flex-row gap-3 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="이름·설명 검색"
                        className="w-full bg-white border border-neutral-200 rounded-lg pl-9 pr-4 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-[#0F766E]"
                    />
                </div>
                <div className="flex gap-1">
                    {(["all", "framework", "schedule", "note"] as const).map((c) => (
                        <button
                            key={c}
                            onClick={() => setCat(c)}
                            className={`px-3 py-2 text-xs rounded-lg transition-colors ${
                                cat === c
                                    ? "bg-[#0F766E] text-white"
                                    : "bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50"
                            }`}
                        >
                            {c === "all" ? "전체" : CATEGORY_LABEL[c]} ({counts[c]})
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="py-16 text-center">
                    <Loader2 className="h-5 w-5 animate-spin text-neutral-400 mx-auto" />
                </div>
            ) : filtered.length === 0 ? (
                <div className="py-16 text-center text-neutral-400 text-sm">
                    {query ? `"${query}"에 대한 템플릿이 없습니다.` : "등록된 템플릿이 없습니다."}
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {filtered.map((tpl) => (
                        <button
                            key={tpl.id}
                            onClick={() => setSelected(tpl)}
                            className="text-left p-4 bg-white border border-neutral-200 rounded-xl hover:border-[#0F766E] hover:bg-[#0F766E]/5 transition-all"
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-[9px] px-1.5 py-0.5 bg-neutral-100 text-neutral-600 rounded uppercase tracking-wider">
                                    {CATEGORY_LABEL[tpl.category] || tpl.category}
                                </span>
                                {tpl.subcategory && (
                                    <span className="text-[9px] text-neutral-400">{tpl.subcategory}</span>
                                )}
                            </div>
                            <h4 className="font-semibold text-neutral-900 text-sm">{tpl.label}</h4>
                            {tpl.description && (
                                <p className="text-xs text-neutral-500 mt-1 leading-relaxed line-clamp-2">
                                    {tpl.description}
                                </p>
                            )}
                        </button>
                    ))}
                </div>
            )}

            {/* Preview modal */}
            {selected && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl max-w-2xl w-full max-h-[85vh] flex flex-col">
                        <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-[9px] px-1.5 py-0.5 bg-neutral-100 text-neutral-600 rounded uppercase tracking-wider">
                                        {CATEGORY_LABEL[selected.category] || selected.category}
                                    </span>
                                    {selected.subcategory && (
                                        <span className="text-[9px] text-neutral-400">{selected.subcategory}</span>
                                    )}
                                </div>
                                <h3 className="font-serif text-xl text-neutral-900">{selected.label}</h3>
                            </div>
                            <button onClick={() => setSelected(null)} className="text-neutral-400 hover:text-neutral-900">
                                닫기
                            </button>
                        </div>
                        <div className="overflow-y-auto flex-1 p-6">
                            {selected.description && (
                                <p className="text-sm text-neutral-500 mb-4">{selected.description}</p>
                            )}
                            <pre className="text-xs text-neutral-800 whitespace-pre-wrap font-mono bg-neutral-50 rounded-lg p-4 leading-relaxed">
                                {selected.body_md}
                            </pre>
                        </div>
                        <div className="px-6 py-4 border-t border-neutral-100 text-xs text-neutral-500">
                            프로젝트 상세 → Notes 탭 → "템플릿에서 삽입"으로 사용하세요.
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
