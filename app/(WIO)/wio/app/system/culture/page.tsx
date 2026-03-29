'use client';

import { useState, useEffect, useCallback } from 'react';
import { Heart, Target, Star, TrendingUp, Users, FileText, Award, Edit3, Save } from 'lucide-react';
import { useWIO } from '../../layout';
import { createClient } from '@/lib/supabase/client';

type CoreValue = {
  id: string; name: string; description: string; icon: typeof Heart;
  indicators: string[]; mentionCount: number;
};

const MOCK_MISSION = '기술과 사람을 연결하여, 모든 조직이 더 나은 방식으로 일할 수 있는 세상을 만든다.';
const MOCK_VISION = '2030년까지 아시아 No.1 통합 업무 플랫폼이 되어, 10만 개 조직의 디지털 전환을 이끈다.';

const MOCK_VALUES: CoreValue[] = [
  {
    id: 'v1', name: '혁신', description: '기존의 방식에 안주하지 않고, 더 나은 해결책을 끊임없이 찾는다.',
    icon: Star, indicators: ['새로운 아이디어 제안', '실험적 시도', '개선 제안서 작성'], mentionCount: 48,
  },
  {
    id: 'v2', name: '협업', description: '팀의 성과가 개인의 성과보다 크다. 함께 일하는 방법을 먼저 생각한다.',
    icon: Users, indicators: ['크로스팀 프로젝트 참여', '지식 공유', '동료 피드백 제공'], mentionCount: 62,
  },
  {
    id: 'v3', name: '투명성', description: '정보를 숨기지 않는다. 의사결정의 근거를 공유한다.',
    icon: Target, indicators: ['문서화 습관', '의사결정 배경 공유', '데이터 기반 보고'], mentionCount: 35,
  },
  {
    id: 'v4', name: '성장', description: '개인과 조직의 성장을 함께 추구한다.',
    icon: TrendingUp, indicators: ['학습 시간 확보', '멘토링 참여', '자기 개발 목표 설정'], mentionCount: 41,
  },
  {
    id: 'v5', name: '책임감', description: '맡은 일에 끝까지 책임진다. 결과로 말한다.',
    icon: Award, indicators: ['일정 준수', '약속 이행', '문제 발생 시 선제 보고'], mentionCount: 29,
  },
];

const MOCK_DASHBOARD = {
  valueMentionTotal: 215,
  formComplianceRate: 87,
  feedbackActivityRate: 72,
  monthlyTrend: [
    { month: '1월', count: 28 }, { month: '2월', count: 35 }, { month: '3월', count: 48 },
  ],
};

export default function CulturePage() {
  const { tenant } = useWIO();
  const isDemo = !tenant || tenant.id === 'demo';
  const [mission, setMission] = useState(MOCK_MISSION);
  const [vision, setVision] = useState(MOCK_VISION);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(!isDemo);

  // Supabase에서 조직문화 데이터 로드
  const loadCulture = useCallback(async () => {
    if (isDemo) { setLoading(false); return; }
    setLoading(true);
    try {
      const sb = createClient();
      const [valuesRes, metricsRes] = await Promise.all([
        sb.from('wio_culture_values').select('*').eq('tenant_id', tenant!.id),
        sb.from('wio_culture_metrics').select('*').eq('tenant_id', tenant!.id),
      ]);
      if (valuesRes.data && valuesRes.data.length > 0) {
        // TODO: data → mission/vision/values 매핑 구현
      }
      // TODO: metricsRes → 문화 지표 매핑
    } catch {
      // Mock 폴백
    } finally {
      setLoading(false);
    }
  }, [isDemo, tenant]);

  useEffect(() => { loadCulture(); }, [loadCulture]);

  if (!tenant) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">Culture Engine</h1>
        <button onClick={() => setEditMode(!editMode)}
          className="flex items-center gap-1.5 rounded-lg border border-white/5 px-3 py-2 text-sm text-slate-400 hover:text-white hover:border-white/10 transition-all">
          {editMode ? <><Save size={14} /> 저장</> : <><Edit3 size={14} /> 편집</>}
        </button>
      </div>

      {isDemo && (
        <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-3 mb-4 text-sm text-amber-300">
          데모 모드입니다.
        </div>
      )}

      {/* 미션 & 비전 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
          <h2 className="text-sm font-semibold mb-2 flex items-center gap-1.5"><Target size={14} className="text-indigo-400" /> 미션</h2>
          {editMode ? (
            <textarea value={mission} onChange={e => setMission(e.target.value)} rows={3}
              className="w-full rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2.5 text-sm resize-none focus:border-indigo-500 focus:outline-none" />
          ) : (
            <p className="text-sm text-slate-300 leading-relaxed">{mission}</p>
          )}
        </div>
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
          <h2 className="text-sm font-semibold mb-2 flex items-center gap-1.5"><Star size={14} className="text-amber-400" /> 비전</h2>
          {editMode ? (
            <textarea value={vision} onChange={e => setVision(e.target.value)} rows={3}
              className="w-full rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2.5 text-sm resize-none focus:border-indigo-500 focus:outline-none" />
          ) : (
            <p className="text-sm text-slate-300 leading-relaxed">{vision}</p>
          )}
        </div>
      </div>

      {/* 핵심 가치 */}
      <div className="mb-6">
        <h2 className="text-sm font-semibold mb-4">핵심가치</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {MOCK_VALUES.map(v => (
            <div key={v.id} className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
                  <v.icon size={15} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold">{v.name}</h3>
                  <span className="text-[10px] text-slate-500">언급 {v.mentionCount}회</span>
                </div>
              </div>
              <p className="text-xs text-slate-400 mb-3">{v.description}</p>
              <div className="space-y-1">
                <span className="text-[10px] text-slate-500">행동지표</span>
                {v.indicators.map((ind, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-xs text-slate-400">
                    <div className="w-1 h-1 rounded-full bg-indigo-500" />
                    {ind}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Culture Dashboard */}
      <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
        <h2 className="text-sm font-semibold mb-4">Culture Dashboard</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-indigo-400">{MOCK_DASHBOARD.valueMentionTotal}</div>
            <div className="text-xs text-slate-500 mt-1">가치 언급 빈도 (이번 분기)</div>
            <div className="flex items-center justify-center gap-1 mt-2">
              {MOCK_DASHBOARD.monthlyTrend.map(t => (
                <div key={t.month} className="text-center">
                  <div className="w-12 bg-white/5 rounded-t overflow-hidden">
                    <div className="bg-indigo-500 rounded-t" style={{ height: `${(t.count / 50) * 60}px` }} />
                  </div>
                  <span className="text-[9px] text-slate-600">{t.month}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-400">{MOCK_DASHBOARD.formComplianceRate}%</div>
            <div className="text-xs text-slate-500 mt-1">양식 준수율</div>
            <div className="w-full h-2 bg-white/5 rounded-full mt-3">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${MOCK_DASHBOARD.formComplianceRate}%` }} />
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-amber-400">{MOCK_DASHBOARD.feedbackActivityRate}%</div>
            <div className="text-xs text-slate-500 mt-1">피드백 활성도</div>
            <div className="w-full h-2 bg-white/5 rounded-full mt-3">
              <div className="h-full bg-amber-500 rounded-full" style={{ width: `${MOCK_DASHBOARD.feedbackActivityRate}%` }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
