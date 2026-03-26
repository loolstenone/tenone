'use client';

import { useState, useEffect } from 'react';
import { Users, Award, Search, UserPlus, Mail, X } from 'lucide-react';
import Link from 'next/link';
import { useWIO } from '../layout';
import { fetchTenantMembers, fetchMemberPoints, getGrade } from '@/lib/supabase/wio';

export default function PeoplePage() {
  const { tenant } = useWIO();
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteSent, setInviteSent] = useState(false);

  useEffect(() => {
    if (!tenant) return;
    fetchTenantMembers(tenant.id).then(async (ms) => {
      const withPoints = await Promise.all(ms.map(async (m: any) => {
        const { total } = await fetchMemberPoints(m.id);
        return { ...m, totalPoints: total, grade: getGrade(total) };
      }));
      setMembers(withPoints);
      setLoading(false);
    });
  }, [tenant]);

  const roles = ['all', ...Array.from(new Set(members.map(m => m.role).filter(Boolean)))];

  const filtered = members.filter(m => {
    const matchSearch = !search || m.displayName?.toLowerCase().includes(search.toLowerCase()) || m.email?.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'all' || m.role === roleFilter;
    return matchSearch && matchRole;
  });

  const handleInvite = () => {
    if (!inviteEmail.trim()) return;
    // TODO: Supabase invite API
    setInviteSent(true);
    setTimeout(() => { setInviteSent(false); setShowInvite(false); setInviteEmail(''); }, 2000);
  };

  const GRADE_COLORS: Record<string, string> = {
    Diamond: 'text-violet-400 bg-violet-500/10', Platinum: 'text-slate-300 bg-slate-500/10',
    Gold: 'text-amber-400 bg-amber-500/10', Silver: 'text-slate-400 bg-slate-500/10', Bronze: 'text-orange-400 bg-orange-500/10',
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold">멤버</h1>
          {!loading && <p className="text-xs text-slate-500 mt-0.5">{members.length}명</p>}
        </div>
        <button onClick={() => setShowInvite(!showInvite)}
          className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors">
          <UserPlus size={15} /> 초대
        </button>
      </div>

      {/* 초대 폼 */}
      {showInvite && (
        <div className="mb-4 rounded-xl border border-white/5 bg-white/[0.02] p-4">
          {inviteSent ? (
            <p className="text-sm text-emerald-400 text-center py-2">초대 이메일을 보냈습니다</p>
          ) : (
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input value={inviteEmail} onChange={e => setInviteEmail(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleInvite()}
                  placeholder="이메일 주소로 초대"
                  type="email"
                  className="w-full rounded-lg border border-white/5 bg-white/[0.03] pl-9 pr-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none" />
              </div>
              <button onClick={handleInvite} disabled={!inviteEmail.trim()}
                className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold disabled:opacity-40 hover:bg-indigo-500 transition-colors">보내기</button>
              <button onClick={() => setShowInvite(false)} className="text-slate-500 hover:text-white"><X size={16} /></button>
            </div>
          )}
        </div>
      )}

      {/* 검색 + 역할 필터 */}
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="이름 또는 이메일로 검색..."
            className="w-full rounded-lg border border-white/5 bg-white/[0.03] pl-9 pr-4 py-2 text-sm focus:border-indigo-500 focus:outline-none" />
        </div>
        {roles.length > 2 && (
          <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
            className="rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2 text-sm text-slate-300 focus:border-indigo-500 focus:outline-none">
            {roles.map(r => (
              <option key={r} value={r}>{r === 'all' ? '전체 역할' : r}</option>
            ))}
          </select>
        )}
      </div>

      {/* 목록 */}
      {loading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="rounded-xl border border-white/5 bg-white/[0.02] p-4 animate-pulse">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-full bg-white/5" />
                <div><div className="h-4 w-20 bg-white/5 rounded mb-1" /><div className="h-3 w-16 bg-white/5 rounded" /></div>
              </div>
              <div className="h-3 w-24 bg-white/5 rounded" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <Users size={32} className="mx-auto mb-3 text-slate-700" />
          {search || roleFilter !== 'all' ? (
            <>
              <p className="text-sm text-slate-400 mb-1">검색 결과가 없습니다</p>
              <p className="text-xs text-slate-600">다른 조건으로 검색해보세요</p>
            </>
          ) : (
            <>
              <p className="text-sm text-slate-400 mb-1">아직 멤버가 없어요</p>
              <p className="text-xs text-slate-600 mb-4">이메일로 팀원을 초대해보세요</p>
              <button onClick={() => setShowInvite(true)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium hover:bg-indigo-500 transition-colors">
                <UserPlus size={14} /> 멤버 초대하기
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((m: any) => (
            <Link key={m.id} href={`/wio/app/people/${m.id}`}
              className="rounded-xl border border-white/5 bg-white/[0.02] p-4 hover:border-white/10 hover:bg-white/[0.04] transition-all group">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold shrink-0">
                  {m.avatarUrl ? <img src={m.avatarUrl} alt="" className="h-full w-full rounded-full object-cover" /> : m.displayName?.charAt(0)}
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-sm truncate">{m.displayName}</div>
                  <div className="text-xs text-slate-500 truncate">{m.jobTitle || m.role || '멤버'}</div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5"><Award size={13} className="text-indigo-400" /><span className="text-xs text-slate-400">{m.totalPoints || 0} P</span></div>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${GRADE_COLORS[m.grade] || GRADE_COLORS.Bronze}`}>{m.grade}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
