'use client';

import { useState } from 'react';
import { Plus, Mail, Shield, UserPlus, MoreHorizontal, Crown } from 'lucide-react';
import { getSCUser } from '@/lib/smarcomm/auth';
import { getChartColors } from '@/lib/smarcomm/chart-palette';

interface Member {
  email: string;
  role: 'owner' | 'admin' | 'editor' | 'viewer';
  joinedAt: string;
  lastActive: string;
}

const _mc = getChartColors(7);
const ROLE_LABELS: Record<string, { label: string; color: string }> = {
  owner: { label: '소유자', color: _mc[0] },
  admin: { label: '관리자', color: _mc[1] },
  editor: { label: '편집자', color: _mc[2] },
  viewer: { label: '뷰어', color: _mc[3] },
};

export default function MembersPage() {
  const user = getSCUser();
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'editor' | 'viewer'>('viewer');
  const [showInvite, setShowInvite] = useState(false);

  const [members, setMembers] = useState<Member[]>([
    { email: user?.email || 'admin@smarcomm.com', role: 'owner', joinedAt: '2026-03-01', lastActive: '방금' },
  ]);

  const handleInvite = () => {
    if (!inviteEmail || !inviteEmail.includes('@')) return;
    setMembers([...members, {
      email: inviteEmail,
      role: inviteRole,
      joinedAt: new Date().toISOString().split('T')[0],
      lastActive: '초대됨',
    }]);
    setInviteEmail('');
    setShowInvite(false);
  };

  return (
    <div className="max-w-3xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-text">관리자</h1>
          <p className="mt-1 text-xs text-text-muted">워크스페이스 멤버를 관리하고 역할을 설정하세요</p>
        </div>
        <button onClick={() => setShowInvite(!showInvite)} className="flex items-center gap-1.5 rounded-xl bg-text px-4 py-2.5 text-sm font-semibold text-white hover:bg-accent-sub">
          <UserPlus size={15} /> 멤버 초대
        </button>
      </div>

      {/* 초대 폼 */}
      {showInvite && (
        <div className="mb-6 rounded-2xl border border-border bg-white p-5">
          <h2 className="mb-3 text-sm font-semibold text-text">새 멤버 초대</h2>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
              <input type="email" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} placeholder="이메일 주소"
                className="w-full rounded-xl border border-border bg-surface py-2.5 pl-11 pr-4 text-sm text-text placeholder:text-text-muted focus:border-text focus:outline-none" />
            </div>
            <select value={inviteRole} onChange={e => setInviteRole(e.target.value as typeof inviteRole)}
              className="rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-text focus:border-text focus:outline-none">
              <option value="admin">관리자</option>
              <option value="editor">편집자</option>
              <option value="viewer">뷰어</option>
            </select>
            <button onClick={handleInvite} className="rounded-xl bg-text px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent-sub">
              초대
            </button>
          </div>
        </div>
      )}

      {/* 역할 설명 */}
      <div className="mb-6 grid gap-3 sm:grid-cols-4">
        {[
          { role: 'owner', icon: Crown, desc: '모든 권한 + 멤버 관리' },
          { role: 'admin', icon: Shield, desc: '설정 변경 + 캠페인 관리' },
          { role: 'editor', icon: Mail, desc: '소재 제작 + 리포트 조회' },
          { role: 'viewer', icon: Mail, desc: '리포트 조회만 가능' },
        ].map(item => {
          const role = ROLE_LABELS[item.role];
          return (
            <div key={item.role} className="rounded-xl border border-border bg-white p-4 text-center">
              <item.icon size={18} className="mx-auto mb-2" style={{ color: role.color }} />
              <div className="text-xs font-semibold" style={{ color: role.color }}>{role.label}</div>
              <div className="mt-1 text-[10px] text-text-muted">{item.desc}</div>
            </div>
          );
        })}
      </div>

      {/* 멤버 목록 */}
      <div className="rounded-2xl border border-border bg-white">
        <div className="border-b border-border px-5 py-3">
          <h2 className="text-sm font-semibold text-text">멤버 ({members.length}명)</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-xs text-text-muted">
              <th className="px-5 py-2.5 text-left font-medium">멤버</th>
              <th className="px-5 py-2.5 text-center font-medium">역할</th>
              <th className="px-5 py-2.5 text-right font-medium">참여일</th>
              <th className="px-5 py-2.5 text-right font-medium">최근 활동</th>
            </tr>
          </thead>
          <tbody>
            {members.map((member, i) => {
              const role = ROLE_LABELS[member.role];
              return (
                <tr key={i} className="border-b border-border last:border-0 hover:bg-surface">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-text text-xs font-bold text-white">
                        {member.email.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-text">{member.email}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-center">
                    <span className="rounded-full px-2.5 py-1 text-xs font-semibold" style={{ color: role.color, background: `${role.color}10` }}>
                      {role.label}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right text-text-muted">{member.joinedAt}</td>
                  <td className="px-5 py-3 text-right text-text-muted">{member.lastActive}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
