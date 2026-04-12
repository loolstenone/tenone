"use client";

import { useState, useEffect } from "react";
import { ArrowRight, Check, Clock, Edit3, Eye, Send, Trash2, Filter } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface TrendItem {
    id: string;
    title: string;
    summary: string;
    category: string;
    source_urls: string[];
    status: string;
    relevance_score: number;
    published_at: string;
    created_at: string;
}

type PipelineStage = 'collected' | 'reviewed' | 'approved' | 'published' | 'rejected';

const stages: { key: PipelineStage; label: string; icon: React.ElementType; color: string }[] = [
    { key: 'collected', label: '수집됨', icon: Clock, color: 'bg-neutral-100 text-neutral-600' },
    { key: 'reviewed',  label: '검토 중', icon: Eye, color: 'bg-blue-50 text-blue-600' },
    { key: 'approved',  label: '승인됨', icon: Check, color: 'bg-emerald-50 text-emerald-600' },
    { key: 'published', label: '발행됨', icon: Send, color: 'bg-violet-50 text-violet-600' },
];

const categoryLabels: Record<string, string> = {
    tech: 'AI / 테크',
    trend_market: '트렌드',
    business_corporate: '비즈니스',
    talent_career: '인재/커리어',
    creator_trend: '크리에이터',
    marketing: '마케팅',
};

export default function MindlePipelinePage() {
    const [items, setItems] = useState<TrendItem[]>([]);
    const [activeStage, setActiveStage] = useState<PipelineStage>('collected');
    const [loading, setLoading] = useState(true);
    const [counts, setCounts] = useState<Record<string, number>>({});

    useEffect(() => {
        loadItems();
    }, []);

    const loadItems = async () => {
        setLoading(true);
        const supabase = createClient();

        // 전체 건수 (status별)
        const { data: allData } = await supabase
            .from('mindle_trends')
            .select('id, status');

        if (allData) {
            const c: Record<string, number> = {};
            allData.forEach((d: { id: string; status?: string }) => {
                const s = (d as { status?: string }).status || 'collected';
                c[s] = (c[s] || 0) + 1;
            });
            // status가 'published'인 것은 기존 DB에서 이미 발행된 상태
            // status가 없으면 'collected'로 간주
            setCounts(c);
        }

        // 현재 스테이지 아이템
        const { data } = await supabase
            .from('mindle_trends')
            .select('*')
            .eq('status', activeStage === 'collected' ? 'published' : activeStage)
            .order('relevance_score', { ascending: false })
            .limit(50);

        if (data) setItems(data as TrendItem[]);
        setLoading(false);
    };

    useEffect(() => { loadItems(); }, [activeStage]);

    const updateStatus = async (id: string, newStatus: string) => {
        const supabase = createClient();
        await supabase.from('mindle_trends').update({ status: newStatus }).eq('id', id);
        setItems(prev => prev.filter(i => i.id !== id));
        setCounts(prev => ({
            ...prev,
            [activeStage]: (prev[activeStage] || 1) - 1,
            [newStatus]: (prev[newStatus] || 0) + 1,
        }));
    };

    // 현재 DB에는 status='published'만 있으므로 collected로 매핑
    const displayItems = items;
    const totalCollected = counts['published'] || 0;

    return (
        <div>
            {/* 헤더 */}
            <div className="mb-5">
                <h2 className="text-base font-semibold text-neutral-900">콘텐츠 파이프라인</h2>
                <p className="text-xs text-neutral-400 mt-0.5">수집 → 검토 → 승인 → 발행 채널 선택</p>
            </div>

            {/* 파이프라인 스테이지 탭 */}
            <div className="flex items-center gap-1 mb-5 pb-4 border-b border-neutral-100">
                {stages.map((stage, idx) => (
                    <div key={stage.key} className="flex items-center">
                        <button
                            onClick={() => setActiveStage(stage.key)}
                            className={`flex items-center gap-1.5 px-3 py-2 text-[11px] font-medium transition-colors ${
                                activeStage === stage.key
                                    ? 'bg-neutral-900 text-white'
                                    : 'text-neutral-400 hover:text-neutral-700 hover:bg-neutral-50'
                            }`}
                        >
                            <stage.icon className="h-3 w-3" />
                            {stage.label}
                            <span className={`px-1.5 py-0.5 text-[9px] rounded-full ${
                                activeStage === stage.key ? 'bg-white/20' : 'bg-neutral-100'
                            }`}>
                                {stage.key === 'collected' ? totalCollected : (counts[stage.key] || 0)}
                            </span>
                        </button>
                        {idx < stages.length - 1 && (
                            <ArrowRight className="h-3 w-3 text-neutral-200 mx-1" />
                        )}
                    </div>
                ))}
            </div>

            {/* 아이템 목록 */}
            <div className="space-y-2">
                {displayItems.map(item => (
                    <div key={item.id} className="flex items-start gap-3 p-3 border border-neutral-100 hover:border-neutral-200 transition-colors">
                        {/* 점수 */}
                        <div className="w-10 h-10 flex items-center justify-center bg-neutral-50 shrink-0">
                            <span className="text-sm font-bold text-neutral-700">
                                {item.relevance_score?.toFixed(0) || '-'}
                            </span>
                        </div>

                        {/* 내용 */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-[9px] px-1.5 py-0.5 bg-neutral-100 text-neutral-500">
                                    {categoryLabels[item.category] || item.category}
                                </span>
                                <span className="text-[10px] text-neutral-300">
                                    {item.published_at?.slice(5, 10).replace('-', '.')}
                                </span>
                            </div>
                            <h4 className="text-xs font-medium text-neutral-800 mb-1 line-clamp-1">{item.title}</h4>
                            <p className="text-[11px] text-neutral-400 line-clamp-1">{item.summary}</p>
                        </div>

                        {/* 액션 버튼 */}
                        <div className="flex items-center gap-1 shrink-0">
                            {activeStage === 'collected' && (
                                <>
                                    <button onClick={() => updateStatus(item.id, 'reviewed')}
                                        className="px-2 py-1 text-[10px] text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors"
                                        title="검토 시작">
                                        <Eye className="h-3 w-3" />
                                    </button>
                                    <button onClick={() => updateStatus(item.id, 'rejected')}
                                        className="px-2 py-1 text-[10px] text-neutral-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                                        title="제외">
                                        <Trash2 className="h-3 w-3" />
                                    </button>
                                </>
                            )}
                            {activeStage === 'reviewed' && (
                                <>
                                    <button onClick={() => updateStatus(item.id, 'approved')}
                                        className="px-2.5 py-1 text-[10px] font-medium text-emerald-600 bg-emerald-50 hover:bg-emerald-100 transition-colors">
                                        승인
                                    </button>
                                    <button onClick={() => updateStatus(item.id, 'collected')}
                                        className="px-2 py-1 text-[10px] text-neutral-400 hover:bg-neutral-100 transition-colors">
                                        반려
                                    </button>
                                </>
                            )}
                            {activeStage === 'approved' && (
                                <button onClick={() => updateStatus(item.id, 'published')}
                                    className="px-2.5 py-1 text-[10px] font-medium text-violet-600 bg-violet-50 hover:bg-violet-100 transition-colors flex items-center gap-1">
                                    <Send className="h-2.5 w-2.5" /> 발행
                                </button>
                            )}
                            {activeStage === 'published' && (
                                <span className="text-[10px] text-neutral-300">발행 완료</span>
                            )}
                        </div>
                    </div>
                ))}

                {displayItems.length === 0 && !loading && (
                    <div className="text-center py-12 text-neutral-400">
                        <p className="text-xs">이 단계에 아이템이 없습니다</p>
                    </div>
                )}

                {loading && (
                    <div className="text-center py-8 text-neutral-300">
                        <p className="text-xs">로딩 중...</p>
                    </div>
                )}
            </div>
        </div>
    );
}
