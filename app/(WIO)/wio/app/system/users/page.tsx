'use client';

import { useState, useEffect, useCallback } from 'react';
import { Users, Plus, Search, UserX, UserCheck, Loader2 } from 'lucide-react';
import { useWIO } from '../../layout';
import { fetchTenantMembers, inviteMember, updateMemberRole, removeMember } from '@/lib/supabase/wio';
import type { WIOMember, WIORole } from '@/types/wio';

const ROLE_LABELS: Record<string, string> = {
  owner: '소유자', admin: '관리자', manager: '매니저', member: '멤버', guest: '게스트',
};
const ROLE_COLORS: Record<string, string> = {
  owner: 'text-violet-400', admin: 'text-indigo-400', manager: 'text-blue-400', member: 'text-slate-400', guest: 'text-slate-500',
};

// 데모 Mock
const DEMO_USERS: WIOMember[] = [
  { id: 'u1', tenantId: 'demo', userId: '', displayName: '김대표', email: 'ceo@tenone.biz', role: 'owner', department: '경영', jobTitle: 'CEO', avatarUrl: null, moduleAccess: [], isActive: true, joinedAt: '2024-01-01' },
  { id: 'u2', tenantId: 'demo', userId: '', displayName: '박개발', email: 'dev@tenone.biz', role: 'admin', department: '개발', jobTitle: '리드', avatarUrl: null, moduleAccess: [], isActive: true, joinedAt: '2024-03-15' },
  { id: 'u3', tenantId: 'demo', userId: '', displayName: '이마케팅', email: 'mkt@tenone.biz', role: 'manager', department: '마케팅', jobTitle: '팀장', avatarUrl: null, moduleAccess: [], isActive: true, joinedAt: '2024-06-01' },
  { id: 'u4', tenantId: 'demo', userId: '', displayName: '정디자인', email: 'design@tenone.biz', role: 'member', department: '디자인', jobTitle: '디자이너', avatarUrl: null, moduleAccess: [], isActive: true, joinedAt: '2024-09-01' },
  { id: 'u5', tenantId: 'demo', userId: '', displayName: '최인사', email: 'hr@tenone.biz', role: 'manager', department: '인사', jobTitle: 'HR 매니저', avatarUrl: null, moduleAccess: [], isActive: true, joinedAt: '2024-04-15' },
  { id: 'u6', tenantId: 'demo', userId: '', displayName: '한재무', email: 'fin@tenone.biz', role: 'member', department: '재무', jobTitle: '회계', avatarUrl: null, moduleAccess: [], isActive: true, joinedAt: '2024-07-01' },
];

export default function UsersPage() {
  const { tenant, member: currentMember } = useWIO();
  const [users, setUsers] = useState<WIOMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | WIORole>('all');
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<WIORole>('member');
  const [newDept, setNewDept] = useState('');
  const [creating, setCreating] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const isDemo = !tenant || tenant.id === 'demo';

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  }, []);

  // 데이터 로드
  useEffect(() => {
    if (!tenant) return;
    if (isDemo) {
      setUsers(DEMO_USERS);
      setLoading(false);
      return;
    }
    (async () => {
      setLoading(true);
      const members = await fetchTenantMembers(tenant.id);
      setUsers(members);
      setLoading(false);
    })();
  }, [tenant, isDemo]);

  // 필터
  const filtered = users
    .filter(u => roleFilter === 'all' || u.role === roleFilter)
    .filter(u => !searchQuery || u.displayName.includes(searchQuery) || (u.email || '').includes(searchQuery));

  // 역할 변경
  const handleRoleChange = async (userId: string, role: WIORole) => {
    if (isDemo) {
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role } : u));
      showToast('역할이 변경되었습니다 (데모)');
      return;
    }
    const ok = await updateMemberRole(userId, role);
    if (ok) {
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role } : u));
      showToast('역할이 변경되었습니다');
    }
  };

  // 활성/비활성 토글
  const handleToggleStatus = async (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    if (isDemo) {
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, isActive: !u.isActive } : u));
      showToast(user.isActive ? '비활성화됨 (데모)' : '활성화됨 (데모)');
      return;
    }

    if (user.isActive) {
      const ok = await removeMember(userId);
      if (ok) {
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, isActive: false } : u));
        showToast('비활성화되었습니다');
      }
    } else {
      // 재활성화 — removeMember는 is_active=false로만 하므로, 직접 update
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      await supabase.from('wio_members').update({ is_active: true }).eq('id', userId);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, isActive: true } : u));
      showToast('활성화되었습니다');
    }
  };

  // 사용자 생성
  const handleCreate = async () => {
    if (!newEmail.trim()) return;
    setCreating(true);

    if (isDemo) {
      const newUser: WIOMember = {
        id: `u-${Date.now()}`, tenantId: 'demo', userId: '', displayName: newName || newEmail.split('@')[0],
        email: newEmail, role: newRole, department: newDept || null, jobTitle: null, avatarUrl: null,
        moduleAccess: [], isActive: true, joinedAt: new Date().toISOString(),
      };
      setUsers(prev => [...prev, newUser]);
      showToast('생성되었습니다 (데모)');
    } else {
      const m = await inviteMember(tenant!.id, newEmail, newRole);
      if (m) {
        setUsers(prev => [...prev, m]);
        showToast('초대되었습니다');
      } else {
        showToast('초대 실패 — 이메일을 확인하세요');
      }
    }

    setNewName('');
    setNewEmail('');
    setNewRole('member');
    setNewDept('');
    setShowCreate(false);
    setCreating(false);
  };

  if (!tenant) return null;

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg shadow-lg">{toast}</div>
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold">사용자 관리</h1>
          <p className="text-xs text-slate-500 mt-1">총 {users.length}명 ({users.filter(u => u.isActive).length}명 활성)</p>
        </div>
        <button onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors">
          <Plus size={15} /> 사용자 초대
        </button>
      </div>

      {isDemo && (
        <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-3 mb-4 text-sm text-amber-300">
          데모 모드 — 변경 사항은 저장되지 않습니다.
        </div>
      )}

      {/* 생성 폼 */}
      {showCreate && (
        <div className="mb-4 rounded-xl border border-white/5 bg-white/[0.02] p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="이름"
              className="rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none" />
            <input value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="이메일 *" type="email"
              className="rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <select value={newRole} onChange={e => setNewRole(e.target.value as WIORole)}
              className="rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2.5 text-sm focus:outline-none">
              {Object.entries(ROLE_LABELS).map(([k, v]) => <option key={k} value={k} className="bg-[#0F0F23]">{v}</option>)}
            </select>
            <input value={newDept} onChange={e => setNewDept(e.target.value)} placeholder="부서"
              className="rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none" />
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowCreate(false)} className="px-4 py-2 text-sm text-slate-400 hover:text-white">취소</button>
            <button onClick={handleCreate} disabled={!newEmail.trim() || creating}
              className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-40">
              {creating ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
              {isDemo ? '생성' : '초대'}
            </button>
          </div>
        </div>
      )}

      {/* 필터 */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="이름 또는 이메일 검색..."
            className="w-full rounded-lg border border-white/5 bg-white/[0.03] pl-9 pr-3 py-2 text-sm focus:border-indigo-500 focus:outline-none" />
        </div>
        <select value={roleFilter} onChange={e => setRoleFilter(e.target.value as any)}
          className="rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2 text-sm focus:outline-none">
          <option value="all" className="bg-[#0F0F23]">전체 역할</option>
          {Object.entries(ROLE_LABELS).map(([k, v]) => <option key={k} value={k} className="bg-[#0F0F23]">{v}</option>)}
        </select>
      </div>

      {/* 로딩 */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-slate-500">
          <Loader2 size={20} className="animate-spin mr-2" /> 사용자 목록을 불러오는 중...
        </div>
      ) : (
        /* 테이블 */
        <div className="rounded-xl border border-white/5 bg-white/[0.02] overflow-hidden">
          <div className="grid grid-cols-12 gap-2 px-4 py-2 border-b border-white/5 text-[10px] text-slate-500 uppercase tracking-wider">
            <div className="col-span-2">이름</div>
            <div className="col-span-3">이메일</div>
            <div className="col-span-2">역할</div>
            <div className="col-span-1">상태</div>
            <div className="col-span-2">부서</div>
            <div className="col-span-2">액션</div>
          </div>
          {filtered.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-slate-500">사용자가 없습니다</div>
          ) : filtered.map(u => (
            <div key={u.id} className="grid grid-cols-12 gap-2 px-4 py-3 border-b border-white/5 hover:bg-white/[0.04] transition-colors">
              <div className="col-span-2 flex items-center gap-2">
                <div className={`flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold shrink-0 ${u.isActive ? 'bg-indigo-600' : 'bg-slate-700'}`}>
                  {u.displayName.charAt(0)}
                </div>
                <div className="min-w-0">
                  <span className="text-sm truncate block">{u.displayName}</span>
                  {u.jobTitle && <span className="text-[10px] text-slate-600 truncate block">{u.jobTitle}</span>}
                </div>
              </div>
              <div className="col-span-3 text-xs text-slate-400 flex items-center truncate">{u.email || '-'}</div>
              <div className="col-span-2 flex items-center">
                <select value={u.role} onChange={e => handleRoleChange(u.id, e.target.value as WIORole)}
                  className={`text-[11px] font-semibold px-2 py-1 rounded-lg bg-white/5 border border-white/5 focus:outline-none cursor-pointer ${ROLE_COLORS[u.role] || 'text-slate-400'}`}>
                  {Object.entries(ROLE_LABELS).map(([k, v]) => <option key={k} value={k} className="bg-[#0F0F23]">{v}</option>)}
                </select>
              </div>
              <div className="col-span-1 flex items-center">
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${u.isActive ? 'text-emerald-400 bg-emerald-500/10' : 'text-slate-500 bg-slate-600/10'}`}>
                  {u.isActive ? '활성' : '비활성'}
                </span>
              </div>
              <div className="col-span-2 text-xs text-slate-500 flex items-center">{u.department || '-'}</div>
              <div className="col-span-2 flex items-center gap-1">
                <button onClick={() => handleToggleStatus(u.id)} title={u.isActive ? '비활성화' : '활성화'}
                  className={`p-1.5 rounded transition-colors ${u.isActive ? 'text-slate-500 hover:text-red-400 hover:bg-red-500/10' : 'text-slate-500 hover:text-emerald-400 hover:bg-emerald-500/10'}`}>
                  {u.isActive ? <UserX size={14} /> : <UserCheck size={14} />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
