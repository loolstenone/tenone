'use client';

import { useState } from 'react';
import { ChevronRight, Clock, BookOpen, Target } from 'lucide-react';

/* ── Mock Data ── */
const MOODS = [
  { emoji: '\ud83d\ude0a', label: '\uc88b\uc544' },
  { emoji: '\ud83d\ude10', label: '\ubcf4\ud1b5' },
  { emoji: '\ud83d\ude14', label: '\ud798\ub4e4\uc5b4' },
  { emoji: '\ud83d\udd25', label: '\ubd88\ud0c0\uc62c\ub77c' },
];

const TODAY_SCHEDULE = [
  { id: '1', time: '10:00', title: '\ud300 \uc8fc\uac04 \ud68c\uc758', color: 'bg-indigo-500' },
  { id: '2', time: '14:00', title: '\ud504\ub85c\uc81d\ud2b8 \ub9c8\uac10 D-3', color: 'bg-amber-500' },
  { id: '3', time: '19:00', title: '\uc6b4\ub3d9 30\ubd84', color: 'bg-emerald-500' },
];

const RECENT_LOGS = [
  { id: '1', time: '2\uc2dc\uac04 \uc804', content: '\uce74\ud398\uc5d0\uc11c \uae30\ud68d\uc11c \uc791\uc131 \uc644\ub8cc \u2615', mood: '\ud83d\udd25' },
  { id: '2', time: '\uc5b4\uc81c', content: '\uc800\ub141 \uce5c\uad6c\ub4e4\uacfc \uc77c\uc2dd \ud68c\uc2dd', mood: '\ud83d\ude0a' },
];

const YEAR_GOAL = {
  title: '\uc0ac\uc774\ub4dc \ud504\ub85c\uc81d\ud2b8 \ub7f0\uce6d',
  progress: 42,
};

function formatDate() {
  const d = new Date();
  const days = ['\uc77c', '\uc6d4', '\ud654', '\uc218', '\ubaa9', '\uae08', '\ud1a0'];
  return `${d.getFullYear()}. ${d.getMonth() + 1}. ${d.getDate()}. (${days[d.getDay()]})`;
}

export default function MePage() {
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const userName = '\ud150\uc6d0';

  return (
    <div className="px-5 py-6 space-y-6">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold">\uc548\ub155 {userName}.</h1>
        <p className="text-sm text-slate-400 mt-1">{formatDate()}</p>
      </div>

      {/* Mood selector */}
      <section className="bg-white/5 rounded-2xl p-4">
        <h2 className="text-sm font-medium text-slate-300 mb-3">\uc624\ub298 \uae30\ubd84\uc740?</h2>
        <div className="flex gap-3">
          {MOODS.map((mood, i) => (
            <button
              key={i}
              onClick={() => setSelectedMood(i)}
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

      {/* Today's schedule */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium text-slate-300 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-indigo-400" />
            \uc624\ub298 \uc77c\uc815
          </h2>
          <button className="text-xs text-slate-500 flex items-center gap-0.5 hover:text-slate-300">
            \uc804\uccb4 <ChevronRight className="w-3 h-3" />
          </button>
        </div>
        <div className="space-y-2">
          {TODAY_SCHEDULE.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 bg-white/5 rounded-xl px-4 py-3"
            >
              <div className={`w-1 h-8 rounded-full ${item.color}`} />
              <span className="text-xs text-slate-400 w-12">{item.time}</span>
              <span className="text-sm">{item.title}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Recent logs */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium text-slate-300 flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-indigo-400" />
            \ucd5c\uadfc \uae30\ub85d
          </h2>
          <button className="text-xs text-slate-500 flex items-center gap-0.5 hover:text-slate-300">
            \ub354\ubcf4\uae30 <ChevronRight className="w-3 h-3" />
          </button>
        </div>
        <div className="space-y-2">
          {RECENT_LOGS.map((log) => (
            <div
              key={log.id}
              className="flex items-start gap-3 bg-white/5 rounded-xl px-4 py-3"
            >
              <span className="text-lg mt-0.5">{log.mood}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm">{log.content}</p>
                <p className="text-xs text-slate-500 mt-1">{log.time}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Year goal */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium text-slate-300 flex items-center gap-1.5">
            <Target className="w-4 h-4 text-indigo-400" />
            \uc62c\ud574 \ubaa9\ud45c
          </h2>
        </div>
        <div className="bg-white/5 rounded-xl px-4 py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm">{YEAR_GOAL.title}</span>
            <span className="text-xs text-indigo-400 font-medium">{YEAR_GOAL.progress}%</span>
          </div>
          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-500 rounded-full transition-all"
              style={{ width: `${YEAR_GOAL.progress}%` }}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
