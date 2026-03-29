'use client';

import { useState, useEffect } from 'react';
import { ChevronRight, Clock, BookOpen, Target } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { fetchProfile, upsertProfile, fetchLogs, fetchTasks, fetchDreams } from '@/lib/myverse-supabase';
import type { MyverseProfile, MyverseLog, MyverseTask, MyverseDream } from '@/lib/myverse-supabase';

/* ── 기분 옵션 ── */
const MOODS = [
  { emoji: '\ud83d\ude0a', label: '좋아' },
  { emoji: '\ud83d\ude10', label: '보통' },
  { emoji: '\ud83d\ude14', label: '힘들어' },
  { emoji: '\ud83d\udd25', label: '불타올라' },
];

function formatDate() {
  const d = new Date();
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  return `${d.getFullYear()}. ${d.getMonth() + 1}. ${d.getDate()}. (${days[d.getDay()]})`;
}

export default function MePage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState<MyverseProfile | null>(null);
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [recentLogs, setRecentLogs] = useState<MyverseLog[]>([]);
  const [todayTasks, setTodayTasks] = useState<MyverseTask[]>([]);
  const [topDream, setTopDream] = useState<MyverseDream | null>(null);
  const [loading, setLoading] = useState(true);

  // 초기 데이터 로드
  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      // 병렬로 데이터 로드
      const [profileRes, logsRes, tasksRes, dreamsRes] = await Promise.all([
        fetchProfile(user.id),
        fetchLogs(user.id, 3),
        fetchTasks(user.id),
        fetchDreams(user.id),
      ]);

      if (profileRes.profile) {
        setProfile(profileRes.profile);
        // 기분 상태 복원
        const moodIdx = MOODS.findIndex(m => m.emoji === profileRes.profile?.mood);
        if (moodIdx >= 0) setSelectedMood(moodIdx);
      }

      setRecentLogs(logsRes.logs);
      setTodayTasks(tasksRes.tasks.slice(0, 5));

      // 활성 목표 중 진행률 기준 첫 번째
      const activeDream = dreamsRes.dreams.find(d => d.status === 'active' && d.dream_type === 'year');
      if (activeDream) setTopDream(activeDream);

      setLoading(false);
    };
    load();
  }, []);

  // 기분 선택 시 DB 저장
  const handleMoodSelect = async (index: number) => {
    setSelectedMood(index);
    if (!userId) return;
    await upsertProfile(userId, { mood: MOODS[index].emoji });
  };

  const userName = profile?.display_name || '텐원';

  if (loading) {
    return (
      <div className="px-5 py-6 flex items-center justify-center min-h-[60vh]">
        <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="px-5 py-6 space-y-6">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold">안녕 {userName}.</h1>
        <p className="text-sm text-slate-400 mt-1">{formatDate()}</p>
      </div>

      {/* Mood selector */}
      <section className="bg-white/5 rounded-2xl p-4">
        <h2 className="text-sm font-medium text-slate-300 mb-3">오늘 기분은?</h2>
        <div className="flex gap-3">
          {MOODS.map((mood, i) => (
            <button
              key={i}
              onClick={() => handleMoodSelect(i)}
              className={`flex-1 flex flex-col items-center gap-1 py-3 rounded-xl transition-all ${
                selectedMood === i
                  ? 'bg-indigo-500/20 ring-1 ring-indigo-500/50 scale-105'
                  : 'bg-white/5 hover:bg-white/10'
              }`}
            >
              <span className="text-2xl">{mood.emoji}</span>
              <span className="text-[11px] text-slate-400">{mood.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Today's tasks (from Supabase or empty) */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium text-slate-300 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-indigo-400" />
            오늘 할 일
          </h2>
          <button className="text-xs text-slate-500 flex items-center gap-0.5 hover:text-slate-300">
            전체 <ChevronRight className="w-3 h-3" />
          </button>
        </div>
        <div className="space-y-2">
          {todayTasks.length > 0 ? todayTasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center gap-3 bg-white/5 rounded-xl px-4 py-3"
            >
              <div className={`w-1 h-8 rounded-full ${task.status === 'done' ? 'bg-emerald-500' : task.priority === 'high' ? 'bg-amber-500' : 'bg-indigo-500'}`} />
              <span className="text-xs text-slate-400 w-16">{task.due_date || '-'}</span>
              <span className={`text-sm ${task.status === 'done' ? 'line-through text-slate-500' : ''}`}>{task.title}</span>
            </div>
          )) : (
            <p className="text-sm text-slate-500 bg-white/5 rounded-xl px-4 py-3">등록된 할 일이 없어요. PLAN 탭에서 추가해보세요.</p>
          )}
        </div>
      </section>

      {/* Recent logs */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium text-slate-300 flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-indigo-400" />
            최근 기록
          </h2>
          <button className="text-xs text-slate-500 flex items-center gap-0.5 hover:text-slate-300">
            더보기 <ChevronRight className="w-3 h-3" />
          </button>
        </div>
        <div className="space-y-2">
          {recentLogs.length > 0 ? recentLogs.map((log) => (
            <div
              key={log.id}
              className="flex items-start gap-3 bg-white/5 rounded-xl px-4 py-3"
            >
              <span className="text-lg mt-0.5">{log.emotion || '\ud83d\udcdd'}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm">{log.content}</p>
                <p className="text-xs text-slate-500 mt-1">
                  {new Date(log.created_at).toLocaleString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          )) : (
            <p className="text-sm text-slate-500 bg-white/5 rounded-xl px-4 py-3">아직 기록이 없어요. LOG 탭에서 하루를 남겨보세요.</p>
          )}
        </div>
      </section>

      {/* Year goal */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium text-slate-300 flex items-center gap-1.5">
            <Target className="w-4 h-4 text-indigo-400" />
            올해 목표
          </h2>
        </div>
        <div className="bg-white/5 rounded-xl px-4 py-4">
          {topDream ? (
            <>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm">{topDream.title}</span>
                <span className="text-xs text-indigo-400 font-medium">{topDream.progress}%</span>
              </div>
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 rounded-full transition-all"
                  style={{ width: `${topDream.progress}%` }}
                />
              </div>
            </>
          ) : (
            <p className="text-sm text-slate-500">DREAM 탭에서 올해 목표를 설정해보세요.</p>
          )}
        </div>
      </section>
    </div>
  );
}
