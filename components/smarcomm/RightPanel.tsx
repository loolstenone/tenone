'use client';

import { useState } from 'react';
import { X, Plus, CheckSquare, Square, HelpCircle, MessageSquare, Send, Newspaper, ChevronDown, ChevronUp } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
}

interface TodoItem {
  id: string;
  text: string;
  done: boolean;
}

interface ChatMsg {
  sender: string;
  text: string;
  time: string;
}

const BLOG_SUGGESTIONS = [
  { category: '광고', title: '네이버 검색광고 키워드 전략 — 소상공인 실전 가이드' },
  { category: 'SEO', title: 'AI 검색 시대, GEO 최적화가 필요한 이유' },
];

const GUIDE_ITEMS = [
  { title: '워크스페이스 설정하기', desc: '기본 정보, 멤버 관리, 차트 팔레트, 외부 연동까지 4단계로 완성', links: ['Google Ads 연동하기', '네이버 검색광고 연동하기'] },
];

const INITIAL_CHAT: ChatMsg[] = [
  { sender: '시스템', text: '오늘 badak.biz 진단 완료했습니다. 점수 72점', time: '4:30' },
  { sender: '시스템', text: '경쟁사 ptbwa.com은 82점이네요', time: '4:32' },
];

export default function SCRightPanel({ open, onClose }: Props) {
  const [todos, setTodos] = useState<TodoItem[]>(() => {
    if (typeof window === 'undefined') return [];
    const saved = localStorage.getItem('sc_todos');
    return saved ? JSON.parse(saved) : [];
  });
  const [newTodo, setNewTodo] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMsg[]>(INITIAL_CHAT);
  const [chatInput, setChatInput] = useState('');
  const [blogOpen, setBlogOpen] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);

  const saveTodos = (items: TodoItem[]) => {
    setTodos(items);
    localStorage.setItem('sc_todos', JSON.stringify(items));
  };

  const addTodo = () => {
    if (!newTodo.trim()) return;
    saveTodos([...todos, { id: Date.now().toString(), text: newTodo.trim(), done: false }]);
    setNewTodo('');
  };

  const toggleTodo = (id: string) => {
    saveTodos(todos.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  const removeTodo = (id: string) => {
    saveTodos(todos.filter(t => t.id !== id));
  };

  const sendChat = () => {
    if (!chatInput.trim()) return;
    const now = new Date();
    setChatMessages([...chatMessages, {
      sender: '나',
      text: chatInput.trim(),
      time: `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`,
    }]);
    setChatInput('');
  };

  return (
    <aside
      className={`fixed top-0 right-0 z-40 flex h-screen w-72 flex-col border-l border-border bg-white transition-all duration-200 ${open ? 'shadow-xl lg:shadow-none' : ''}`}
      style={{ transform: open ? 'translateX(0)' : 'translateX(100%)', transition: 'transform 0.2s ease' }}
    >
      {/* 헤더 */}
      <div className="flex h-12 shrink-0 items-center justify-between border-b border-border px-4">
        <span className="text-sm font-semibold text-text">패널</span>
        <button onClick={onClose} className="flex h-6 w-6 items-center justify-center rounded text-text-muted hover:text-text">
          <X size={14} />
        </button>
      </div>

      {/* TODO LIST */}
      <div className="shrink-0 border-b border-border p-4">
        <h3 className="mb-3 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-text-muted">
          <CheckSquare size={12} /> TODO LIST
        </h3>
        <div className="mb-2 flex gap-2">
          <input
            value={newTodo}
            onChange={e => setNewTodo(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addTodo()}
            placeholder="업무를 추가하세요"
            className="flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-xs placeholder:text-text-muted focus:border-text focus:outline-none"
          />
          <button onClick={addTodo} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent text-white hover:bg-accent/80">
            <Plus size={14} />
          </button>
        </div>
        {todos.length === 0 ? (
          <p className="text-center text-[11px] text-text-muted py-1">업무를 추가하세요</p>
        ) : (
          <div className="max-h-32 space-y-1 overflow-y-auto scrollbar-hide">
            {todos.map(todo => (
              <div key={todo.id} className="group flex items-center gap-2 rounded-lg px-1 py-1 hover:bg-surface">
                <button onClick={() => toggleTodo(todo.id)} className="shrink-0 text-text-muted hover:text-text">
                  {todo.done ? <CheckSquare size={14} className="text-success" /> : <Square size={14} />}
                </button>
                <span className={`flex-1 text-xs ${todo.done ? 'text-text-muted line-through' : 'text-text-sub'}`}>{todo.text}</span>
                <button onClick={() => removeTodo(todo.id)} className="shrink-0 text-text-muted opacity-0 group-hover:opacity-100 hover:text-danger">
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 추천 블로그 (접기/펼치기) */}
      <div className="shrink-0 border-b border-border">
        <button onClick={() => setBlogOpen(!blogOpen)} className="flex w-full items-center justify-between px-4 py-3 text-xs font-bold uppercase tracking-wider text-text-muted hover:text-text">
          <span className="flex items-center gap-1.5"><Newspaper size={12} /> 추천 블로그</span>
          {blogOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>
        {blogOpen && (
          <div className="space-y-2 px-4 pb-3">
            {BLOG_SUGGESTIONS.map((post, i) => (
              <div key={i} className="rounded-lg border border-border p-3 hover:bg-surface cursor-pointer">
                <div className="mb-1 text-[10px] font-semibold text-accent">{post.category}</div>
                <div className="text-xs font-medium text-text leading-relaxed">{post.title}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 사용자 가이드 (접기/펼치기) */}
      <div className="shrink-0 border-b border-border">
        <button onClick={() => setGuideOpen(!guideOpen)} className="flex w-full items-center justify-between px-4 py-3 text-xs font-bold uppercase tracking-wider text-text-muted hover:text-text">
          <span className="flex items-center gap-1.5"><HelpCircle size={12} /> 사용자 가이드</span>
          {guideOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>
        {guideOpen && (
          <div className="px-4 pb-3">
            {GUIDE_ITEMS.map((item, i) => (
              <div key={i}>
                <div className="rounded-lg border border-border p-3 hover:bg-surface cursor-pointer">
                  <div className="text-xs font-semibold text-text">{item.title}</div>
                  <div className="mt-1 text-[11px] text-text-muted">{item.desc}</div>
                </div>
                <div className="mt-1.5 space-y-1">
                  {item.links.map((link, li) => (
                    <div key={li} className="px-3 py-1.5 text-xs text-text-sub hover:bg-surface rounded-lg cursor-pointer">→ {link}</div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 팀 채팅 (flex-1로 남은 공간 전부 사용) */}
      <div className="flex flex-1 flex-col min-h-0">
        <div className="shrink-0 px-4 pt-3 pb-1">
          <h3 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-text-muted">
            <MessageSquare size={12} /> 팀 채팅
          </h3>
          <p className="text-[10px] text-text-muted">워크스페이스 멤버 전원 참여</p>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-2 scrollbar-hide">
          <div className="space-y-3">
            {chatMessages.map((msg, i) => (
              <div key={i}>
                <div className="rounded-lg bg-surface px-3 py-2">
                  <span className="text-xs text-text-sub">{msg.text}</span>
                </div>
                <div className="mt-0.5 text-[10px] text-text-muted">{msg.time}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 채팅 입력 */}
        <div className="shrink-0 border-t border-border p-3">
          <div className="flex gap-2">
            <input
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendChat()}
              placeholder="메시지 입력..."
              className="flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-xs placeholder:text-text-muted focus:border-text focus:outline-none"
            />
            <button onClick={sendChat} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-text text-white hover:bg-accent-sub">
              <Send size={14} />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
