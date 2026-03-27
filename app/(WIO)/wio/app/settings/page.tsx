'use client';

import { useState, useEffect } from 'react';
import { Settings, Users, Palette, Shield, Check, Plus, Trash2, Save, X } from 'lucide-react';
import { useWIO } from '../layout';
import { fetchTenantMembers, updateTenant, inviteMember, updateMemberRole, removeMember } from '@/lib/supabase/wio';
import { WIO_MODULES } from '@/types/wio';
import type { WIOMember, WIOModule } from '@/types/wio';

const MODULE_LABELS: Record<string, string> = {
  home: '홈', project: '프로젝트', talk: '소통', finance: '재무', timesheet: '시수',
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
  const { tenant, member, refreshTenant } = useWIO();
  const [tab, setTab] = useState<Tab>('general');
  const [members, setMembers] = useState<WIOMember[]>([]);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  // General 편집
  const [editName, setEditName] = useState('');
  const [editServiceName, setEditServiceName] = useState('');
  const [editDomain, setEditDomain] = useState('');

  // 멤버 초대
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('member');
  const [inviting, setInviting] = useState(false);

  // 브랜딩
  const [editColor, setEditColor] = useState('');
  const [editPoweredBy, setEditPoweredBy] = useState(true);

  useEffect(() => {
    if (tenant) {
      setEditName(tenant.name);
      setEditServiceName(tenant.serviceName);
      setEditDomain(tenant.domain || '');
      setEditColor(tenant.primaryColor);
      setEditPoweredBy(tenant.poweredBy);
    }
  }, [tenant]);

  useEffect(() => {
    if (tenant && tab === 'members') {
      fetchTenantMembers(tenant.id).then(setMembers);
    }
  }, [tenant, tab]);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 2000); };

  if (!tenant) return null;
  const isDemo = tenant.id === 'demo';
  const plan = PLAN_LABELS[tenant.plan] || PLAN_LABELS.starter;
  const isAdmin = !isDemo && (member?.role === 'owner' || member?.role === 'admin');

  const TABS = [
    { id: 'general' as Tab, label: '일반', icon: Settings },
    { id: 'members' as Tab, label: '멤버', icon: Users },
    { id: 'modules' as Tab, label: '모듈', icon: Shield },
    { id: 'branding' as Tab, label: '브랜딩', icon: Palette },
  ];

  // ── 일반 설정 저장 ──
  async function saveGeneral() {
    setSaving(true);
    const ok = await updateTenant(tenant.id, { name: editName, serviceName: editServiceName, domain: editDomain || null } as any);
    setSaving(false);
    if (ok) { showToast('저장되었습니다'); refreshTenant?.(); }
    else showToast('저장 실패');
  }

  // ── 멤버 초대 ──
  async function handleInvite() {
    if (!inviteEmail) return;
    setInviting(true);
    const m = await inviteMember(tenant.id, inviteEmail, inviteRole);
    setInviting(false);
    if (m) { setMembers(prev => [...prev, m]); setInviteEmail(''); showToast('초대 완료'); }
    else showToast('초대 실패 — 가입된 이메일인지 확인하세요');
  }

  // ── 역할 변경 ──
  async function handleRoleChange(memberId: string, role: string) {
    const ok = await updateMemberRole(memberId, role);
    if (ok) { setMembers(prev => prev.map(m => m.id === memberId ? { ...m, role } as WIOMember : m)); showToast('역할 변경됨'); }
  }

  // ── 멤버 삭제 ──
  async function handleRemove(memberId: string) {
    const ok = await removeMember(memberId);
    if (ok) { setMembers(prev => prev.filter(m => m.id !== memberId)); showToast('멤버 제거됨'); }
  }

  // ── 모듈 토글 ──
  async function toggleModule(mod: WIOModule) {
    const current = tenant.modules || [];
    const next = current.includes(mod) ? current.filter(m => m !== mod) : [...current, mod];
    const ok = await updateTenant(tenant.id, { modules: next } as any);
    if (ok) { showToast(`${MODULE_LABELS[mod]} ${next.includes(mod) ? '활성화' : '비활성화'}`); refreshTenant?.(); }
  }

  // ── 브랜딩 저장 ──
  async function saveBranding() {
    setSaving(true);
    const ok = await updateTenant(tenant.id, { primaryColor: editColor, poweredBy: editPoweredBy } as any);
    setSaving(false);
    if (ok) { showToast('브랜딩 저장됨'); refreshTenant?.(); }
    else showToast('저장 실패');
  }

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">설정</h1>

      {isDemo && (
        <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-3 mb-6 text-sm text-amber-300">
          데모 모드입니다. 로그인하면 실제 설정을 변경할 수 있습니다.
        </div>
      )}

      <div className="flex gap-2 mb-6">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm transition-colors ${tab === t.id ? 'bg-indigo-600/10 text-indigo-400 font-semibold' : 'text-slate-400 hover:bg-white/5'}`}>
            <t.icon size={14} /> {t.label}
          </button>
        ))}
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg shadow-lg animate-in fade-in">
          {toast}
        </div>
      )}

      {/* 일반 */}
      {tab === 'general' && (
        <div className="space-y-4">
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
            <h2 className="text-sm font-semibold mb-4">조직 정보</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-slate-500 mb-1">조직 이름</label>
                <input value={editName} onChange={e => setEditName(e.target.value)} disabled={!isAdmin}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:border-indigo-500 focus:outline-none disabled:opacity-50" />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">서비스명</label>
                <input value={editServiceName} onChange={e => setEditServiceName(e.target.value)} disabled={!isAdmin}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:border-indigo-500 focus:outline-none disabled:opacity-50" />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">커스텀 도메인</label>
                <input value={editDomain} onChange={e => setEditDomain(e.target.value)} disabled={!isAdmin} placeholder="example.com"
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-slate-600 focus:border-indigo-500 focus:outline-none disabled:opacity-50" />
              </div>
              <div className="flex justify-between items-center">
                <div className="text-sm">
                  <span className="text-slate-500">플랜:</span>{' '}
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${plan.color}`}>{plan.name}</span>
                  <span className="text-slate-600 text-xs ml-2">최대 {tenant.maxMembers}명</span>
                </div>
                {isAdmin && (
                  <button onClick={saveGeneral} disabled={saving}
                    className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-500 transition disabled:opacity-50">
                    <Save size={14} /> {saving ? '저장 중...' : '저장'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 멤버 */}
      {tab === 'members' && (
        <div className="space-y-4">
          {isAdmin && (
            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
              <h3 className="text-sm font-semibold mb-3">멤버 초대</h3>
              <div className="flex gap-2">
                <input value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} placeholder="이메일 주소"
                  className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-slate-600 focus:border-indigo-500 focus:outline-none" />
                <select value={inviteRole} onChange={e => setInviteRole(e.target.value)}
                  className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none">
                  <option value="member" className="bg-[#0F0F23]">멤버</option>
                  <option value="manager" className="bg-[#0F0F23]">매니저</option>
                  <option value="admin" className="bg-[#0F0F23]">관리자</option>
                </select>
                <button onClick={handleInvite} disabled={inviting || !inviteEmail}
                  className="flex items-center gap-1 px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-500 transition disabled:opacity-50">
                  <Plus size={14} /> {inviting ? '...' : '초대'}
                </button>
              </div>
            </div>
          )}
          <div className="rounded-xl border border-white/5 bg-white/[0.02] overflow-hidden">
            <div className="px-5 py-3 border-b border-white/5">
              <span className="text-sm font-semibold">멤버 ({members.length}명)</span>
            </div>
            <div className="divide-y divide-white/5">
              {members.map((m: any) => (
                <div key={m.id} className="flex items-center gap-3 px-5 py-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold">{m.displayName?.charAt(0)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{m.displayName}</div>
                    <div className="text-xs text-slate-500">{m.jobTitle || '-'}</div>
                  </div>
                  {isAdmin && m.role !== 'owner' ? (
                    <div className="flex items-center gap-2">
                      <select value={m.role} onChange={e => handleRoleChange(m.id, e.target.value)}
                        className="px-2 py-1 bg-white/5 border border-white/10 rounded text-xs text-white focus:outline-none">
                        {Object.entries(ROLE_LABELS).filter(([k]) => k !== 'owner').map(([k, v]) => (
                          <option key={k} value={k} className="bg-[#0F0F23]">{v}</option>
                        ))}
                      </select>
                      <button onClick={() => handleRemove(m.id)} className="p-1 text-slate-600 hover:text-red-400 transition">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ) : (
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${m.role === 'owner' ? 'text-violet-400 bg-violet-500/10' : 'text-slate-400 bg-slate-500/10'}`}>
                      {ROLE_LABELS[m.role] || m.role}
                    </span>
                  )}
                </div>
              ))}
              {members.length === 0 && <p className="text-center py-6 text-slate-500 text-sm">멤버가 없습니다.</p>}
            </div>
          </div>
        </div>
      )}

      {/* 모듈 */}
      {tab === 'modules' && (
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
          <h2 className="text-sm font-semibold mb-4">활성 모듈 {isAdmin && <span className="text-xs text-slate-500 font-normal ml-1">— 클릭하여 토글</span>}</h2>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {WIO_MODULES.map(mod => {
              const active = (tenant.modules || []).includes(mod);
              return (
                <button key={mod} onClick={() => isAdmin && toggleModule(mod)} disabled={!isAdmin || mod === 'home'}
                  className={`flex items-center gap-3 rounded-lg border p-3 transition-all text-left ${
                    active ? 'border-indigo-500/30 bg-indigo-500/5' : 'border-white/5 opacity-40'
                  } ${isAdmin && mod !== 'home' ? 'cursor-pointer hover:border-indigo-500/50' : 'cursor-default'}`}>
                  {active && <Check size={14} className="text-indigo-400 shrink-0" />}
                  <span className="text-sm">{MODULE_LABELS[mod] || mod}</span>
                  {mod === 'home' && <span className="text-[9px] text-slate-600 ml-auto">필수</span>}
                </button>
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
              <span className="text-sm text-slate-500 w-28">메인 색상</span>
              <div className="flex items-center gap-2">
                <input type="color" value={editColor} onChange={e => setEditColor(e.target.value)} disabled={!isAdmin}
                  className="h-8 w-8 rounded cursor-pointer bg-transparent border-0" />
                <input value={editColor} onChange={e => setEditColor(e.target.value)} disabled={!isAdmin}
                  className="w-24 px-2 py-1 bg-white/5 border border-white/10 rounded text-sm font-mono text-slate-400 focus:outline-none disabled:opacity-50" />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-500 w-28">서비스명</span>
              <span className="text-sm">{tenant.serviceName}</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-500 w-28">Powered by</span>
              <button onClick={() => isAdmin && setEditPoweredBy(!editPoweredBy)} disabled={!isAdmin}
                className={`w-10 h-5 rounded-full transition-colors ${editPoweredBy ? 'bg-indigo-600' : 'bg-slate-700'} disabled:opacity-50`}>
                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${editPoweredBy ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </button>
            </div>
            {isAdmin && (
              <button onClick={saveBranding} disabled={saving}
                className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-500 transition disabled:opacity-50 mt-4">
                <Save size={14} /> {saving ? '저장 중...' : '저장'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
