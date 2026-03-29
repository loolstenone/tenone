'use client';

import { useState, useEffect, useCallback } from 'react';
import { Users, Plus, Star, Filter, Building2, Handshake, Briefcase, GraduationCap } from 'lucide-react';
import { useWIO } from '../layout';
import { createClient } from '@/lib/supabase/client';

type Partner = {
  id: string;
  name: string;
  type: '계열사' | '협력사' | '벤더' | '컨설팅';
  grade: 'S' | 'A' | 'B' | 'C';
  score: number;
  contact: string;
  email: string;
  description: string;
  since: string;
};

const TYPE_MAP: Record<string, { icon: any; color: string }> = {
  '계열사': { icon: Building2, color: 'text-purple-400 bg-purple-500/10' },
  '협력사': { icon: Handshake, color: 'text-blue-400 bg-blue-500/10' },
  '벤더': { icon: Briefcase, color: 'text-amber-400 bg-amber-500/10' },
  '컨설팅': { icon: GraduationCap, color: 'text-emerald-400 bg-emerald-500/10' },
};

const GRADE_COLOR: Record<string, string> = {
  S: 'text-yellow-400 bg-yellow-500/10',
  A: 'text-indigo-400 bg-indigo-500/10',
  B: 'text-slate-300 bg-white/5',
  C: 'text-slate-500 bg-white/5',
};

const MOCK_PARTNERS: Partner[] = [
  { id: 'P-001', name: 'MAD League', type: '계열사', grade: 'S', score: 95, contact: '이매드', email: 'mad@tenone.io', description: '대학 동아리 연합 플랫폼', since: '2024-01' },
  { id: 'P-002', name: '글로벌테크', type: '협력사', grade: 'A', score: 88, contact: '김글로벌', email: 'contact@globaltech.co.kr', description: 'AI/ML 기술 협력', since: '2025-03' },
  { id: 'P-003', name: '클라우드코리아', type: '벤더', grade: 'A', score: 85, contact: '박클라우드', email: 'biz@cloudkorea.io', description: '클라우드 인프라 공급', since: '2025-01' },
  { id: 'P-004', name: '맥킨지코리아', type: '컨설팅', grade: 'S', score: 92, contact: '최컨설턴트', email: 'kor@mckinsey.com', description: '경영 전략 자문', since: '2025-06' },
  { id: 'P-005', name: '에듀플러스', type: '협력사', grade: 'B', score: 72, contact: '정에듀', email: 'hello@eduplus.kr', description: '교육 콘텐츠 공동 개발', since: '2025-09' },
  { id: 'P-006', name: '한국IT솔루션', type: '벤더', grade: 'B', score: 78, contact: '한솔루션', email: 'sales@kitsol.co.kr', description: 'IT장비/서버 공급', since: '2025-01' },
  { id: 'P-007', name: 'SmarComm', type: '계열사', grade: 'S', score: 98, contact: '유커뮤니케이션', email: 'info@smarcomm.io', description: '마케팅 커뮤니케이션', since: '2024-01' },
  { id: 'P-008', name: '디자인웍스', type: '협력사', grade: 'A', score: 82, contact: '오디자인', email: 'work@designworks.kr', description: '브랜드 디자인 협업', since: '2025-04' },
];

export default function PartnerPage() {
  const { tenant } = useWIO();
  const isDemo = !tenant || tenant.id === 'demo';
  const [showForm, setShowForm] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');
  const [partners, setPartners] = useState<Partner[]>(isDemo ? MOCK_PARTNERS : []);
  const [loading, setLoading] = useState(!isDemo);

  // Supabase에서 파트너 데이터 로드
  const loadPartners = useCallback(async () => {
    if (isDemo) return;
    setLoading(true);
    try {
      const sb = createClient();
      const { data, error } = await sb
        .from('partners')
        .select('*')
        .eq('tenant_id', tenant!.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      if (data && data.length > 0) {
        setPartners(data.map((row: any) => ({
          id: row.id,
          name: row.name || '',
          type: row.type || '협력사',
          grade: row.grade || 'B',
          score: row.score || 0,
          contact: row.contact || '',
          email: row.email || '',
          description: row.description || '',
          since: row.since || '',
        })));
      } else {
        setPartners(MOCK_PARTNERS);
      }
    } catch {
      setPartners(MOCK_PARTNERS);
    } finally {
      setLoading(false);
    }
  }, [isDemo, tenant]);

  useEffect(() => { loadPartners(); }, [loadPartners]);

  const filtered = filterType === 'all' ? partners : partners.filter(p => p.type === filterType);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold">파트너관리</h1>
          <p className="text-xs text-slate-500 mt-0.5">PTN-MGT &middot; Partner Management</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
          <Plus size={15} /> 파트너 등록
        </button>
      </div>

      {/* 유형 필터 */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <button onClick={() => setFilterType('all')}
          className={`rounded-lg px-3 py-1.5 text-xs transition-colors ${filterType === 'all' ? 'bg-indigo-600/10 text-indigo-400 font-semibold' : 'text-slate-400 hover:bg-white/5'}`}>
          전체 ({partners.length})
        </button>
        {Object.entries(TYPE_MAP).map(([key, val]) => {
          const Icon = val.icon;
          const count = partners.filter(p => p.type === key).length;
          return (
            <button key={key} onClick={() => setFilterType(key)}
              className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs transition-colors ${filterType === key ? 'bg-indigo-600/10 text-indigo-400 font-semibold' : 'text-slate-400 hover:bg-white/5'}`}>
              <Icon size={12} /> {key} ({count})
            </button>
          );
        })}
      </div>

      {/* 파트너 등록 폼 */}
      {showForm && (
        <div className="mb-4 rounded-xl border border-white/5 bg-white/[0.02] p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input placeholder="파트너명" className="rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none" />
            <select defaultValue="" className="rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2 text-sm text-slate-400 focus:border-indigo-500 focus:outline-none">
              <option value="" disabled>유형 선택</option>
              <option value="계열사">계열사</option>
              <option value="협력사">협력사</option>
              <option value="벤더">벤더</option>
              <option value="컨설팅">컨설팅</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input placeholder="담당자" className="rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none" />
            <input type="email" placeholder="이메일" className="rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none" />
          </div>
          <input placeholder="설명" className="w-full rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none" />
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-slate-400">취소</button>
            <button className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white">등록</button>
          </div>
        </div>
      )}

      {/* 로딩 */}
      {loading && (
        <div className="text-center py-12">
          <div className="h-6 w-6 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-500">데이터 로딩 중...</p>
        </div>
      )}

      {/* 파트너 목록 */}
      {!loading && <div className="space-y-2">
        {filtered.map(p => {
          const typeInfo = TYPE_MAP[p.type];
          const TypeIcon = typeInfo.icon;
          return (
            <div key={p.id} className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${typeInfo.color.split(' ')[1]}`}>
                    <TypeIcon size={16} className={typeInfo.color.split(' ')[0]} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{p.name}</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${GRADE_COLOR[p.grade]}`}>{p.grade}</span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${typeInfo.color}`}>{p.type}</span>
                    </div>
                    <div className="text-xs text-slate-500">{p.description}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1">
                    <Star size={12} className="text-amber-400" />
                    <span className="text-sm font-bold">{p.score}</span>
                  </div>
                  <div className="text-[10px] text-slate-600">since {p.since}</div>
                </div>
              </div>
              <div className="text-xs text-slate-500 mt-1">
                담당: {p.contact} &middot; {p.email}
              </div>
            </div>
          );
        })}
      </div>}
    </div>
  );
}
