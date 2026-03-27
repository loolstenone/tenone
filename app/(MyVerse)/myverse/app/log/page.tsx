'use client';

import { useState } from 'react';
import { Camera, Smile, Lock, Users, Globe, Send, Instagram, Linkedin, Twitter, ImageIcon, Heart, MessageCircle } from 'lucide-react';

/* ── Types ── */
type Visibility = 'private' | 'shared' | 'public';

interface LogEntry {
  id: string;
  time: string;
  content: string;
  mood?: string;
  image?: string;
  visibility: Visibility;
  likes: number;
}

/* ── Mock Data ── */
const MOCK_LOGS: LogEntry[] = [
  {
    id: '1',
    time: '14:32',
    content: '\uce74\ud398\uc5d0\uc11c \uae30\ud68d\uc11c \uc791\uc131 \uc644\ub8cc. \uc624\ub298 \uc9d1\uc911\ub825 \ucd5c\uace0\uc600\ub2e4 \u2615',
    mood: '\ud83d\udd25',
    visibility: 'public',
    likes: 3,
  },
  {
    id: '2',
    time: '12:15',
    content: '\uc810\uc2ec \uba54\ub274 \uace0\ubbfc\ud558\ub2e4\uac00 \uc0c8\ub85c\uc6b4 \ub77c\uba58\uc9d1 \ubc1c\uacac \ud83c\udf5c',
    image: 'ramen',
    mood: '\ud83d\ude0a',
    visibility: 'shared',
    likes: 7,
  },
  {
    id: '3',
    time: '09:45',
    content: '\uc544\uce68 \ub7ec\ub2dd 5km \uc644\uc8fc! \uc2a4\ud2b8\ub9ad 12\uc77c\uc9f8 \ud83c\udfc3',
    mood: '\ud83d\udd25',
    visibility: 'public',
    likes: 12,
  },
  {
    id: '4',
    time: '\uc5b4\uc81c 22:10',
    content: '\uc624\ub298 \ud558\ub8e8 \ub3cc\uc544\ubcf4\uba70 \uac10\uc0ac\ud55c \uc810 3\uac00\uc9c0 \uc801\uc5b4\ubcf4\uae30',
    mood: '\ud83d\ude0a',
    visibility: 'private',
    likes: 0,
  },
  {
    id: '5',
    time: '\uc5b4\uc81c 18:30',
    content: '\ud300 \ud68c\uc2dd \uc0ac\uc9c4 \ud83c\udf7b \ub2e4\ub4e4 \uc218\uace0\ud588\uc5b4\uc694!',
    image: 'team',
    mood: '\ud83d\ude0a',
    visibility: 'shared',
    likes: 15,
  },
];

const MOOD_OPTIONS = ['\ud83d\ude0a', '\ud83d\ude10', '\ud83d\ude14', '\ud83d\udd25', '\ud83d\ude0d', '\ud83e\udd14'];

const VIS_OPTIONS: { key: Visibility; icon: typeof Lock; label: string }[] = [
  { key: 'private', icon: Lock, label: '\ub098\ub9cc' },
  { key: 'shared', icon: Users, label: '\uce5c\uad6c' },
  { key: 'public', icon: Globe, label: '\uc804\uccb4' },
];

export default function LogPage() {
  const [text, setText] = useState('');
  const [visibility, setVisibility] = useState<Visibility>('private');
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [showMoodPicker, setShowMoodPicker] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>(MOCK_LOGS);
  const [toast, setToast] = useState<string | null>(null);

  const handleSubmit = () => {
    if (!text.trim()) return;
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const newLog: LogEntry = {
      id: Date.now().toString(),
      time: timeStr,
      content: text.trim(),
      mood: selectedMood ?? undefined,
      visibility,
      likes: 0,
    };
    setLogs([newLog, ...logs]);
    setText('');
    setSelectedMood(null);
  };

  const showToast = (platform: string) => {
    setToast(`AI\uac00 ${platform}\uc6a9 \uce21\uc158\uc744 \uc900\ube44\ud558\uace0 \uc788\uc5b4\uc694...`);
    setTimeout(() => setToast(null), 2500);
  };

  return (
    <div className="px-5 py-6 space-y-5">
      {/* Header */}
      <h1 className="text-lg font-bold">LOG</h1>

      {/* Compose area */}
      <div className="bg-white/5 rounded-2xl p-4 space-y-3">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="\uc624\ub298 \ubb50 \ud588\uc5b4?"
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
              \u2715
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
            \ub4f1\ub85d
          </button>
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-3">
        {logs.map((log) => {
          const VisIcon = VIS_OPTIONS.find((v) => v.key === log.visibility)!.icon;
          return (
            <div key={log.id} className="bg-white/5 rounded-2xl p-4 space-y-3">
              {/* Header row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span>{log.time}</span>
                  <VisIcon className="w-3 h-3" />
                </div>
                {log.mood && <span className="text-base">{log.mood}</span>}
              </div>

              {/* Content */}
              <p className="text-sm leading-relaxed">{log.content}</p>

              {/* Image placeholder */}
              {log.image && (
                <div className="w-full h-40 bg-white/5 rounded-xl flex items-center justify-center">
                  <ImageIcon className="w-8 h-8 text-slate-600" />
                </div>
              )}

              {/* Footer: likes + social share */}
              <div className="flex items-center justify-between border-t border-white/5 pt-3">
                <div className="flex items-center gap-3">
                  <button className="flex items-center gap-1 text-xs text-slate-500 hover:text-rose-400 transition-colors">
                    <Heart className="w-3.5 h-3.5" />
                    {log.likes > 0 && <span>{log.likes}</span>}
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
        })}
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
