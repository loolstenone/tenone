'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Award, Mail, Briefcase, Calendar, MapPin, Tag } from 'lucide-react';
import { useWIO } from '../../layout';
import { fetchMemberPoints, getGrade } from '@/lib/supabase/wio';
import { createClient } from '@/lib/supabase/client';

export default function PeopleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { tenant } = useWIO();
  const [member, setMember] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [points, setPoints] = useState(0);

  useEffect(() => {
    if (!id) return;
    const sb = createClient();
    sb.from('wio_members').select('*').eq('id', id).single().then(async ({ data }) => {
      if (data) {
        const camel: any = {};
        Object.entries(data).forEach(([k, v]) => {
          camel[k.replace(/_([a-z])/g, (_, c) => c.toUpperCase())] = v;
        });
        const { total } = await fetchMemberPoints(id);
        setMember(camel);
        setPoints(total);
      }
      setLoading(false);
    });
  }, [id]);

  const grade = getGrade(points);
  const GRADE_COLORS: Record<string, string> = {
    Diamond: 'text-violet-400 bg-violet-500/10', Platinum: 'text-slate-300 bg-slate-500/10',
    Gold: 'text-amber-400 bg-amber-500/10', Silver: 'text-slate-400 bg-slate-500/10', Bronze: 'text-orange-400 bg-orange-500/10',
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-4 w-20 bg-white/5 rounded mb-8" />
        <div className="flex items-center gap-4 mb-6">
          <div className="h-16 w-16 rounded-full bg-white/5" />
          <div><div className="h-6 w-32 bg-white/5 rounded mb-2" /><div className="h-4 w-24 bg-white/5 rounded" /></div>
        </div>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-400 mb-4">멤버를 찾을 수 없습니다</p>
        <button onClick={() => router.back()} className="text-indigo-400 text-sm">돌아가기</button>
      </div>
    );
  }

  return (
    <div>
      <button onClick={() => router.back()} className="flex items-center gap-1 text-sm text-slate-500 hover:text-white mb-6 transition-colors">
        <ArrowLeft size={14} /> 목록
      </button>

      {/* 프로필 헤더 */}
      <div className="rounded-xl border border-white/5 bg-white/[0.02] p-6 mb-4">
        <div className="flex items-center gap-4 mb-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-600 text-xl font-bold shrink-0">
            {member.avatarUrl ? <img src={member.avatarUrl} alt="" className="h-full w-full rounded-full object-cover" /> : member.displayName?.charAt(0)}
          </div>
          <div>
            <h1 className="text-xl font-bold">{member.displayName}</h1>
            <p className="text-sm text-slate-400">{member.jobTitle || member.role || '멤버'}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${GRADE_COLORS[grade] || GRADE_COLORS.Bronze}`}>
            <Award size={11} className="inline mr-1" />{grade} · {points}P
          </span>
          {member.role && (
            <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400">{member.role}</span>
          )}
        </div>
      </div>

      {/* 상세 정보 */}
      <div className="rounded-xl border border-white/5 bg-white/[0.02] divide-y divide-white/5">
        {[
          { icon: Mail, label: '이메일', value: member.email },
          { icon: Briefcase, label: '직책', value: member.jobTitle },
          { icon: Tag, label: '역할', value: member.role },
          { icon: Calendar, label: '가입일', value: member.createdAt ? new Date(member.createdAt).toLocaleDateString('ko-KR') : null },
        ].filter(item => item.value).map((item, i) => (
          <div key={i} className="flex items-center gap-3 px-5 py-3">
            <item.icon size={14} className="text-slate-500 shrink-0" />
            <span className="text-xs text-slate-500 w-16 shrink-0">{item.label}</span>
            <span className="text-sm text-slate-300">{item.value}</span>
          </div>
        ))}
      </div>

      {/* 활동 요약 (placeholder) */}
      <div className="mt-4 rounded-xl border border-white/5 bg-white/[0.02] p-5">
        <h2 className="text-sm font-semibold mb-3">활동 요약</h2>
        <p className="text-xs text-slate-600">프로젝트 참여, 게시글, GPR 달성률 등이 여기에 표시됩니다.</p>
      </div>
    </div>
  );
}
