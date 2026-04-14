"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import Fuse from "fuse.js";
import { WIKI_CATEGORIES, WIKI_STATIC_PAGES, type WikiSearchItem } from "@/types/wiki";

export default function WikiSearchPage() {
    const [query, setQuery] = useState("");
    const [items, setItems] = useState<WikiSearchItem[]>([]);
    const [categoryFilter, setCategoryFilter] = useState<string>("전체");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/wiki/search-index")
            .then(r => r.json())
            .then(data => {
                setItems(data.items || []);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const fuse = useMemo(() => new Fuse(items, {
        keys: [
            { name: "title", weight: 3 },
            { name: "summary", weight: 1 },
            { name: "tags", weight: 2 },
        ],
        threshold: 0.3,
        includeScore: true,
    }), [items]);

    const results = useMemo(() => {
        let filtered: WikiSearchItem[];

        if (query.trim()) {
            filtered = fuse.search(query).map(r => r.item);
        } else {
            filtered = items;
        }

        if (categoryFilter !== "전체") {
            filtered = filtered.filter(i => i.category === categoryFilter);
        }

        return filtered;
    }, [query, items, fuse, categoryFilter]);

    const categories = ["전체", ...Object.values(WIKI_CATEGORIES).map(c => c.label), "문화", "교육"];

    // URL search param
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const q = params.get("q");
        if (q) setQuery(q);
    }, []);

    return (
        <div>
            <h1 className="text-lg font-bold mb-4">검색</h1>

            {/* 검색 입력 */}
            <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-300" />
                <input
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    placeholder="위키 검색..."
                    autoFocus
                    className="w-full pl-10 pr-4 py-2.5 text-sm border border-neutral-200 rounded focus:outline-none focus:border-neutral-400"
                />
            </div>

            {/* 카테고리 필터 */}
            <div className="flex gap-1.5 flex-wrap mb-4">
                {categories.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setCategoryFilter(cat)}
                        className={`px-2.5 py-1 text-[11px] rounded transition-colors ${
                            categoryFilter === cat
                                ? "bg-neutral-900 text-white"
                                : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200"
                        }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* 결과 */}
            {loading ? (
                <p className="text-xs text-neutral-400">로딩 중...</p>
            ) : (
                <>
                    <p className="text-xs text-neutral-400 mb-3">{results.length}개 결과</p>
                    <div className="space-y-0">
                        {results.map(item => (
                            <Link
                                key={item.slug}
                                href={`/wiki/${item.slug}`}
                                className="flex items-start gap-3 py-3 border-b border-neutral-100 hover:bg-neutral-50 transition-colors px-2 -mx-2"
                            >
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-sm font-medium">{item.title}</h3>
                                    {item.summary && (
                                        <p className="text-[11px] text-neutral-400 mt-0.5 line-clamp-2">{item.summary}</p>
                                    )}
                                </div>
                                <span className="text-[10px] px-1.5 py-0.5 bg-neutral-100 text-neutral-500 rounded shrink-0">
                                    {item.category}
                                </span>
                            </Link>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
