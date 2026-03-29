'use client';

import { useState, useEffect, useCallback } from 'react';
import { Wrench, CheckCircle, AlertTriangle, XCircle, Calendar, Plus } from 'lucide-react';
import { useWIO } from '../../layout';
import { createClient } from '@/lib/supabase/client';

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  running: { label: '가동', color: 'text-emerald-400 bg-emerald-500/10' },
  standby: { label: '대기', color: 'text-blue-400 bg-blue-500/10' },
  maintenance: { label: '정비중', color: 'text-amber-400 bg-amber-500/10' },
  broken: { label: '고장', color: 'text-red-400 bg-red-500/10' },
};

const MOCK_EQUIPMENT = [
  { id: 'EQ-001', name: 'SMT 장비 (라인A)', model: 'YSM20R', manufacturer: 'YAMAHA', status: 'running', location: '1공장 A동', installDate: '2023-06-15', lastMaintenance: '2026-03-15', nextMaintenance: '2026-04-15', totalHours: 12400, failureCount: 3 },
  { id: 'EQ-002', name: '리플로우 오븐', model: 'RF-800', manufacturer: 'Heller', status: 'running', location: '1공장 A동', installDate: '2023-06-15', lastMaintenance: '2026-03-01', nextMaintenance: '2026-04-01', totalHours: 11800, failureCount: 1 },
  { id: 'EQ-003', name: 'AOI 검사기', model: 'Zenith-5D', manufacturer: 'Koh Young', status: 'maintenance', location: '1공장 B동', installDate: '2024-01-10', lastMaintenance: '2026-03-28', nextMaintenance: '2026-04-28', totalHours: 8200, failureCount: 2 },
  { id: 'EQ-004', name: '자동 조립기', model: 'AS-2000', manufacturer: 'Samsung', status: 'running', location: '2공장 A동', installDate: '2024-06-20', lastMaintenance: '2026-03-10', nextMaintenance: '2026-04-10', totalHours: 6500, failureCount: 0 },
  { id: 'EQ-005', name: 'ICT 테스터', model: 'i3070', manufacturer: 'Keysight', status: 'broken', location: '1공장 C동', installDate: '2022-03-05', lastMaintenance: '2026-02-15', nextMaintenance: '2026-03-15', totalHours: 15200, failureCount: 7 },
  { id: 'EQ-006', name: '패키징 머신', model: 'PK-500', manufacturer: '한국포장기', status: 'standby', location: '2공장 B동', installDate: '2025-01-15', lastMaintenance: '2026-03-20', nextMaintenance: '2026-06-20', totalHours: 3100, failureCount: 0 },
];

const MOCK_FAILURES = [
  { equipId: 'EQ-005', date: '2026-03-20', description: 'ICT 보드 접촉 불량', downtime: 16, resolved: false },
  { equipId: 'EQ-003', date: '2026-03-10', description: 'AOI 카메라 캘리브레이션 오류', downtime: 4, resolved: true },
  { equipId: 'EQ-001', date: '2026-02-28', description: '노즐 막힘', downtime: 2, resolved: true },
  { equipId: 'EQ-005', date: '2026-02-15', description: '전원부 불안정', downtime: 8, resolved: true },
  { equipId: 'EQ-002', date: '2026-01-20', description: '히터 온도 편차', downtime: 3, resolved: true },
];

const MAINTENANCE_SCHEDULE = [
  { equipId: 'EQ-002', name: '리플로우 오븐', type: '정기점검', date: '2026-04-01', assignee: '김정비' },
  { equipId: 'EQ-004', name: '자동 조립기', type: '정기점검', date: '2026-04-10', assignee: '박정비' },
  { equipId: 'EQ-001', name: 'SMT 장비', type: '예방교체 (노즐)', date: '2026-04-15', assignee: '김정비' },
  { equipId: 'EQ-003', name: 'AOI 검사기', type: '정기점검', date: '2026-04-28', assignee: '이정비' },
];

export default function EquipmentPage() {
  const { tenant } = useWIO();
  const isDemo = !tenant || tenant.id === 'demo';
  const [tab, setTab] = useState<'list' | 'schedule' | 'history'>('list');
  const [equipment, setEquipment] = useState(MOCK_EQUIPMENT);
  const [failures, setFailures] = useState(MOCK_FAILURES);
  const [schedule, setSchedule] = useState(MAINTENANCE_SCHEDULE);
  const [loading, setLoading] = useState(!isDemo);

  // Supabase에서 설비 데이터 로드
  const loadData = useCallback(async () => {
    if (isDemo) return;
    try {
      const sb = createClient();
      const { data, error } = await sb
        .from('wio_equipment')
        .select('*')
        .eq('tenant_id', tenant!.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      if (data && data.length > 0) {
        setEquipment(data.map((r: any) => ({
          id: r.id,
          name: r.name || '',
          model: r.type || '',
          manufacturer: '',
          status: r.status === 'active' ? 'running' : r.status || 'standby',
          location: '',
          installDate: r.created_at?.split('T')[0] || '',
          lastMaintenance: r.last_maintenance || '',
          nextMaintenance: r.next_maintenance || '',
          totalHours: 0,
          failureCount: 0,
          code: r.code || '',
        })));
      }
      // failures / schedule 전용 테이블은 아직 없으므로 Mock 유지
    } catch {
      // DB 실패 시 Mock 유지
    } finally {
      setLoading(false);
    }
  }, [isDemo, tenant]);

  useEffect(() => { loadData(); }, [loadData]);

  const runningCount = equipment.filter(e => e.status === 'running').length;
  const brokenCount = equipment.filter(e => e.status === 'broken').length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold">설비관리</h1>
          <p className="text-xs text-slate-500 mt-0.5">PRD-EQP &middot; 설비대장, 보전, 고장이력</p>
        </div>
        <button className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
          <Plus size={15} /> 설비 등록
        </button>
      </div>

      {/* 통계 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
          <p className="text-xs text-slate-500">전체 설비</p>
          <p className="text-2xl font-bold mt-1">{equipment.length}</p>
        </div>
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
          <p className="text-xs text-slate-500">가동중</p>
          <p className="text-2xl font-bold mt-1 text-emerald-400">{runningCount}</p>
        </div>
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
          <p className="text-xs text-slate-500">고장</p>
          <p className={`text-2xl font-bold mt-1 ${brokenCount > 0 ? 'text-red-400' : 'text-slate-500'}`}>{brokenCount}</p>
        </div>
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
          <p className="text-xs text-slate-500">이번 달 보전 예정</p>
          <p className="text-2xl font-bold mt-1 text-amber-400">{schedule.length}</p>
        </div>
      </div>

      {/* 탭 */}
      <div className="flex gap-2 mb-4">
        {[
          { key: 'list' as const, label: '설비대장' },
          { key: 'schedule' as const, label: '보전 일정' },
          { key: 'history' as const, label: '고장 이력' },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`text-sm px-4 py-2 rounded-lg ${tab === t.key ? 'bg-indigo-600/10 text-indigo-400 font-semibold' : 'text-slate-400 hover:bg-white/5'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'list' && (
        <div className="space-y-2">
          {equipment.map(eq => {
            const st = STATUS_MAP[eq.status];
            return (
              <div key={eq.id} className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Wrench size={14} className={st.color.split(' ')[0]} />
                    <span className="text-sm font-medium">{eq.name}</span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${st.color}`}>{st.label}</span>
                  </div>
                  <span className="text-xs text-slate-600 font-mono">{eq.id}</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-slate-500">
                  <span>모델: {eq.model}</span>
                  <span>제조사: {eq.manufacturer}</span>
                  <span>위치: {eq.location}</span>
                  <span>가동시간: {eq.totalHours.toLocaleString()}h</span>
                </div>
                <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                  <span>설치 {eq.installDate}</span>
                  <span>최근 보전 {eq.lastMaintenance}</span>
                  <span className={eq.nextMaintenance <= '2026-04-01' ? 'text-amber-400 font-medium' : ''}>다음 보전 {eq.nextMaintenance}</span>
                  <span>고장 {eq.failureCount}회</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {tab === 'schedule' && (
        <div className="space-y-2">
          {schedule.map((ms, i) => (
            <div key={i} className="flex items-center gap-4 rounded-xl border border-white/5 bg-white/[0.02] p-4">
              <Calendar size={14} className="text-blue-400 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{ms.name}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-slate-400">{ms.type}</span>
                </div>
                <div className="text-xs text-slate-500 mt-0.5">담당: {ms.assignee}</div>
              </div>
              <span className="text-xs text-slate-400">{ms.date}</span>
            </div>
          ))}
        </div>
      )}

      {tab === 'history' && (
        <div className="space-y-2">
          {failures.map((f, i) => (
            <div key={i} className="flex items-center gap-4 rounded-xl border border-white/5 bg-white/[0.02] p-4">
              {f.resolved ? <CheckCircle size={14} className="text-emerald-400 shrink-0" /> : <XCircle size={14} className="text-red-400 shrink-0" />}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-slate-600">{f.equipId}</span>
                  <span className="text-sm font-medium">{f.description}</span>
                </div>
                <div className="text-xs text-slate-500 mt-0.5">{f.date} &middot; 다운타임 {f.downtime}시간</div>
              </div>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${f.resolved ? 'text-emerald-400 bg-emerald-500/10' : 'text-red-400 bg-red-500/10'}`}>
                {f.resolved ? '해결' : '미해결'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
