'use client';

import { useState } from 'react';
import Link from 'next/link';
import PageTopBar from '@/components/smarcomm/PageTopBar';
import GuideHelpButton from '@/components/smarcomm/GuideHelpButton';
import {
  FileText, Sparkles, Search, RefreshCw, Plus, Filter,
} from 'lucide-react';
import { getChartColors } from '@/lib/smarcomm/chart-palette';
import BarChart from '@/components/smarcomm/charts/BarChart';
import NextStepCTA from '@/components/smarcomm/NextStepCTA';
import { useWorkflow } from '@/lib/smarcomm/workflow-context';
import { PipelineStage } from '@/types/workflow';
import { workflowChannels } from '@/lib/smarcomm/workflow-data';

type MainTab = 'content' | 'pipeline';

// ── Mock: 콘텐츠 현황 ──
const CONTENT_STATS = {
  totalPosts: 26,
  published: 22,
  drafts: 4,
  avgReadTime: 5.4,
  totalViews: 18400,
  topCategory: 'GEO/SEO',
};

const CONTENT_SEO_SCORES = [
  { title: 'GEO란? AI 검색 시대의 새로운 SEO', score: 92, status: 'optimized', views: 4200, category: 'GEO/SEO' },
  { title: 'ROAS 200% 달성한 소상공인 사례', score: 88, status: 'optimized', views: 3800, category: '사례' },
  { title: '마케터가 꼭 봐야 할 KPI 5가지', score: 85, status: 'optimized', views: 2900, category: '그로스' },
  { title: '클릭률 높은 광고 카피 작성법', score: 78, status: 'good', views: 2100, category: '소재' },
  { title: '전환율 10배 높이기 3단계', score: 72, status: 'good', views: 1800, category: '그로스' },
  { title: '카카오 알림톡 마케팅 가이드', score: 65, status: 'needs_work', views: 1200, category: 'CRM' },
  { title: '데이터 기반 마케팅 입문', score: 58, status: 'needs_work', views: 680, category: '트렌드' },
];

const AI_TOPICS = [
  { topic: 'AI 검색에서 브랜드를 노출시키는 5가지 방법', funnelStage: 'Awareness', difficulty: 'easy', searchVolume: '월 3,200', keyword: 'AI 검색 노출' },
  { topic: '네이버 SA 품질지수 높이는 실전 가이드', funnelStage: 'Interest', difficulty: 'medium', searchVolume: '월 2,800', keyword: '네이버 품질지수' },
  { topic: '랜딩 페이지 전환율 최적화 체크리스트', funnelStage: 'Consideration', difficulty: 'easy', searchVolume: '월 1,900', keyword: '랜딩 전환율' },
  { topic: '카카오 알림톡 자동화로 재구매율 2배', funnelStage: 'Retention', difficulty: 'medium', searchVolume: '월 1,400', keyword: '카카오 자동화' },
  { topic: '고객 리뷰를 마케팅 자산으로 활용하는 법', funnelStage: 'Advocacy', difficulty: 'easy', searchVolume: '월 980', keyword: '리뷰 마케팅' },
];

const RECYCLE_SUGGESTIONS = [
  { original: 'GEO란? AI 검색 시대의 새로운 SEO', channels: ['인스타그램 캐러셀', '이메일 뉴스레터', '카카오 친구톡', '유튜브 숏츠'] },
  { original: 'ROAS 200% 달성한 소상공인 사례', channels: ['블로그 시리즈 3편', '인스타그램 릴스', '이메일 드립', 'LinkedIn 포스트'] },
  { original: '마케터가 꼭 봐야 할 KPI 5가지', channels: ['인포그래픽', '이메일 시리즈', '슬라이드 카드', '트위터 스레드'] },
];

const FUNNEL_COLORS: Record<string, string> = { Awareness: '#3B82F6', Interest: '#8B5CF6', Consideration: '#F59E0B', Purchase: '#10B981', Retention: '#F97316', Advocacy: '#EC4899' };

const stages: { key: PipelineStage; label: string }[] = [
  { key: 'Idea', label: '아이디어' }, { key: 'Scripting', label: '기획' }, { key: 'Production', label: '제작' },
  { key: 'Review', label: '리뷰' }, { key: 'Scheduled', label: '예약' }, { key: 'Published', label: '발행' },
];

export default function ContentPage() {
  const [mainTab, setMainTab] = useState<MainTab>('content');

  return (
    <div className="max-w-6xl">
      <div className="mb-4 flex justify-end print:hidden"><PageTopBar /></div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2"><h1 className="text-xl font-bold text-text">콘텐츠</h1><GuideHelpButton /></div>
          <p className="mt-1 text-xs text-text-muted">콘텐츠 관리와 파이프라인을 통합 관리합니다</p>
        </div>
        <Link href="/sc/dashboard/creative" className="flex items-center gap-1.5 rounded-xl bg-text px-4 py-2.5 text-xs font-semibold text-white hover:bg-accent-sub">
          <Plus size={13} /> AI 콘텐츠 생성
        </Link>
      </div>

      {/* 메인 탭 */}
      <div className="mb-6 flex gap-1">
        {([
          { id: 'content' as MainTab, label: '콘텐츠 관리' },
          { id: 'pipeline' as MainTab, label: '파이프라인' },
        ]).map(t => (
          <button key={t.id} onClick={() => setMainTab(t.id)}
            className={`rounded-full px-5 py-2 text-sm font-medium transition-colors ${mainTab === t.id ? 'bg-text text-white' : 'bg-surface text-text-sub hover:text-text'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {mainTab === 'content' && <ContentManageTab />}
      {mainTab === 'pipeline' && <PipelineTab />}

      <NextStepCTA stage="제작 → 실행" title="제작된 콘텐츠를 광고 채널에 집행" description="SEO 최적화된 콘텐츠를 캠페인 소재로 바로 활용하세요" actionLabel="캠페인 집행" href="/sc/dashboard/campaigns" />
    </div>
  );
}

/* ── 콘텐츠 관리 탭 ── */
function ContentManageTab() {
  const [tab, setTab] = useState<'overview' | 'topics' | 'seo' | 'recycle'>('overview');
  const pc = getChartColors(7);

  const TABS = [
    { id: 'overview' as const, label: '콘텐츠 현황', icon: FileText },
    { id: 'topics' as const, label: 'AI 주제 추천', icon: Sparkles },
    { id: 'seo' as const, label: 'SEO 최적화', icon: Search },
    { id: 'recycle' as const, label: '콘텐츠 재활용', icon: RefreshCw },
  ];

  return (
    <div className="max-w-5xl">
      {/* 서브 탭 */}
      <div className="mb-6 flex gap-1 border-b border-border">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 border-b-2 px-4 py-2.5 text-xs font-medium transition-colors ${tab === t.id ? 'border-text text-text' : 'border-transparent text-text-muted hover:text-text-sub'}`}>
            <t.icon size={13} /> {t.label}
          </button>
        ))}
      </div>

      {/* 콘텐츠 현황 */}
      {tab === 'overview' && (
        <div>
          <div className="mb-6 grid grid-cols-4 gap-3">
            {[
              { label: '총 콘텐츠', value: CONTENT_STATS.totalPosts, sub: `발행 ${CONTENT_STATS.published} / 초안 ${CONTENT_STATS.drafts}` },
              { label: '총 조회수', value: CONTENT_STATS.totalViews.toLocaleString(), sub: '최근 30일' },
              { label: '평균 읽기 시간', value: `${CONTENT_STATS.avgReadTime}분`, sub: '전월 대비 +0.3분' },
              { label: '인기 카테고리', value: CONTENT_STATS.topCategory, sub: '가장 많은 조회' },
            ].map(kpi => (
              <div key={kpi.label} className="rounded-2xl border border-border bg-white p-5">
                <div className="text-xs text-text-muted">{kpi.label}</div>
                <div className="mt-1 text-2xl font-bold text-text">{kpi.value}</div>
                <div className="mt-1 text-[10px] text-text-muted">{kpi.sub}</div>
              </div>
            ))}
          </div>
          <div className="mb-6 rounded-2xl border border-border bg-white p-5">
            <h2 className="mb-3 text-sm font-semibold text-text">카테고리별 콘텐츠 수</h2>
            <BarChart data={[
              { label: 'GEO/SEO', value: 6, color: pc[0] }, { label: '광고', value: 4, color: pc[1] },
              { label: '그로스', value: 5, color: pc[2] }, { label: '소재', value: 3, color: pc[3] },
              { label: 'CRM', value: 4, color: pc[4] }, { label: '사례', value: 2, color: pc[5] },
              { label: '트렌드', value: 2, color: pc[6] },
            ]} height={180} />
          </div>
          <div className="rounded-2xl border border-border bg-white">
            <div className="border-b border-border px-5 py-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-text">콘텐츠 성과 순위</h2>
            </div>
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border text-xs text-text-muted">
                <th className="px-5 py-2.5 text-left font-medium">제목</th>
                <th className="px-5 py-2.5 text-center font-medium">SEO 점수</th>
                <th className="px-5 py-2.5 text-right font-medium">조회수</th>
              </tr></thead>
              <tbody>
                {CONTENT_SEO_SCORES.slice(0, 5).map((c, i) => (
                  <tr key={i} className="border-b border-border last:border-0 hover:bg-surface">
                    <td className="px-5 py-3">
                      <div className="text-xs font-medium text-text">{c.title}</div>
                      <span className="rounded bg-surface px-1.5 py-0.5 text-[9px] text-text-muted">{c.category}</span>
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span className={`text-xs font-bold ${c.score >= 80 ? 'text-success' : c.score >= 60 ? 'text-warning' : 'text-danger'}`}>{c.score}</span>
                    </td>
                    <td className="px-5 py-3 text-right text-xs text-text-sub">{c.views.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* AI 주제 추천 */}
      {tab === 'topics' && (
        <div>
          <div className="mb-4 rounded-2xl border border-dashed border-point/30 bg-point/5 p-4">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles size={16} className="text-point" />
              <span className="text-xs font-semibold text-text">퍼널 분석 단계별 콘텐츠 추천</span>
            </div>
            <p className="text-[10px] text-text-muted">AI가 퍼널 각 단계에서 부족한 콘텐츠를 분석하고, SEO 검색량 기반으로 주제를 추천합니다</p>
          </div>
          <div className="space-y-3">
            {AI_TOPICS.map((topic, i) => (
              <div key={i} className="rounded-2xl border border-border bg-white p-5 hover:shadow-md transition-all">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="rounded-full px-2 py-0.5 text-[9px] font-bold text-white" style={{ background: FUNNEL_COLORS[topic.funnelStage] }}>{topic.funnelStage}</span>
                      <span className="text-[9px] text-text-muted">난이도: {topic.difficulty === 'easy' ? '쉬움' : topic.difficulty === 'medium' ? '보통' : '어려움'}</span>
                    </div>
                    <h3 className="text-sm font-bold text-text">{topic.topic}</h3>
                    <div className="mt-1.5 flex items-center gap-3 text-[10px] text-text-muted">
                      <span>타겟 키워드: <b className="text-text-sub">{topic.keyword}</b></span>
                      <span>검색량: <b className="text-text-sub">{topic.searchVolume}</b></span>
                    </div>
                  </div>
                  <Link href="/sc/dashboard/creative" className="shrink-0 flex items-center gap-1 rounded-lg bg-surface px-3 py-2 text-[10px] font-semibold text-text-sub hover:bg-text hover:text-white transition-colors">
                    <Sparkles size={11} /> AI 작성
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SEO 최적화 */}
      {tab === 'seo' && (
        <div>
          <div className="mb-6 grid grid-cols-3 gap-3">
            <div className="rounded-2xl border border-border bg-white p-4 text-center">
              <div className="text-2xl font-bold text-success">{CONTENT_SEO_SCORES.filter(c => c.score >= 80).length}</div>
              <div className="text-xs text-text-muted mt-0.5">최적화 완료</div>
            </div>
            <div className="rounded-2xl border border-border bg-white p-4 text-center">
              <div className="text-2xl font-bold text-warning">{CONTENT_SEO_SCORES.filter(c => c.score >= 60 && c.score < 80).length}</div>
              <div className="text-xs text-text-muted mt-0.5">개선 가능</div>
            </div>
            <div className="rounded-2xl border border-border bg-white p-4 text-center">
              <div className="text-2xl font-bold text-danger">{CONTENT_SEO_SCORES.filter(c => c.score < 60).length}</div>
              <div className="text-xs text-text-muted mt-0.5">개선 필요</div>
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-white">
            <div className="border-b border-border px-5 py-3">
              <h2 className="text-sm font-semibold text-text">콘텐츠별 SEO 점수</h2>
            </div>
            <div className="divide-y divide-border">
              {CONTENT_SEO_SCORES.map((c, i) => (
                <div key={i} className="flex items-center gap-4 px-5 py-3.5 hover:bg-surface">
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-medium text-text">{c.title}</div>
                    <span className="rounded bg-surface px-1.5 py-0.5 text-[9px] text-text-muted">{c.category}</span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="w-24 h-2 rounded-full bg-surface overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${c.score}%`, background: c.score >= 80 ? '#059669' : c.score >= 60 ? '#D97706' : '#DC2626' }} />
                    </div>
                    <span className={`text-xs font-bold w-8 text-right ${c.score >= 80 ? 'text-success' : c.score >= 60 ? 'text-warning' : 'text-danger'}`}>{c.score}</span>
                    {c.score < 80 && (
                      <span className="text-[9px] text-text-muted hover:text-text cursor-pointer">개선 →</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 콘텐츠 재활용 */}
      {tab === 'recycle' && (
        <div>
          <div className="mb-4 rounded-2xl border border-dashed border-point/30 bg-point/5 p-4">
            <div className="flex items-center gap-2 mb-1">
              <RefreshCw size={16} className="text-point" />
              <span className="text-xs font-semibold text-text">하나의 콘텐츠 → 여러 채널</span>
            </div>
            <p className="text-[10px] text-text-muted">성과가 좋은 블로그 글을 인스타그램, 이메일, 카카오, 유튜브용으로 자동 변환합니다</p>
          </div>
          <div className="space-y-4">
            {RECYCLE_SUGGESTIONS.map((item, i) => (
              <div key={i} className="rounded-2xl border border-border bg-white p-5">
                <div className="mb-3">
                  <div className="text-[10px] text-text-muted">원본 콘텐츠</div>
                  <h3 className="text-sm font-bold text-text">{item.original}</h3>
                </div>
                <div className="text-[10px] text-text-muted mb-2">재활용 가능한 채널</div>
                <div className="grid grid-cols-2 gap-2">
                  {item.channels.map((ch, j) => (
                    <div key={j} className="flex items-center justify-between rounded-xl border border-border px-3 py-2.5 hover:bg-surface cursor-pointer">
                      <span className="text-xs text-text-sub">{ch}</span>
                      <span className="flex items-center gap-1 text-[9px] text-text-muted">
                        <Sparkles size={9} /> AI 변환
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── 파이프라인 탭 ── */
function PipelineTab() {
  const { pipelineItems, movePipelineItem } = useWorkflow();
  const [brandFilter, setBrandFilter] = useState('all');
  const filteredItems = brandFilter === 'all' ? pipelineItems : pipelineItems.filter(item => item.brandId === brandFilter);
  const getChannelName = (id: string) => workflowChannels.find(c => c.id === id)?.name ?? id;

  const handleDragStart = (e: React.DragEvent, itemId: string) => { e.dataTransfer.setData('text/plain', itemId); };
  const handleDrop = (e: React.DragEvent, stage: PipelineStage) => { e.preventDefault(); const id = e.dataTransfer.getData('text/plain'); if (id) movePipelineItem(id, stage); e.currentTarget.classList.remove('ring-2', 'ring-text-muted'); };
  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); e.currentTarget.classList.add('ring-2', 'ring-text-muted'); };
  const handleDragLeave = (e: React.DragEvent) => { e.currentTarget.classList.remove('ring-2', 'ring-text-muted'); };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-text-muted">소재 제작 흐름을 단계별로 관리합니다</p>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-3.5 w-3.5 text-text-muted" />
          <select value={brandFilter} onChange={e => setBrandFilter(e.target.value)} className="rounded-xl border border-border bg-white px-3 py-2 text-xs text-text focus:border-text focus:outline-none">
            <option value="all">전체 채널</option>
            {workflowChannels.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-6 gap-2.5 overflow-x-auto">
        {stages.map(stage => {
          const stageItems = filteredItems.filter(item => item.stage === stage.key);
          return (
            <div key={stage.key} className="rounded-2xl border border-border bg-surface/40 p-3 min-h-[400px] transition-all"
              onDrop={e => handleDrop(e, stage.key)} onDragOver={handleDragOver} onDragLeave={handleDragLeave}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-semibold text-text-sub">{stage.label}</h3>
                <span className="text-[10px] px-1.5 py-0.5 bg-surface text-text-muted rounded">{stageItems.length}</span>
              </div>
              <div className="space-y-2">
                {stageItems.map(item => (
                  <div key={item.id} draggable onDragStart={e => handleDragStart(e, item.id)}
                    className="rounded-xl border border-border bg-white p-3 cursor-grab active:cursor-grabbing hover:border-text-muted/40 transition-colors">
                    <div className="flex items-start justify-between gap-1">
                      <p className="text-xs font-medium text-text leading-tight">{item.title}</p>
                      {item.aiGenerated && <Sparkles className="h-3 w-3 text-text-muted/40 shrink-0 mt-0.5" />}
                    </div>
                    <p className="text-[10px] text-text-muted mt-1">{getChannelName(item.brandId)}</p>
                    <div className="flex items-center justify-between mt-1.5">
                      <span className="text-[9px] text-text-muted/50">{item.type}</span>
                      {item.dueDate && <span className="text-[9px] text-text-muted/50">{item.dueDate}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
