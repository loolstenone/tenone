'use client';

import { useState, useEffect } from 'react';
import { Settings, Users, Palette, Shield, Check } from 'lucide-react';
import { useWIO } from '../layout';
import { fetchTenantMembers } from '@/lib/supabase/wio';
import { WIO_MODULES } from '@/types/wio';

const MODULE_LABELS: Record<string, string> = {
  home: '홈', project: '프로젝트', talk: '소통', finance: '재무',
  people: '인재', sales: '영업', learn: '교육', content: '콘텐츠',
  wiki: '위키', insight: '인사이트', shop: '커머스',
};

const ROLE_LABELS: Record<string, string> = {
  owner: '소유자', admin: '관리자', manager: '매니저', member: '멤버', guest: '게스트',
};

const PLAN_LABELS: Record<string, { name: string; color: string }> = {
  starter: { name: 'Starter', color: 'text-slate-400 bg-slate-500/10' },
  growth: { name: 'Growth', color: 'text-blue-400 bg-blue-500/10' },
  pro: { name: 'Pro', color: 'text-indigo-400 bg-indigo-500/10' },
  enterprise: { name: 'Enterprise', color: 'text-violet-400 bg-violet-500/10' },
};

type Tab = 'general' | 'members' | 'modules' | 'branding';

export default function SettingsPage() {
  const { tenant, member } = useWIO();
  const [tab, setTab] = useState<Tab>('general');
  const [members, setMembers] = useState<any[]>([]);

  useEffect(() => {
    if (tenant && tab === 'members') {
      fetchTenantMembers(tenant.id).then(setMembers);
    }
  }, [tenant, tab]);

  if (!tenant) return null;
  const plan = PLAN_LABELS[tenant.plan] || PLAN_LABELS.starter;

  const TABS = [
    { id: 'general' as Tab, label: '일반', icon: Settings },
    { id: 'members' as Tab, label: '멤버', icon: Users },
    { id: 'modules' as Tab, label: '모듈', icon: Shield },
    { id: 'branding' as Tab, label: '브랜딩', icon: Palette },
  ];

  return (
    <div>
      <h1 className="text-xl font-bold mb-6">설정</h1>

      <div className="flex gap-2 mb-6">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm transition-colors ${tab === t.id ? 'bg-indigo-600/10 text-indigo-400 font-semibold' : 'text-slate-400 hover:bg-white/5'}`}>
            <t.icon size={14} /> {t.label}
          </button>
        ))}
      </div>

      {/* 일반 */}
      {tab === 'general' && (
        <div className="space-y-4">
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
            <h2 className="text-sm font-semibold mb-4">조직 정보</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-slate-500">이름</span><span>{tenant.name}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">슬러그</span><span className="font-mono text-slate-400">{tenant.slug}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">도메인</span><span>{tenant.domain || '-'}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">플랜</span><span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${plan.color}`}>{plan.name}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">최대 멤버</span><span>{tenant.maxMembers}명</span></div>
              <div className="flex justify-between"><span className="text-slate-500">서비스명</span><span>{tenant.serviceName}</span></div>
            </div>
          </div>
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
            <h2 className="text-sm font-semibold mb-2">내 정보</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-slate-500">이름</span><span>{member?.displayName}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">역할</span><span>{ROLE_LABELS[member?.role || 'member']}</span></div>
            </div>
          </div>
        </div>
      )}

      {/* 멤버 */}
      {tab === 'members' && (
        <div className="rounded-xl border border-white/5 bg-white/[0.02] overflow-hidden">
          <div className="px-5 py-3 border-b border-white/5 flex justify-between items-center">
            <span className="text-sm font-semibold">멤버 ({members.length}명)</span>
          </div>
          <div className="divide-y divide-white/5">
            {members.map((m: any) => (
              <div key={m.id} className="flex items-center gap-3 px-5 py-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold">{m.displayName?.charAt(0)}</div>
                <div className="flex-1">
                  <div className="text-sm font-medium">{m.displayName}</div>
                  <div className="text-xs text-slate-500">{m.jobTitle || '-'}</div>
                </div>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${m.role === 'owner' ? 'text-violet-400 bg-violet-500/10' : m.role === 'admin' ? 'text-blue-400 bg-blue-500/10' : 'text-slate-400 bg-slate-500/10'}`}>
                  {ROLE_LABELS[m.role] || m.role}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 모듈 */}
      {tab === 'modules' && (
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
          <h2 className="text-sm font-semibold mb-4">활성 모듈</h2>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {WIO_MODULES.map(mod => {
              const active = tenant.modules.includes(mod);
              return (
                <div key={mod} className={`flex items-center gap-3 rounded-lg border p-3 ${active ? 'border-indigo-500/30 bg-indigo-500/5' : 'border-white/5 opacity-40'}`}>
                  {active && <Check size={14} className="text-indigo-400" />}
                  <span className="text-sm">{MODULE_LABELS[mod] || mod}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 브랜딩 */}
      {tab === 'branding' && (
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
          <h2 className="text-sm font-semibold mb-4">브랜딩 설정</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-500 w-24">메인 색상</span>
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded" style={{ background: tenant.primaryColor }} />
                <span className="text-sm font-mono text-slate-400">{tenant.primaryColor}</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-500 w-24">서비스명</span>
              <span className="text-sm">{tenant.serviceName}</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-500 w-24">Powered by</span>
              <span className="text-sm">{tenant.poweredBy ? 'Powered by WIO 표시' : '비표시'}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
