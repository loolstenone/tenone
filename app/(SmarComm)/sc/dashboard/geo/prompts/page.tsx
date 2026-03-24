'use client';

import { useState } from 'react';
import { Search, MessageSquare, CheckCircle2, XCircle, Plus, Play, Pause, Clock, AlertTriangle, Trash2 } from 'lucide-react';
import PageTopBar from '@/components/smarcomm/PageTopBar';
import GuideHelpButton from '@/components/smarcomm/GuideHelpButton';

type PromptTab = 'research' | 'tracking';

// ── Mock: 프롬프트 리서치 ──
interface PromptData {
  id: string;
  prompt: string;
  platform: string;
  mentioned: boolean;
  sentiment: 'positive' | 'neutral' | 'negative';
  position: number | null;
  competitors: string[];
  category: string;
  volume: string;
  testedAt: string;
}

const MOCK_PROMPTS: PromptData[] = [
  { id: 'p1', prompt: '한국에서 좋은 마케팅 자동화 도구 추천해줘', platform: 'ChatGPT', mentioned: true, sentiment: 'positive', position: 2, competitors: ['competitor-a', 'hubspot'], category: '추천', volume: '월 2,400', testedAt: '2026-03-22' },
  { id: 'p2', prompt: 'SEO 진단 도구 비교해줘', platform: 'Perplexity', mentioned: true, sentiment: 'positive', position: 1, competitors: ['semrush', 'ahrefs'], category: '비교', volume: '월 1,800', testedAt: '2026-03-22' },
  { id: 'p3', prompt: 'GEO 최적화가 뭐야?', platform: 'Claude', mentioned: true, sentiment: 'positive', position: 3, competitors: [], category: '정보', volume: '월 890', testedAt: '2026-03-22' },
  { id: 'p4', prompt: '소상공인 마케팅 플랫폼 추천', platform: 'Gemini', mentioned: false, sentiment: 'neutral', position: null, competitors: ['네이버 비즈니스', 'cafe24'], category: '추천', volume: '월 3,200', testedAt: '2026-03-21' },
  { id: 'p5', prompt: '광고 성과 분석 도구 뭐가 좋아?', platform: 'ChatGPT', mentioned: false, sentiment: 'neutral', position: null, competitors: ['google analytics', 'amplitude'], category: '비교', volume: '월 1,500', testedAt: '2026-03-21' },
  { id: 'p6', prompt: 'AI 시대에 SEO는 어떻게 변하고 있어?', platform: 'Perplexity', mentioned: true, sentiment: 'positive', position: 4, competitors: [], category: '정보', volume: '월 4,100', testedAt: '2026-03-21' },
  { id: 'p7', prompt: '네이버 검색광고 최적화 방법', platform: 'ChatGPT', mentioned: false, sentiment: 'neutral', position: null, competitors: ['네이버 SA'], category: '가이드', volume: '월 5,600', testedAt: '2026-03-20' },
  { id: 'p8', prompt: '마케팅 KPI 측정 방법 알려줘', platform: 'Claude', mentioned: true, sentiment: 'positive', position: 2, competitors: ['hubspot', 'mixpanel'], category: '정보', volume: '월 2,100', testedAt: '2026-03-20' },
  { id: 'p9', prompt: 'SmarComm이 뭐하는 서비스야?', platform: 'ChatGPT', mentioned: true, sentiment: 'positive', position: 1, competitors: [], category: '브랜드', volume: '월 120', testedAt: '2026-03-20' },
  { id: 'p10', prompt: '전환율 최적화 CRO 도구 추천', platform: 'Perplexity', mentioned: false, sentiment: 'neutral', position: null, competitors: ['optimizely', 'vwo'], category: '추천', volume: '월 980', testedAt: '2026-03-19' },
];

const CATEGORIES = ['전체', '추천', '비교', '정보', '가이드', '브랜드'];

// ── Mock: 프롬프트 추적 ──
interface TrackedPrompt {
  id: string;
  prompt: string;
  platforms: string[];
  frequency: 'daily' | 'weekly';
  status: 'active' | 'paused';
  lastRun: string;
  currentPosition: number | null;
  previousPosition: number | null;
  mentioned: boolean;
}

const MOCK_TRACKING: TrackedPrompt[] = [
  { id: 'tr1', prompt: '한국 마케팅 자동화 도구 추천', platforms: ['ChatGPT', 'Perplexity', 'Gemini', 'Claude'], frequency: 'daily', status: 'active', lastRun: '2026-03-23 09:00', currentPosition: 2, previousPosition: 3, mentioned: true },
  { id: 'tr2', prompt: 'SEO 진단 도구 비교', platforms: ['ChatGPT', 'Perplexity'], frequency: 'daily', status: 'active', lastRun: '2026-03-23 09:00', currentPosition: 1, previousPosition: 1, mentioned: true },
  { id: 'tr3', prompt: 'GEO 최적화 방법', platforms: ['ChatGPT', 'Claude'], frequency: 'weekly', status: 'active', lastRun: '2026-03-22 09:00', currentPosition: 3, previousPosition: null, mentioned: true },
  { id: 'tr4', prompt: '소상공인 마케팅 플랫폼', platforms: ['ChatGPT', 'Gemini', 'Naver Cue'], frequency: 'daily', status: 'active', lastRun: '2026-03-23 09:00', currentPosition: null, previousPosition: null, mentioned: false },
  { id: 'tr5', prompt: '광고 성과 분석 도구', platforms: ['ChatGPT', 'Perplexity'], frequency: 'weekly', status: 'paused', lastRun: '2026-03-20 09:00', currentPosition: null, previousPosition: null, mentioned: false },
];

export default function PromptsPage() {
  const [tab, setTab] = useState<PromptTab>('research');

  return (
    <div className="max-w-5xl">
      <div className="mb-4 flex justify-end print:hidden"><PageTopBar /></div>
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <div className="flex items-center gap-2"><h1 className="text-xl font-bold text-text">프롬프트 관리</h1><GuideHelpButton /></div>
        </div>
        <p className="text-xs text-text-muted">프롬프트 리서치와 추적을 통합 관리합니다</p>
      </div>

      {/* 탭 */}
      <div className="mb-6 flex gap-1">
        {([
          { id: 'research' as PromptTab, label: '프롬프트 리서치' },
          { id: 'tracking' as PromptTab, label: '프롬프트 추적' },
        ]).map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`rounded-full px-5 py-2 text-sm font-medium transition-colors ${tab === t.id ? 'bg-text text-white' : 'bg-surface text-text-sub hover:text-text'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'research' && <ResearchTab />}
      {tab === 'tracking' && <TrackingTab />}
    </div>
  );
}

/* ── 프롬프트 리서치 탭 ── */
function ResearchTab() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('전체');

  const filtered = MOCK_PROMPTS.filter(p => {
    if (category !== '전체' && p.category !== category) return false;
    if (search && !p.prompt.includes(search)) return false;
    return true;
  });

  const mentionRate = Math.round(MOCK_PROMPTS.filter(p => p.mentioned).length / MOCK_PROMPTS.length * 100);

  return (
    <div>
      {/* 요약 */}
      <div className="mb-6 grid grid-cols-4 gap-3">
        <div className="rounded-2xl border border-border bg-white p-4">
          <div className="text-xs text-text-muted">테스트 프롬프트</div>
          <div className="text-xl font-bold text-text">{MOCK_PROMPTS.length}개</div>
        </div>
        <div className="rounded-2xl border border-border bg-white p-4">
          <div className="text-xs text-text-muted">멘션 비율</div>
          <div className="text-xl font-bold text-text">{mentionRate}%</div>
        </div>
        <div className="rounded-2xl border border-border bg-white p-4">
          <div className="text-xs text-text-muted">평균 포지션</div>
          <div className="text-xl font-bold text-text">{(MOCK_PROMPTS.filter(p => p.position).reduce((s, p) => s + (p.position || 0), 0) / MOCK_PROMPTS.filter(p => p.position).length).toFixed(1)}위</div>
        </div>
        <div className="rounded-2xl border border-border bg-white p-4">
          <div className="text-xs text-text-muted">월 추정 검색량</div>
          <div className="text-xl font-bold text-text">22.7K</div>
        </div>
      </div>

      {/* 필터 */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="프롬프트 검색..."
            className="w-full rounded-xl border border-border bg-surface py-2 pl-9 pr-4 text-sm placeholder:text-text-muted focus:border-text focus:outline-none" />
        </div>
        <div className="flex gap-1.5">
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setCategory(c)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium ${category === c ? 'bg-text text-white' : 'bg-surface text-text-sub hover:text-text'}`}>{c}</button>
          ))}
        </div>
      </div>

      {/* 테이블 */}
      <div className="rounded-2xl border border-border bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-xs text-text-muted">
              <th className="px-5 py-2.5 text-left font-medium">프롬프트</th>
              <th className="px-5 py-2.5 text-center font-medium">플랫폼</th>
              <th className="px-5 py-2.5 text-center font-medium">멘션</th>
              <th className="px-5 py-2.5 text-center font-medium">포지션</th>
              <th className="px-5 py-2.5 text-center font-medium">감성</th>
              <th className="px-5 py-2.5 text-right font-medium">추정 검색량</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id} className="border-b border-border last:border-0 hover:bg-surface">
                <td className="px-5 py-3">
                  <div className="flex items-start gap-2">
                    <MessageSquare size={12} className="mt-0.5 shrink-0 text-text-muted" />
                    <div>
                      <p className="text-xs font-medium text-text">&quot;{p.prompt}&quot;</p>
                      <div className="mt-0.5 flex gap-1">
                        <span className="rounded bg-surface px-1.5 py-0.5 text-[9px] text-text-muted">{p.category}</span>
                        {p.competitors.length > 0 && <span className="text-[9px] text-text-muted">경쟁: {p.competitors.join(', ')}</span>}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3 text-center text-xs text-text-sub">{p.platform}</td>
                <td className="px-5 py-3 text-center">
                  {p.mentioned ? <CheckCircle2 size={14} className="mx-auto text-success" /> : <XCircle size={14} className="mx-auto text-danger" />}
                </td>
                <td className="px-5 py-3 text-center text-xs font-bold text-text">{p.position ? `${p.position}위` : '—'}</td>
                <td className="px-5 py-3 text-center">
                  <span className={`text-xs font-semibold ${p.sentiment === 'positive' ? 'text-success' : p.sentiment === 'negative' ? 'text-danger' : 'text-text-muted'}`}>
                    {p.sentiment === 'positive' ? '긍정' : p.sentiment === 'negative' ? '부정' : '중립'}
                  </span>
                </td>
                <td className="px-5 py-3 text-right text-xs text-text-muted">{p.volume}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ── 프롬프트 추적 탭 ── */
function TrackingTab() {
  const [prompts, setPrompts] = useState(MOCK_TRACKING);
  const [showAdd, setShowAdd] = useState(false);
  const [newPrompt, setNewPrompt] = useState('');

  const toggleStatus = (id: string) => {
    setPrompts(prompts.map(p => p.id === id ? { ...p, status: p.status === 'active' ? 'paused' : 'active' } : p));
  };

  const deletePrompt = (id: string) => {
    setPrompts(prompts.filter(p => p.id !== id));
  };

  const activeCount = prompts.filter(p => p.status === 'active').length;
  const mentionedCount = prompts.filter(p => p.mentioned).length;

  return (
    <div>
      {/* 추가 버튼 */}
      <div className="mb-6 flex justify-end">
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-1.5 rounded-xl bg-text px-4 py-2.5 text-xs font-semibold text-white hover:bg-accent-sub">
          <Plus size={13} /> 프롬프트 추가
        </button>
      </div>

      {/* 요약 */}
      <div className="mb-6 grid grid-cols-4 gap-3">
        <div className="rounded-2xl border border-border bg-white p-4">
          <div className="text-xs text-text-muted">추적 중</div>
          <div className="text-xl font-bold text-text">{activeCount}개</div>
        </div>
        <div className="rounded-2xl border border-border bg-white p-4">
          <div className="text-xs text-text-muted">멘션 성공</div>
          <div className="text-xl font-bold text-success">{mentionedCount}개</div>
        </div>
        <div className="rounded-2xl border border-border bg-white p-4">
          <div className="text-xs text-text-muted">미멘션</div>
          <div className="text-xl font-bold text-danger">{prompts.filter(p => !p.mentioned && p.status === 'active').length}개</div>
        </div>
        <div className="rounded-2xl border border-border bg-white p-4">
          <div className="text-xs text-text-muted">평균 포지션</div>
          <div className="text-xl font-bold text-text">
            {(prompts.filter(p => p.currentPosition).reduce((s, p) => s + (p.currentPosition || 0), 0) / Math.max(1, prompts.filter(p => p.currentPosition).length)).toFixed(1)}위
          </div>
        </div>
      </div>

      {/* 추적 목록 */}
      <div className="rounded-2xl border border-border bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-xs text-text-muted">
              <th className="px-5 py-2.5 text-left font-medium">프롬프트</th>
              <th className="px-5 py-2.5 text-center font-medium">플랫폼</th>
              <th className="px-5 py-2.5 text-center font-medium">주기</th>
              <th className="px-5 py-2.5 text-center font-medium">포지션</th>
              <th className="px-5 py-2.5 text-center font-medium">멘션</th>
              <th className="px-5 py-2.5 text-center font-medium">최근 실행</th>
              <th className="px-5 py-2.5 text-right font-medium">관리</th>
            </tr>
          </thead>
          <tbody>
            {prompts.map(p => {
              const posChange = p.currentPosition && p.previousPosition ? p.previousPosition - p.currentPosition : null;
              return (
                <tr key={p.id} className={`border-b border-border last:border-0 hover:bg-surface ${p.status === 'paused' ? 'opacity-50' : ''}`}>
                  <td className="px-5 py-3">
                    <div className="text-xs font-medium text-text">&quot;{p.prompt}&quot;</div>
                  </td>
                  <td className="px-5 py-3 text-center">
                    <div className="flex flex-wrap justify-center gap-1">
                      {p.platforms.map(pl => <span key={pl} className="rounded bg-surface px-1.5 py-0.5 text-[8px] text-text-muted">{pl}</span>)}
                    </div>
                  </td>
                  <td className="px-5 py-3 text-center text-xs text-text-muted">{p.frequency === 'daily' ? '매일' : '매주'}</td>
                  <td className="px-5 py-3 text-center">
                    {p.currentPosition ? (
                      <div className="flex items-center justify-center gap-1">
                        <span className="text-xs font-bold text-text">{p.currentPosition}위</span>
                        {posChange !== null && posChange !== 0 && (
                          <span className={`text-[9px] font-bold ${posChange > 0 ? 'text-success' : 'text-danger'}`}>
                            {posChange > 0 ? `+${posChange}` : `${posChange}`}
                          </span>
                        )}
                      </div>
                    ) : <span className="text-xs text-text-muted">—</span>}
                  </td>
                  <td className="px-5 py-3 text-center">
                    {p.mentioned ? <CheckCircle2 size={14} className="mx-auto text-success" /> : <AlertTriangle size={14} className="mx-auto text-danger" />}
                  </td>
                  <td className="px-5 py-3 text-center text-[10px] text-text-muted">{p.lastRun}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => toggleStatus(p.id)} className="text-text-muted hover:text-text">
                        {p.status === 'active' ? <Pause size={13} /> : <Play size={13} />}
                      </button>
                      <button onClick={() => deletePrompt(p.id)} className="text-text-muted hover:text-danger"><Trash2 size={13} /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 프롬프트 추가 모달 */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={() => setShowAdd(false)}>
          <div className="w-[420px] rounded-2xl border border-border bg-white p-6 shadow-xl" onClick={e => e.stopPropagation()}>
            <h3 className="mb-4 text-sm font-bold text-text">프롬프트 추적 추가</h3>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs text-text-muted">추적할 프롬프트</label>
                <textarea value={newPrompt} onChange={e => setNewPrompt(e.target.value)} placeholder="AI에게 물어볼 질문을 입력하세요" rows={2}
                  className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm placeholder:text-text-muted focus:border-text focus:outline-none resize-none" />
              </div>
              <div>
                <label className="mb-1 block text-xs text-text-muted">테스트 플랫폼</label>
                <div className="flex gap-2">
                  {['ChatGPT', 'Perplexity', 'Gemini', 'Claude'].map(p => (
                    <label key={p} className="flex items-center gap-1.5 text-xs text-text-sub">
                      <input type="checkbox" defaultChecked className="rounded" /> {p}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs text-text-muted">추적 주기</label>
                <select className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm focus:border-text focus:outline-none">
                  <option>매일</option><option>매주</option>
                </select>
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setShowAdd(false)} className="px-4 py-2 text-sm text-text-muted hover:text-text">취소</button>
              <button onClick={() => setShowAdd(false)} className="rounded-xl bg-text px-4 py-2 text-sm font-semibold text-white hover:bg-accent-sub">추가</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
