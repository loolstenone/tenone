"use client";

// Notion Mail 스타일 인박스 — 좌측 카테고리 사이드바 + 중앙 메일 목록 + 우측 본문
// Gmail API 임포트 캐시(myverse_email_imports)를 표시. 본문은 클릭 시 on-demand fetch.

import { useCallback, useEffect, useMemo, useState } from "react";
import {
    Mail, Inbox, Tag, Receipt, Calendar as CalIcon, Newspaper, Archive,
    Search, RefreshCw, Loader2, Star, ExternalLink, AlertCircle, Trash2, Check,
} from "lucide-react";

interface EmailItem {
    id: string;
    sender_name: string | null;
    sender_email: string | null;
    subject: string | null;
    snippet: string | null;
    received_at: string;
    auto_category: string | null;
    auto_amount: number | null;
    triage_state: string;
    is_read?: boolean;
    is_starred?: boolean;
    labels?: string[] | null;
}

interface EmailDetail extends EmailItem {
    body_text?: string | null;
    body_html?: string | null;
    body_fetched_at?: string | null;
    external_id?: string;
}

const CATEGORIES = [
    { key: "all",        label: "전체",       icon: Mail,      filter: () => true },
    { key: "inbox",      label: "수신함",     icon: Inbox,     filter: (e: EmailItem) => e.triage_state === "inbox" },
    { key: "receipt",    label: "영수증",     icon: Receipt,   filter: (e: EmailItem) => e.auto_category === "receipt" },
    { key: "invite",     label: "초대·일정", icon: CalIcon,   filter: (e: EmailItem) => e.auto_category === "invite" },
    { key: "newsletter", label: "뉴스레터",   icon: Newspaper, filter: (e: EmailItem) => e.auto_category === "newsletter" },
    { key: "starred",    label: "즐겨찾기",   icon: Star,      filter: (e: EmailItem) => !!e.is_starred },
    { key: "archive",    label: "보관함",     icon: Archive,   filter: (e: EmailItem) => e.triage_state === "archive" },
] as const;

type CategoryKey = (typeof CATEGORIES)[number]["key"];

const CATEGORY_META: Record<string, { label: string; color: string }> = {
    receipt:    { label: "영수증",   color: "bg-rose-50 text-rose-600 border-rose-100" },
    invite:     { label: "초대",     color: "bg-sky-50 text-sky-600 border-sky-100" },
    newsletter: { label: "뉴스레터", color: "bg-neutral-100 text-neutral-500 border-neutral-200" },
    personal:   { label: "개인",     color: "bg-emerald-50 text-emerald-600 border-emerald-100" },
    work:       { label: "업무",     color: "bg-amber-50 text-amber-600 border-amber-100" },
};

function timeAgo(iso: string): string {
    const t = new Date(iso).getTime();
    const now = Date.now();
    const diff = (now - t) / 1000;
    if (diff < 60) return "방금";
    if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
    if (diff < 86400 * 7) return `${Math.floor(diff / 86400)}일 전`;
    const d = new Date(iso);
    return `${d.getMonth() + 1}/${d.getDate()}`;
}

export function MailView() {
    const [emails, setEmails] = useState<EmailItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [activeCategory, setActiveCategory] = useState<CategoryKey>("inbox");
    const [search, setSearch] = useState("");
    const [selected, setSelected] = useState<EmailDetail | null>(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [notConnected, setNotConnected] = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/myverse/email-imports?state=all", { cache: "no-store" });
            if (res.ok) {
                const d = await res.json();
                setEmails(d.emails ?? []);
                setNotConnected(false);
            } else if (res.status === 400 || res.status === 404) {
                setNotConnected(true);
            }
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { void load(); }, [load]);

    async function sync() {
        setSyncing(true);
        try {
            const res = await fetch("/api/myverse/integrations/gmail/sync", { method: "POST" });
            if (res.ok) {
                await load();
            } else {
                const d = await res.json().catch(() => ({}));
                if (d.error === "not_connected") setNotConnected(true);
            }
        } finally {
            setSyncing(false);
        }
    }

    async function openEmail(e: EmailItem) {
        setSelected({ ...e });
        setDetailLoading(true);
        // 읽음 마킹 (낙관)
        if (!e.is_read) {
            setEmails(prev => prev.map(x => x.id === e.id ? { ...x, is_read: true } : x));
            void fetch(`/api/myverse/email-imports/${e.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ is_read: true }),
            });
        }
        try {
            const res = await fetch(`/api/myverse/email-imports/${e.id}`, { cache: "no-store" });
            if (res.ok) {
                const d = await res.json();
                setSelected(d.email ?? e);
            }
        } finally {
            setDetailLoading(false);
        }
    }

    async function toggleStar(e: EmailItem) {
        const next = !e.is_starred;
        setEmails(prev => prev.map(x => x.id === e.id ? { ...x, is_starred: next } : x));
        if (selected?.id === e.id) setSelected({ ...selected, is_starred: next });
        await fetch(`/api/myverse/email-imports/${e.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ is_starred: next }),
        });
    }

    async function archive(e: EmailItem) {
        setEmails(prev => prev.filter(x => x.id !== e.id));
        if (selected?.id === e.id) setSelected(null);
        await fetch(`/api/myverse/email-imports/${e.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ triage_state: "archive" }),
        });
    }

    // 카테고리 카운트
    const counts = useMemo(() => {
        const out: Record<string, number> = {};
        for (const cat of CATEGORIES) {
            out[cat.key] = emails.filter(cat.filter).length;
        }
        return out;
    }, [emails]);

    const filtered = useMemo(() => {
        const cat = CATEGORIES.find(c => c.key === activeCategory);
        let list = emails.filter(cat?.filter ?? (() => true));
        if (search.trim()) {
            const q = search.toLowerCase();
            list = list.filter(e =>
                (e.subject?.toLowerCase() ?? "").includes(q) ||
                (e.sender_name?.toLowerCase() ?? "").includes(q) ||
                (e.sender_email?.toLowerCase() ?? "").includes(q) ||
                (e.snippet?.toLowerCase() ?? "").includes(q)
            );
        }
        return list.sort((a, b) => b.received_at.localeCompare(a.received_at));
    }, [emails, activeCategory, search]);

    return (
        <div className="flex h-[calc(100vh-3rem)] overflow-hidden bg-white myverse-dark:bg-[#0A0A12]">
            {/* 좌측 카테고리 사이드바 */}
            <aside className="w-52 shrink-0 border-r border-neutral-200 myverse-dark:border-white/8 flex flex-col">
                <div className="px-3 py-3 border-b border-neutral-200 myverse-dark:border-white/8 flex items-center gap-2">
                    <Mail className="h-4 w-4 text-[#6366F1]" />
                    <h1 className="text-sm font-semibold text-neutral-900 myverse-dark:text-neutral-100">메일</h1>
                </div>
                <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
                    {CATEGORIES.map(cat => {
                        const Icon = cat.icon;
                        const isActive = activeCategory === cat.key;
                        const count = counts[cat.key] ?? 0;
                        return (
                            <button
                                key={cat.key}
                                onClick={() => setActiveCategory(cat.key as CategoryKey)}
                                className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs text-left transition-colors ${
                                    isActive
                                        ? "bg-[#6366F1]/10 text-[#6366F1] myverse-dark:bg-[#6366F1]/20"
                                        : "text-neutral-600 myverse-dark:text-neutral-300 hover:bg-neutral-100 myverse-dark:hover:bg-white/5"
                                }`}
                            >
                                <Icon className="h-3.5 w-3.5 shrink-0" />
                                <span className="flex-1 truncate">{cat.label}</span>
                                {count > 0 && (
                                    <span className={`text-[10px] ${isActive ? "text-[#6366F1]" : "text-neutral-400"}`}>
                                        {count}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </nav>
                <div className="p-2 border-t border-neutral-200 myverse-dark:border-white/8">
                    <button
                        onClick={sync}
                        disabled={syncing || notConnected}
                        className="w-full flex items-center justify-center gap-1.5 px-2 py-1.5 text-[11px] text-neutral-600 myverse-dark:text-neutral-300 hover:bg-neutral-100 myverse-dark:hover:bg-white/5 rounded disabled:opacity-50"
                    >
                        {syncing ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
                        {syncing ? "동기화 중…" : "Gmail 동기화"}
                    </button>
                </div>
            </aside>

            {/* 중앙 메일 목록 */}
            <div className="w-96 shrink-0 border-r border-neutral-200 myverse-dark:border-white/8 flex flex-col">
                <div className="px-3 py-2 border-b border-neutral-200 myverse-dark:border-white/8">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-neutral-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="이름·제목·내용 검색"
                            className="w-full text-xs pl-7 pr-2 py-1.5 bg-neutral-50 myverse-dark:bg-white/5 border border-neutral-200 myverse-dark:border-white/10 rounded focus:outline-none focus:border-[#6366F1]"
                        />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="p-6 text-center text-xs text-neutral-400 flex items-center justify-center gap-2">
                            <Loader2 className="h-3 w-3 animate-spin" /> 불러오는 중…
                        </div>
                    ) : notConnected ? (
                        <div className="p-6 text-center">
                            <AlertCircle className="h-6 w-6 text-amber-500 mx-auto mb-2" />
                            <p className="text-xs text-neutral-600 myverse-dark:text-neutral-300">Gmail 연결 필요</p>
                            <a
                                href="/myverse/app/settings"
                                className="inline-block mt-3 text-[11px] text-[#6366F1] hover:underline"
                            >
                                설정 → 외부 연동에서 연결
                            </a>
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="p-6 text-center text-xs text-neutral-400">
                            {search ? `"${search}" 검색 결과 없음` : "메일이 없습니다"}
                        </div>
                    ) : (
                        <ul className="divide-y divide-neutral-100 myverse-dark:divide-white/8">
                            {filtered.map(e => {
                                const isSelected = selected?.id === e.id;
                                const isUnread = !e.is_read;
                                const cat = e.auto_category ? CATEGORY_META[e.auto_category] : null;
                                return (
                                    <li
                                        key={e.id}
                                        onClick={() => openEmail(e)}
                                        className={`group px-3 py-2 cursor-pointer transition-colors ${
                                            isSelected
                                                ? "bg-[#6366F1]/5 myverse-dark:bg-[#6366F1]/15"
                                                : "hover:bg-neutral-50 myverse-dark:hover:bg-white/5"
                                        }`}
                                    >
                                        <div className="flex items-start gap-2">
                                            <button
                                                onClick={(ev) => { ev.stopPropagation(); toggleStar(e); }}
                                                className="mt-0.5 shrink-0"
                                                title="즐겨찾기"
                                            >
                                                <Star
                                                    className={`h-3 w-3 ${e.is_starred ? "fill-amber-400 text-amber-400" : "text-neutral-300 hover:text-amber-400"}`}
                                                />
                                            </button>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-1.5">
                                                    {isUnread && (
                                                        <span className="w-1.5 h-1.5 rounded-full bg-[#6366F1] shrink-0" />
                                                    )}
                                                    <p className={`text-xs truncate flex-1 ${isUnread ? "font-semibold text-neutral-900 myverse-dark:text-neutral-100" : "text-neutral-600 myverse-dark:text-neutral-400"}`}>
                                                        {e.sender_name || e.sender_email || "(보낸이 없음)"}
                                                    </p>
                                                    <span className="text-[10px] text-neutral-400 shrink-0">
                                                        {timeAgo(e.received_at)}
                                                    </span>
                                                </div>
                                                <p className={`text-xs truncate mt-0.5 ${isUnread ? "text-neutral-800 myverse-dark:text-neutral-200" : "text-neutral-500 myverse-dark:text-neutral-400"}`}>
                                                    {e.subject ?? "(제목 없음)"}
                                                </p>
                                                <p className="text-[11px] text-neutral-400 truncate mt-0.5">
                                                    {e.snippet}
                                                </p>
                                                {cat && (
                                                    <span className={`inline-block mt-1 text-[9px] px-1.5 py-0.5 rounded border ${cat.color}`}>
                                                        {cat.label}
                                                        {e.auto_amount != null && ` · ${e.auto_amount.toLocaleString()}원`}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>
            </div>

            {/* 우측 메일 본문 */}
            <div className="flex-1 min-w-0 flex flex-col">
                {!selected ? (
                    <div className="flex-1 flex items-center justify-center text-xs text-neutral-400">
                        <div className="text-center">
                            <Mail className="h-8 w-8 mx-auto mb-2 text-neutral-200" />
                            <p>메일을 선택하세요</p>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* 헤더 */}
                        <div className="px-5 py-3 border-b border-neutral-200 myverse-dark:border-white/8">
                            <div className="flex items-start justify-between gap-3 mb-1">
                                <h2 className="text-base font-semibold text-neutral-900 myverse-dark:text-neutral-100 leading-snug flex-1">
                                    {selected.subject ?? "(제목 없음)"}
                                </h2>
                                <div className="flex items-center gap-1 shrink-0">
                                    <button
                                        onClick={() => toggleStar(selected)}
                                        className="p-1.5 rounded hover:bg-neutral-100 myverse-dark:hover:bg-white/5"
                                        title="즐겨찾기"
                                    >
                                        <Star className={`h-3.5 w-3.5 ${selected.is_starred ? "fill-amber-400 text-amber-400" : "text-neutral-400"}`} />
                                    </button>
                                    <button
                                        onClick={() => archive(selected)}
                                        className="p-1.5 rounded hover:bg-neutral-100 myverse-dark:hover:bg-white/5 text-neutral-400 hover:text-neutral-700"
                                        title="보관함으로"
                                    >
                                        <Archive className="h-3.5 w-3.5" />
                                    </button>
                                    {selected.external_id && (
                                        <a
                                            href={`https://mail.google.com/mail/u/0/#inbox/${selected.external_id}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-1.5 rounded hover:bg-neutral-100 myverse-dark:hover:bg-white/5 text-neutral-400 hover:text-[#6366F1]"
                                            title="Gmail에서 열기"
                                        >
                                            <ExternalLink className="h-3.5 w-3.5" />
                                        </a>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-neutral-500 myverse-dark:text-neutral-400">
                                <span className="font-medium text-neutral-700 myverse-dark:text-neutral-200">
                                    {selected.sender_name || selected.sender_email || "?"}
                                </span>
                                {selected.sender_email && selected.sender_name && (
                                    <span className="text-neutral-400">&lt;{selected.sender_email}&gt;</span>
                                )}
                                <span className="text-neutral-300">·</span>
                                <span>{new Date(selected.received_at).toLocaleString("ko-KR")}</span>
                            </div>
                        </div>

                        {/* 본문 */}
                        <div className="flex-1 overflow-y-auto">
                            {detailLoading && !selected.body_text && !selected.body_html ? (
                                <div className="p-6 text-center text-xs text-neutral-400 flex items-center justify-center gap-2">
                                    <Loader2 className="h-3 w-3 animate-spin" /> 본문 불러오는 중…
                                </div>
                            ) : selected.body_html ? (
                                <iframe
                                    title="email-body"
                                    srcDoc={selected.body_html}
                                    sandbox="allow-same-origin"
                                    className="w-full h-full border-0 bg-white"
                                />
                            ) : selected.body_text ? (
                                <pre className="p-5 text-sm text-neutral-800 myverse-dark:text-neutral-200 whitespace-pre-wrap font-sans leading-relaxed">
                                    {selected.body_text}
                                </pre>
                            ) : (
                                <div className="p-5">
                                    <p className="text-xs text-neutral-500 mb-2">본문 미리보기</p>
                                    <p className="text-sm text-neutral-700 myverse-dark:text-neutral-300">{selected.snippet}</p>
                                    <p className="mt-4 text-[11px] text-neutral-400">
                                        본문을 불러오지 못했습니다. Gmail에서 직접 확인하세요.
                                    </p>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
