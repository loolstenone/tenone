'use client';

import { useState, useEffect } from 'react';
import { BookOpen, Clock, Award, CheckCircle2 } from 'lucide-react';
import { useWIO } from '../layout';
import { fetchCourses, fetchMyEnrollments, enrollCourse } from '@/lib/supabase/wio';

export default function LearnPage() {
  const { tenant, member } = useWIO();
  const [courses, setCourses] = useState<any[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div>
      <h1 className="text-xl font-bold mb-6">교육</h1>
      {loading ? (
        <div className="flex justify-center py-16"><div className="h-8 w-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" /></div>
      ) : courses.length === 0 ? (
        <div className="text-center py-16 text-slate-500"><BookOpen size={32} className="mx-auto mb-2 text-slate-600" /><p>등록된 과정이 없습니다</p></div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((c: any) => {
            const enr = getEnrollment(c.id);
            return (
              <div key={c.id} className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${c.category === 'required' ? 'text-red-400 bg-red-500/10' : c.category === 'professional' ? 'text-blue-400 bg-blue-500/10' : 'text-violet-400 bg-violet-500/10'}`}>
                    {c.category === 'required' ? '필수' : c.category === 'professional' ? '전문' : '심화'}
                  </span>
                  <div className="flex items-center gap-1 text-xs text-slate-500"><Clock size={11} />{c.durationMinutes}분</div>
                </div>
                <h3 className="font-semibold mb-1">{c.title}</h3>
                <p className="text-xs text-slate-500 mb-3 line-clamp-2">{c.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-xs text-indigo-400"><Award size={12} />{c.pointsReward}P</div>
                  {enr?.status === 'completed' ? (
                    <span className="flex items-center gap-1 text-xs text-emerald-400"><CheckCircle2 size={12} />이수 완료</span>
                  ) : enr ? (
                    <span className="text-xs text-amber-400">학습 중</span>
                  ) : (
                    <button onClick={() => handleEnroll(c.id)} className="text-xs text-indigo-400 hover:underline">수강 시작</button>
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
