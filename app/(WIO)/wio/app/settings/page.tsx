'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Settings, Users, Palette, Building2, Save, Check, Plus, Trash2,
  ChevronUp, ChevronDown, Pencil, ToggleLeft, ToggleRight, Search,
} from 'lucide-react';
import { useWIO } from '../layout';
import { fetchTenantMembers, updateTenant, inviteMember, updateMemberRole, removeMember } from '@/lib/supabase/wio';
import {
  TRACK_CATALOG, getModulesByTrack,
  loadOrbiConfig, saveOrbiConfig,
  type OrbiConfig,
} from '@/lib/wio-modules';
import type { WIOMember } from '@/types/wio';

const ROLE_LABELS: Record<string, string> = {
  owner: '소유자', admin: '관리자', manager: '매니저', member: '멤버', guest: '게스트',
};

type SettingsTab = 'modules' | 'theme' | 'org' | 'members';

export default function SettingsPage() {
  const { tenant, member, refreshTenant, reloadConfig: reloadSidebar } = useWIO();
  const [tab, setTab] = useState<SettingsTab>('modules');

  // Module config
  const [config, setConfig] = useState<OrbiConfig>({ enabledModules: [], tracks: [] });
  const [selectedTrack, setSelectedTrack] = useState('common');
  const [editingTrackName, setEditingTrackName] = useState<string | null>(null);
  const [trackNameInput, setTrackNameInput] = useState('');
  const trackNameRef = useRef<HTMLInputElement>(null);
  const [moduleSearch, setModuleSearch] = useState('');

  // Theme
  const [editColor, setEditColor] = useState('#6366F1');

  // Org
  const [editName, setEditName] = useState('');
  const [editServiceName, setEditServiceName] = useState('');
  const [editDomain, setEditDomain] = useState('');

  // Members
  const [members, setMembers] = useState<WIOMember[]>([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('member');
  const [inviting, setInviting] = useState(false);

  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  // Init
  useEffect(() => {
    if (tenant) {
      setEditName(tenant.name);
      setEditServiceName(tenant.serviceName);
      setEditDomain(tenant.domain || '');
      setEditColor(tenant.primaryColor);
    }
    const cfg = loadOrbiConfig();
    setConfig(cfg);
    // if no track configs, initialize
    if (cfg.tracks.length === 0) {
      const defaultTracks = TRACK_CATALOG.map((t, i) => ({
        id: t.id, name: t.name, order: i, enabled: true,
      }));
      setConfig(prev => ({ ...prev, tracks: defaultTracks }));
    }
  }, [tenant]);

  useEffect(() => {
    if (tenant && tab === 'members' && tenant.id !== 'demo') {
      fetchTenantMembers(tenant.id).then(setMembers);
    }
  }, [tenant, tab]);

  // Focus track name input when editing
  useEffect(() => {
    if (editingTrackName && trackNameRef.current) trackNameRef.current.focus();
  }, [editingTrackName]);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 2000); };

  if (!tenant) return null;
  const isDemo = tenant.id === 'demo';

  // ── Module config handlers ──
  function toggleModule(key: string) {
    setConfig(prev => {
      const next = prev.enabledModules.includes(key)
        ? prev.enabledModules.filter(k => k !== key)
        : [...prev.enabledModules, key];
      const updated = { ...prev, enabledModules: next };
      saveOrbiConfig(updated);
      reloadSidebar();
      return updated;
    });
  }

  function enableAllInTrack(trackId: string) {
    const trackMods = getModulesByTrack(trackId).map(m => m.key);
    setConfig(prev => {
      const next = [...new Set([...prev.enabledModules, ...trackMods])];
      const updated = { ...prev, enabledModules: next };
      saveOrbiConfig(updated);
      reloadSidebar();
      return updated;
    });
  }

  function disableAllInTrack(trackId: string) {
    const trackMods = getModulesByTrack(trackId).map(m => m.key);
    setConfig(prev => {
      const next = prev.enabledModules.filter(k => !trackMods.includes(k) || k === 'home');
      const updated = { ...prev, enabledModules: next };
      saveOrbiConfig(updated);
      reloadSidebar();
      return updated;
    });
  }

  function moveTrack(trackId: string, dir: -1 | 1) {
    setConfig(prev => {
      const sorted = [...prev.tracks].sort((a, b) => a.order - b.order);
      const idx = sorted.findIndex(t => t.id === trackId);
      if (idx < 0) return prev;
      const swapIdx = idx + dir;
      if (swapIdx < 0 || swapIdx >= sorted.length) return prev;
      const newOrder = [...sorted];
      [newOrder[idx], newOrder[swapIdx]] = [newOrder[swapIdx], newOrder[idx]];
      const updated = {
        ...prev,
        tracks: newOrder.map((t, i) => ({ ...t, order: i })),
      };
      saveOrbiConfig(updated);
      reloadSidebar();
      return updated;
    });
  }

  function renameTrack(trackId: string, newName: string) {
    setConfig(prev => {
      const updated = {
        ...prev,
        tracks: prev.tracks.map(t => t.id === trackId ? { ...t, name: newName } : t),
      };
      saveOrbiConfig(updated);
      reloadSidebar();
      return updated;
    });
    setEditingTrackName(null);
  }

  function getTrackName(trackId: string): string {
    const tc = config.tracks.find(t => t.id === trackId);
    if (tc) return tc.name;
    const cat = TRACK_CATALOG.find(t => t.id === trackId);
    return cat?.name || trackId;
  }

  function enabledCountForTrack(trackId: string): number {
    const trackMods = getModulesByTrack(trackId).map(m => m.key);
    return config.enabledModules.filter(k => trackMods.includes(k)).length;
  }

  // sort tracks by order
  const sortedTracks = [...(config.tracks.length > 0 ? config.tracks : TRACK_CATALOG.map((t, i) => ({ id: t.id, name: t.name, order: i, enabled: true })))].sort((a, b) => a.order - b.order);

  // ── Org save ──
  async function saveOrg() {
    if (isDemo) { showToast('데모 모드에서는 저장할 수 없습니다'); return; }
    setSaving(true);
    const ok = await updateTenant(tenant!.id, { name: editName, serviceName: editServiceName, domain: editDomain || null } as any);
    setSaving(false);
    if (ok) { showToast('저장되었습니다'); refreshTenant?.(); } else showToast('저장 실패');
  }

  // ── Theme save ──
  async function saveTheme() {
    if (isDemo) { showToast('데모 모드에서는 저장할 수 없습니다'); return; }
    setSaving(true);
    const ok = await updateTenant(tenant!.id, { primaryColor: editColor } as any);
    setSaving(false);
    if (ok) { showToast('테마 저장됨'); refreshTenant?.(); } else showToast('저장 실패');
  }

  // ── Member handlers ──
  async function handleInvite() {
    if (!inviteEmail || isDemo) return;
    setInviting(true);
    const m = await inviteMember(tenant!.id, inviteEmail, inviteRole);
    setInviting(false);
    if (m) { setMembers(prev => [...prev, m]); setInviteEmail(''); showToast('초대 완료'); }
    else showToast('초대 실패');
  }
  async function handleRoleChange(memberId: string, role: string) {
    const ok = await updateMemberRole(memberId, role);
    if (ok) { setMembers(prev => prev.map(m => m.id === memberId ? { ...m, role } as WIOMember : m)); showToast('역할 변경됨'); }
  }
  async function handleRemove(memberId: string) {
    const ok = await removeMember(memberId);
    if (ok) { setMembers(prev => prev.filter(m => m.id !== memberId)); showToast('멤버 제거됨'); }
  }

  const TABS: { id: SettingsTab; label: string; icon: typeof Settings }[] = [
    { id: 'modules', label: '모듈 설정', icon: Settings },
    { id: 'theme', label: '테마', icon: Palette },
    { id: 'org', label: '조직 정보', icon: Building2 },
    { id: 'members', label: '멤버 관리', icon: Users },
  ];

  return (
    <div>
      <h1 className="text-xl font-bold mb-1">설정</h1>
      <p className="text-xs text-slate-500 mb-5">Orbi 시스템 설정 센터</p>

      {isDemo && (
        <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-3 mb-5 text-sm text-amber-300">
          데모 모드입니다. 모듈 설정은 브라우저에 저장됩니다.
        </div>
      )}

      {/* Top tabs */}
      <div className="flex gap-1 mb-5 border-b border-white/5 pb-2">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm transition-colors ${tab === t.id ? 'bg-indigo-600/10 text-indigo-400 font-semibold' : 'text-slate-400 hover:bg-white/5'}`}>
            <t.icon size={14} /> {t.label}
          </button>
        ))}
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg shadow-lg">
          {toast}
        </div>
      )}

      {/* ═══ 모듈 설정 ═══ */}
      {tab === 'modules' && (
        <div className="flex gap-5" style={{ minHeight: 'calc(100vh - 220px)' }}>
          {/* Left: Track list */}
          <div className="w-[250px] shrink-0 rounded-xl border border-white/5 bg-white/[0.02] overflow-hidden">
            <div className="px-4 py-3 border-b border-white/5">
              <span className="text-xs font-semibold text-slate-400">트랙</span>
            </div>
            <div className="p-2 space-y-0.5">
              {sortedTracks.map((tc, idx) => {
                const catTrack = TRACK_CATALOG.find(t => t.id === tc.id);
                if (!catTrack) return null;
                const TrackIcon = catTrack.icon;
                const count = enabledCountForTrack(tc.id);
                const isSelected = selectedTrack === tc.id;

                return (
                  <div key={tc.id}
                    className={`group flex items-center gap-2 rounded-lg px-3 py-2.5 cursor-pointer transition-colors ${isSelected ? 'bg-indigo-600/10 text-indigo-400' : 'text-slate-400 hover:bg-white/5 hover:text-slate-300'}`}
                    onClick={() => setSelectedTrack(tc.id)}>
                    <TrackIcon size={15} className="shrink-0" />
                    <div className="flex-1 min-w-0">
                      {editingTrackName === tc.id ? (
                        <input ref={trackNameRef} value={trackNameInput}
                          onChange={e => setTrackNameInput(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') renameTrack(tc.id, trackNameInput); if (e.key === 'Escape') setEditingTrackName(null); }}
                          onBlur={() => renameTrack(tc.id, trackNameInput)}
                          className="w-full bg-transparent border-b border-indigo-500 text-sm text-white outline-none py-0"
                          onClick={e => e.stopPropagation()} />
                      ) : (
                        <span className="text-sm truncate block">{tc.name}</span>
                      )}
                    </div>
                    <span className={`text-[10px] ${count > 0 ? 'text-indigo-400' : 'text-slate-600'}`}>{count}</span>
                    {/* Reorder + rename buttons */}
                    <div className="hidden group-hover:flex items-center gap-0.5" onClick={e => e.stopPropagation()}>
                      <button onClick={() => moveTrack(tc.id, -1)} disabled={idx === 0}
                        className="p-0.5 text-slate-600 hover:text-white disabled:opacity-20 transition"><ChevronUp size={12} /></button>
                      <button onClick={() => moveTrack(tc.id, 1)} disabled={idx === sortedTracks.length - 1}
                        className="p-0.5 text-slate-600 hover:text-white disabled:opacity-20 transition"><ChevronDown size={12} /></button>
                      <button onClick={() => { setEditingTrackName(tc.id); setTrackNameInput(tc.name); }}
                        className="p-0.5 text-slate-600 hover:text-white transition"><Pencil size={11} /></button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Module catalog for selected track */}
          <div className="flex-1 min-w-0">
            {(() => {
              const catTrack = TRACK_CATALOG.find(t => t.id === selectedTrack);
              if (!catTrack) return null;
              const trackModules = getModulesByTrack(selectedTrack);
              const allEnabled = trackModules.every(m => config.enabledModules.includes(m.key));
              const filtered = moduleSearch
                ? trackModules.filter(m => m.label.includes(moduleSearch) || m.description.includes(moduleSearch) || m.key.includes(moduleSearch))
                : trackModules;

              return (
                <>
                  {/* Track header */}
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-base font-bold">{getTrackName(selectedTrack)}</h2>
                      <p className="text-xs text-slate-500 mt-0.5">{trackModules.length}개 모듈 중 {enabledCountForTrack(selectedTrack)}개 활성</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {/* Search */}
                      <div className="relative">
                        <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-600" />
                        <input value={moduleSearch} onChange={e => setModuleSearch(e.target.value)} placeholder="검색..."
                          className="pl-8 pr-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-white placeholder:text-slate-600 focus:border-indigo-500 focus:outline-none w-40" />
                      </div>
                      {/* Toggle all */}
                      <button onClick={() => allEnabled ? disableAllInTrack(selectedTrack) : enableAllInTrack(selectedTrack)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors ${allEnabled ? 'bg-slate-700/50 text-slate-400 hover:bg-slate-700' : 'bg-indigo-600/10 text-indigo-400 hover:bg-indigo-600/20'}`}>
                        {allEnabled ? <ToggleRight size={13} /> : <ToggleLeft size={13} />}
                        {allEnabled ? '전체 해제' : '전체 활성'}
                      </button>
                    </div>
                  </div>

                  {/* Module grid */}
                  <div className="grid gap-3 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
                    {filtered.map(mod => {
                      const enabled = config.enabledModules.includes(mod.key);
                      const isHome = mod.key === 'home';
                      const Icon = mod.icon;
                      return (
                        <button key={mod.key}
                          onClick={() => !isHome && toggleModule(mod.key)}
                          disabled={isHome}
                          className={`relative flex items-start gap-3 rounded-xl border p-4 text-left transition-all ${
                            enabled
                              ? 'border-indigo-500/30 bg-indigo-500/5 hover:border-indigo-500/50'
                              : 'border-white/5 bg-white/[0.01] opacity-50 hover:opacity-70 hover:border-white/10'
                          } ${isHome ? 'cursor-default' : 'cursor-pointer'}`}>
                          <div className={`shrink-0 flex h-9 w-9 items-center justify-center rounded-lg ${enabled ? 'bg-indigo-600/15 text-indigo-400' : 'bg-white/5 text-slate-500'}`}>
                            <Icon size={17} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className={`text-sm font-semibold ${enabled ? 'text-white' : 'text-slate-400'}`}>{mod.label}</span>
                              {isHome && <span className="text-[9px] text-slate-600 border border-slate-700 px-1.5 py-0.5 rounded">필수</span>}
                            </div>
                            <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{mod.description}</p>
                          </div>
                          {/* Toggle indicator */}
                          <div className={`absolute top-3 right-3 w-8 h-4.5 rounded-full transition-colors ${enabled ? 'bg-indigo-600' : 'bg-slate-700'}`}>
                            <div className={`w-3.5 h-3.5 rounded-full bg-white transition-transform mt-[2px] ${enabled ? 'translate-x-[18px]' : 'translate-x-[2px]'}`} />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* ═══ 테마 ═══ */}
      {tab === 'theme' && (
        <div className="max-w-2xl space-y-5">
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
            <h2 className="text-sm font-semibold mb-1">앱 컬러 패턴</h2>
            <p className="text-xs text-slate-500 mb-4">브랜드에 맞는 컬러를 선택하세요.</p>
            <div className="grid grid-cols-5 gap-3">
              {[
                { name: 'Indigo',  color: '#6366F1', bg: '#1e1b4b', accent: '#818CF8', desc: '기본' },
                { name: 'Emerald', color: '#10B981', bg: '#022c22', accent: '#34D399', desc: '성장' },
                { name: 'Amber',   color: '#F59E0B', bg: '#1c1917', accent: '#FBBF24', desc: '에너지' },
                { name: 'Rose',    color: '#F43F5E', bg: '#1a0a0e', accent: '#FB7185', desc: '열정' },
                { name: 'Slate',   color: '#64748B', bg: '#0f172a', accent: '#94A3B8', desc: '모던' },
              ].map(p => (
                <button key={p.name} onClick={() => setEditColor(p.color)}
                  className={`relative rounded-xl border p-4 text-center transition-all ${editColor === p.color ? 'border-white/30 ring-1 ring-white/20' : 'border-white/5 hover:border-white/15'}`}>
                  <div className="rounded-lg overflow-hidden mb-3 border border-white/5" style={{ backgroundColor: p.bg }}>
                    <div className="h-2" style={{ backgroundColor: p.color }} />
                    <div className="p-2 space-y-1">
                      <div className="h-1.5 rounded-full w-3/4" style={{ backgroundColor: p.accent, opacity: 0.3 }} />
                      <div className="h-1.5 rounded-full w-1/2" style={{ backgroundColor: p.accent, opacity: 0.15 }} />
                      <div className="flex gap-1 mt-1.5">
                        <div className="h-4 w-4 rounded" style={{ backgroundColor: p.color }} />
                        <div className="h-4 flex-1 rounded" style={{ backgroundColor: `${p.accent}15` }} />
                      </div>
                    </div>
                  </div>
                  <div className="text-xs font-semibold" style={{ color: p.color }}>{p.name}</div>
                  <div className="text-[10px] text-slate-500">{p.desc}</div>
                  {editColor === p.color && (
                    <div className="absolute top-2 right-2 w-4 h-4 rounded-full flex items-center justify-center" style={{ backgroundColor: p.color }}>
                      <Check size={10} className="text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3 mt-4 pt-4 border-t border-white/5">
              <span className="text-xs text-slate-500">커스텀:</span>
              <input type="color" value={editColor} onChange={e => setEditColor(e.target.value)}
                className="h-7 w-7 rounded cursor-pointer bg-transparent border-0" />
              <input value={editColor} onChange={e => setEditColor(e.target.value)}
                className="w-20 px-2 py-1 bg-white/5 border border-white/10 rounded text-xs font-mono text-slate-400 focus:outline-none" />
            </div>
          </div>
          {!isDemo && (
            <button onClick={saveTheme} disabled={saving}
              className="flex items-center gap-1.5 px-4 py-2 text-white text-sm rounded-lg hover:opacity-90 transition disabled:opacity-50"
              style={{ backgroundColor: editColor }}>
              <Save size={14} /> {saving ? '저장 중...' : '테마 저장'}
            </button>
          )}
        </div>
      )}

      {/* ═══ 조직 정보 ═══ */}
      {tab === 'org' && (
        <div className="max-w-lg">
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5 space-y-4">
            <h2 className="text-sm font-semibold mb-2">조직 정보</h2>
            <div>
              <label className="block text-xs text-slate-500 mb-1">조직 이름</label>
              <input value={editName} onChange={e => setEditName(e.target.value)} disabled={isDemo}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:border-indigo-500 focus:outline-none disabled:opacity-50" />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">서비스명</label>
              <input value={editServiceName} onChange={e => setEditServiceName(e.target.value)} disabled={isDemo}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:border-indigo-500 focus:outline-none disabled:opacity-50" />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">커스텀 도메인</label>
              <input value={editDomain} onChange={e => setEditDomain(e.target.value)} disabled={isDemo} placeholder="example.com"
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-slate-600 focus:border-indigo-500 focus:outline-none disabled:opacity-50" />
            </div>
            {!isDemo && (
              <div className="pt-2">
                <button onClick={saveOrg} disabled={saving}
                  className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-500 transition disabled:opacity-50">
                  <Save size={14} /> {saving ? '저장 중...' : '저장'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══ 멤버 관리 ═══ */}
      {tab === 'members' && (
        <div className="max-w-2xl space-y-4">
          {isDemo && (
            <div className="rounded-lg border border-slate-700 bg-white/[0.02] px-4 py-6 text-center">
              <Users size={24} className="text-slate-600 mx-auto mb-2" />
              <p className="text-sm text-slate-400">로그인 후 멤버를 관리할 수 있습니다.</p>
            </div>
          )}
          {!isDemo && (
            <>
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
                      {m.role !== 'owner' ? (
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
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full text-violet-400 bg-violet-500/10">
                          {ROLE_LABELS[m.role]}
                        </span>
                      )}
                    </div>
                  ))}
                  {members.length === 0 && <p className="text-center py-6 text-slate-500 text-sm">멤버가 없습니다.</p>}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
