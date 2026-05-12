"use client";

// Notion Mail 스타일 인박스 — 좌측 카테고리 사이드바 + 중앙 메일 목록 + 우측 본문
// Gmail API 임포트 캐시(myverse_email_imports)를 표시. 본문은 클릭 시 on-demand fetch.

import { useCallback, useEffect, useMemo, useState } from "react";
import {
    Mail, Inbox, Receipt, Calendar as CalIcon, Newspaper, Archive,
    Search, RefreshCw, Loader2, Star, ExternalLink, AlertCircle,
    Users as UsersIcon, Filter, X as XIcon, NotebookPen, Check,
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
    const [unreadOnly, setUnreadOnly] = useState(false);
    const [dateRange, setDateRange] = useState<"all" | "today" | "week" | "month">("all");
    const [senderFilter, setSenderFilter] = useState<string | null>(null);  // sender_email 또는 도메인
    const [showFilters, setShowFilters] = useState(false);

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

    const [embedding, setEmbedding] = useState(false);
    const [embedded, setEmbedded] = useState(false);
    async function embedToDaily(e: EmailDetail) {
        if (embedding) return;
        setEmbedding(true);
        try {
            // 1) 오늘 daily 가져오기
            const today = new Date();
            const date = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
            const r = await fetch(`/api/myverse/daily?date=${date}`, { cache: "no-store" });
            const d = r.ok ? await r.json() : null;
            const currentNotes = Array.isArray(d?.daily?.notes) ? d.daily.notes : [];
            // 2) email 노트 추가
            const noteId = `n_email_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
            const newNote = {
                id: noteId,
                type: "email" as const,
                email_id: e.id,
                email_meta: {
                    sender_name: e.sender_name ?? null,
                    sender_email: e.sender_email ?? null,
                    subject: e.subject ?? null,
                    snippet: e.snippet ?? null,
                    received_at: e.received_at,
                    external_id: e.external_id,
                },
                title: e.subject?.slice(0, 60) || `메일 ${currentNotes.length + 1}`,
                cue: "", content: "", summary: "", rows: [],
            };
            // 3) POST upsert
            await fetch("/api/myverse/daily", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ date, notes: [...currentNotes, newNote] }),
            });
            // 4) email triage_state='note' 마킹 (이미 임베드한 메일 식별용)
            await fetch(`/api/myverse/email-imports/${e.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ triage_state: "note" }),
            });
            setEmbedded(true);
            setTimeout(() => setEmbedded(false), 2500);
        } finally {
            setEmbedding(false);
        }
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

    // 발신인 빈도 (top 8)
    const topSenders = useMemo(() => {
        const counts = new Map<string, { name: string | null; count: number }>();
        for (const e of emails) {
            if (!e.sender_email) continue;
            const key = e.sender_email.toLowerCase();
            const cur = counts.get(key);
            if (cur) cur.count++;
            else counts.set(key, { name: e.sender_name, count: 1 });
        }
        return [...counts.entries()]
            .sort((a, b) => b[1].count - a[1].count)
            .slice(0, 8)
            .map(([email, { name, count }]) => ({ email, name, count }));
    }, [emails]);

    const filtered = useMemo(() => {
        const cat = CATEGORIES.find(c => c.key === activeCategory);
        let list = emails.filter(cat?.filter ?? (() => true));
        if (unreadOnly) list = list.filter(e => !e.is_read);
        if (senderFilter) list = list.filter(e => (e.sender_email ?? "").toLowerCase() === senderFilter);
        if (dateRange !== "all") {
            const now = Date.now();
            const range = dateRange === "today" ? 86400_000 : dateRange === "week" ? 7 * 86400_000 : 30 * 86400_000;
            list = list.filter(e => now - new Date(e.received_at).getTime() < range);
        }
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
    }, [emails, activeCategory, search, unreadOnly, senderFilter, dateRange]);

    const activeFiltersCount = (unreadOnly ? 1 : 0) + (senderFilter ? 1 : 0) + (dateRange !== "all" ? 1 : 0);

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
                <div className="px-3 py-2 border-b border-neutral-200 myverse-dark:border-white/8 space-y-1.5">
                    <div className="flex items-center gap-1.5">
                        <div className="flex-1 relative">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-neutral-400" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="이름·제목·내용 검색"
                                className="w-full text-xs pl-7 pr-2 py-1.5 bg-neutral-50 myverse-dark:bg-white/5 border border-neutral-200 myverse-dark:border-white/10 rounded focus:outline-none focus:border-[#6366F1]"
                            />
                        </div>
                        <button
                            type="button"
                            onClick={() => setShowFilters(s => !s)}
                            className={`relative px-2 py-1.5 text-[10px] rounded border transition-colors ${
                                showFilters || activeFiltersCount > 0
                                    ? "bg-[#6366F1]/10 text-[#6366F1] border-[#6366F1]/30"
                                    : "bg-neutral-50 myverse-dark:bg-white/5 text-neutral-500 border-neutral-200 myverse-dark:border-white/10 hover:text-neutral-700"
                            }`}
                            title="필터"
                        >
                            <Filter className="h-3 w-3" />
                            {activeFiltersCount > 0 && (
                                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#6366F1] text-white text-[8px] flex items-center justify-center font-semibold">
                                    {activeFiltersCount}
                                </span>
                            )}
                        </button>
                    </div>

                    {showFilters && (
                        <div className="space-y-1.5 pt-1.5 border-t border-neutral-100 myverse-dark:border-white/5">
                            {/* 읽지 않음 토글 + 날짜 범위 */}
                            <div className="flex items-center gap-1.5 flex-wrap">
                                <button
                                    type="button"
                                    onClick={() => setUnreadOnly(v => !v)}
                                    className={`text-[10px] px-1.5 py-0.5 rounded border ${
                                        unreadOnly
                                            ? "bg-[#6366F1]/10 text-[#6366F1] border-[#6366F1]/30"
                                            : "text-neutral-500 border-neutral-200 hover:bg-neutral-50"
                                    }`}
                                >
                                    읽지 않음만
                                </button>
                                {(["all", "today", "week", "month"] as const).map(r => (
                                    <button
                                        key={r}
                                        type="button"
                                        onClick={() => setDateRange(r)}
                                        className={`text-[10px] px-1.5 py-0.5 rounded border ${
                                            dateRange === r
                                                ? "bg-[#6366F1]/10 text-[#6366F1] border-[#6366F1]/30"
                                                : "text-neutral-500 border-neutral-200 hover:bg-neutral-50"
                                        }`}
                                    >
                                        {r === "all" ? "전체기간" : r === "today" ? "오늘" : r === "week" ? "이번주" : "이번달"}
                                    </button>
                                ))}
                            </div>

                            {/* 발신인 — top 8 */}
                            {topSenders.length > 0 && (
                                <div>
                                    <p className="text-[9px] uppercase tracking-widest text-neutral-400 mb-1 flex items-center gap-1">
                                        <UsersIcon className="h-2.5 w-2.5" /> 발신인
                                    </p>
                                    <div className="flex flex-wrap gap-1">
                                        {topSenders.map(s => {
                                            const isActive = senderFilter === s.email;
                                            return (
                                                <button
                                                    key={s.email}
                                                    type="button"
                                                    onClick={() => setSenderFilter(isActive ? null : s.email)}
                                                    className={`text-[10px] px-1.5 py-0.5 rounded border max-w-[140px] truncate ${
                                                        isActive
                                                            ? "bg-[#6366F1]/10 text-[#6366F1] border-[#6366F1]/30"
                                                            : "text-neutral-500 border-neutral-200 hover:bg-neutral-50"
                                                    }`}
                                                    title={`${s.email} (${s.count}건)`}
                                                >
                                                    {s.name || s.email.split("@")[0]} <span className="text-neutral-400">·{s.count}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* 활성 필터 칩 (필터 패널 닫혀 있을 때만 요약 표시) */}
                    {!showFilters && activeFiltersCount > 0 && (
                        <div className="flex items-center gap-1 flex-wrap">
                            {unreadOnly && (
                                <span className="inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded bg-[#6366F1]/10 text-[#6366F1]">
                                    읽지 않음
                                    <button onClick={() => setUnreadOnly(false)} className="hover:text-rose-500"><XIcon className="h-2 w-2" /></button>
                                </span>
                            )}
                            {dateRange !== "all" && (
                                <span className="inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded bg-[#6366F1]/10 text-[#6366F1]">
                                    {dateRange === "today" ? "오늘" : dateRange === "week" ? "이번주" : "이번달"}
                                    <button onClick={() => setDateRange("all")} className="hover:text-rose-500"><XIcon className="h-2 w-2" /></button>
                                </span>
                            )}
                            {senderFilter && (
                                <span className="inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded bg-[#6366F1]/10 text-[#6366F1] max-w-[160px]">
                                    <span className="truncate">{senderFilter}</span>
                                    <button onClick={() => setSenderFilter(null)} className="hover:text-rose-500 shrink-0"><XIcon className="h-2 w-2" /></button>
                                </span>
                            )}
                        </div>
                    )}
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
                                        onClick={() => embedToDaily(selected)}
                                        disabled={embedding}
                                        className="inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] border border-[#6366F1]/30 text-[#6366F1] hover:bg-[#6366F1]/5 disabled:opacity-50 transition-colors"
                                        title="오늘 Daily 노트로 임베드"
                                    >
                                        {embedded ? <Check className="h-3 w-3" /> : embedding ? <Loader2 className="h-3 w-3 animate-spin" /> : <NotebookPen className="h-3 w-3" />}
                                        {embedded ? "임베드됨" : "Daily 임베드"}
                                    </button>
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
