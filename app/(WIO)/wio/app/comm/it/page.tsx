'use client';

import { useState } from 'react';
import { Monitor, Laptop, Smartphone, Plus, AlertTriangle, Check, Clock, Key, Search } from 'lucide-react';
import { useWIO } from '../../layout';

type DeviceType = 'laptop' | 'monitor' | 'phone' | 'software';
type DeviceStatus = 'active' | 'returned' | 'repair';
type Device = {
  id: string; name: string; type: DeviceType; serial: string; assignee: string;
  status: DeviceStatus; assignedAt: string; note?: string;
};
type License = { id: string; name: string; seats: number; used: number; expiresAt: string; vendor: string };

const MOCK_DEVICES: Device[] = [
  { id: 'dv1', name: 'MacBook Pro 14"', type: 'laptop', serial: 'MBP-2026-001', assignee: '박개발', status: 'active', assignedAt: '2026-01-15' },
  { id: 'dv2', name: 'MacBook Pro 16"', type: 'laptop', serial: 'MBP-2026-002', assignee: '이프론트', status: 'active', assignedAt: '2026-01-15' },
  { id: 'dv3', name: 'Dell U2723QE 27"', type: 'monitor', serial: 'MON-2025-001', assignee: '박개발', status: 'active', assignedAt: '2025-12-01' },
  { id: 'dv4', name: 'Dell U2723QE 27"', type: 'monitor', serial: 'MON-2025-002', assignee: '정백엔드', status: 'active', assignedAt: '2025-12-01' },
  { id: 'dv5', name: 'iPhone 16 Pro', type: 'phone', serial: 'IPH-2026-001', assignee: '김대표', status: 'active', assignedAt: '2026-02-01' },
  { id: 'dv6', name: 'MacBook Air 15"', type: 'laptop', serial: 'MBA-2025-003', assignee: '-', status: 'returned', assignedAt: '2025-06-01', note: '전 직원 반납' },
  { id: 'dv7', name: 'Figma License', type: 'software', serial: 'SW-FIG-001', assignee: '정디자인', status: 'active', assignedAt: '2026-01-01' },
  { id: 'dv8', name: 'LG 34WN80C 34"', type: 'monitor', serial: 'MON-2025-003', assignee: '이마케팅', status: 'repair', assignedAt: '2025-10-01', note: '화면 불량 수리 중' },
  { id: 'dv9', name: 'Galaxy Z Fold5', type: 'phone', serial: 'GAL-2025-001', assignee: '윤기획', status: 'active', assignedAt: '2025-11-15' },
  { id: 'dv10', name: 'ThinkPad X1 Carbon', type: 'laptop', serial: 'TP-2025-001', assignee: '한재무', status: 'active', assignedAt: '2025-09-01' },
];

const MOCK_LICENSES: License[] = [
  { id: 'l1', name: 'Figma Business', seats: 10, used: 7, expiresAt: '2026-12-31', vendor: 'Figma Inc.' },
  { id: 'l2', name: 'Slack Pro', seats: 30, used: 22, expiresAt: '2026-06-30', vendor: 'Salesforce' },
  { id: 'l3', name: 'GitHub Team', seats: 15, used: 12, expiresAt: '2026-04-15', vendor: 'GitHub' },
  { id: 'l4', name: 'Notion Team', seats: 30, used: 25, expiresAt: '2026-09-30', vendor: 'Notion Labs' },
  { id: 'l5', name: 'Google Workspace', seats: 30, used: 22, expiresAt: '2027-01-31', vendor: 'Google' },
];

type Tab = 'devices' | 'licenses';
const DEV_ICONS: Record<DeviceType, typeof Monitor> = { laptop: Laptop, monitor: Monitor, phone: Smartphone, software: Key };
const STATUS_COLORS: Record<DeviceStatus, string> = { active: 'text-emerald-400 bg-emerald-500/10', returned: 'text-slate-400 bg-slate-500/10', repair: 'text-amber-400 bg-amber-500/10' };
const STATUS_LABELS: Record<DeviceStatus, string> = { active: '사용중', returned: '반납', repair: '수리중' };

export default function ITPage() {
  const { tenant } = useWIO();
  const [tab, setTab] = useState<Tab>('devices');
  const [searchQuery, setSearchQuery] = useState('');
  const [showRequest, setShowRequest] = useState(false);

  if (!tenant) return null;
  const isDemo = tenant.id === 'demo';

  const filteredDevices = MOCK_DEVICES.filter(d => !searchQuery || d.name.toLowerCase().includes(searchQuery.toLowerCase()) || d.assignee.includes(searchQuery));

  const expiringLicenses = MOCK_LICENSES.filter(l => {
    const days = (new Date(l.expiresAt).getTime() - new Date('2026-03-29').getTime()) / (1000 * 60 * 60 * 24);
    return days < 90;
  });

  const TABS = [
    { id: 'devices' as Tab, label: '장비', icon: Monitor },
    { id: 'licenses' as Tab, label: '라이선스', icon: Key },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">전산관리</h1>
        <button onClick={() => setShowRequest(!showRequest)} className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors">
          <Plus size={15} /> 장비 요청
        </button>
      </div>

      {isDemo && (
        <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-3 mb-4 text-sm text-amber-300">
          데모 모드입니다.
        </div>
      )}

      {showRequest && (
        <div className="mb-4 rounded-xl border border-white/5 bg-white/[0.02] p-4 space-y-3">
          <input placeholder="장비명" className="w-full rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none" />
          <select className="w-full rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2.5 text-sm focus:outline-none">
            <option className="bg-[#0F0F23]">노트북</option>
            <option className="bg-[#0F0F23]">모니터</option>
            <option className="bg-[#0F0F23]">모바일</option>
            <option className="bg-[#0F0F23]">소프트웨어</option>
          </select>
          <textarea placeholder="요청 사유" rows={3} className="w-full rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2.5 text-sm resize-none focus:border-indigo-500 focus:outline-none" />
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowRequest(false)} className="px-4 py-2 text-sm text-slate-400 hover:text-white">취소</button>
            <button className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500">요청</button>
          </div>
        </div>
      )}

      <div className="flex items-center gap-3 mb-4">
        <div className="flex gap-1.5">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm transition-colors ${tab === t.id ? 'bg-indigo-600/10 text-indigo-400 font-semibold' : 'text-slate-400 hover:bg-white/5'}`}>
              <t.icon size={14} /> {t.label}
            </button>
          ))}
        </div>
        {tab === 'devices' && (
          <div className="relative flex-1 max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="장비/사용자 검색..."
              className="w-full rounded-lg border border-white/5 bg-white/[0.03] pl-9 pr-3 py-2 text-sm focus:border-indigo-500 focus:outline-none" />
          </div>
        )}
      </div>

      {tab === 'devices' && (
        <div className="rounded-xl border border-white/5 bg-white/[0.02] overflow-hidden">
          <div className="grid grid-cols-12 gap-2 px-4 py-2 border-b border-white/5 text-[10px] text-slate-500 uppercase tracking-wider">
            <div className="col-span-3">장비</div>
            <div className="col-span-2">시리얼</div>
            <div className="col-span-2">사용자</div>
            <div className="col-span-2">상태</div>
            <div className="col-span-2">배정일</div>
            <div className="col-span-1">비고</div>
          </div>
          {filteredDevices.map(d => {
            const Icon = DEV_ICONS[d.type];
            return (
              <div key={d.id} className="grid grid-cols-12 gap-2 px-4 py-3 border-b border-white/5 hover:bg-white/[0.04] transition-colors">
                <div className="col-span-3 flex items-center gap-2">
                  <Icon size={14} className="text-slate-400" />
                  <span className="text-sm truncate">{d.name}</span>
                </div>
                <div className="col-span-2 text-xs text-slate-500 flex items-center font-mono">{d.serial}</div>
                <div className="col-span-2 text-xs text-slate-400 flex items-center">{d.assignee}</div>
                <div className="col-span-2 flex items-center">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[d.status]}`}>{STATUS_LABELS[d.status]}</span>
                </div>
                <div className="col-span-2 text-xs text-slate-500 flex items-center">{d.assignedAt.slice(5)}</div>
                <div className="col-span-1 text-xs text-slate-600 flex items-center truncate">{d.note || '-'}</div>
              </div>
            );
          })}
        </div>
      )}

      {tab === 'licenses' && (
        <div className="space-y-4">
          {expiringLicenses.length > 0 && (
            <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-3 flex items-center gap-2 text-sm text-amber-300">
              <AlertTriangle size={14} />
              {expiringLicenses.length}개 라이선스가 90일 이내 만료 예정입니다.
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {MOCK_LICENSES.map(l => {
              const pct = Math.round((l.used / l.seats) * 100);
              const daysLeft = Math.round((new Date(l.expiresAt).getTime() - new Date('2026-03-29').getTime()) / (1000 * 60 * 60 * 24));
              return (
                <div key={l.id} className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold">{l.name}</h3>
                    {daysLeft < 90 && <AlertTriangle size={12} className="text-amber-400" />}
                  </div>
                  <div className="text-xs text-slate-500 mb-3">{l.vendor}</div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-400">사용량</span>
                    <span>{l.used}/{l.seats}석 ({pct}%)</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden mb-3">
                    <div className={`h-full rounded-full ${pct > 80 ? 'bg-amber-500' : 'bg-indigo-500'}`} style={{ width: `${pct}%` }} />
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-slate-500">
                    <Clock size={10} /> 만료: {l.expiresAt} ({daysLeft}일)
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
