'use client';

import { useState } from 'react';
import { Plug, Check, X, AlertCircle, Key, Link2, Settings, RefreshCw } from 'lucide-react';
import { useWIO } from '../../layout';

type IntStatus = 'connected' | 'disconnected' | 'error';
type Integration = {
  id: string; name: string; description: string; icon: string; status: IntStatus;
  apiKey?: string; webhookUrl?: string; lastSync?: string;
};

const MOCK_INTEGRATIONS: Integration[] = [
  { id: 'int1', name: 'Google Workspace', description: 'Gmail, 캘린더, 드라이브 연동', icon: 'G', status: 'connected', lastSync: '2026-03-29 14:00' },
  { id: 'int2', name: 'Slack', description: '팀 메시지 및 알림 연동', icon: 'S', status: 'connected', webhookUrl: 'https://hooks.slack.com/services/***', lastSync: '2026-03-29 13:30' },
  { id: 'int3', name: 'Kakao Work', description: '카카오워크 메시지 연동', icon: 'K', status: 'disconnected' },
  { id: 'int4', name: 'GitHub', description: '코드 저장소 및 이슈 연동', icon: 'GH', status: 'connected', apiKey: 'ghp_***...***abc', lastSync: '2026-03-29 12:00' },
  { id: 'int5', name: 'Notion', description: '문서 및 위키 동기화', icon: 'N', status: 'error', lastSync: '2026-03-27 09:00' },
  { id: 'int6', name: 'Figma', description: '디자인 파일 연동', icon: 'F', status: 'disconnected' },
];

const STATUS_CONFIG: Record<IntStatus, { label: string; color: string; icon: typeof Check }> = {
  connected: { label: '연결됨', color: 'text-emerald-400 bg-emerald-500/10', icon: Check },
  disconnected: { label: '끊김', color: 'text-slate-400 bg-slate-500/10', icon: X },
  error: { label: '오류', color: 'text-rose-400 bg-rose-500/10', icon: AlertCircle },
};

export default function IntegrationPage() {
  const { tenant } = useWIO();
  const [integrations, setIntegrations] = useState(MOCK_INTEGRATIONS);
  const [selected, setSelected] = useState<string | null>(null);
  const [editKey, setEditKey] = useState('');
  const [editWebhook, setEditWebhook] = useState('');

  if (!tenant) return null;
  const isDemo = tenant.id === 'demo';

  const detail = integrations.find(i => i.id === selected);

  const toggleConnection = (id: string) => {
    setIntegrations(prev => prev.map(i => {
      if (i.id !== id) return i;
      return { ...i, status: i.status === 'connected' ? 'disconnected' : 'connected', lastSync: i.status !== 'connected' ? new Date().toISOString().slice(0, 16).replace('T', ' ') : i.lastSync };
    }));
  };

  return (
    <div>
      <h1 className="text-xl font-bold mb-6">외부연동</h1>

      {isDemo && (
        <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-3 mb-4 text-sm text-amber-300">
          데모 모드입니다. 실제 연동은 수행되지 않습니다.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* 서비스 목록 */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          {integrations.map(int => {
            const cfg = STATUS_CONFIG[int.status];
            const StatusIcon = cfg.icon;
            return (
              <button key={int.id} onClick={() => { setSelected(int.id); setEditKey(int.apiKey || ''); setEditWebhook(int.webhookUrl || ''); }}
                className={`w-full text-left rounded-xl border p-4 transition-colors ${selected === int.id ? 'border-indigo-500/30 bg-indigo-500/5' : 'border-white/5 bg-white/[0.02] hover:bg-white/[0.04]'}`}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 text-sm font-bold">{int.icon}</div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold">{int.name}</div>
                    <div className="text-xs text-slate-500">{int.description}</div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 ${cfg.color}`}>
                    <StatusIcon size={10} /> {cfg.label}
                  </span>
                  {int.lastSync && <span className="text-[10px] text-slate-600">동기화: {int.lastSync.slice(5)}</span>}
                </div>
              </button>
            );
          })}
        </div>

        {/* 설정 패널 */}
        <div className="lg:col-span-1">
          {detail ? (
            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4 space-y-4 sticky top-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-xs font-bold">{detail.icon}</div>
                <div>
                  <h3 className="text-sm font-semibold">{detail.name}</h3>
                  <span className={`text-[10px] ${STATUS_CONFIG[detail.status].color}`}>{STATUS_CONFIG[detail.status].label}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-500 mb-1">API 키</label>
                <input value={editKey} onChange={e => setEditKey(e.target.value)} placeholder="API Key 입력"
                  className="w-full rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2 text-sm font-mono focus:border-indigo-500 focus:outline-none" />
              </div>

              <div>
                <label className="block text-xs text-slate-500 mb-1">웹훅 URL</label>
                <input value={editWebhook} onChange={e => setEditWebhook(e.target.value)} placeholder="https://..."
                  className="w-full rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2 text-sm font-mono focus:border-indigo-500 focus:outline-none" />
              </div>

              <div className="flex gap-2">
                <button onClick={() => toggleConnection(detail.id)}
                  className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${detail.status === 'connected' ? 'bg-rose-600/10 text-rose-400 hover:bg-rose-600/20' : 'bg-indigo-600 text-white hover:bg-indigo-500'}`}>
                  {detail.status === 'connected' ? <><X size={14} /> 연결 해제</> : <><Plug size={14} /> 연결</>}
                </button>
                {detail.status === 'connected' && (
                  <button className="flex items-center justify-center gap-1 rounded-lg border border-white/5 px-3 py-2 text-sm text-slate-400 hover:text-white hover:border-white/10 transition-all">
                    <RefreshCw size={13} />
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-8 text-center">
              <Plug size={24} className="mx-auto mb-2 text-slate-700" />
              <p className="text-sm text-slate-500">서비스를 선택하세요</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
