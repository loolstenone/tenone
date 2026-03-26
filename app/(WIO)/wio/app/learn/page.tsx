'use client';

import { useState, useEffect } from 'react';
import { BookOpen, Clock, Award, CheckCircle2, Search, GraduationCap } from 'lucide-react';
import { useWIO } from '../layout';
import { fetchCourses, fetchMyEnrollments, enrollCourse } from '@/lib/supabase/wio';

type Category = 'all' | 'required' | 'professional' | 'advanced';

const CATEGORY_LABELS: Record<string, { label: string; color: string }> = {
  required: { label: '필수', color: 'text-red-400 bg-red-500/10' },
  professional: { label: '전문', color: 'text-blue-400 bg-blue-500/10' },
  advanced: { label: '심화', color: 'text-violet-400 bg-violet-500/10' },
};

export default function LearnPage() {
  const { tenant, member } = useWIO();
  const [courses, setCourses] = useState<any[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<Category>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!tenant || !member) return;
    Promise.all([fetchCourses(tenant.id), fetchMyEnrollments(member.id)]).then(([c, e]) => {
      setCourses(c); setEnrollments(e); setLoading(false);
    });
  }, [tenant, member]);

  const getEnrollment = (courseId: string) => enrollments.find((e: any) => e.courseId === courseId);

  const handleEnroll = async (courseId: string) => {
    if (!tenant || !member) return;
    await enrollCourse(tenant.id, courseId, member.id);
    fetchMyEnrollments(member.id).then(setEnrollments);
  };

  const filtered = courses.filter(c => {
    const matchCat = category === 'all' || c.category === category;
    const matchSearch = !search || c.title?.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const completedCount = enrollments.filter((e: any) => e.status === 'completed').length;
  const inProgressCount = enrollments.filter((e: any) => e.status === 'in_progress' || e.status === 'enrolled').length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold">교육</h1>
          {!loading && <p className="text-xs text-slate-500 mt-0.5">{courses.length}개 과정 · 이수 {completedCount}개 · 학습 중 {inProgressCount}개</p>}
        </div>
      </div>

      {/* 필터 + 검색 */}
      <div className="flex gap-2 mb-4">
        <div className="flex gap-1.5">
          {[{ id: 'all' as Category, label: '전체' }, ...Object.entries(CATEGORY_LABELS).map(([id, v]) => ({ id: id as Category, label: v.label }))].map(f => (
            <button key={f.id} onClick={() => setCategory(f.id)}
              className={`rounded-lg px-3 py-1.5 text-xs transition-colors ${category === f.id ? 'bg-indigo-600/10 text-indigo-400 font-semibold' : 'text-slate-400 hover:bg-white/5'}`}>
              {f.label}
            </button>
          ))}
        </div>
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="과정 검색..."
            className="w-full rounded-lg border border-white/5 bg-white/[0.03] pl-9 pr-4 py-1.5 text-sm focus:border-indigo-500 focus:outline-none" />
        </div>
      </div>

      {/* 목록 */}
      {loading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="rounded-xl border border-white/5 bg-white/[0.02] p-5 animate-pulse">
              <div className="h-3 w-16 bg-white/5 rounded mb-3" />
              <div className="h-5 w-3/4 bg-white/5 rounded mb-2" />
              <div className="h-3 w-full bg-white/5 rounded mb-1" />
              <div className="h-3 w-2/3 bg-white/5 rounded" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <GraduationCap size={36} className="mx-auto mb-3 text-slate-700" />
          {search || category !== 'all' ? (
            <>
              <p className="text-sm text-slate-400 mb-1">검색 결과가 없습니다</p>
              <p className="text-xs text-slate-600">다른 조건으로 검색해보세요</p>
            </>
          ) : (
            <>
              <p className="text-sm text-slate-400 mb-1">아직 과정이 없어요</p>
              <p className="text-xs text-slate-600">교육 과정이 등록되면 여기에 표시됩니다</p>
            </>
          )}
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c: any) => {
            const enr = getEnrollment(c.id);
            const cat = CATEGORY_LABELS[c.category] || CATEGORY_LABELS.advanced;
            return (
              <div key={c.id} className="rounded-xl border border-white/5 bg-white/[0.02] p-5 hover:border-white/10 transition-all">
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${cat.color}`}>{cat.label}</span>
                  <div className="flex items-center gap-1 text-xs text-slate-500"><Clock size={11} />{c.durationMinutes}분</div>
                </div>
                <h3 className="font-semibold text-sm mb-1">{c.title}</h3>
                <p className="text-xs text-slate-500 mb-3 line-clamp-2">{c.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-xs text-indigo-400"><Award size={12} />{c.pointsReward}P</div>
                  {enr?.status === 'completed' ? (
                    <span className="flex items-center gap-1 text-xs text-emerald-400"><CheckCircle2 size={12} />이수 완료</span>
                  ) : enr ? (
                    <span className="text-xs text-amber-400">학습 중</span>
                  ) : (
                    <button onClick={() => handleEnroll(c.id)} className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">수강 시작</button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
