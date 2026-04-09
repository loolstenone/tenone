'use client';

import { Building2, Users, Save, Plus, Trash2, Mail } from 'lucide-react';
import type { WIOMember } from '@/types/wio';

const ROLE_LABELS: Record<string, string> = {
  owner: '소유자', admin: '관리자', manager: '매니저', member: '멤버', guest: '게스트',
};

interface SystemTabProps {
  editName: string;
  setEditName: (v: string) => void;
  editServiceName: string;
  setEditServiceName: (v: string) => void;
  editDomain: string;
  setEditDomain: (v: string) => void;
  members: WIOMember[];
  inviteEmail: string;
  setInviteEmail: (v: string) => void;
  inviteRole: string;
  setInviteRole: (v: string) => void;
  inviting: boolean;
  saving: boolean;
  isDemo: boolean;
  saveOrg: () => void;
  handleInvite: () => void;
  handleRoleChange: (memberId: string, role: string) => void;
  handleRemove: (memberId: string) => void;
}

export default function SystemTab({
  editName, setEditName,
  editServiceName, setEditServiceName,
  editDomain, setEditDomain,
  members,
  inviteEmail, setInviteEmail,
  inviteRole, setInviteRole,
  inviting, saving, isDemo,
  saveOrg, handleInvite, handleRoleChange, handleRemove,
}: SystemTabProps) {
  return (
    <div className="max-w-3xl space-y-5">
      {/* Company info */}
      <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5 space-y-4">
        <h2 className="text-sm font-semibold flex items-center gap-2">
          <Building2 size={14} className="text-slate-400" /> 조직 정보
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

      {/* Member management */}
      <div className="rounded-xl border border-white/5 bg-white/[0.02] overflow-hidden">
        <div className="px-5 py-3 border-b border-white/5 flex items-center justify-between">
          <h2 className="text-sm font-semibold flex items-center gap-2">
            <Users size={14} className="text-slate-400" /> 멤버 관리
          </h2>
        </div>

        {isDemo ? (
          <div className="px-4 py-8 text-center">
            <Users size={24} className="text-slate-600 mx-auto mb-2" />
            <p className="text-sm text-slate-400">로그인 후 멤버를 관리할 수 있습니다.</p>
          </div>
        ) : (
          <>
            {/* Invite */}
            <div className="px-5 py-4 border-b border-white/5 bg-white/[0.01]">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Mail size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
                  <input value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} placeholder="이메일 주소"
                    className="w-full pl-9 pr-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-slate-600 focus:border-indigo-500 focus:outline-none" />
                </div>
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

            {/* Member list */}
            <div className="divide-y divide-white/5">
              {members.map((m) => (
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
          </>
        )}
      </div>
    </div>
  );
}
