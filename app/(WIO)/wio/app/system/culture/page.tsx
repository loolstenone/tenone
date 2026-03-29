'use client';

import { useState, useEffect, useCallback } from 'react';
import { Heart, Target, Star, TrendingUp, Users, FileText, Award, Edit3, Save, Plus, Trash2, Activity, X } from 'lucide-react';
import { useWIO } from '../../layout';
import {
  fetchCultureValues, upsertCultureValue, deleteCultureValue, getCultureHealth,
  type CultureValue, type CultureHealth,
} from '@/lib/culture-engine';

/* ── 아이콘 매핑 ── */
const ICON_MAP: Record<string, typeof Heart> = {
  Star, Users, Target, TrendingUp, Award, Heart, FileText, Activity,
};
function getIcon(name?: string) {
  if (!name) return Star;
  return ICON_MAP[name] || Star;
}

/* ── Mock 폴백 ── */
const MOCK_MISSION = '기술과 사람을 연결하여, 모든 조직이 더 나은 방식으로 일할 수 있는 세상을 만든다.';
const MOCK_VISION = '2030년까지 아시아 No.1 통합 업무 플랫폼이 되어, 10만 개 조직의 디지털 전환을 이끈다.';

const MOCK_VALUES: CultureValue[] = [
  {
    id: 'v1', tenantId: 'demo', name: '혁신', description: '기존의 방식에 안주하지 않고, 더 나은 해결책을 끊임없이 찾는다.',
    icon: 'Star', behavioralIndicators: ['새로운 아이디어 제안', '실험적 시도', '개선 제안서 작성'], weight: 0.25,
    isActive: true, createdAt: '2026-01-01', updatedAt: '2026-01-01',
  },
  {
    id: 'v2', tenantId: 'demo', name: '협업', description: '팀의 성과가 개인의 성과보다 크다. 함께 일하는 방법을 먼저 생각한다.',
    icon: 'Users', behavioralIndicators: ['크로스팀 프로젝트 참여', '지식 공유', '동료 피드백 제공'], weight: 0.25,
    isActive: true, createdAt: '2026-01-01', updatedAt: '2026-01-01',
  },
  {
    id: 'v3', tenantId: 'demo', name: '투명성', description: '정보를 숨기지 않는다. 의사결정의 근거를 공유한다.',
    icon: 'Target', behavioralIndicators: ['문서화 습관', '의사결정 배경 공유', '데이터 기반 보고'], weight: 0.2,
    isActive: true, createdAt: '2026-01-01', updatedAt: '2026-01-01',
  },
  {
    id: 'v4', tenantId: 'demo', name: '성장', description: '개인과 조직의 성장을 함께 추구한다.',
    icon: 'TrendingUp', behavioralIndicators: ['학습 시간 확보', '멘토링 참여', '자기 개발 목표 설정'], weight: 0.15,
    isActive: true, createdAt: '2026-01-01', updatedAt: '2026-01-01',
  },
  {
    id: 'v5', tenantId: 'demo', name: '책임감', description: '맡은 일에 끝까지 책임진다. 결과로 말한다.',
    icon: 'Award', behavioralIndicators: ['일정 준수', '약속 이행', '문제 발생 시 선제 보고'], weight: 0.15,
    isActive: true, createdAt: '2026-01-01', updatedAt: '2026-01-01',
  },
];

const MOCK_HEALTH: CultureHealth = {
  valueUsage: 72, templateCompliance: 87, feedbackActivity: 65,
  meetingEfficiency: 58, onboardingRate: 91, overallScore: 75,
};

/* ── 가치 편집 모달 ── */
function ValueEditModal({
  open, onClose, value, onSave,
}: {
  open: boolean; onClose: () => void;
  value: Partial<CultureValue> | null;
  onSave: (v: Partial<CultureValue>) => void;
}) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('Star');
  const [weight, setWeight] = useState('0.2');
  const [indicators, setIndicators] = useState<string[]>([]);
  const [newIndicator, setNewIndicator] = useState('');

  useEffect(() => {
    if (value) {
      setName(value.name || '');
      setDescription(value.description || '');
      setIcon(value.icon || 'Star');
      setWeight(String(value.weight ?? 0.2));
      setIndicators(value.behavioralIndicators || []);
    } else {
      setName(''); setDescription(''); setIcon('Star'); setWeight('0.2'); setIndicators([]);
    }
  }, [value]);

  if (!open) return null;

  const addIndicator = () => {
    if (newIndicator.trim()) {
      setIndicators(prev => [...prev, newIndicator.trim()]);
      setNewIndicator('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#0F0F23] p-6 shadow-xl" onClick={e => e.stopPropagation()}>
        <h2 className="text-lg font-bold mb-4">{value?.id ? '핵심가치 수정' : '핵심가치 추가'}</h2>
        <div className="space-y-4">
          <div>
            <label className="text-xs text-slate-500 block mb-1">가치명</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="예: 혁신, 협업"
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none" />
          </div>
          <div>
            <label className="text-xs text-slate-500 block mb-1">설명</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm resize-none focus:border-indigo-500 focus:outline-none" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-500 block mb-1">아이콘</label>
              <select value={icon} onChange={e => setIcon(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none">
                {Object.keys(ICON_MAP).map(k => <option key={k} value={k} className="bg-[#0F0F23]">{k}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-500 block mb-1">가중치 (0~1)</label>
              <input value={weight} onChange={e => setWeight(e.target.value)} type="number" step="0.05" min="0" max="1"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none font-mono" />
            </div>
          </div>
          <div>
            <label className="text-xs text-slate-500 block mb-1">행동지표</label>
            <div className="space-y-1 mb-2">
              {indicators.map((ind, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-slate-400">
                  <div className="w-1 h-1 rounded-full bg-indigo-500 shrink-0" />
                  <span className="flex-1">{ind}</span>
                  <button onClick={() => setIndicators(prev => prev.filter((_, j) => j !== i))} className="text-slate-600 hover:text-red-400">
                    <X size={10} />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input value={newIndicator} onChange={e => setNewIndicator(e.target.value)} placeholder="행동지표 추가"
                onKeyDown={e => e.key === 'Enter' && addIndicator()}
                className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs focus:border-indigo-500 focus:outline-none" />
              <button onClick={addIndicator} className="text-xs text-indigo-400 hover:text-indigo-300 px-2">추가</button>
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <button onClick={onClose} className="px-4 py-2 text-sm text-slate-400 hover:text-white rounded-lg border border-white/5 hover:border-white/10 transition-colors">취소</button>
          <button disabled={!name.trim()} onClick={() => {
            onSave({ ...value, name, description, icon, weight: parseFloat(weight) || 0.2, behavioralIndicators: indicators });
            onClose();
          }} className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg disabled:opacity-50 transition-colors">
            <Save size={13} className="inline mr-1" /> 저장
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── 건강도 게이지 ── */
function HealthGauge({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-slate-400">{label}</span>
        <span className={`text-xs font-bold ${color}`}>{value}%</span>
      </div>
      <div className="w-full h-2 bg-white/5 rounded-full">
        <div className={`h-full rounded-full transition-all duration-500 ${color.includes('emerald') ? 'bg-emerald-500' : color.includes('amber') ? 'bg-amber-500' : color.includes('indigo') ? 'bg-indigo-500' : color.includes('cyan') ? 'bg-cyan-500' : 'bg-violet-500'}`}
          style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

export default function CulturePage() {
  const { tenant } = useWIO();
  const isDemo = !tenant || tenant.id === 'demo';
  const tenantId = tenant?.id || 'demo';

  const [mission, setMission] = useState(MOCK_MISSION);
  const [vision, setVision] = useState(MOCK_VISION);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(!isDemo);

  const [values, setValues] = useState<CultureValue[]>(isDemo ? MOCK_VALUES : []);
  const [health, setHealth] = useState<CultureHealth>(isDemo ? MOCK_HEALTH : { valueUsage: 0, templateCompliance: 0, feedbackActivity: 0, meetingEfficiency: 0, onboardingRate: 0, overallScore: 0 });

  // 모달
  const [editingValue, setEditingValue] = useState<Partial<CultureValue> | null>(null);
  const [showValueModal, setShowValueModal] = useState(false);

  // culture engine에서 데이터 로드
  const loadCulture = useCallback(async () => {
    if (isDemo) { setLoading(false); return; }
    setLoading(true);
    try {
      const [vals, hlth] = await Promise.all([
        fetchCultureValues(tenantId),
        getCultureHealth(tenantId),
      ]);
      if (vals.length > 0) {
        setValues(vals);
      } else {
        setValues(MOCK_VALUES);
      }
      // health: overallScore > 0이면 실제 데이터
      if (hlth.overallScore > 0) {
        setHealth(hlth);
      } else {
        setHealth(MOCK_HEALTH);
      }
    } catch {
      setValues(MOCK_VALUES);
      setHealth(MOCK_HEALTH);
    } finally {
      setLoading(false);
    }
  }, [isDemo, tenantId]);

  useEffect(() => { loadCulture(); }, [loadCulture]);

  // 가치 저장 (추가/수정)
  const handleSaveValue = async (v: Partial<CultureValue>) => {
    if (isDemo) {
      // 데모: 로컬 상태만 업데이트
      if (v.id) {
        setValues(prev => prev.map(val => val.id === v.id ? { ...val, ...v, updatedAt: new Date().toISOString() } as CultureValue : val));
      } else {
        const newVal: CultureValue = {
          id: `v-${Date.now()}`, tenantId: 'demo', name: v.name || '', description: v.description || '',
          behavioralIndicators: v.behavioralIndicators || [], weight: v.weight ?? 0.2,
          icon: v.icon, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
        };
        setValues(prev => [...prev, newVal]);
      }
      return;
    }
    // 실제: culture engine 호출
    const result = await upsertCultureValue(tenantId, v);
    if (result) {
      if (v.id) {
        setValues(prev => prev.map(val => val.id === v.id ? result : val));
      } else {
        setValues(prev => [...prev, result]);
      }
    }
  };

  // 가치 삭제 (소프트 삭제)
  const handleDeleteValue = async (valueId: string) => {
    if (isDemo) {
      setValues(prev => prev.filter(v => v.id !== valueId));
      return;
    }
    const ok = await deleteCultureValue(valueId);
    if (ok) {
      setValues(prev => prev.filter(v => v.id !== valueId));
    }
  };

  if (!tenant) return null;

  // 종합 점수 색상
  const scoreColor = health.overallScore >= 80 ? 'text-emerald-400' : health.overallScore >= 60 ? 'text-amber-400' : 'text-red-400';

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">Culture Engine</h1>
        <button onClick={() => setEditMode(!editMode)}
          className="flex items-center gap-1.5 rounded-lg border border-white/5 px-3 py-2 text-sm text-slate-400 hover:text-white hover:border-white/10 transition-all">
          {editMode ? <><Save size={14} /> 완료</> : <><Edit3 size={14} /> 편집</>}
        </button>
      </div>

      {isDemo && (
        <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-3 mb-4 text-sm text-amber-300">
          데모 모드입니다.
        </div>
      )}

      {loading && (
        <div className="text-center py-12">
          <div className="h-6 w-6 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-500">문화 데이터 로딩 중...</p>
        </div>
      )}

      {!loading && (
        <>
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
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold">핵심가치</h2>
              {editMode && (
                <button onClick={() => { setEditingValue(null); setShowValueModal(true); }}
                  className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300">
                  <Plus size={12} /> 가치 추가
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {values.map(v => {
                const IconComp = getIcon(v.icon);
                return (
                  <div key={v.id} className="rounded-xl border border-white/5 bg-white/[0.02] p-4 group">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
                        <IconComp size={15} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold">{v.name}</h3>
                        <span className="text-[10px] text-slate-500">가중치 {(v.weight * 100).toFixed(0)}%</span>
                      </div>
                      {editMode && (
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => { setEditingValue(v); setShowValueModal(true); }}
                            className="p-1 rounded hover:bg-white/5 text-slate-500 hover:text-indigo-400">
                            <Edit3 size={12} />
                          </button>
                          <button onClick={() => handleDeleteValue(v.id)}
                            className="p-1 rounded hover:bg-white/5 text-slate-500 hover:text-red-400">
                            <Trash2 size={12} />
                          </button>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mb-3">{v.description}</p>
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-500">행동지표</span>
                      {v.behavioralIndicators.map((ind, i) => (
                        <div key={i} className="flex items-center gap-1.5 text-xs text-slate-400">
                          <div className="w-1 h-1 rounded-full bg-indigo-500" />
                          {ind}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Culture Health Dashboard */}
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-semibold flex items-center gap-1.5">
                <Activity size={14} className="text-indigo-400" /> Culture Health Dashboard
              </h2>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-500">종합 점수</span>
                <span className={`text-xl font-bold ${scoreColor}`}>{health.overallScore}</span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4">
              <HealthGauge label="핵심가치 활용도" value={health.valueUsage} color={health.valueUsage >= 70 ? 'text-emerald-400' : 'text-amber-400'} />
              <HealthGauge label="양식 준수율" value={health.templateCompliance} color={health.templateCompliance >= 80 ? 'text-emerald-400' : 'text-amber-400'} />
              <HealthGauge label="피드백 활성도" value={health.feedbackActivity} color={health.feedbackActivity >= 70 ? 'text-indigo-400' : 'text-amber-400'} />
              <HealthGauge label="미팅 효율" value={health.meetingEfficiency} color={health.meetingEfficiency >= 60 ? 'text-cyan-400' : 'text-amber-400'} />
              <HealthGauge label="온보딩 완료율" value={health.onboardingRate} color={health.onboardingRate >= 80 ? 'text-emerald-400' : 'text-amber-400'} />
            </div>
          </div>
        </>
      )}

      {/* 가치 편집 모달 */}
      <ValueEditModal
        open={showValueModal}
        onClose={() => setShowValueModal(false)}
        value={editingValue}
        onSave={handleSaveValue}
      />
    </div>
  );
}
