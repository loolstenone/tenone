'use client';

import { useState, useEffect } from 'react';
import { MessageSquare, Bell, Calendar, HelpCircle, Plus, Pin, Search, Heart, MessageCircle, X } from 'lucide-react';
import Link from 'next/link';
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
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

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

  const filtered = searchQuery.trim()
    ? posts.filter(p => p.title?.toLowerCase().includes(searchQuery.toLowerCase()) || p.content?.toLowerCase().includes(searchQuery.toLowerCase()))
    : posts;

  const TABS = [
    { id: 'notice' as Tab, label: '공지사항', icon: Bell },
    { id: 'free' as Tab, label: '자유게시판', icon: MessageSquare },
    { id: 'qna' as Tab, label: 'Q&A', icon: HelpCircle },
    { id: 'calendar' as Tab, label: '일정', icon: Calendar },
  ];

  const EMPTY_GUIDE: Record<Tab, { title: string; desc: string }> = {
    notice: { title: '아직 공지사항이 없어요', desc: '중요한 소식을 팀원들에게 알려보세요' },
    free: { title: '아직 게시글이 없어요', desc: '자유롭게 이야기를 나눠보세요' },
    qna: { title: '아직 질문이 없어요', desc: '궁금한 것을 물어보세요. 팀원들이 답변해줄 거예요' },
    calendar: { title: '등록된 일정이 없어요', desc: '팀 일정을 추가해서 함께 확인하세요' },
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">소통</h1>
        <div className="flex items-center gap-2">
          {tab !== 'calendar' && (
            <>
              <button onClick={() => { setShowSearch(!showSearch); setSearchQuery(''); }}
                className="rounded-lg border border-white/5 p-2 text-slate-400 hover:text-white hover:border-white/10 transition-all">
                <Search size={15} />
              </button>
              <button onClick={() => setShowForm(!showForm)}
                className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors">
                <Plus size={15} /> 글쓰기
              </button>
            </>
          )}
        </div>
      </div>

      {/* 검색 */}
      {showSearch && (
        <div className="mb-4 flex gap-2">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="제목 또는 내용 검색..."
              autoFocus className="w-full rounded-lg border border-white/5 bg-white/[0.03] pl-9 pr-3 py-2 text-sm focus:border-indigo-500 focus:outline-none" />
          </div>
          <button onClick={() => { setShowSearch(false); setSearchQuery(''); }} className="text-slate-500 hover:text-white"><X size={16} /></button>
        </div>
      )}

      {/* 탭 */}
      <div className="flex gap-1.5 mb-4 overflow-x-auto pb-1">
        {TABS.map(t => (
          <button key={t.id} onClick={() => { setTab(t.id); setShowForm(false); setSearchQuery(''); }}
            className={`flex items-center gap-1.5 shrink-0 rounded-lg px-3 py-2 text-sm transition-colors ${tab === t.id ? 'bg-indigo-600/10 text-indigo-400 font-semibold' : 'text-slate-400 hover:bg-white/5'}`}>
            <t.icon size={14} /> {t.label}
          </button>
        ))}
      </div>

      {/* 글쓰기 폼 */}
      {showForm && (
        <div className="mb-4 rounded-xl border border-white/5 bg-white/[0.02] p-4 space-y-3">
          <input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="제목"
            className="w-full rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none" />
          <textarea value={newContent} onChange={e => setNewContent(e.target.value)} rows={5} placeholder="내용을 입력하세요..."
            className="w-full rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2.5 text-sm resize-none focus:border-indigo-500 focus:outline-none" />
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors">취소</button>
            <button onClick={handlePost} disabled={!newTitle.trim()} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-40 transition-colors">등록</button>
          </div>
        </div>
      )}

      {/* 목록 */}
      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="rounded-lg border border-white/5 bg-white/[0.02] px-4 py-3 animate-pulse">
              <div className="h-4 w-3/4 bg-white/5 rounded mb-2" />
              <div className="h-3 w-1/3 bg-white/5 rounded" />
            </div>
          ))}
        </div>
      ) : tab === 'calendar' ? (
        events.length === 0 ? (
          <div className="text-center py-16">
            <Calendar size={32} className="mx-auto mb-3 text-slate-700" />
            <p className="text-sm text-slate-400 mb-1">{EMPTY_GUIDE.calendar.title}</p>
            <p className="text-xs text-slate-600">{EMPTY_GUIDE.calendar.desc}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {events.map((ev: any) => (
              <div key={ev.id} className="rounded-xl border border-white/5 bg-white/[0.02] p-4 hover:bg-white/[0.04] transition-colors">
                <div className="font-medium text-sm">{ev.title}</div>
                <div className="text-xs text-slate-500 mt-1">{new Date(ev.startAt).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' })}</div>
              </div>
            ))}
          </div>
        )
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <MessageSquare size={32} className="mx-auto mb-3 text-slate-700" />
          {searchQuery ? (
            <>
              <p className="text-sm text-slate-400 mb-1">&ldquo;{searchQuery}&rdquo; 검색 결과가 없습니다</p>
              <p className="text-xs text-slate-600">다른 키워드로 검색해보세요</p>
            </>
          ) : (
            <>
              <p className="text-sm text-slate-400 mb-1">{EMPTY_GUIDE[tab].title}</p>
              <p className="text-xs text-slate-600 mb-4">{EMPTY_GUIDE[tab].desc}</p>
              <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium hover:bg-indigo-500 transition-colors">
                <Plus size={14} /> 첫 글 작성하기
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-1">
          {filtered.map((post: any) => (
            <Link key={post.id} href={`/wio/app/talk/${post.id}`}
              className="flex items-center gap-3 rounded-lg border border-white/5 bg-white/[0.02] px-4 py-3 hover:bg-white/[0.04] transition-colors">
              {post.isPinned && <Pin size={12} className="text-indigo-400 shrink-0" />}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{post.title}</div>
                <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                  <span>{post.author?.displayName || '알 수 없음'}</span>
                  <span>{new Date(post.createdAt).toLocaleDateString('ko-KR')}</span>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0 text-xs text-slate-600">
                {(post.likeCount || 0) > 0 && <span className="flex items-center gap-0.5"><Heart size={11} /> {post.likeCount}</span>}
                {(post.commentCount || 0) > 0 && <span className="flex items-center gap-0.5"><MessageCircle size={11} /> {post.commentCount}</span>}
                <span>조회 {post.viewCount || 0}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
