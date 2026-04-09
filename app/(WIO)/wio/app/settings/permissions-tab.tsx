'use client';

import { Shield, Search, Check, Eye, Play } from 'lucide-react';
import { type PermissionRole, MODULE_BLOCKS } from './settings-data';

interface PermissionsTabProps {
  permRoles: PermissionRole[];
  selectedRole: string;
  setSelectedRole: (id: string) => void;
  simUser: string;
  setSimUser: (v: string) => void;
  togglePermission: (roleId: string, moduleCode: string, field: 'read' | 'write' | 'delete' | 'admin') => void;
  setDataScope: (roleId: string, scope: PermissionRole['dataScope']) => void;
  showToast: (msg: string) => void;
}

export default function PermissionsTab({
  permRoles,
  selectedRole,
  setSelectedRole,
  simUser,
  setSimUser,
  togglePermission,
  setDataScope,
  showToast,
}: PermissionsTabProps) {
  const currentRole = permRoles.find(r => r.id === selectedRole);

  return (
    <div className="space-y-5">
      <div className="flex gap-4" style={{ minHeight: 'calc(100vh - 280px)' }}>
        {/* Left: Role list */}
        <div className="w-[260px] shrink-0 rounded-xl border border-white/5 bg-white/[0.02] overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-b border-white/5">
            <span className="text-xs font-semibold text-slate-400">역할 템플릿</span>
            <span className="ml-2 text-[10px] text-slate-600">{permRoles.length}개</span>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {permRoles.map(r => (
              <button key={r.id} onClick={() => setSelectedRole(r.id)}
                className={`w-full text-left rounded-lg px-3 py-3 transition-colors ${
                  selectedRole === r.id
                    ? 'bg-indigo-500/10 border border-indigo-500/20'
                    : 'hover:bg-white/5 border border-transparent'
                }`}>
                <div className="flex items-center gap-2">
                  <Shield size={13} className={selectedRole === r.id ? 'text-indigo-400' : 'text-slate-500'} />
                  <span className="text-xs font-semibold text-white">{r.name}</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-1 ml-5">{r.description}</p>
                <div className="flex items-center gap-2 mt-2 ml-5">
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${
                    r.dataScope === 'all' ? 'bg-violet-500/10 text-violet-400' :
                    r.dataScope === 'division' ? 'bg-blue-500/10 text-blue-400' :
                    r.dataScope === 'team' ? 'bg-green-500/10 text-green-400' :
                    'bg-slate-500/10 text-slate-400'
                  }`}>
                    {r.dataScope === 'all' ? '전체' : r.dataScope === 'division' ? '본부' : r.dataScope === 'team' ? '팀' : '본인'}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right: Permission matrix + simulator */}
        <div className="flex-1 min-w-0 space-y-4 overflow-y-auto">
          {currentRole && (
            <>
              {/* Data scope selector */}
              <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
                <h3 className="text-xs font-semibold text-slate-400 mb-3">데이터 범위</h3>
                <div className="flex gap-2">
                  {(['all', 'division', 'team', 'self'] as const).map(scope => (
                    <button key={scope} onClick={() => setDataScope(currentRole.id, scope)}
                      className={`text-[11px] px-3 py-2 rounded-lg border transition ${
                        currentRole.dataScope === scope
                          ? 'border-indigo-500/30 bg-indigo-500/10 text-indigo-400'
                          : 'border-white/10 bg-white/[0.02] text-slate-400 hover:bg-white/5'
                      }`}>
                      {scope === 'all' ? '전체 데이터' : scope === 'division' ? '본부 데이터' : scope === 'team' ? '팀 데이터' : '본인 데이터'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Module access matrix */}
              <div className="rounded-xl border border-white/5 bg-white/[0.02] overflow-hidden">
                <div className="px-4 py-3 border-b border-white/5">
                  <span className="text-xs font-semibold text-slate-400">모듈 접근 권한</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-white/5">
                        <th className="text-left px-4 py-2 text-slate-500 font-medium w-32">모듈</th>
                        <th className="px-4 py-2 text-slate-500 font-medium text-center w-20">읽기</th>
                        <th className="px-4 py-2 text-slate-500 font-medium text-center w-20">쓰기</th>
                        <th className="px-4 py-2 text-slate-500 font-medium text-center w-20">삭제</th>
                        <th className="px-4 py-2 text-slate-500 font-medium text-center w-20">관리</th>
                      </tr>
                    </thead>
                    <tbody>
                      {MODULE_BLOCKS.slice(0, 15).map(mod => {
                        const perm = currentRole.modules[mod.code];
                        if (!perm) return null;
                        return (
                          <tr key={mod.code} className="border-b border-white/5 hover:bg-white/[0.02]">
                            <td className="px-4 py-2">
                              <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-sm ${mod.trackColor}`} />
                                <span className="text-white font-medium">{mod.code}</span>
                                <span className="text-slate-500">{mod.name}</span>
                              </div>
                            </td>
                            {(['read', 'write', 'delete', 'admin'] as const).map(field => (
                              <td key={field} className="px-4 py-2 text-center">
                                <button onClick={() => togglePermission(currentRole.id, mod.code, field)}
                                  className={`w-5 h-5 rounded border flex items-center justify-center transition ${
                                    perm[field]
                                      ? 'bg-indigo-600 border-indigo-500 text-white'
                                      : 'border-white/10 bg-white/5 text-transparent hover:border-white/20'
                                  }`}>
                                  <Check size={10} />
                                </button>
                              </td>
                            ))}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Permission simulator */}
              <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
                <h3 className="text-xs font-semibold text-slate-400 mb-3">
                  <Eye size={12} className="inline mr-1" />
                  권한 시뮬레이터
                </h3>
                <p className="text-[10px] text-slate-500 mb-3">이 역할의 사용자가 무엇을 볼 수 있는지 미리 확인</p>
                <div className="flex gap-2 mb-4">
                  <div className="relative flex-1">
                    <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-600" />
                    <input value={simUser} onChange={e => setSimUser(e.target.value)}
                      placeholder="사용자 이름으로 검색..."
                      className="w-full pl-8 pr-3 py-2 bg-white/5 border border-white/10 rounded-lg text-xs text-white placeholder:text-slate-600 focus:border-indigo-500 focus:outline-none" />
                  </div>
                  <button onClick={() => showToast('시뮬레이션 실행')}
                    className="px-4 py-2 bg-indigo-600/10 text-indigo-400 text-xs rounded-lg hover:bg-indigo-600/20 transition border border-indigo-500/20">
                    <Play size={11} className="inline mr-1" /> 시뮬레이션
                  </button>
                </div>
                {/* Preview result */}
                <div className="rounded-lg border border-white/5 bg-[#0a0a1a] p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-8 w-8 rounded-full bg-indigo-600/20 flex items-center justify-center text-xs font-bold text-indigo-400">
                      {currentRole.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-xs font-medium text-white">{currentRole.name}</p>
                      <p className="text-[10px] text-slate-500">
                        데이터 범위: {currentRole.dataScope === 'all' ? '전체' : currentRole.dataScope === 'division' ? '본부' : currentRole.dataScope === 'team' ? '팀' : '본인'}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-2">
                      <p className="text-[10px] text-emerald-400 font-semibold mb-1">접근 가능</p>
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(currentRole.modules).filter(([, v]) => v.read).slice(0, 8).map(([code]) => (
                          <span key={code} className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400">{code}</span>
                        ))}
                        {Object.entries(currentRole.modules).filter(([, v]) => v.read).length > 8 && (
                          <span className="text-[9px] text-emerald-400">+{Object.entries(currentRole.modules).filter(([, v]) => v.read).length - 8}</span>
                        )}
                      </div>
                    </div>
                    <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-2">
                      <p className="text-[10px] text-red-400 font-semibold mb-1">접근 불가</p>
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(currentRole.modules).filter(([, v]) => !v.read).slice(0, 8).map(([code]) => (
                          <span key={code} className="text-[9px] px-1.5 py-0.5 rounded bg-red-500/10 text-red-400">{code}</span>
                        ))}
                        {Object.entries(currentRole.modules).filter(([, v]) => !v.read).length === 0 && (
                          <span className="text-[9px] text-slate-600">없음</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
