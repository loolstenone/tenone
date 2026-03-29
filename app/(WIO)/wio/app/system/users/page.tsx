'use client';

import { useState } from 'react';
import { Users, Plus, Search, Shield, MoreHorizontal, UserX, UserCheck, Mail } from 'lucide-react';
import { useWIO } from '../../layout';

type UserStatus = 'active' | 'inactive' | 'pending';
type UserRole = 'super_admin' | 'admin' | 'manager' | 'member' | 'guest';
type SysUser = {
  id: string; name: string; email: string; role: UserRole; status: UserStatus;
  lastLogin: string; department: string; joinedAt: string;
};

const MOCK_USERS: SysUser[] = [
  { id: 'u1', name: '김대표', email: 'ceo@tenone.biz', role: 'super_admin', status: 'active', lastLogin: '2026-03-29 14:30', department: '경영', joinedAt: '2024-01-01' },
  { id: 'u2', name: '박개발', email: 'dev@tenone.biz', role: 'admin', status: 'active', lastLogin: '2026-03-29 13:15', department: '개발', joinedAt: '2024-03-15' },
  { id: 'u3', name: '이마케팅', email: 'marketing@tenone.biz', role: 'manager', status: 'active', lastLogin: '2026-03-29 11:20', department: '마케팅', joinedAt: '2024-06-01' },
  { id: 'u4', name: '정디자인', email: 'design@tenone.biz', role: 'member', status: 'active', lastLogin: '2026-03-28 17:45', department: '디자인', joinedAt: '2024-09-01' },
  { id: 'u5', name: '최인사', email: 'hr@tenone.biz', role: 'manager', status: 'active', lastLogin: '2026-03-29 09:00', department: '인사', joinedAt: '2024-04-15' },
  { id: 'u6', name: '한재무', email: 'finance@tenone.biz', role: 'member', status: 'active', lastLogin: '2026-03-28 18:30', department: '재무', joinedAt: '2024-07-01' },
  { id: 'u7', name: '이프론트', email: 'front@tenone.biz', role: 'member', status: 'active', lastLogin: '2026-03-29 12:00', department: '개발', joinedAt: '2025-01-15' },
  { id: 'u8', name: '정백엔드', email: 'backend@tenone.biz', role: 'member', status: 'active', lastLogin: '2026-03-29 10:30', department: '개발', joinedAt: '2025-02-01' },
  { id: 'u9', name: '윤기획', email: 'plan@tenone.biz', role: 'member', status: 'inactive', lastLogin: '2026-03-15 09:00', department: '기획', joinedAt: '2025-06-01' },
  { id: 'u10', name: '신입사원', email: 'new@tenone.biz', role: 'guest', status: 'pending', lastLogin: '-', department: '미배정', joinedAt: '2026-04-01' },
];

const ROLE_LABELS: Record<UserRole, string> = { super_admin: '최고관리자', admin: '관리자', manager: '매니저', member: '멤버', guest: '게스트' };
const ROLE_COLORS: Record<UserRole, string> = { super_admin: 'text-violet-400 bg-violet-500/10', admin: 'text-indigo-400 bg-indigo-500/10', manager: 'text-blue-400 bg-blue-500/10', member: 'text-slate-400 bg-slate-500/10', guest: 'text-slate-500 bg-slate-600/10' };
const STATUS_LABELS: Record<UserStatus, string> = { active: '활성', inactive: '비활성', pending: '대기' };
const STATUS_COLORS: Record<UserStatus, string> = { active: 'text-emerald-400', inactive: 'text-slate-500', pending: 'text-amber-400' };

export default function UsersPage() {
  const { tenant } = useWIO();
  const [users, setUsers] = useState(MOCK_USERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all');

  if (!tenant) return null;
  const isDemo = tenant.id === 'demo';

  const filtered = users
    .filter(u => roleFilter === 'all' || u.role === roleFilter)
    .filter(u => !searchQuery || u.name.includes(searchQuery) || u.email.includes(searchQuery));

  const toggleStatus = (id: string) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' } as SysUser : u));
  };

  const changeRole = (id: string, role: UserRole) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, role } : u));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">사용자관리</h1>
        <button onClick={() => setShowCreate(!showCreate)} className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors">
          <Plus size={15} /> 사용자 생성
        </button>
      </div>

      {isDemo && (
        <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-3 mb-4 text-sm text-amber-300">
          데모 모드입니다.
        </div>
      )}

      {showCreate && (
        <div className="mb-4 rounded-xl border border-white/5 bg-white/[0.02] p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input placeholder="이름" className="rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none" />
            <input placeholder="이메일" className="rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <select className="rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2.5 text-sm focus:outline-none">
              {Object.entries(ROLE_LABELS).map(([k, v]) => <option key={k} value={k} className="bg-[#0F0F23]">{v}</option>)}
            </select>
            <input placeholder="부서" className="rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none" />
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowCreate(false)} className="px-4 py-2 text-sm text-slate-400 hover:text-white">취소</button>
            <button className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500">생성</button>
          </div>
        </div>
      )}

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

      <div className="rounded-xl border border-white/5 bg-white/[0.02] overflow-hidden">
        <div className="grid grid-cols-12 gap-2 px-4 py-2 border-b border-white/5 text-[10px] text-slate-500 uppercase tracking-wider">
          <div className="col-span-2">이름</div>
          <div className="col-span-3">이메일</div>
          <div className="col-span-1">역할</div>
          <div className="col-span-1">상태</div>
          <div className="col-span-1">부서</div>
          <div className="col-span-2">마지막 접속</div>
          <div className="col-span-2">액션</div>
        </div>
        {filtered.map(u => (
          <div key={u.id} className="grid grid-cols-12 gap-2 px-4 py-3 border-b border-white/5 hover:bg-white/[0.04] transition-colors">
            <div className="col-span-2 flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold shrink-0">{u.name.charAt(0)}</div>
              <span className="text-sm truncate">{u.name}</span>
            </div>
            <div className="col-span-3 text-xs text-slate-400 flex items-center">{u.email}</div>
            <div className="col-span-1 flex items-center">
              <select value={u.role} onChange={e => changeRole(u.id, e.target.value as UserRole)}
                className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-transparent border-0 focus:outline-none cursor-pointer"
                style={{ color: 'inherit' }}>
                {Object.entries(ROLE_LABELS).map(([k, v]) => <option key={k} value={k} className="bg-[#0F0F23]">{v}</option>)}
              </select>
            </div>
            <div className="col-span-1 flex items-center">
              <span className={`text-[10px] ${STATUS_COLORS[u.status]}`}>{STATUS_LABELS[u.status]}</span>
            </div>
            <div className="col-span-1 text-xs text-slate-500 flex items-center">{u.department}</div>
            <div className="col-span-2 text-xs text-slate-600 flex items-center">{u.lastLogin}</div>
            <div className="col-span-2 flex items-center gap-1">
              <button onClick={() => toggleStatus(u.id)} title={u.status === 'active' ? '비활성화' : '활성화'}
                className="p-1.5 rounded text-slate-500 hover:text-white hover:bg-white/5 transition-colors">
                {u.status === 'active' ? <UserX size={13} /> : <UserCheck size={13} />}
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 text-xs text-slate-600">총 {filtered.length}명</div>
    </div>
  );
}
