"use client";

import { useState } from "react";
import {
    Plus, Search, Filter, ExternalLink, Calendar, DollarSign, MapPin,
    ChevronRight, X, Clock, CheckCircle2, XCircle, Eye, TrendingUp,
    Globe, Briefcase, Award, Users, ArrowRight, Tag,
} from "lucide-react";
import clsx from "clsx";

type OpportunitySource = 'narjangter' | 'competition' | 'government' | 'referral' | 'website' | 'openchat' | 'other';
type OpportunityStatus = 'new' | 'reviewing' | 'bidding' | 'won' | 'lost' | 'expired';

interface Opportunity {
    id: string;
    title: string;
    source: OpportunitySource;
    sourceUrl?: string;
    description?: string;
    budgetMin?: number;
    budgetMax?: number;
    deadline?: string;
    region?: string;
    category?: string;
    tags: string[];
    status: OpportunityStatus;
    assignedTo?: string;
    relevanceScore?: number;
    contactName?: string;
    contactEmail?: string;
    createdAt: string;
}

const sourceLabels: Record<OpportunitySource, { label: string; icon: typeof Globe; color: string }> = {
    narjangter: { label: '나라장터', icon: Briefcase, color: 'bg-blue-50 text-blue-600' },
    competition: { label: '공모전', icon: Award, color: 'bg-purple-50 text-purple-600' },
    government: { label: '지원사업', icon: Globe, color: 'bg-green-50 text-green-600' },
    referral: { label: '소개/의뢰', icon: Users, color: 'bg-amber-50 text-amber-600' },
    website: { label: '웹사이트', icon: Globe, color: 'bg-cyan-50 text-cyan-600' },
    openchat: { label: '오픈채팅', icon: Users, color: 'bg-pink-50 text-pink-600' },
    other: { label: '기타', icon: Tag, color: 'bg-neutral-100 text-neutral-500' },
};

const statusConfig: Record<OpportunityStatus, { label: string; color: string; bg: string }> = {
    new: { label: '신규', color: 'text-blue-600', bg: 'bg-blue-50' },
    reviewing: { label: '검토중', color: 'text-amber-600', bg: 'bg-amber-50' },
    bidding: { label: '입찰중', color: 'text-violet-600', bg: 'bg-violet-50' },
    won: { label: '수주', color: 'text-green-600', bg: 'bg-green-50' },
    lost: { label: '실패', color: 'text-neutral-400', bg: 'bg-neutral-100' },
    expired: { label: '만료', color: 'text-neutral-400', bg: 'bg-neutral-50' },
};

const mockData: Opportunity[] = [
    {
        id: 'opp-1', title: '2026 충남 청년 마케팅 지원사업 (마케팅 컨설팅)', source: 'government',
        description: '충남 소재 청년 창업기업 대상 마케팅 컨설팅 및 콘텐츠 제작 지원. 총 20개사 선정.',
        budgetMin: 50000000, budgetMax: 80000000, deadline: '2026-04-15', region: '충남',
        category: '마케팅 컨설팅', tags: ['청년', '마케팅', '컨설팅'], status: 'reviewing',
        assignedTo: 'Sarah Kim', relevanceScore: 0.92, createdAt: '2026-03-18',
    },
    {
        id: 'opp-2', title: '제12회 대학생 광고 공모전 (한국관광공사)', source: 'competition',
        description: '한국관광공사 주최 대학생 광고 공모전. MADLeague 팀 참가 가능.',
        budgetMin: 5000000, deadline: '2026-05-31', category: '광고/공모전',
        tags: ['공모전', '광고', '관광'], status: 'new', relevanceScore: 0.85, createdAt: '2026-03-20',
    },
    {
        id: 'opp-3', title: 'CJ ENM 브랜드 콘텐츠 제작 RFP', source: 'referral',
        description: 'CJ ENM 산하 브랜드 SNS 콘텐츠 제작 및 운영 대행. 6개월 계약.',
        budgetMin: 120000000, budgetMax: 150000000, deadline: '2026-04-05',
        category: '콘텐츠 제작', tags: ['CJ', '콘텐츠', 'SNS'], status: 'bidding',
        assignedTo: 'Cheonil Jeon', relevanceScore: 0.95, contactName: '박PD', contactEmail: 'pd@cjenm.com',
        createdAt: '2026-03-15',
    },
    {
        id: 'opp-4', title: '나라장터 - 서울시 디지털 마케팅 교육 용역', source: 'narjangter',
        sourceUrl: 'https://www.g2b.go.kr', description: '서울시 소상공인 대상 디지털 마케팅 교육 프로그램 기획·운영.',
        budgetMin: 200000000, budgetMax: 200000000, deadline: '2026-03-28', region: '서울',
        category: '교육 용역', tags: ['나라장터', '교육', '서울시'], status: 'reviewing',
        assignedTo: 'Sarah Kim', relevanceScore: 0.78, createdAt: '2026-03-12',
    },
    {
        id: 'opp-5', title: '스타트업 A사 브랜딩 프로젝트 의뢰', source: 'website',
        description: 'tenone.biz Contact 폼으로 접수. AI 서비스 브랜딩 + 런칭 마케팅.',
        budgetMin: 30000000, budgetMax: 50000000, category: '브랜딩',
        tags: ['브랜딩', 'AI', '스타트업'], status: 'new', contactName: '김대표', contactEmail: 'ceo@startup-a.com',
        relevanceScore: 0.88, createdAt: '2026-03-21',
    },
    {
        id: 'opp-6', title: '영양군 인사이트 투어링 시즌2', source: 'referral',
        description: '영양군 지역 활성화 프로젝트. MADLeague 인사이트 투어링 후속.',
        budgetMin: 40000000, deadline: '2026-06-30', region: '영양',
        category: '지역 활성화', tags: ['지자체', '투어링', 'MADLeague'], status: 'won',
        assignedTo: 'Cheonil Jeon', relevanceScore: 0.97, createdAt: '2026-03-01',
    },
    {
        id: 'opp-7', title: '패션위크 네트워크 스폰서십 제안', source: 'openchat',
        description: '업계 오픈채팅방에서 발견. FWN 브랜드와 시너지 가능.',
        budgetMin: 20000000, category: '스폰서십', tags: ['패션', 'FWN', '스폰서'],
        status: 'lost', relevanceScore: 0.45, createdAt: '2026-02-20',
    },
];

function formatBudget(min?: number, max?: number) {
    const fmt = (n: number) => {
        if (n >= 100000000) return `${(n / 100000000).toFixed(1)}억`;
        if (n >= 10000) return `${(n / 10000).toLocaleString()}만`;
        return n.toLocaleString();
    };
    if (!min && !max) return '-';
    if (min && max && min !== max) return `${fmt(min)} ~ ${fmt(max)}원`;
    return `${fmt(min || max || 0)}원`;
}

function ScoreBadge({ score }: { score?: number }) {
    if (score === undefined) return null;
    const pct = Math.round(score * 100);
    const color = pct >= 80 ? 'text-green-600 bg-green-50' : pct >= 60 ? 'text-amber-600 bg-amber-50' : 'text-neutral-400 bg-neutral-100';
    return <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${color}`}>AI {pct}%</span>;
}

type ViewMode = 'pipeline' | 'list';
type TabKey = 'all' | 'new' | 'reviewing' | 'bidding' | 'won' | 'lost';

export default function OpportunityPage() {
    const [data] = useState(mockData);
    const [viewMode, setViewMode] = useState<ViewMode>('pipeline');
    const [activeTab, setActiveTab] = useState<TabKey>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [sourceFilter, setSourceFilter] = useState<OpportunitySource | 'all'>('all');
    const [selectedOpp, setSelectedOpp] = useState<Opportunity | null>(null);
    const [showAdd, setShowAdd] = useState(false);

    const filtered = data.filter(o => {
        if (activeTab !== 'all' && o.status !== activeTab) return false;
        if (sourceFilter !== 'all' && o.source !== sourceFilter) return false;
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            return o.title.toLowerCase().includes(q) || o.tags.some(t => t.toLowerCase().includes(q));
        }
        return true;
    });

    const pipelineStatuses: OpportunityStatus[] = ['new', 'reviewing', 'bidding', 'won'];
    const countByStatus = (s: OpportunityStatus) => data.filter(o => o.status === s).length;
    const totalBudget = data.filter(o => o.status === 'won').reduce((sum, o) => sum + (o.budgetMin || 0), 0);

    const tabs: { key: TabKey; label: string; count: number }[] = [
        { key: 'all', label: '전체', count: data.length },
        { key: 'new', label: '신규', count: countByStatus('new') },
        { key: 'reviewing', label: '검토중', count: countByStatus('reviewing') },
        { key: 'bidding', label: '입찰중', count: countByStatus('bidding') },
        { key: 'won', label: '수주', count: countByStatus('won') },
        { key: 'lost', label: '실패/만료', count: countByStatus('lost') + countByStatus('expired') },
    ];

    return (
        <div className="max-w-6xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-xl font-bold">Opportunity</h1>
                    <p className="text-xs text-neutral-400 mt-0.5">기회 수집 · 파이프라인 · 프로젝트 전환</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex border border-neutral-200 rounded overflow-hidden">
                        <button onClick={() => setViewMode('pipeline')}
                            className={clsx("px-3 py-1.5 text-xs", viewMode === 'pipeline' ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-500')}>
                            파이프라인
                        </button>
                        <button onClick={() => setViewMode('list')}
                            className={clsx("px-3 py-1.5 text-xs", viewMode === 'list' ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-500')}>
                            리스트
                        </button>
                    </div>
                    <button onClick={() => setShowAdd(true)}
                        className="flex items-center gap-1.5 px-4 py-2 text-sm bg-neutral-900 text-white hover:bg-neutral-800">
                        <Plus className="h-4 w-4" /> 기회 등록
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-5 gap-3 mb-5">
                <div className="border border-neutral-200 bg-white p-3.5">
                    <p className="text-xs text-neutral-400 mb-1">전체 기회</p>
                    <p className="text-xl font-bold">{data.length}<span className="text-xs font-normal text-neutral-400 ml-1">건</span></p>
                </div>
                <div className="border border-neutral-200 bg-white p-3.5">
                    <p className="text-xs text-neutral-400 mb-1">검토 + 입찰</p>
                    <p className="text-xl font-bold text-amber-600">{countByStatus('reviewing') + countByStatus('bidding')}<span className="text-xs font-normal text-neutral-400 ml-1">건</span></p>
                </div>
                <div className="border border-neutral-200 bg-white p-3.5">
                    <p className="text-xs text-neutral-400 mb-1">수주</p>
                    <p className="text-xl font-bold text-green-600">{countByStatus('won')}<span className="text-xs font-normal text-neutral-400 ml-1">건</span></p>
                </div>
                <div className="border border-neutral-200 bg-white p-3.5">
                    <p className="text-xs text-neutral-400 mb-1">수주 금액</p>
                    <p className="text-xl font-bold">{formatBudget(totalBudget)}</p>
                </div>
                <div className="border border-neutral-200 bg-white p-3.5">
                    <p className="text-xs text-neutral-400 mb-1">전환율</p>
                    <p className="text-xl font-bold">{data.length > 0 ? Math.round(countByStatus('won') / data.length * 100) : 0}<span className="text-xs font-normal text-neutral-400 ml-1">%</span></p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3 mb-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-300" />
                    <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="기회 검색..."
                        className="w-full pl-9 pr-4 py-2 text-sm border border-neutral-200 rounded focus:outline-none focus:border-neutral-400" />
                </div>
                <select value={sourceFilter} onChange={e => setSourceFilter(e.target.value as OpportunitySource | 'all')}
                    className="px-3 py-2 text-sm border border-neutral-200 rounded focus:outline-none bg-white">
                    <option value="all">전체 소스</option>
                    {Object.entries(sourceLabels).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
            </div>

            {/* Pipeline View */}
            {viewMode === 'pipeline' && (
                <div className="grid grid-cols-4 gap-3">
                    {pipelineStatuses.map(status => {
                        const cfg = statusConfig[status];
                        const items = data.filter(o => o.status === status);
                        return (
                            <div key={status} className="min-h-[300px]">
                                <div className={`px-3 py-2 rounded-t ${cfg.bg} flex items-center justify-between`}>
                                    <span className={`text-xs font-semibold ${cfg.color}`}>{cfg.label}</span>
                                    <span className={`text-xs ${cfg.color}`}>{items.length}</span>
                                </div>
                                <div className="border border-t-0 border-neutral-200 rounded-b bg-neutral-50 p-2 space-y-2 min-h-[250px]">
                                    {items.map(opp => (
                                        <button key={opp.id} onClick={() => setSelectedOpp(opp)}
                                            className="w-full text-left bg-white border border-neutral-200 rounded p-3 hover:border-neutral-300 transition-colors">
                                            <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                                                <span className={`text-[10px] px-1.5 py-0.5 rounded ${sourceLabels[opp.source].color}`}>
                                                    {sourceLabels[opp.source].label}
                                                </span>
                                                <ScoreBadge score={opp.relevanceScore} />
                                            </div>
                                            <p className="text-xs font-medium text-neutral-800 mb-1.5 line-clamp-2">{opp.title}</p>
                                            <div className="flex items-center gap-2 text-[10px] text-neutral-400">
                                                {opp.budgetMin && <span className="flex items-center gap-0.5"><DollarSign className="h-2.5 w-2.5" />{formatBudget(opp.budgetMin, opp.budgetMax)}</span>}
                                                {opp.deadline && <span className="flex items-center gap-0.5"><Calendar className="h-2.5 w-2.5" />{opp.deadline}</span>}
                                            </div>
                                            {opp.assignedTo && <p className="text-[10px] text-neutral-400 mt-1.5">담당: {opp.assignedTo}</p>}
                                        </button>
                                    ))}
                                    {items.length === 0 && <p className="text-xs text-neutral-300 text-center py-8">없음</p>}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* List View */}
            {viewMode === 'list' && (
                <>
                    <div className="flex gap-1 mb-4 bg-neutral-100 rounded p-1">
                        {tabs.map(t => (
                            <button key={t.key} onClick={() => setActiveTab(t.key)}
                                className={clsx("flex-1 rounded px-2 py-1.5 text-xs font-medium transition-colors",
                                    activeTab === t.key ? "bg-white text-neutral-800 shadow-sm" : "text-neutral-500")}>
                                {t.label} <span className="ml-1 text-[10px] text-neutral-400">({t.count})</span>
                            </button>
                        ))}
                    </div>
                    <div className="border border-neutral-200 bg-white">
                        <div className="grid grid-cols-[1fr_100px_120px_100px_80px_80px] px-4 py-2.5 text-xs font-medium text-neutral-400 border-b border-neutral-200 bg-neutral-50">
                            <span>기회</span><span>소스</span><span>예산</span><span>마감</span><span>AI 점수</span><span>상태</span>
                        </div>
                        {filtered.length === 0 ? (
                            <div className="px-4 py-12 text-center text-sm text-neutral-400">기회가 없습니다.</div>
                        ) : filtered.map(opp => (
                            <button key={opp.id} onClick={() => setSelectedOpp(opp)}
                                className="w-full grid grid-cols-[1fr_100px_120px_100px_80px_80px] px-4 py-3 border-b border-neutral-50 items-center hover:bg-neutral-50 transition-colors text-left">
                                <div>
                                    <p className="text-sm font-medium text-neutral-800 truncate">{opp.title}</p>
                                    <div className="flex gap-1 mt-0.5">
                                        {opp.tags.slice(0, 3).map(t => <span key={t} className="text-[10px] px-1 py-0.5 bg-neutral-100 text-neutral-400 rounded">{t}</span>)}
                                    </div>
                                </div>
                                <span className={`text-[10px] px-1.5 py-0.5 rounded w-fit ${sourceLabels[opp.source].color}`}>{sourceLabels[opp.source].label}</span>
                                <span className="text-xs text-neutral-600">{formatBudget(opp.budgetMin, opp.budgetMax)}</span>
                                <span className="text-xs text-neutral-400">{opp.deadline || '-'}</span>
                                <ScoreBadge score={opp.relevanceScore} />
                                <span className={`text-[10px] px-1.5 py-0.5 rounded w-fit ${statusConfig[opp.status].bg} ${statusConfig[opp.status].color}`}>{statusConfig[opp.status].label}</span>
                            </button>
                        ))}
                    </div>
                </>
            )}

            {/* Detail Modal */}
            {selectedOpp && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="bg-white w-full max-w-lg mx-4 shadow-xl rounded max-h-[80vh] overflow-y-auto">
                        <div className="p-5 border-b border-neutral-100 flex items-start justify-between">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className={`text-xs px-2 py-0.5 rounded ${sourceLabels[selectedOpp.source].color}`}>{sourceLabels[selectedOpp.source].label}</span>
                                    <span className={`text-xs px-2 py-0.5 rounded ${statusConfig[selectedOpp.status].bg} ${statusConfig[selectedOpp.status].color}`}>{statusConfig[selectedOpp.status].label}</span>
                                    <ScoreBadge score={selectedOpp.relevanceScore} />
                                </div>
                                <h2 className="text-sm font-bold text-neutral-900">{selectedOpp.title}</h2>
                            </div>
                            <button onClick={() => setSelectedOpp(null)} className="text-neutral-400 hover:text-neutral-700 p-1">
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                        <div className="p-5 space-y-4">
                            {selectedOpp.description && (
                                <div>
                                    <p className="text-xs font-medium text-neutral-500 mb-1">설명</p>
                                    <p className="text-sm text-neutral-700">{selectedOpp.description}</p>
                                </div>
                            )}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs font-medium text-neutral-500 mb-1">예산</p>
                                    <p className="text-sm font-semibold">{formatBudget(selectedOpp.budgetMin, selectedOpp.budgetMax)}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-neutral-500 mb-1">마감일</p>
                                    <p className="text-sm">{selectedOpp.deadline || '미정'}</p>
                                </div>
                                {selectedOpp.region && (
                                    <div>
                                        <p className="text-xs font-medium text-neutral-500 mb-1">지역</p>
                                        <p className="text-sm flex items-center gap-1"><MapPin className="h-3 w-3" />{selectedOpp.region}</p>
                                    </div>
                                )}
                                {selectedOpp.assignedTo && (
                                    <div>
                                        <p className="text-xs font-medium text-neutral-500 mb-1">담당자</p>
                                        <p className="text-sm">{selectedOpp.assignedTo}</p>
                                    </div>
                                )}
                            </div>
                            {selectedOpp.contactName && (
                                <div>
                                    <p className="text-xs font-medium text-neutral-500 mb-1">연락처</p>
                                    <p className="text-sm">{selectedOpp.contactName} {selectedOpp.contactEmail && `(${selectedOpp.contactEmail})`}</p>
                                </div>
                            )}
                            {selectedOpp.tags.length > 0 && (
                                <div className="flex gap-1.5 flex-wrap">
                                    {selectedOpp.tags.map(t => <span key={t} className="text-xs px-2 py-0.5 bg-neutral-100 text-neutral-500 rounded">{t}</span>)}
                                </div>
                            )}
                            {selectedOpp.sourceUrl && (
                                <a href={selectedOpp.sourceUrl} target="_blank" rel="noopener noreferrer"
                                    className="flex items-center gap-1 text-xs text-blue-600 hover:underline">
                                    <ExternalLink className="h-3 w-3" /> 원본 링크
                                </a>
                            )}
                        </div>
                        <div className="p-5 border-t border-neutral-100 flex justify-between">
                            <div className="flex gap-2">
                                {selectedOpp.status !== 'won' && selectedOpp.status !== 'lost' && (
                                    <>
                                        <button className="px-3 py-1.5 text-xs bg-green-50 text-green-600 rounded hover:bg-green-100 flex items-center gap-1">
                                            <CheckCircle2 className="h-3 w-3" /> 수주
                                        </button>
                                        <button className="px-3 py-1.5 text-xs bg-red-50 text-red-500 rounded hover:bg-red-100 flex items-center gap-1">
                                            <XCircle className="h-3 w-3" /> 실패
                                        </button>
                                    </>
                                )}
                            </div>
                            {selectedOpp.status === 'won' && !selectedOpp.category?.includes('전환') && (
                                <button className="px-4 py-2 text-xs bg-neutral-900 text-white hover:bg-neutral-800 flex items-center gap-1">
                                    <ArrowRight className="h-3 w-3" /> 프로젝트 전환
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Add Modal (간단 버전) */}
            {showAdd && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="bg-white w-full max-w-lg mx-4 shadow-xl rounded">
                        <div className="p-5 border-b border-neutral-100 flex items-center justify-between">
                            <h2 className="text-sm font-bold">기회 등록</h2>
                            <button onClick={() => setShowAdd(false)}><X className="h-4 w-4 text-neutral-400" /></button>
                        </div>
                        <div className="p-5 space-y-3">
                            <div>
                                <label className="block text-xs text-neutral-500 mb-1">제목 *</label>
                                <input className="w-full border border-neutral-200 px-3 py-2 text-sm rounded focus:outline-none focus:border-neutral-400" placeholder="기회 제목" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs text-neutral-500 mb-1">소스 *</label>
                                    <select className="w-full border border-neutral-200 px-3 py-2 text-sm rounded focus:outline-none bg-white">
                                        {Object.entries(sourceLabels).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs text-neutral-500 mb-1">마감일</label>
                                    <input type="date" className="w-full border border-neutral-200 px-3 py-2 text-sm rounded focus:outline-none" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs text-neutral-500 mb-1">예산 (최소)</label>
                                    <input type="number" className="w-full border border-neutral-200 px-3 py-2 text-sm rounded focus:outline-none" placeholder="원" />
                                </div>
                                <div>
                                    <label className="block text-xs text-neutral-500 mb-1">예산 (최대)</label>
                                    <input type="number" className="w-full border border-neutral-200 px-3 py-2 text-sm rounded focus:outline-none" placeholder="원" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs text-neutral-500 mb-1">설명</label>
                                <textarea rows={3} className="w-full border border-neutral-200 px-3 py-2 text-sm rounded focus:outline-none resize-none" />
                            </div>
                            <div>
                                <label className="block text-xs text-neutral-500 mb-1">원본 링크</label>
                                <input className="w-full border border-neutral-200 px-3 py-2 text-sm rounded focus:outline-none" placeholder="https://" />
                            </div>
                        </div>
                        <div className="p-5 border-t border-neutral-100 flex justify-end gap-2">
                            <button onClick={() => setShowAdd(false)} className="px-4 py-2 text-sm text-neutral-500">취소</button>
                            <button onClick={() => setShowAdd(false)} className="px-4 py-2 text-sm bg-neutral-900 text-white hover:bg-neutral-800">등록</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
