"use client";

import { useAuth } from "@/lib/auth-context";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Activity, Database, Zap, TrendingUp, FileText, BarChart3, Settings, Eye, CheckCircle, Clock, AlertCircle, ChevronRight, ChevronDown, RefreshCw, Search, Filter, Sparkles, Play } from "lucide-react";
import Link from "next/link";

interface CollectedDataRow {
    id: string;
    source?: string;
    keyword?: string;
    content?: string;
    url?: string;
    platform?: string;
    collected_at?: string;
    created_at?: string;
}

interface CrawlerStatusRow {
    id: string;
    name: string;
    status: string;
    last_run?: string;
    today_count?: number;
    icon?: string;
}

interface OpportunityRow {
    id: string;
    type?: string;
    title: string;
    brand?: string;
    status: string;
    created_at?: string;
}

interface ContentDraftRow {
    id: string;
    title: string;
    brand?: string;
    format?: string;
    status: string;
}

const draftStatusMap: Record<string, { label: string; color: string }> = {
    draft: { label: "Draft", color: "text-neutral-400 bg-neutral-800" },
    reviewed: { label: "Reviewed", color: "text-[#F5C518] bg-[#F5C518]/10" },
    published: { label: "Published", color: "text-green-400 bg-green-400/10" },
};

const oppStatusMap: Record<string, { label: string; color: string }> = {
    new: { label: "New", color: "text-red-400 bg-red-400/10" },
    reviewed: { label: "Under Review", color: "text-[#F5C518] bg-[#F5C518]/10" },
    acted: { label: "Acted On", color: "text-green-400 bg-green-400/10" },
};

export default function MindleAdminPage() {
    const { isAuthenticated, user } = useAuth();
    const adminEmails = ["cheonil@tenone.biz", "tenone@tenone.biz", "admin@tenone.biz"];
    const isAdmin = user?.role === "Admin" || user?.accountType === "staff" || adminEmails.includes(user?.email || "");

    const [collectedData, setCollectedData] = useState<CollectedDataRow[]>([]);
    const [collectedTodayCount, setCollectedTodayCount] = useState(0);
    const [crawlerStatus, setCrawlerStatus] = useState<CrawlerStatusRow[]>([]);
    const [opportunities, setOpportunities] = useState<OpportunityRow[]>([]);
    const [contentDrafts, setContentDrafts] = useState<ContentDraftRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedRow, setExpandedRow] = useState<string | null>(null);
    const [expandedDraft, setExpandedDraft] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [sourceFilter, setSourceFilter] = useState("all");
    const [topicFilter, setTopicFilter] = useState("all");
    const [crawlRunning, setCrawlRunning] = useState(false);
    const [crawlResult, setCrawlResult] = useState<string | null>(null);
    const [analyzeRunning, setAnalyzeRunning] = useState(false);
    const [analyzeResult, setAnalyzeResult] = useState<string | null>(null);
    const [allCollected, setAllCollected] = useState<CollectedDataRow[]>([]);

    useEffect(() => {
        if (!isAuthenticated || !isAdmin) return;
        fetchData();
    }, [isAuthenticated, isAdmin]);

    async function fetchData() {
        setLoading(true);
        const supabase = createClient();
        const today = new Date().toISOString().split("T")[0];

        const [collectedRes, countRes, crawlerRes, oppRes, draftsRes] = await Promise.all([
            supabase.from("collected_data").select("*").order("collected_at", { ascending: false }).limit(100),
            supabase.from("collected_data").select("id", { count: "exact", head: true }).gte("collected_at", today),
            supabase.from("crawler_status").select("*").order("crawler_name"),
            supabase.from("th_opportunities").select("*").order("detected_at", { ascending: false }).limit(10),
            supabase.from("content_drafts").select("*").order("created_at", { ascending: false }).limit(10),
        ]);

        setAllCollected(collectedRes.data ?? []);
        setCollectedData(collectedRes.data ?? []);
        setCollectedTodayCount(countRes.count ?? 0);
        setCrawlerStatus(crawlerRes.data ?? []);
        setOpportunities(oppRes.data ?? []);
        setContentDrafts(draftsRes.data ?? []);
        setLoading(false);
    }

    if (!isAuthenticated || !isAdmin) {
        return (
            <div className="bg-[#0A0A0A] min-h-[60vh] flex items-center justify-center px-6">
                <div className="text-center">
                    <Settings className="w-12 h-12 text-neutral-700 mx-auto mb-4" />
                    <h2 className="text-white text-xl font-bold mb-2">Admin Only</h2>
                    <p className="text-neutral-400 text-sm">This page is restricted to administrators.</p>
                </div>
            </div>
        );
    }

    const activeCrawlers = crawlerStatus.filter(c => c.status === "active").length;
    const draftCount = contentDrafts.filter(d => d.status === "draft").length;

    // Filter collected data
    const filteredData = allCollected.filter((row: any) => {
        const q = searchQuery.toLowerCase();
        const matchesSearch = !q || (row.title || "").toLowerCase().includes(q)
            || (row.source_name || "").toLowerCase().includes(q)
            || (row.content || "").toLowerCase().includes(q);
        const matchesSource = sourceFilter === "all" || (row.source_type || "") === sourceFilter;
        const matchesTopic = topicFilter === "all" || (row.topic || "") === topicFilter;
        return matchesSearch && matchesSource && matchesTopic;
    });

    const sources = [...new Set(allCollected.map((r: any) => r.source_type).filter(Boolean))];
    const topics = [...new Set(allCollected.map((r: any) => r.topic).filter(Boolean))];

    async function runCrawlNow() {
        setCrawlRunning(true);
        setCrawlResult(null);
        try {
            const res = await fetch("/api/trendhunter/rss");
            const data = await res.json();
            setCrawlResult(`Collected ${data.collected} items from ${data.feeds} feeds${data.errors ? ` (${data.errors.length} errors)` : ""}`);
            fetchData();
        } catch (e: any) {
            setCrawlResult(`Error: ${e.message}`);
        }
        setCrawlRunning(false);
    }

    async function runAnalysis() {
        setAnalyzeRunning(true);
        setAnalyzeResult(null);
        try {
            const res = await fetch("/api/trendhunter/analyze", { method: "POST" });
            const data = await res.json();
            if (data.success) {
                setAnalyzeResult(`Analyzed ${data.analyzed} articles → ${data.draftsCreated} drafts created. Top: ${(data.keywords || []).slice(0, 3).map((k: any) => k.keyword).join(", ")}`);
                fetchData();
            } else {
                setAnalyzeResult(`Error: ${data.error || data.message}`);
            }
        } catch (e: any) {
            setAnalyzeResult(`Error: ${e.message}`);
        }
        setAnalyzeRunning(false);
    }

    return (
        <div className="bg-[#0A0A0A]">
            <section className="py-12 px-6">
                <div className="mx-auto max-w-6xl">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <Settings className="w-5 h-5 text-[#F5C518]" />
                            <h1 className="text-2xl font-bold text-white">Mindle Admin</h1>
                        </div>
                        <button onClick={fetchData} disabled={loading}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-600 transition-colors text-xs">
                            <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} /> Refresh
                        </button>
                    </div>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                        <div className="p-4 rounded-xl border border-neutral-800 bg-neutral-900/50">
                            <Database className="w-4 h-4 text-blue-400 mb-2" />
                            <p className="text-2xl font-bold text-white">{loading ? "..." : collectedTodayCount.toLocaleString()}</p>
                            <p className="text-neutral-500 text-xs">Collected Today</p>
                        </div>
                        <div className="p-4 rounded-xl border border-neutral-800 bg-neutral-900/50">
                            <Zap className="w-4 h-4 text-[#F5C518] mb-2" />
                            <p className="text-2xl font-bold text-white">{loading ? "..." : opportunities.length}</p>
                            <p className="text-neutral-500 text-xs">Opportunities Detected</p>
                        </div>
                        <div className="p-4 rounded-xl border border-neutral-800 bg-neutral-900/50">
                            <FileText className="w-4 h-4 text-green-400 mb-2" />
                            <p className="text-2xl font-bold text-white">{loading ? "..." : draftCount}</p>
                            <p className="text-neutral-500 text-xs">Content Drafts</p>
                        </div>
                        <div className="p-4 rounded-xl border border-neutral-800 bg-neutral-900/50">
                            <Activity className="w-4 h-4 text-purple-400 mb-2" />
                            <p className="text-2xl font-bold text-white">{loading ? "..." : activeCrawlers}</p>
                            <p className="text-neutral-500 text-xs">Active Crawlers</p>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3 mb-6">
                        <button onClick={runCrawlNow} disabled={crawlRunning}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition disabled:opacity-50">
                            <Play className={`w-3.5 h-3.5 ${crawlRunning ? "animate-pulse" : ""}`} />
                            {crawlRunning ? "Crawling..." : "Run Crawl Now"}
                        </button>
                        <button onClick={runAnalysis} disabled={analyzeRunning}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium transition disabled:opacity-50">
                            <Sparkles className={`w-3.5 h-3.5 ${analyzeRunning ? "animate-pulse" : ""}`} />
                            {analyzeRunning ? "Analyzing..." : "Run AI Analysis"}
                        </button>
                        {crawlResult && (
                            <span className="flex items-center text-xs text-neutral-400 bg-neutral-900 px-3 py-2 rounded-lg">
                                {crawlResult}
                            </span>
                        )}
                        {analyzeResult && (
                            <span className="flex items-center text-xs text-purple-300 bg-purple-900/30 px-3 py-2 rounded-lg">
                                {analyzeResult}
                            </span>
                        )}
                    </div>

                    {/* Collected Data Section */}
                    <div className="rounded-2xl border border-neutral-800 bg-neutral-900/30 p-5 mb-6">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
                            <h2 className="text-white font-semibold flex items-center gap-2">
                                <Database className="w-4 h-4 text-blue-400" /> Collected Data
                                <span className="text-neutral-500 text-xs font-normal">({filteredData.length} of {allCollected.length})</span>
                            </h2>
                        </div>
                        {/* Search & Filters */}
                        <div className="flex flex-wrap gap-2 mb-4">
                            <div className="flex items-center gap-2 flex-1 min-w-[200px] px-3 py-1.5 rounded-lg bg-neutral-800 border border-neutral-700">
                                <Search className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                                <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search title, source, content..."
                                    className="bg-transparent text-white text-xs placeholder:text-neutral-600 focus:outline-none w-full" />
                            </div>
                            <select value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value)}
                                className="px-3 py-1.5 rounded-lg bg-neutral-800 border border-neutral-700 text-neutral-300 text-xs focus:outline-none">
                                <option value="all">All Sources</option>
                                {sources.map((s) => <option key={s} value={s}>{s}</option>)}
                            </select>
                            <select value={topicFilter} onChange={(e) => setTopicFilter(e.target.value)}
                                className="px-3 py-1.5 rounded-lg bg-neutral-800 border border-neutral-700 text-neutral-300 text-xs focus:outline-none">
                                <option value="all">All Topics</option>
                                {topics.map((t) => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                        {loading ? (
                            <p className="text-neutral-500 text-sm py-4 text-center">Loading...</p>
                        ) : filteredData.length === 0 ? (
                            <p className="text-neutral-500 text-sm py-4 text-center">No data matches your filters.</p>
                        ) : (
                            <div className="space-y-2 max-h-[500px] overflow-y-auto">
                                {filteredData.slice(0, 50).map((row) => (
                                    <div key={row.id} className="rounded-lg bg-neutral-900/50 border border-neutral-800/30">
                                        <button onClick={() => setExpandedRow(expandedRow === row.id ? null : row.id)}
                                            className="w-full flex items-center justify-between p-3 text-left">
                                            <div className="flex items-center gap-3 min-w-0 flex-1">
                                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 shrink-0">
                                                    {(row as any).source_type || (row as any).platform || "Unknown"}
                                                </span>
                                                <span className="text-white text-sm truncate">{(row as any).title || (row as any).source_name || row.url || row.id}</span>
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0 ml-2">
                                                <span className="text-neutral-600 text-[10px]">
                                                    {row.collected_at || row.created_at ? new Date(row.collected_at || row.created_at!).toLocaleString() : ""}
                                                </span>
                                                {expandedRow === row.id ? <ChevronDown className="w-3 h-3 text-neutral-500" /> : <ChevronRight className="w-3 h-3 text-neutral-500" />}
                                            </div>
                                        </button>
                                        {expandedRow === row.id && (
                                            <div className="px-3 pb-3 border-t border-neutral-800/30 pt-2">
                                                <pre className="text-neutral-400 text-xs whitespace-pre-wrap break-all max-h-48 overflow-y-auto">
                                                    {row.content || JSON.stringify(row, null, 2)}
                                                </pre>
                                                {row.url && (
                                                    <a href={row.url} target="_blank" rel="noopener noreferrer"
                                                        className="text-[#F5C518] text-xs mt-2 inline-block hover:underline">
                                                        Open source link
                                                    </a>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Crawler Status */}
                        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/30 p-5">
                            <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
                                <Activity className="w-4 h-4 text-blue-400" /> Crawler Status
                            </h2>
                            {loading ? (
                                <p className="text-neutral-500 text-sm py-4 text-center">Loading...</p>
                            ) : crawlerStatus.length === 0 ? (
                                <p className="text-neutral-500 text-sm py-4 text-center">No crawlers configured yet.</p>
                            ) : (
                                <div className="space-y-2">
                                    {crawlerStatus.map((c) => (
                                        <div key={c.id} className="flex items-center justify-between p-3 rounded-lg bg-neutral-900/50">
                                            <div className="flex items-center gap-2">
                                                <span>{c.icon || "🔧"}</span>
                                                <div>
                                                    <p className="text-white text-sm">{(c as any).crawler_name || c.name}</p>
                                                    <p className="text-neutral-600 text-[10px]">{(c as any).last_run ? new Date((c as any).last_run).toLocaleString() : "N/A"}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className={`text-xs font-mono ${c.status === "active" ? "text-green-400" : "text-[#F5C518]"}`}>
                                                    {c.status === "active" ? "● Active" : "⏸ Paused"}
                                                </p>
                                                <p className="text-neutral-400 text-xs">{(c as any).last_count ?? 0} items</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Content Workflow */}
                        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/30 p-5">
                            <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
                                <FileText className="w-4 h-4 text-green-400" /> Content Workflow
                            </h2>
                            {loading ? (
                                <p className="text-neutral-500 text-sm py-4 text-center">Loading...</p>
                            ) : contentDrafts.length === 0 ? (
                                <p className="text-neutral-500 text-sm py-4 text-center">No content drafts yet.</p>
                            ) : (
                                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                                    {contentDrafts.map((d: any) => (
                                        <div key={d.id} className="rounded-lg bg-neutral-900/50 border border-neutral-800/30">
                                            <button onClick={() => setExpandedDraft(expandedDraft === d.id ? null : d.id)}
                                                className="w-full flex items-center justify-between p-3 text-left">
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-white text-sm truncate">{d.title}</p>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <span className="text-[10px] text-neutral-500">{d.target_brand || d.brand || "—"}</span>
                                                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-400">{d.target_format || d.format || "—"}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 shrink-0 ml-2">
                                                    <span className={`text-[10px] px-2 py-0.5 rounded ${(draftStatusMap[d.status] || draftStatusMap.draft).color}`}>
                                                        {(draftStatusMap[d.status] || draftStatusMap.draft).label}
                                                    </span>
                                                    {expandedDraft === d.id ? <ChevronDown className="w-3 h-3 text-neutral-500" /> : <ChevronRight className="w-3 h-3 text-neutral-500" />}
                                                </div>
                                            </button>
                                            {expandedDraft === d.id && (
                                                <div className="px-3 pb-3 border-t border-neutral-800/30 pt-2">
                                                    <pre className="text-neutral-300 text-xs whitespace-pre-wrap break-words max-h-60 overflow-y-auto leading-relaxed">
                                                        {d.body || "No content yet."}
                                                    </pre>
                                                    {d.source_data && (
                                                        <div className="flex flex-wrap gap-1 mt-2">
                                                            {(d.source_data.keywords || []).slice(0, 5).map((k: any) => (
                                                                <span key={k.keyword} className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400">
                                                                    {k.keyword} ({k.count})
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Opportunity Radar */}
                    <div className="rounded-2xl border border-neutral-800 bg-neutral-900/30 p-5 mt-6">
                        <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
                            <Zap className="w-4 h-4 text-[#F5C518]" /> Opportunity Radar
                        </h2>
                        {loading ? (
                            <p className="text-neutral-500 text-sm py-4 text-center">Loading...</p>
                        ) : opportunities.length === 0 ? (
                            <p className="text-neutral-500 text-sm py-4 text-center">No opportunities detected yet.</p>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                                {opportunities.map((o) => (
                                    <div key={o.id} className="p-4 rounded-xl bg-neutral-900/50 border border-neutral-800/50">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-[10px] text-[#F5C518]">{o.type || "General"}</span>
                                            <span className={`text-[10px] px-1.5 py-0.5 rounded ${(oppStatusMap[o.status] || oppStatusMap.new).color}`}>
                                                {(oppStatusMap[o.status] || oppStatusMap.new).label}
                                            </span>
                                        </div>
                                        <p className="text-white text-sm font-medium">{o.title}</p>
                                        <div className="flex items-center justify-between mt-2 text-[10px] text-neutral-500">
                                            <span>{o.brand ? `→ ${o.brand}` : ""}</span>
                                            <span>{o.created_at ? new Date(o.created_at).toLocaleDateString() : ""}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
}
