'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Rocket, Lightbulb, Search, CheckCircle2, Play, X, Plus,
  TrendingUp, AlertTriangle, DollarSign, Target, Users, BarChart3,
  ChevronRight, GripVertical,
} from 'lucide-react';
import { useWIO } from '../../layout';
import { createClient } from '@/lib/supabase/client';

/* ── Types ── */
type BDStage = 'idea' | 'analysis' | 'validation' | 'approval' | 'execution';
type BDProject = {
  id: string;
  name: string;
  description: string;
  marketSize: string;
  feasibilityScore: number;
  stage: BDStage;
  owner: string;
  analysis: {
    marketSize: string;
    competition: 'low' | 'medium' | 'high';
    investment: string;
    expectedROI: string;
    risks: string[];
  };
};

const STAGES: { key: BDStage; label: string; color: string; bg: string; icon: typeof Lightbulb }[] = [
  { key: 'idea', label: '아이디어', color: 'text-slate-400', bg: 'bg-slate-500/10 border-slate-500/20', icon: Lightbulb },
  { key: 'analysis', label: '분석', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20', icon: Search },
  { key: 'validation', label: '검증', color: 'text-violet-400', bg: 'bg-violet-500/10 border-violet-500/20', icon: CheckCircle2 },
  { key: 'approval', label: '승인', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20', icon: Target },
  { key: 'execution', label: '실행', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', icon: Play },
];

const COMPETITION_MAP: Record<string, { label: string; color: string }> = {
  low: { label: '낮음', color: 'text-emerald-400' },
  medium: { label: '보통', color: 'text-amber-400' },
  high: { label: '높음', color: 'text-red-400' },
};

/* ── Mock: 5 new business ideas ── */
const MOCK_PROJECTS: BDProject[] = [
  {
    id: 'bd1', name: 'WIO for Education', description: '대학·교육기관 전용 WIO 패키지. LMS + 프로젝트 관리 + 취업 파이프라인 통합.',
    marketSize: '3,200억', feasibilityScore: 8, stage: 'validation', owner: '전략기획팀',
    analysis: { marketSize: '국내 교육 IT 시장 3,200억 (YoY +18%)', competition: 'medium', investment: '5억 (12개월)', expectedROI: '3년 내 BEP, 5년 ROI 320%', risks: ['대학 의사결정 속도 느림', '기존 LMS 벤더 계약 만료 시점 맞춰야 함', '교수진 저항 가능성'] },
  },
  {
    id: 'bd2', name: 'Mindle AI 트렌드 리포트', description: 'AI 크롤링 기반 실시간 트렌드 분석 리포트 구독 서비스. B2B 마케터 타겟.',
    marketSize: '800억', feasibilityScore: 7, stage: 'analysis', owner: '콘텐츠팀',
    analysis: { marketSize: '국내 마케팅 인텔리전스 시장 800억', competition: 'high', investment: '2억 (6개월)', expectedROI: '2년 내 BEP, 구독 모델 MRR 중심', risks: ['ChatGPT 등 범용 AI와 차별화 필요', '데이터 크롤링 법적 리스크', '콘텐츠 품질 일관성 유지'] },
  },
  {
    id: 'bd3', name: 'HeRo 인재 매칭 플랫폼', description: '대학생·주니어 인재와 스타트업 매칭. MADLeague 네트워크 활용.',
    marketSize: '1,500억', feasibilityScore: 6, stage: 'idea', owner: 'MAD사업부',
    analysis: { marketSize: '국내 채용 플랫폼 시장 1,500억', competition: 'high', investment: '8억 (18개월)', expectedROI: '4년 내 BEP, 수수료 모델', risks: ['원티드/사람인 등 기존 플랫폼 장악', 'MADLeague 규모 부족', '양면 네트워크 효과 달성 시간'] },
  },
  {
    id: 'bd4', name: 'WIO 일본 시장 진출', description: 'WIO SaaS 일본 현지화. J-Startup 에코시스템 타겟.',
    marketSize: '2조', feasibilityScore: 5, stage: 'idea', owner: '해외사업팀',
    analysis: { marketSize: '일본 SaaS 시장 약 2조엔 규모', competition: 'medium', investment: '15억 (24개월)', expectedROI: '5년 내 BEP, 장기 성장 투자', risks: ['현지 파트너 확보 필수', '일본 기업 문화 이해 부족', '언어·현지화 비용', '환율 리스크'] },
  },
  {
    id: 'bd5', name: 'YouInOne 프리랜서 정산 서비스', description: '프리랜서/크루 시수 관리 + 자동 정산 서비스. 세금 계산 포함.',
    marketSize: '500억', feasibilityScore: 9, stage: 'approval', owner: '프로덕트팀',
    analysis: { marketSize: '프리랜서 이코노미 정산 시장 500억', competition: 'low', investment: '1.5억 (4개월)', expectedROI: '1년 내 BEP, 거래 수수료 모델', risks: ['세무/법률 검토 필요', '결제 시스템 연동 복잡도', '프리랜서 신뢰도 확보'] },
  },
];

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 8 ? 'text-emerald-400 bg-emerald-500/10' : score >= 6 ? 'text-amber-400 bg-amber-500/10' : 'text-red-400 bg-red-500/10';
  return <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${color}`}>{score}/10</span>;
}

export default function BDProjectPage() {
  const { tenant, isDemo } = useWIO();
  const [projects, setProjects] = useState<BDProject[]>(isDemo ? MOCK_PROJECTS : []);
  const [loading, setLoading] = useState(!isDemo);

  // Supabase에서 신사업 프로젝트 로드
  const loadProjects = useCallback(async () => {
    if (isDemo) return;
    setLoading(true);
    try {
      const sb = createClient();
      const { data, error } = await sb
        .from('wio_bd_projects')
        .select('*')
        .eq('tenant_id', tenant!.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      if (data && data.length > 0) {
        setProjects(data.map((row: any) => ({
          id: row.id,
          name: row.name || '',
          description: row.description || '',
          marketSize: row.market_size || '',
          feasibilityScore: row.feasibility_score ?? 0,
          stage: row.stage || 'idea',
          owner: row.owner || '',
          analysis: row.analysis || { marketSize: '', competition: 'medium', investment: '', expectedROI: '', risks: [] },
        })));
      } else {
        setProjects(MOCK_PROJECTS);
      }
    } catch {
      setProjects(MOCK_PROJECTS);
    } finally {
      setLoading(false);
    }
  }, [isDemo, tenant]);

  useEffect(() => { loadProjects(); }, [loadProjects]);
  const [selected, setSelected] = useState<BDProject | null>(null);
  const [viewMode, setViewMode] = useState<'pipeline' | 'list'>('pipeline');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">신사업 기획</h1>
          <p className="text-xs text-slate-500 mt-0.5">BD-PRJ · 신규 사업 아이디어 {projects.length}건</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-white/5 overflow-hidden">
            <button onClick={() => setViewMode('pipeline')} className={`px-3 py-1.5 text-xs ${viewMode === 'pipeline' ? 'bg-indigo-600/10 text-indigo-400' : 'text-slate-400'}`}>파이프라인</button>
            <button onClick={() => setViewMode('list')} className={`px-3 py-1.5 text-xs ${viewMode === 'list' ? 'bg-indigo-600/10 text-indigo-400' : 'text-slate-400'}`}>리스트</button>
          </div>
        </div>
      </div>

      {/* Pipeline stages header */}
      <div className="flex gap-2">
        {STAGES.map(st => {
          const Icon = st.icon;
          const cnt = projects.filter(p => p.stage === st.key).length;
          return (
            <div key={st.key} className={`flex-1 rounded-lg border p-2.5 text-center ${st.bg}`}>
              <Icon size={16} className={`mx-auto mb-1 ${st.color}`} />
              <div className={`text-xs font-bold ${st.color}`}>{st.label}</div>
              <div className="text-lg font-bold">{cnt}</div>
            </div>
          );
        })}
      </div>

      {viewMode === 'pipeline' ? (
        /* Pipeline view */
        <div className="flex gap-3 overflow-x-auto" style={{ minWidth: '900px' }}>
          {STAGES.map(st => {
            const stageProjects = projects.filter(p => p.stage === st.key);
            return (
              <div key={st.key} className="flex-1 min-w-[170px]">
                <div className={`text-xs font-bold uppercase tracking-wider mb-2 ${st.color}`}>{st.label}</div>
                <div className="space-y-2">
                  {stageProjects.map(p => (
                    <div key={p.id} onClick={() => setSelected(p)}
                      className="rounded-xl border border-white/5 bg-white/[0.02] p-3 cursor-pointer hover:bg-white/[0.04] transition-colors">
                      <div className="flex items-start gap-2">
                        <GripVertical size={14} className="text-slate-600 mt-0.5 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold">{p.name}</div>
                          <div className="text-xs text-slate-500 mt-0.5 line-clamp-2">{p.description}</div>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-slate-400">{p.marketSize}</span>
                            <ScoreBadge score={p.feasibilityScore} />
                          </div>
                          <div className="text-[10px] text-slate-600 mt-1">{p.owner}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List view */
        <div className="rounded-xl border border-white/5 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-white/[0.02] text-xs text-slate-500 uppercase tracking-wider">
                <th className="text-left px-4 py-3">사업명</th>
                <th className="text-center px-4 py-3">시장규모</th>
                <th className="text-center px-4 py-3">타당성</th>
                <th className="text-center px-4 py-3">단계</th>
                <th className="text-left px-4 py-3">담당</th>
              </tr>
            </thead>
            <tbody>
              {projects.map(p => {
                const st = STAGES.find(s => s.key === p.stage)!;
                return (
                  <tr key={p.id} onClick={() => setSelected(p)} className="border-t border-white/5 hover:bg-white/[0.02] cursor-pointer">
                    <td className="px-4 py-3">
                      <div className="font-medium">{p.name}</div>
                      <div className="text-xs text-slate-500 mt-0.5 truncate max-w-[300px]">{p.description}</div>
                    </td>
                    <td className="px-4 py-3 text-center text-slate-300">{p.marketSize}</td>
                    <td className="px-4 py-3 text-center"><ScoreBadge score={p.feasibilityScore} /></td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${st.bg} ${st.color}`}>{st.label}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-400">{p.owner}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Detail modal with feasibility analysis */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSelected(null)} />
          <div className="relative w-full max-w-xl bg-[#0f1117] border border-white/5 rounded-2xl p-6 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-bold">{selected.name}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${STAGES.find(s => s.key === selected.stage)?.bg} ${STAGES.find(s => s.key === selected.stage)?.color}`}>
                    {STAGES.find(s => s.key === selected.stage)?.label}
                  </span>
                  <ScoreBadge score={selected.feasibilityScore} />
                </div>
              </div>
              <button onClick={() => setSelected(null)} className="p-1 rounded hover:bg-white/5"><X size={18} /></button>
            </div>

            <p className="text-sm text-slate-300 mb-4">{selected.description}</p>

            {/* Feasibility analysis form/display */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold flex items-center gap-2"><BarChart3 size={14} className="text-indigo-400" />타당성 분석</h3>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-white/5 bg-white/[0.02] p-3">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1"><DollarSign size={12} />시장 크기</div>
                  <div className="text-sm font-medium">{selected.analysis.marketSize}</div>
                </div>
                <div className="rounded-lg border border-white/5 bg-white/[0.02] p-3">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1"><Users size={12} />경쟁 강도</div>
                  <div className={`text-sm font-medium ${COMPETITION_MAP[selected.analysis.competition].color}`}>
                    {COMPETITION_MAP[selected.analysis.competition].label}
                  </div>
                </div>
                <div className="rounded-lg border border-white/5 bg-white/[0.02] p-3">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1"><DollarSign size={12} />투자 규모</div>
                  <div className="text-sm font-medium">{selected.analysis.investment}</div>
                </div>
                <div className="rounded-lg border border-white/5 bg-white/[0.02] p-3">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1"><TrendingUp size={12} />예상 ROI</div>
                  <div className="text-sm font-medium">{selected.analysis.expectedROI}</div>
                </div>
              </div>

              {/* Risks */}
              <div className="rounded-lg border border-red-500/10 bg-red-500/5 p-3">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-red-400 mb-2"><AlertTriangle size={12} />리스크</div>
                <ul className="space-y-1.5">
                  {selected.analysis.risks.map((risk, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                      <ChevronRight size={10} className="mt-0.5 text-red-500 shrink-0" />
                      {risk}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Feasibility score bar */}
              <div>
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span>타당성 점수</span>
                  <span className="font-bold">{selected.feasibilityScore}/10</span>
                </div>
                <div className="w-full h-2 rounded-full bg-white/5">
                  <div className={`h-full rounded-full ${selected.feasibilityScore >= 8 ? 'bg-emerald-500' : selected.feasibilityScore >= 6 ? 'bg-amber-500' : 'bg-red-500'}`}
                    style={{ width: `${selected.feasibilityScore * 10}%` }} />
                </div>
              </div>

              {/* Stage progression */}
              <div className="pt-3 border-t border-white/5">
                <div className="text-xs text-slate-500 mb-2">진행 단계</div>
                <div className="flex items-center gap-1">
                  {STAGES.map((st, i) => {
                    const currentIdx = STAGES.findIndex(s => s.key === selected.stage);
                    const active = i <= currentIdx;
                    return (
                      <div key={st.key} className="flex items-center gap-1 flex-1">
                        <div className={`flex-1 h-1.5 rounded-full ${active ? 'bg-indigo-500' : 'bg-white/5'}`} />
                        {i === currentIdx && <span className={`text-[10px] font-semibold ${st.color}`}>{st.label}</span>}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="text-xs text-slate-500 text-right">담당: {selected.owner}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
