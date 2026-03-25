'use client';

import { useState, useEffect } from 'react';
import { Users, Award, Search } from 'lucide-react';
import { useWIO } from '../layout';
import { fetchTenantMembers, fetchMemberPoints, getGrade } from '@/lib/supabase/wio';

export default function PeoplePage() {
  const { tenant } = useWIO();
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

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

  const filtered = search ? members.filter((m: any) => m.displayName?.toLowerCase().includes(search.toLowerCase())) : members;

  const GRADE_COLORS: Record<string, string> = {
    Diamond: 'text-violet-400 bg-violet-500/10', Platinum: 'text-slate-300 bg-slate-500/10',
    Gold: 'text-amber-400 bg-amber-500/10', Silver: 'text-slate-400 bg-slate-500/10', Bronze: 'text-orange-400 bg-orange-500/10',
  };

  return (
    <div>
      <h1 className="text-xl font-bold mb-6">인재</h1>
      <div className="relative mb-4">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="이름으로 검색..."
          className="w-full rounded-lg border border-white/5 bg-white/[0.03] pl-9 pr-4 py-2 text-sm focus:border-indigo-500 focus:outline-none" />
      </div>
      {loading ? (
        <div className="flex justify-center py-16"><div className="h-8 w-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-500"><Users size={32} className="mx-auto mb-2 text-slate-600" /><p>멤버가 없습니다</p></div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((m: any) => (
            <div key={m.id} className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold">{m.displayName?.charAt(0)}</div>
                <div>
                  <div className="font-semibold">{m.displayName}</div>
                  <div className="text-xs text-slate-500">{m.jobTitle || m.role}</div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5"><Award size={13} className="text-indigo-400" /><span className="text-xs text-slate-400">{m.totalPoints || 0} P</span></div>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${GRADE_COLORS[m.grade] || GRADE_COLORS.Bronze}`}>{m.grade}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
