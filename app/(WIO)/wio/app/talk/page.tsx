'use client';

import { useState, useEffect } from 'react';
import { MessageSquare, Bell, Calendar, HelpCircle, Plus, Pin } from 'lucide-react';
import { useWIO } from '../layout';
import { fetchPosts, createPost, fetchEvents } from '@/lib/supabase/wio';

type Tab = 'notice' | 'free' | 'qna' | 'calendar';

export default function TalkPage() {
  const { tenant, member } = useWIO();
  const [tab, setTab] = useState<Tab>('notice');
  const [posts, setPosts] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');

  useEffect(() => {
    if (!tenant) return;
    setLoading(true);
    if (tab === 'calendar') {
      fetchEvents(tenant.id).then(e => { setEvents(e); setLoading(false); });
    } else {
      fetchPosts(tenant.id, tab).then(p => { setPosts(p); setLoading(false); });
    }
  }, [tenant, tab]);

  const handlePost = async () => {
    if (!tenant || !member || !newTitle.trim()) return;
    await createPost({ tenantId: tenant.id, board: tab, title: newTitle.trim(), content: newContent.trim(), authorId: member.id });
    setNewTitle(''); setNewContent(''); setShowForm(false);
    fetchPosts(tenant.id, tab).then(setPosts);
  };

  const TABS = [
    { id: 'notice' as Tab, label: '공지사항', icon: Bell },
    { id: 'free' as Tab, label: '자유게시판', icon: MessageSquare },
    { id: 'qna' as Tab, label: 'Q&A', icon: HelpCircle },
    { id: 'calendar' as Tab, label: '일정', icon: Calendar },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">소통</h1>
        {tab !== 'calendar' && (
          <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
            <Plus size={15} /> 글쓰기
          </button>
        )}
      </div>

      <div className="flex gap-2 mb-4">
        {TABS.map(t => (
          <button key={t.id} onClick={() => { setTab(t.id); setShowForm(false); }}
            className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm transition-colors ${tab === t.id ? 'bg-indigo-600/10 text-indigo-400 font-semibold' : 'text-slate-400 hover:bg-white/5'}`}>
            <t.icon size={14} /> {t.label}
          </button>
        ))}
      </div>

      {/* 글쓰기 폼 */}
      {showForm && (
        <div className="mb-4 rounded-xl border border-white/5 bg-white/[0.02] p-4 space-y-3">
          <input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="제목"
            className="w-full rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none" />
          <textarea value={newContent} onChange={e => setNewContent(e.target.value)} rows={4} placeholder="내용"
            className="w-full rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2 text-sm resize-none focus:border-indigo-500 focus:outline-none" />
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-slate-400 hover:text-white">취소</button>
            <button onClick={handlePost} disabled={!newTitle.trim()} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-40">등록</button>
          </div>
        </div>
      )}

      {/* 목록 */}
      {loading ? (
        <div className="flex justify-center py-16"><div className="h-8 w-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" /></div>
      ) : tab === 'calendar' ? (
        events.length === 0 ? (
          <div className="text-center py-16 text-slate-500"><Calendar size={32} className="mx-auto mb-2 text-slate-600" /><p>일정이 없습니다</p></div>
        ) : (
          <div className="space-y-2">
            {events.map((ev: any) => (
              <div key={ev.id} className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
                <div className="font-medium">{ev.title}</div>
                <div className="text-xs text-slate-500 mt-1">{new Date(ev.startAt).toLocaleDateString('ko-KR')}</div>
              </div>
            ))}
          </div>
        )
      ) : posts.length === 0 ? (
        <div className="text-center py-16 text-slate-500"><MessageSquare size={32} className="mx-auto mb-2 text-slate-600" /><p>게시글이 없습니다</p></div>
      ) : (
        <div className="space-y-1">
          {posts.map((post: any) => (
            <div key={post.id} className="flex items-center gap-3 rounded-lg border border-white/5 bg-white/[0.02] px-4 py-3 hover:bg-white/[0.04] transition-colors">
              {post.isPinned && <Pin size={12} className="text-indigo-400 shrink-0" />}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{post.title}</div>
                <div className="text-xs text-slate-500 mt-0.5">{post.author?.displayName || '알 수 없음'} · {new Date(post.createdAt).toLocaleDateString('ko-KR')}</div>
              </div>
              <span className="text-xs text-slate-600">조회 {post.viewCount || 0}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
