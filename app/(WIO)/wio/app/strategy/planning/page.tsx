'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Target, Compass, Lightbulb, TrendingUp, Shield, AlertTriangle, Eye, Zap,
  ChevronRight, Calendar,
} from 'lucide-react';
import { useWIO } from '../../layout';
import { createClient } from '@/lib/supabase/client';

/* ── SWOT ── */
const SWOT = {
  strengths: ['AI 기반 자동화 핵심 역량', 'WIO 모듈형 SaaS 아키텍처', '멀티 브랜드 시너지 생태계', '빠른 MVP → 피벗 실행력'],
  weaknesses: ['초기 브랜드 인지도 부족', '소규모 개발팀 리소스 제한', '아직 수익 모델 미검증', 'B2B 영업 네트워크 부재'],
  opportunities: ['AI SaaS 시장 급성장', '중소기업 디지털 전환 수요', 'K-콘텐츠 글로벌 확산', '리모트 워크 도구 수요 증가'],
  threats: ['대기업 유사 서비스 진출', '경기 침체에 따른 IT 투자 축소', '빠른 기술 변화 대응 부담', '개인정보 보호 규제 강화'],
};

const SWOT_CONFIG: Record<string, { label: string; icon: typeof Shield; color: string; bg: string }> = {
  strengths: { label: '강점 (S)', icon: Shield, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  weaknesses: { label: '약점 (W)', icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
  opportunities: { label: '기회 (O)', icon: Eye, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
  threats: { label: '위협 (T)', icon: Zap, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
};

/* ── Strategic Initiatives ── */
type Initiative = {
  id: string;
  title: string;
  description: string;
  owner: string;
  startDate: string;
  endDate: string;
  progress: number;
  status: 'on_track' | 'at_risk' | 'delayed' | 'completed';
};

const INITIATIVES: Initiative[] = [
  { id: 'i1', title: 'WIO SaaS 런칭 & PMF 확보', description: 'WIO 플랫폼 정식 런칭 후 첫 50개 유료 고객 확보. Starter/Pro 플랜 중심.', owner: '전략기획팀', startDate: '2026-01', endDate: '2026-06', progress: 35, status: 'on_track' },
  { id: 'i2', title: 'AI 에이전트 코어 완성', description: 'Universe OS 기반 AI 에이전트 시스템 구축. 브랜드별 독립 에이전트 운영.', owner: '개발팀', startDate: '2026-02', endDate: '2026-09', progress: 20, status: 'on_track' },
  { id: 'i3', title: 'MADLeague 대학 커뮤니티 확장', description: '전국 20개 대학 동아리 연합 네트워크 구축. 인재 파이프라인 시스템화.', owner: 'MAD사업부', startDate: '2026-03', endDate: '2026-12', progress: 15, status: 'at_risk' },
  { id: 'i4', title: 'SmarComm 마케팅 솔루션 상용화', description: '마케팅 자동화 + 콘텐츠 파이프라인 솔루션 B2B 출시. 월 3건 계약 목표.', owner: '마케팅사업부', startDate: '2026-04', endDate: '2026-12', progress: 5, status: 'delayed' },
];

const STATUS_COLORS: Record<string, string> = {
  on_track: 'text-emerald-400 bg-emerald-500/10',
  at_risk: 'text-amber-400 bg-amber-500/10',
  delayed: 'text-red-400 bg-red-500/10',
  completed: 'text-blue-400 bg-blue-500/10',
};
const STATUS_LABELS: Record<string, string> = {
  on_track: '정상', at_risk: '리스크', delayed: '지연', completed: '완료',
};

/* ── Timeline helper ── */
const months = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];
function getBarStyle(start: string, end: string) {
  const sMonth = parseInt(start.split('-')[1]) - 1;
  const eMonth = parseInt(end.split('-')[1]) - 1;
  return { left: `${(sMonth / 12) * 100}%`, width: `${((eMonth - sMonth + 1) / 12) * 100}%` };
}

export default function PlanningPage() {
  const { tenant, isDemo } = useWIO();
  const [initiatives, setInitiatives] = useState<Initiative[]>(isDemo ? INITIATIVES : []);
  const [loading, setLoading] = useState(!isDemo);

  // Supabase에서 전략 이니셔티브 로드
  const loadStrategies = useCallback(async () => {
    if (isDemo) return;
    setLoading(true);
    try {
      const sb = createClient();
      const { data, error } = await sb
        .from('wio_strategies')
        .select('*')
        .eq('tenant_id', tenant!.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      if (data && data.length > 0) {
        setInitiatives(data.map((row: any) => ({
          id: row.id,
          title: row.title || '',
          description: row.description || '',
          owner: row.owner || '',
          startDate: row.start_date ? row.start_date.slice(0, 7) : '',
          endDate: row.end_date ? row.end_date.slice(0, 7) : '',
          progress: row.progress ?? 0,
          status: row.status || 'on_track',
        })));
      } else {
        // 데이터 없으면 Mock 폴백
        setInitiatives(INITIATIVES);
      }
    } catch {
      setInitiatives(INITIATIVES);
    } finally {
      setLoading(false);
    }
  }, [isDemo, tenant]);

  useEffect(() => { loadStrategies(); }, [loadStrategies]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div><h1 className="text-xl font-bold">경영 기획</h1></div>
        <div className="text-center py-12">
          <div className="h-6 w-6 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-500">데이터 로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold">경영 기획</h1>
        <p className="text-xs text-slate-500 mt-0.5">STR-PLN · 2026년 사업계획</p>
      </div>

      {/* Vision & Mission */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-5">
          <div className="flex items-center gap-2 mb-3">
            <Compass size={18} className="text-indigo-400" />
            <span className="text-sm font-bold text-indigo-400">비전</span>
          </div>
          <p className="text-sm leading-relaxed">"입력을 없앤다. AI가 80%를 채운다."</p>
          <p className="text-xs text-slate-500 mt-2">AI 기반 업무 자동화 플랫폼으로 모든 기업의 디지털 전환을 이끈다.</p>
        </div>
        <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-5">
          <div className="flex items-center gap-2 mb-3">
            <Target size={18} className="text-violet-400" />
            <span className="text-sm font-bold text-violet-400">미션</span>
          </div>
          <p className="text-sm leading-relaxed">WIO 플랫폼을 통해 기업이 사람·돈·시간을 가장 효율적으로 운영하도록 돕는다.</p>
          <p className="text-xs text-slate-500 mt-2">모듈형 SaaS로 필요한 기능만 골라 쓰는 유연한 업무 인프라 제공.</p>
        </div>
      </div>

      {/* Annual Goals */}
      <div>
        <h2 className="text-sm font-bold mb-3 flex items-center gap-2"><Lightbulb size={16} className="text-amber-400" />2026 전략 이니셔티브</h2>
        <div className="grid grid-cols-2 gap-3">
          {initiatives.map(init => (
            <div key={init.id} className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-sm font-semibold flex-1">{init.title}</h3>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ml-2 ${STATUS_COLORS[init.status]}`}>{STATUS_LABELS[init.status]}</span>
              </div>
              <p className="text-xs text-slate-400 mb-3 line-clamp-2">{init.description}</p>
              <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                <span>{init.owner}</span>
                <span>{init.progress}%</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-white/5">
                <div className="h-full rounded-full bg-indigo-500 transition-all" style={{ width: `${init.progress}%` }} />
              </div>
              <div className="flex items-center gap-1 mt-2 text-[10px] text-slate-600">
                <Calendar size={10} />{init.startDate} ~ {init.endDate}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SWOT 2x2 */}
      <div>
        <h2 className="text-sm font-bold mb-3">SWOT 분석</h2>
        <div className="grid grid-cols-2 gap-3">
          {Object.entries(SWOT_CONFIG).map(([key, cfg]) => {
            const Icon = cfg.icon;
            const items = SWOT[key as keyof typeof SWOT];
            return (
              <div key={key} className={`rounded-xl border p-4 ${cfg.bg}`}>
                <div className={`flex items-center gap-2 mb-3 ${cfg.color}`}>
                  <Icon size={16} />
                  <span className="text-sm font-bold">{cfg.label}</span>
                </div>
                <ul className="space-y-1.5">
                  {items.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                      <ChevronRight size={10} className="mt-0.5 text-slate-600 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>

      {/* Timeline Roadmap */}
      <div>
        <h2 className="text-sm font-bold mb-3 flex items-center gap-2"><TrendingUp size={16} className="text-indigo-400" />전략 로드맵 타임라인</h2>
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
          {/* Month headers */}
          <div className="flex mb-3">
            {months.map(m => (
              <div key={m} className="flex-1 text-center text-[10px] text-slate-600">{m}</div>
            ))}
          </div>
          {/* Bars */}
          <div className="space-y-3">
            {initiatives.map(init => {
              const style = getBarStyle(init.startDate, init.endDate);
              return (
                <div key={init.id} className="relative">
                  <div className="text-xs text-slate-400 mb-1">{init.title}</div>
                  <div className="relative h-6 rounded bg-white/[0.03]">
                    <div className="absolute top-0 h-full rounded bg-indigo-500/20 border border-indigo-500/30" style={style}>
                      <div className="h-full rounded bg-indigo-500/40" style={{ width: `${init.progress}%` }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
