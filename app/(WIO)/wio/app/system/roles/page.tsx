'use client';

import { useState } from 'react';
import { Shield, Plus, Users, Check, X } from 'lucide-react';
import { useWIO } from '../../layout';

type Permission = 'create' | 'read' | 'update' | 'delete';
type Role = {
  id: string; name: string; description: string; memberCount: number; isSystem: boolean;
  permissions: Record<string, Permission[]>;
};

const MODULES = ['홈', '프로젝트', '소통', '인재', '영업', '재무', '시수', '교육', '콘텐츠', '위키', '인사이트', '결재'];

const MOCK_ROLES: Role[] = [
  {
    id: 'r1', name: '최고관리자', description: '모든 모듈에 대한 전체 권한', memberCount: 1, isSystem: true,
    permissions: Object.fromEntries(MODULES.map(m => [m, ['create', 'read', 'update', 'delete'] as Permission[]])),
  },
  {
    id: 'r2', name: '관리자', description: '대부분의 모듈에 대한 관리 권한', memberCount: 2, isSystem: true,
    permissions: Object.fromEntries(MODULES.map(m => [m, ['create', 'read', 'update', 'delete'] as Permission[]])),
  },
  {
    id: 'r3', name: '매니저', description: '팀 관리 및 콘텐츠 생성 권한', memberCount: 3, isSystem: false,
    permissions: Object.fromEntries(MODULES.map(m => [m, ['create', 'read', 'update'] as Permission[]])),
  },
  {
    id: 'r4', name: '멤버', description: '기본 사용 권한', memberCount: 12, isSystem: false,
    permissions: Object.fromEntries(MODULES.map(m => [m, ['read'] as Permission[]])),
  },
  {
    id: 'r5', name: '게스트', description: '읽기 전용 제한된 접근', memberCount: 2, isSystem: false,
    permissions: { '홈': ['read'], '소통': ['read'], '위키': ['read'] },
  },
];

const PERM_LABELS: Record<Permission, string> = { create: 'C', read: 'R', update: 'U', delete: 'D' };

export default function RolesPage() {
  const { tenant } = useWIO();
  const [roles, setRoles] = useState(MOCK_ROLES);
  const [selectedRole, setSelectedRole] = useState<string>('r1');
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');

  if (!tenant) return null;
  const isDemo = tenant.id === 'demo';

  const currentRole = roles.find(r => r.id === selectedRole);

  const togglePermission = (roleId: string, module: string, perm: Permission) => {
    setRoles(prev => prev.map(r => {
      if (r.id !== roleId || r.isSystem) return r;
      const current = r.permissions[module] || [];
      const next = current.includes(perm) ? current.filter(p => p !== perm) : [...current, perm];
      return { ...r, permissions: { ...r.permissions, [module]: next } };
    }));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">역할/권한관리</h1>
        <button onClick={() => setShowCreate(!showCreate)} className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors">
          <Plus size={15} /> 역할 생성
        </button>
      </div>

      {isDemo && (
        <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-3 mb-4 text-sm text-amber-300">
          데모 모드입니다.
        </div>
      )}

      {showCreate && (
        <div className="mb-4 rounded-xl border border-white/5 bg-white/[0.02] p-4 space-y-3">
          <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="역할 이름"
            className="w-full rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none" />
          <input value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="설명"
            className="w-full rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none" />
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowCreate(false)} className="px-4 py-2 text-sm text-slate-400 hover:text-white">취소</button>
            <button disabled={!newName} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-40">생성</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* 역할 목록 */}
        <div className="lg:col-span-1 space-y-1">
          {roles.map(r => (
            <button key={r.id} onClick={() => setSelectedRole(r.id)}
              className={`w-full text-left rounded-xl border p-4 transition-colors ${selectedRole === r.id ? 'border-indigo-500/30 bg-indigo-500/5' : 'border-white/5 bg-white/[0.02] hover:bg-white/[0.04]'}`}>
              <div className="flex items-center gap-2 mb-1">
                <Shield size={14} className={selectedRole === r.id ? 'text-indigo-400' : 'text-slate-500'} />
                <span className="text-sm font-semibold">{r.name}</span>
                {r.isSystem && <span className="text-[9px] text-slate-600 bg-slate-500/10 px-1.5 py-0.5 rounded-full">시스템</span>}
              </div>
              <p className="text-xs text-slate-500">{r.description}</p>
              <div className="flex items-center gap-1 mt-2 text-[10px] text-slate-600">
                <Users size={10} /> {r.memberCount}명
              </div>
            </button>
          ))}
        </div>

        {/* 권한 매트릭스 */}
        <div className="lg:col-span-3 rounded-xl border border-white/5 bg-white/[0.02] overflow-hidden">
          {currentRole && (
            <>
              <div className="px-5 py-3 border-b border-white/5">
                <h3 className="text-sm font-semibold">{currentRole.name} — 권한 매트릭스</h3>
                {currentRole.isSystem && <p className="text-[10px] text-slate-500 mt-0.5">시스템 역할은 수정할 수 없습니다</p>}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/5">
                      <th className="text-left px-4 py-2 text-[10px] text-slate-500 uppercase tracking-wider w-32">모듈</th>
                      {(['create', 'read', 'update', 'delete'] as Permission[]).map(p => (
                        <th key={p} className="text-center px-4 py-2 text-[10px] text-slate-500 uppercase tracking-wider">{PERM_LABELS[p]}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {MODULES.map(mod => (
                      <tr key={mod} className="border-b border-white/5 hover:bg-white/[0.02]">
                        <td className="px-4 py-2.5 text-sm">{mod}</td>
                        {(['create', 'read', 'update', 'delete'] as Permission[]).map(perm => {
                          const has = (currentRole.permissions[mod] || []).includes(perm);
                          return (
                            <td key={perm} className="text-center px-4 py-2.5">
                              <button onClick={() => togglePermission(currentRole.id, mod, perm)}
                                disabled={currentRole.isSystem}
                                className={`w-6 h-6 rounded flex items-center justify-center transition-colors ${has ? 'bg-indigo-600 text-white' : 'bg-white/5 text-slate-600'} ${!currentRole.isSystem ? 'hover:bg-indigo-500/50 cursor-pointer' : 'cursor-default'}`}>
                                {has && <Check size={12} />}
                              </button>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
