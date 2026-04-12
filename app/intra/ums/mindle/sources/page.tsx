"use client";

import { useState, useEffect } from "react";
import { Rss, RefreshCw, Plus, Check, X, AlertCircle, Clock, ExternalLink, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface RssSource {
    id: string;
    name: string;
    url: string;
    source_type: string;
    category: string;
    brand_filter: string[] | null;
    is_active: boolean;
    last_crawled_at: string | null;
    crawl_interval_hours: number;
    crawl_count: number;
    error_count: number;
    notes: string | null;
    created_at: string;
}

const categoryColors: Record<string, string> = {
    marketing: 'bg-pink-50 text-pink-600',
    startup: 'bg-violet-50 text-violet-600',
    general: 'bg-neutral-100 text-neutral-600',
    'Brand/Marketing': 'bg-amber-50 text-amber-600',
    'Fashion/Lifestyle': 'bg-rose-50 text-rose-600',
    'Agency/Blogs': 'bg-blue-50 text-blue-600',
    'Marketing/Consumer': 'bg-emerald-50 text-emerald-600',
    'Trend/Research': 'bg-indigo-50 text-indigo-600',
};

export default function RssSourcesPage() {
    const [sources, setSources] = useState<RssSource[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAdd, setShowAdd] = useState(false);
    const [newName, setNewName] = useState('');
    const [newUrl, setNewUrl] = useState('');
    const [newCategory, setNewCategory] = useState('general');
    const [addLoading, setAddLoading] = useState(false);

    const loadSources = async () => {
        setLoading(true);
        const supabase = createClient();
        const { data } = await supabase
            .from('mindle_sources')
            .select('*')
            .order('is_active', { ascending: false })
            .order('name');
        if (data) setSources(data as RssSource[]);
        setLoading(false);
    };

    useEffect(() => { loadSources(); }, []);

    const toggleActive = async (id: string, current: boolean) => {
        const supabase = createClient();
        await supabase.from('mindle_sources').update({ is_active: !current }).eq('id', id);
        setSources(prev => prev.map(s => s.id === id ? { ...s, is_active: !current } : s));
    };

    const deleteSource = async (id: string) => {
        if (!confirm('이 RSS 소스를 삭제하시겠습니까?')) return;
        const supabase = createClient();
        await supabase.from('mindle_sources').delete().eq('id', id);
        setSources(prev => prev.filter(s => s.id !== id));
    };

    const addSource = async () => {
        if (!newName.trim() || !newUrl.trim()) return;
        setAddLoading(true);
        const supabase = createClient();
        const { data } = await supabase.from('mindle_sources').insert({
            name: newName.trim(),
            url: newUrl.trim(),
            source_type: 'rss',
            category: newCategory,
            is_active: true,
            crawl_interval_hours: 6,
            crawl_count: 0,
            error_count: 0,
            tenant_id: 'tenone',
        }).select().single();
        if (data) setSources(prev => [...prev, data as RssSource]);
        setNewName(''); setNewUrl(''); setShowAdd(false);
        setAddLoading(false);
    };

    const activeCount = sources.filter(s => s.is_active).length;
    const totalCrawls = sources.reduce((sum, s) => sum + s.crawl_count, 0);

    const timeSince = (dateStr: string | null) => {
        if (!dateStr) return '없음';
        const diff = Date.now() - new Date(dateStr).getTime();
        const hours = Math.floor(diff / 3600000);
        if (hours < 1) return '방금';
        if (hours < 24) return `${hours}시간 전`;
        return `${Math.floor(hours / 24)}일 전`;
    };

    return (
        <div>
            {/* 헤더 */}
            <div className="flex items-center justify-between mb-5">
                <div>
                    <h2 className="text-base font-semibold text-neutral-900">RSS 소스 관리</h2>
                    <p className="text-xs text-neutral-400 mt-0.5">
                        활성 {activeCount}개 / 전체 {sources.length}개 · 총 {totalCrawls.toLocaleString()}회 수집
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => setShowAdd(!showAdd)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-neutral-900 text-white hover:bg-neutral-800 transition-colors">
                        <Plus className="h-3 w-3" /> 소스 추가
                    </button>
                    <button onClick={loadSources} disabled={loading}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-neutral-200 hover:bg-neutral-50 transition-colors">
                        <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {/* 소스 추가 폼 */}
            {showAdd && (
                <div className="mb-4 p-4 border border-neutral-200 bg-neutral-50 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="소스 이름"
                            className="px-3 py-2 text-xs border border-neutral-200 focus:outline-none focus:border-neutral-400" />
                        <input value={newUrl} onChange={e => setNewUrl(e.target.value)} placeholder="RSS URL (https://...)"
                            className="px-3 py-2 text-xs border border-neutral-200 focus:outline-none focus:border-neutral-400" />
                        <select value={newCategory} onChange={e => setNewCategory(e.target.value)}
                            className="px-3 py-2 text-xs border border-neutral-200 focus:outline-none">
                            <option value="general">일반</option>
                            <option value="marketing">마케팅</option>
                            <option value="startup">스타트업</option>
                            <option value="Brand/Marketing">브랜드/마케팅</option>
                            <option value="Fashion/Lifestyle">패션/라이프스타일</option>
                            <option value="Agency/Blogs">에이전시 블로그</option>
                            <option value="Trend/Research">트렌드/리서치</option>
                        </select>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={addSource} disabled={addLoading || !newName.trim() || !newUrl.trim()}
                            className="px-4 py-1.5 text-xs bg-neutral-900 text-white hover:bg-neutral-800 disabled:bg-neutral-300 transition-colors">
                            추가
                        </button>
                        <button onClick={() => setShowAdd(false)} className="px-4 py-1.5 text-xs text-neutral-400 hover:text-neutral-600">
                            취소
                        </button>
                    </div>
                </div>
            )}

            {/* 소스 목록 */}
            <div className="border border-neutral-200">
                {/* 테이블 헤더 */}
                <div className="grid grid-cols-12 gap-2 px-4 py-2 bg-neutral-50 border-b border-neutral-200 text-[10px] text-neutral-400 uppercase tracking-wider font-medium">
                    <div className="col-span-1">상태</div>
                    <div className="col-span-3">소스</div>
                    <div className="col-span-2">카테고리</div>
                    <div className="col-span-2">마지막 수집</div>
                    <div className="col-span-1">수집</div>
                    <div className="col-span-1">오류</div>
                    <div className="col-span-2">관리</div>
                </div>

                {sources.map(src => (
                    <div key={src.id} className="grid grid-cols-12 gap-2 px-4 py-2.5 border-b border-neutral-50 hover:bg-neutral-50 transition-colors items-center">
                        {/* 상태 */}
                        <div className="col-span-1">
                            <button onClick={() => toggleActive(src.id, src.is_active)}
                                className={`h-5 w-5 flex items-center justify-center rounded-full border transition-colors ${
                                    src.is_active
                                        ? 'bg-green-50 border-green-300 text-green-600'
                                        : 'bg-neutral-50 border-neutral-300 text-neutral-400'
                                }`}>
                                {src.is_active ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                            </button>
                        </div>

                        {/* 소스명 + URL */}
                        <div className="col-span-3 min-w-0">
                            <p className="text-xs font-medium text-neutral-800 truncate">{src.name}</p>
                            <a href={src.url} target="_blank" rel="noopener noreferrer"
                                className="text-[10px] text-neutral-400 hover:text-blue-500 truncate flex items-center gap-0.5">
                                {src.url.replace(/^https?:\/\//, '').slice(0, 35)}
                                <ExternalLink className="h-2 w-2 shrink-0" />
                            </a>
                        </div>

                        {/* 카테고리 */}
                        <div className="col-span-2">
                            <span className={`text-[9px] px-1.5 py-0.5 ${categoryColors[src.category] || categoryColors.general}`}>
                                {src.category}
                            </span>
                        </div>

                        {/* 마지막 수집 */}
                        <div className="col-span-2">
                            <span className="text-[11px] text-neutral-500 flex items-center gap-1">
                                <Clock className="h-2.5 w-2.5" />
                                {timeSince(src.last_crawled_at)}
                            </span>
                        </div>

                        {/* 수집 횟수 */}
                        <div className="col-span-1">
                            <span className="text-[11px] text-neutral-500">{src.crawl_count}</span>
                        </div>

                        {/* 오류 */}
                        <div className="col-span-1">
                            {src.error_count > 0 ? (
                                <span className="text-[11px] text-red-500 flex items-center gap-0.5">
                                    <AlertCircle className="h-2.5 w-2.5" /> {src.error_count}
                                </span>
                            ) : (
                                <span className="text-[11px] text-neutral-300">0</span>
                            )}
                        </div>

                        {/* 관리 */}
                        <div className="col-span-2 flex items-center gap-1">
                            {src.notes && (
                                <span className="text-[9px] text-amber-500 truncate max-w-[100px]" title={src.notes}>
                                    {src.notes}
                                </span>
                            )}
                            <button onClick={() => deleteSource(src.id)}
                                className="p-1 text-neutral-300 hover:text-red-500 transition-colors ml-auto">
                                <Trash2 className="h-3 w-3" />
                            </button>
                        </div>
                    </div>
                ))}

                {sources.length === 0 && !loading && (
                    <div className="text-center py-12 text-neutral-400">
                        <Rss className="h-6 w-6 mx-auto mb-2 text-neutral-300" />
                        <p className="text-xs">등록된 RSS 소스가 없습니다</p>
                    </div>
                )}
            </div>
        </div>
    );
}
