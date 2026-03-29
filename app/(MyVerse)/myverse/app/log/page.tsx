'use client';

import { useState, useEffect } from 'react';
import { Camera, Smile, Lock, Users, Globe, Send, Instagram, Linkedin, Twitter, ImageIcon, Heart, MessageCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { fetchLogs, createLog } from '@/lib/myverse-supabase';
import type { MyverseLog } from '@/lib/myverse-supabase';

/* ── Types ── */
type Visibility = 'private' | 'shared' | 'public';

/* ── 기분 옵션 ── */
const MOOD_OPTIONS = ['\ud83d\ude0a', '\ud83d\ude10', '\ud83d\ude14', '\ud83d\udd25', '\ud83d\ude0d', '\ud83e\udd14'];

const VIS_OPTIONS: { key: Visibility; icon: typeof Lock; label: string }[] = [
  { key: 'private', icon: Lock, label: '나만' },
  { key: 'shared', icon: Users, label: '친구' },
  { key: 'public', icon: Globe, label: '전체' },
];

export default function LogPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [text, setText] = useState('');
  const [visibility, setVisibility] = useState<Visibility>('private');
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [showMoodPicker, setShowMoodPicker] = useState(false);
  const [logs, setLogs] = useState<MyverseLog[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // 초기 데이터 로드
  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      const { logs: dbLogs } = await fetchLogs(user.id, 30);
      if (dbLogs.length > 0) {
        setLogs(dbLogs);
      }
      setLoading(false);
    };
    load();
  }, []);

  // 새 로그 등록
  const handleSubmit = async () => {
    if (!text.trim() || !userId) return;

    // Supabase에 저장
    const { log: newLog } = await createLog(userId, {
      content: text.trim(),
      emotion: selectedMood ?? undefined,
      visibility,
      log_type: 'text',
    });

    if (newLog) {
      setLogs([newLog, ...logs]);
    }

    setText('');
    setSelectedMood(null);
  };

  const showToast = (platform: string) => {
    setToast(`AI가 ${platform}용 캡션을 준비하고 있어요...`);
    setTimeout(() => setToast(null), 2500);
  };

  // 시간 포맷
  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}분 전`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}시간 전`;
    const days = Math.floor(hours / 24);
    if (days === 1) return '어제';
    return d.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="px-5 py-6 flex items-center justify-center min-h-[60vh]">
        <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="px-5 py-6 space-y-5">
      {/* Header */}
      <h1 className="text-lg font-bold">LOG</h1>

      {/* Compose area */}
      <div className="bg-white/5 rounded-2xl p-4 space-y-3">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="오늘 뭐 했어?"
          rows={3}
          className="w-full bg-transparent text-sm text-white placeholder-slate-500 resize-none focus:outline-none"
        />

        {/* Mood badge */}
        {selectedMood && (
          <div className="flex items-center gap-1.5">
            <span className="text-lg">{selectedMood}</span>
            <button
              onClick={() => setSelectedMood(null)}
              className="text-xs text-slate-500 hover:text-slate-300"
            >
              ✕
            </button>
          </div>
        )}

        {/* Mood picker */}
        {showMoodPicker && (
          <div className="flex gap-2 bg-white/5 rounded-xl px-3 py-2">
            {MOOD_OPTIONS.map((m) => (
              <button
                key={m}
                onClick={() => { setSelectedMood(m); setShowMoodPicker(false); }}
                className="text-xl hover:scale-125 transition-transform"
              >
                {m}
              </button>
            ))}
          </div>
        )}

        {/* Toolbar */}
        <div className="flex items-center justify-between border-t border-white/5 pt-3">
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
              <Camera className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowMoodPicker(!showMoodPicker)}
              className={`p-2 rounded-lg hover:bg-white/10 transition-colors ${
                showMoodPicker ? 'text-indigo-400 bg-indigo-500/10' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Smile className="w-4 h-4" />
            </button>

            {/* Visibility selector */}
            <div className="flex items-center gap-0.5 ml-2 bg-white/5 rounded-lg p-0.5">
              {VIS_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                const isActive = visibility === opt.key;
                return (
                  <button
                    key={opt.key}
                    onClick={() => setVisibility(opt.key)}
                    className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs transition-colors ${
                      isActive
                        ? 'bg-indigo-500/20 text-indigo-400'
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    <Icon className="w-3 h-3" />
                    <span className="hidden sm:inline">{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!text.trim()}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
            등록
          </button>
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-3">
        {logs.length > 0 ? logs.map((log) => {
          const VisIcon = VIS_OPTIONS.find((v) => v.key === log.visibility)?.icon || Lock;
          return (
            <div key={log.id} className="bg-white/5 rounded-2xl p-4 space-y-3">
              {/* Header row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span>{formatTime(log.created_at)}</span>
                  <VisIcon className="w-3 h-3" />
                </div>
                {log.emotion && <span className="text-base">{log.emotion}</span>}
              </div>

              {/* Content */}
              <p className="text-sm leading-relaxed">{log.content}</p>

              {/* Image placeholder */}
              {log.image_url && (
                <div className="w-full h-40 bg-white/5 rounded-xl flex items-center justify-center">
                  <ImageIcon className="w-8 h-8 text-slate-600" />
                </div>
              )}

              {/* Footer: likes + social share */}
              <div className="flex items-center justify-between border-t border-white/5 pt-3">
                <div className="flex items-center gap-3">
                  <button className="flex items-center gap-1 text-xs text-slate-500 hover:text-rose-400 transition-colors">
                    <Heart className="w-3.5 h-3.5" />
                  </button>
                  <button className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-300 transition-colors">
                    <MessageCircle className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Social share */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => showToast('Instagram')}
                    className="p-1.5 rounded-lg text-slate-600 hover:text-pink-400 hover:bg-pink-500/10 transition-colors"
                  >
                    <Instagram className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => showToast('LinkedIn')}
                    className="p-1.5 rounded-lg text-slate-600 hover:text-blue-400 hover:bg-blue-500/10 transition-colors"
                  >
                    <Linkedin className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => showToast('X')}
                    className="p-1.5 rounded-lg text-slate-600 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <Twitter className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        }) : (
          <p className="text-sm text-slate-500 bg-white/5 rounded-2xl px-4 py-6 text-center">
            아직 기록이 없어요. 오늘 하루를 남겨보세요.
          </p>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-indigo-500 text-white text-sm px-4 py-2 rounded-full shadow-lg animate-pulse z-50">
          {toast}
        </div>
      )}
    </div>
  );
}
