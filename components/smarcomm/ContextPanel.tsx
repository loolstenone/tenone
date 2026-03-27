'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import {
  X, MessageSquare, BookOpen, FileText, ChevronRight,
  Send, Plus, Check, Calendar, Search, BookA, ArrowRight, Paperclip, Download
} from 'lucide-react';
import { GLOSSARY, CATEGORIES, type GlossaryTerm } from '@/lib/smarcomm/glossary-data';
import { GUIDES, type Guide } from '@/lib/smarcomm/guide-data';
import { GUIDE_SECTIONS } from '@/lib/smarcomm/guide-sections';
import { getPublishedPosts, type BlogPost } from '@/lib/smarcomm/blog-data';
import Link from 'next/link';

// ── 메뉴별 키워드 매핑 (블로그/가이드 자동 매칭용) ──
const MENU_KEYWORDS: Record<string, string[]> = {
  // Core
  '/dashboard': ['KPI', '대시보드', 'ROAS', '마케팅', '트렌드', '프로세스', '퍼널 분석'],
  '/dashboard/funnel': ['퍼널', '퍼널 분석', '전환', '이탈', '전환율', 'Awareness', 'Interest', 'Consideration', 'Purchase', 'Retention', 'Advocacy', '병목', '건강도'],
  '/dashboard/scan': ['GEO', 'SEO', '진단', '검색', 'AI', '스키마', '크롤링', '점수', 'Index'],
  '/dashboard/traffic': ['트래픽', '유입', '채널', 'GA4', '세션', '사용자', 'AI 추천', '오디언스', '디바이스', '페이지'],
  '/dashboard/analytics': ['매출', '분석', 'ROAS', 'ROI', '수익', '광고비', '추이'],
  '/dashboard/reports': ['보고서', '리포트', '성과', '채널', '캠페인', 'KPI', 'CPA'],
  '/dashboard/data-reports': ['데이터', '리포트', '통합', '분석', '커스텀', '템플릿', '업종', '프리셋'],
  // AI 가시성
  '/dashboard/geo': ['AI 가시성', 'GEO', '멘션', 'ChatGPT', 'Perplexity', 'Gemini', 'Claude', '브랜드', '프롬프트'],
  '/dashboard/geo/competitors': ['경쟁사', 'AI 가시성', '리서치', '비교', '점수'],
  '/dashboard/geo/prompts': ['프롬프트', '리서치', '검색', '멘션', '포지션', 'AI'],
  '/dashboard/geo/brand': ['브랜드', '인식', '감성', '내러티브', '실적', 'NPS'],
  '/dashboard/geo/tracking': ['프롬프트', '추적', '모니터링', '포지션', '변화'],
  // 액션팩
  '/dashboard/creative': ['소재', '카피', '배너', '크리에이티브', 'A/B', 'CTR', '제작', 'AI'],
  '/dashboard/content': ['콘텐츠', '주제', 'SEO 최적화', '재활용', '블로그', '채널', '퍼널'],
  '/dashboard/advisor': ['AI 어드바이저', '인사이트', '추천', '액션', '예산', 'Before', 'After', '병목'],
  // CRM팩
  '/dashboard/crm': ['CRM', '고객', '리드', '관리', '파이프라인', '세그먼트'],
  '/dashboard/crm/kakao': ['카카오', '알림톡', '친구톡', '비즈메시지', '발송', 'CRM'],
  '/dashboard/crm/email': ['이메일', '자동화', '드립', '뉴스레터', '발송', '오픈율'],
  '/dashboard/crm/push': ['푸시', '알림', '메시지', '발송', '세그먼트', '클릭'],
  // 실험팩
  '/dashboard/abtest': ['A/B', '테스트', '실험', '전환율', 'CTR', '소재', '유의성', '통계'],
  '/dashboard/journey': ['여정', '고객', '접점', '퍼널', '전환', '타임라인', '이탈'],
  '/dashboard/cohort': ['코호트', '리텐션', '세그먼트', '이탈', '그룹', '히트맵'],
  '/dashboard/events': ['이벤트', '추적', '트래킹', '전환', '데이터', '연동', '매핑'],
  // 운영팩
  '/dashboard/workflow/projects': ['프로젝트', '캠페인', '기획', '관리', 'Phase', '진행률'],
  '/dashboard/workflow/kanban': ['칸반', '태스크', '보드', '관리', '드래그', '우선순위'],
  '/dashboard/calendar': ['캘린더', '일정', '시즌', '스케줄', '기획', '이벤트'],
  '/dashboard/workflow/pipeline': ['파이프라인', '콘텐츠', '제작', '아이디어', '발행'],
  '/dashboard/archive': ['아카이브', '소재', '보관', '라이브러리', '캠페인'],
  // 집행팩
  '/dashboard/campaigns': ['캠페인', '광고', '집행', '네이버', '메타', '구글', 'ROAS', 'CPA', '전환'],
  '/dashboard/workflow/automation': ['자동화', '트리거', '규칙', '워크플로우', '액션', '조건'],
  // 설정
  '/dashboard/admin': ['관리', '블로그', 'SEO', '사이트', '설정', 'CMS', '회원', '페이지'],
  '/dashboard/workflow': ['워크플로우', '현황', '태스크', '파이프라인', '프로젝트', '자동화'],
  '/dashboard/profile': ['설정', '워크스페이스', '멤버', '연동', '팔레트', 'OAuth', 'API'],
  '/dashboard/members': ['멤버', '권한', '역할', '초대', '관리자'],
  '/dashboard/glossary': ['용어', '사전', '마케팅', '검색', '카테고리'],
  '/dashboard/guide': ['가이드', '사용법', '시작', '도움말'],
};

// ── 메뉴 → 가이드 1:1 직접 매핑 ──
const MENU_GUIDE_MAP: Record<string, string> = {
  '/dashboard': 'process-overview',
  '/dashboard/funnel': 'breaking-funnel-guide',
  '/dashboard/scan': 'site-scan',
  '/dashboard/traffic': 'traffic-guide',
  '/dashboard/analytics': 'analytics-guide',
  '/dashboard/reports': 'campaign-report-guide',
  '/dashboard/data-reports': 'data-report-guide',
  '/dashboard/geo': 'geo-overview-guide',
  '/dashboard/geo/competitors': 'geo-competitors-guide',
  '/dashboard/geo/prompts': 'geo-prompts-guide',
  '/dashboard/geo/brand': 'geo-brand-guide',
  '/dashboard/geo/tracking': 'geo-tracking-guide',
  '/dashboard/creative': 'creative',
  '/dashboard/content': 'content-guide',
  '/dashboard/advisor': 'advisor-guide',
  '/dashboard/crm': 'crm-guide',
  '/dashboard/crm/kakao': 'kakao-guide',
  '/dashboard/crm/email': 'email-automation',
  '/dashboard/crm/push': 'push-setup',
  '/dashboard/abtest': 'abtest-guide',
  '/dashboard/journey': 'journey-guide',
  '/dashboard/cohort': 'cohort',
  '/dashboard/events': 'events-guide',
  '/dashboard/workflow/projects': 'project-guide',
  '/dashboard/workflow/kanban': 'kanban-guide',
  '/dashboard/calendar': 'calendar-guide',
  '/dashboard/workflow/pipeline': 'pipeline-guide',
  '/dashboard/archive': 'archive-guide',
  '/dashboard/campaigns': 'campaigns-guide',
  '/dashboard/workflow/automation': 'automation-guide',
  '/dashboard/admin': 'admin-guide',
  '/dashboard/workflow': 'kanban-guide',
  '/dashboard/profile': 'workspace-guide',
};

// 키워드 기반으로 블로그 글 매칭
function getMatchedBlogs(pathname: string): BlogPost[] {
  const keywords = MENU_KEYWORDS[pathname] || MENU_KEYWORDS['/dashboard'] || [];
  const posts = getPublishedPosts();
  const scored = posts.map(post => {
    let score = 0;
    const text = `${post.title} ${post.summary} ${post.tags.join(' ')} ${post.category}`.toLowerCase();
    keywords.forEach(kw => { if (text.includes(kw.toLowerCase())) score += 1; });
    return { post, score };
  });
  return scored.filter(s => s.score > 0).sort((a, b) => b.score - a.score).slice(0, 2).map(s => s.post);
}

// 메뉴별 가이드 매칭: 1:1 매칭 + 키워드 기반 관련 가이드
function getPrimaryGuide(pathname: string): Guide | null {
  const guideId = MENU_GUIDE_MAP[pathname];
  if (!guideId) return null;
  return GUIDES.find(g => g.id === guideId) || null;
}

function getRelatedGuides(pathname: string, excludeId?: string): Guide[] {
  const keywords = MENU_KEYWORDS[pathname] || MENU_KEYWORDS['/dashboard'] || [];
  const scored = GUIDES
    .filter(g => g.id !== excludeId)
    .map(guide => {
      let score = 0;
      const text = `${guide.title} ${guide.description} ${guide.category} ${guide.steps.map(s => s.title + ' ' + s.content).join(' ')}`.toLowerCase();
      keywords.forEach(kw => { if (text.includes(kw.toLowerCase())) score += 1; });
      return { guide, score };
    });
  return scored.filter(s => s.score > 0).sort((a, b) => b.score - a.score).slice(0, 2).map(s => s.guide);
}

// ── Todo 타입 ──
interface TodoItem {
  id: string;
  text: string;
  startDate: string;
  dueDate: string;
  createdBy: string;
  completedBy?: string;
  done: boolean;
}

// ── 컴포넌트 ──
interface ContextPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ContextPanel({ isOpen, onClose }: ContextPanelProps) {
  const pathname = usePathname();
  const matchedBlogs = getMatchedBlogs(pathname);
  const primaryGuide = getPrimaryGuide(pathname);
  const relatedGuides = getRelatedGuides(pathname, primaryGuide?.id);

  // ── 용어 사전 모달 ──
  const [glossaryOpen, setGlossaryOpen] = useState(false);
  const [glossarySearch, setGlossarySearch] = useState('');
  const [glossaryCategory, setGlossaryCategory] = useState('전체');
  const [expandedTerm, setExpandedTerm] = useState<string | null>(null);

  // ── To Do ──
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [showTodoAdd, setShowTodoAdd] = useState(false);
  const [newTodoText, setNewTodoText] = useState('');
  const [newTodoDue, setNewTodoDue] = useState('');

  // ── 우측 패널 탭 ──
  type PanelTab = 'todo' | 'guide' | 'blog' | 'glossary';
  const [panelTab, setPanelTab] = useState<PanelTab>('todo');

  // ── TODO 페이지네이션 ──
  const [pendingPage, setPendingPage] = useState(0);
  const [donePage, setDonePage] = useState(0);
  const [doneDetailPopup, setDoneDetailPopup] = useState(false);

  // ── 블로그/가이드 팝업 ──
  const [blogPopup, setBlogPopup] = useState<{ title: string; tag: string; body?: string } | null>(null);
  const [guidePopup, setGuidePopup] = useState<{ title: string; desc: string; steps?: string[]; sections?: Guide['sections'] } | null>(null);
  const [guideTab, setGuideTab] = useState(0);

  // ── 가이드 라이브러리 팝업 ──
  const [guideLibOpen, setGuideLibOpen] = useState(false);
  const [guideLibDetail, setGuideLibDetail] = useState<Guide | null>(null);

  // ── PageTopBar에서 가이드 팝업 열기 이벤트 수신 ──
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail) {
        setGuidePopup(detail);
        setGuideTab(0);
      }
    };
    window.addEventListener('open-guide-popup', handler);
    return () => window.removeEventListener('open-guide-popup', handler);
  }, []);

  // ── 팀 채팅 ──
  const [message, setMessage] = useState('');
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  type ChatMessage = { user: string; text: string; time: string; date?: string; fileName?: string; fileSize?: number };
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  // 채팅 로드 + 3개월 자동 백업/삭제
  useEffect(() => {
    try {
      const saved = localStorage.getItem('smarcomm_chat');
      const msgs: ChatMessage[] = saved ? JSON.parse(saved) : [
        { user: 'admin', text: '오늘 badak.biz 진단 완료했습니다. 점수 72점', time: '14:30', date: new Date().toISOString().slice(0, 10) },
        { user: 'admin', text: '경쟁사 ptbwa.com은 82점이네요', time: '14:32', date: new Date().toISOString().slice(0, 10) },
      ];

      // 3개월(90일) 이전 메시지 백업 후 삭제
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 90);
      const cutoffStr = cutoff.toISOString().slice(0, 10);
      const old = msgs.filter(m => m.date && m.date < cutoffStr);
      const recent = msgs.filter(m => !m.date || m.date >= cutoffStr);

      if (old.length > 0) {
        // 백업 저장
        const existing = localStorage.getItem('smarcomm_chat_archive') || '[]';
        const archive = [...JSON.parse(existing), ...old];
        localStorage.setItem('smarcomm_chat_archive', JSON.stringify(archive));
      }

      setMessages(recent);
      localStorage.setItem('smarcomm_chat', JSON.stringify(recent));
    } catch {}
  }, []);

  // localStorage에서 Todo 로드
  useEffect(() => {
    try {
      const saved = localStorage.getItem('smarcomm_todos');
      if (saved) {
        setTodos(JSON.parse(saved));
      } else {
        // 초기 더미 데이터 (6개: 미완료 4 + 완료 2)
        const defaults: TodoItem[] = [
          { id: '1', text: '3월 캠페인 성과 리포트 작성', startDate: '2026-03-20', dueDate: '2026-03-28', createdBy: 'kim@smarcomm.com', done: false },
          { id: '2', text: 'GEO 진단 결과 경쟁사 비교 분석', startDate: '2026-03-22', dueDate: '2026-03-31', createdBy: 'admin@smarcomm.com', done: false },
          { id: '3', text: '블로그 SEO 키워드 리서치', startDate: '2026-03-23', dueDate: '2026-04-01', createdBy: 'park@smarcomm.com', done: false },
          { id: '4', text: '네이버 SA 신규 캠페인 세팅', startDate: '2026-03-24', dueDate: '2026-04-03', createdBy: 'lee@smarcomm.com', done: false },
          { id: '5', text: '메타 광고 A/B 테스트 결과 정리', startDate: '2026-03-15', dueDate: '2026-03-22', createdBy: 'admin@smarcomm.com', completedBy: 'kim@smarcomm.com', done: true },
          { id: '6', text: '랜딩페이지 전환율 개선안 제출', startDate: '2026-03-10', dueDate: '2026-03-20', createdBy: 'park@smarcomm.com', completedBy: 'park@smarcomm.com', done: true },
        ];
        setTodos(defaults);
        localStorage.setItem('smarcomm_todos', JSON.stringify(defaults));
      }
    } catch {}
  }, []);

  // Todo 저장
  const saveTodos = (items: TodoItem[]) => {
    setTodos(items);
    localStorage.setItem('smarcomm_todos', JSON.stringify(items));
  };

  const [newTodoStart, setNewTodoStart] = useState('');

  const addTodo = () => {
    if (!newTodoText.trim()) return;
    const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('smarcomm_user') || '{}') : {};
    const item: TodoItem = { id: Date.now().toString(), text: newTodoText.trim(), startDate: newTodoStart, dueDate: newTodoDue, createdBy: user.email || 'admin', done: false };
    saveTodos([...todos, item]);
    setNewTodoText('');
    setNewTodoStart('');
    setNewTodoDue('');
    setShowTodoAdd(false);
  };

  const toggleTodo = (id: string) => {
    const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('smarcomm_user') || '{}') : {};
    saveTodos(todos.map(t => t.id === id ? { ...t, done: !t.done, completedBy: !t.done ? (user.email || 'admin') : undefined } : t));
  };

  const deleteTodo = (id: string) => {
    saveTodos(todos.filter(t => t.id !== id));
  };

  const handleSend = () => {
    if (!message.trim() && !attachedFile) return;
    const now = new Date();
    const time = now.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
    const newMsg: ChatMessage = {
      user: 'me',
      text: attachedFile && !message.trim() ? `📎 ${attachedFile.name}` : message,
      time,
      date: now.toISOString().slice(0, 10),
      ...(attachedFile ? { fileName: attachedFile.name, fileSize: attachedFile.size } : {}),
    };
    const updated = [...messages, newMsg];
    setMessages(updated);
    localStorage.setItem('smarcomm_chat', JSON.stringify(updated));
    setMessage('');
    setAttachedFile(null);
  };

  // 채팅 백업 다운로드
  const downloadChatArchive = () => {
    const archive = localStorage.getItem('smarcomm_chat_archive');
    if (!archive || archive === '[]') { alert('백업된 채팅이 없습니다.'); return; }
    const blob = new Blob([archive], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `smarcomm-chat-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // 용어 사전 필터
  const filteredTerms = GLOSSARY.filter(t => {
    const matchCat = glossaryCategory === '전체' || t.category === glossaryCategory;
    const q = glossarySearch.toLowerCase();
    const matchSearch = !q || t.en.toLowerCase().includes(q) || t.ko.includes(q) || t.definition.includes(q) || (t.abbr && t.abbr.toLowerCase().includes(q));
    return matchCat && matchSearch;
  });

  const formatDue = (d: string) => {
    if (!d) return '';
    const date = new Date(d);
    return `~${date.getMonth() + 1}/${date.getDate()}`;
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed right-0 top-12 z-30 flex w-72 flex-col border-l border-border bg-white transition-all duration-200" style={{ height: 'calc(100vh - 48px)' }}>

        {/* ── 단일 스크롤 뷰 ── */}
        <div className="flex flex-1 flex-col overflow-hidden">

          {/* ── 탭 영역 (고정 높이) ── */}
          <div className="flex flex-col border-b-2 border-text-muted/15" style={{ height: '280px', minHeight: '280px', maxHeight: '280px' }}>
          <div className="shrink-0 px-3 pt-3 pb-1">
            <div className="mb-2 flex items-center">
              <div className="grid grid-cols-4 flex-1 gap-0.5 rounded-lg bg-surface p-0.5">
                {([['todo', 'TODO'], ['guide', '가이드'], ['blog', '블로그'], ['glossary', '사전']] as [PanelTab, string][]).map(([key, label]) => (
                  <button key={key} onClick={() => setPanelTab(key)}
                    className={`rounded-md py-1 text-[10px] font-bold transition-colors ${
                      panelTab === key ? 'bg-white text-text shadow-sm' : 'text-text-muted hover:text-text'
                    }`}>
                    {label}
                  </button>
                ))}
              </div>
              {panelTab === 'todo' && (
                <button onClick={() => setShowTodoAdd(true)} className="ml-1.5 shrink-0 text-text-muted hover:text-text"><Plus size={12} /></button>
              )}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto px-3 pb-2">
            {/* ── TODO 탭 ── */}
            {panelTab === 'todo' && (todos.length === 0 ? (
              <div className="rounded-lg bg-surface px-3 py-4 text-center text-xs text-text-muted">
                업무를 추가하세요
              </div>
            ) : (() => {
              const perPage = 3;
              const totalPages = Math.ceil(todos.length / perPage);
              const visible = todos.slice(pendingPage * perPage, (pendingPage + 1) * perPage);
              return (
                <div className="space-y-1">
                  {todos.length > perPage && (
                    <div className="flex items-center justify-between px-1">
                      <span className="text-[9px] text-text-muted">{pendingPage * perPage + 1}~{Math.min((pendingPage + 1) * perPage, todos.length)} / {todos.length}개</span>
                      <div className="flex items-center gap-1">
                        <button onClick={() => setPendingPage(Math.max(0, pendingPage - 1))} disabled={pendingPage === 0}
                          className="flex h-5 w-5 items-center justify-center rounded text-text-muted hover:text-text disabled:opacity-20">
                          <ChevronRight size={10} className="rotate-180" />
                        </button>
                        <button onClick={() => setPendingPage(Math.min(totalPages - 1, pendingPage + 1))} disabled={pendingPage >= totalPages - 1}
                          className="flex h-5 w-5 items-center justify-center rounded text-text-muted hover:text-text disabled:opacity-20">
                          <ChevronRight size={10} />
                        </button>
                      </div>
                    </div>
                  )}
                  {visible.map(todo => (
                    <div key={todo.id} className="group rounded-lg bg-surface px-2.5 py-2">
                      <div className="flex items-center gap-2">
                        <button onClick={() => toggleTodo(todo.id)}
                          className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${todo.done ? 'border-text bg-text' : 'border-text-muted'}`}>
                          {todo.done && <Check size={10} className="text-white" />}
                        </button>
                        <div className="min-w-0 flex-1">
                          <div className={`text-xs ${todo.done ? 'text-text-muted line-through' : 'text-text'}`}>{todo.text}</div>
                        </div>
                        <button onClick={() => deleteTodo(todo.id)} className="shrink-0 text-text-muted opacity-0 group-hover:opacity-100 hover:text-danger"><X size={10} /></button>
                      </div>
                      <div className="mt-1 flex items-center gap-2 pl-6">
                        {(todo.startDate || todo.dueDate) && (
                          <span className="text-[9px] text-text-muted">
                            {todo.startDate ? formatDue(todo.startDate) : ''}{todo.startDate && todo.dueDate ? ' → ' : ''}{todo.dueDate ? formatDue(todo.dueDate) : ''}
                          </span>
                        )}
                        {todo.createdBy && <span className="text-[9px] text-text-muted/60">{todo.createdBy.split('@')[0]}</span>}
                        {todo.done && todo.completedBy && <span className="text-[9px] text-point/70">✓ {todo.completedBy.split('@')[0]}</span>}
                      </div>
                    </div>
                  ))}
                  {todos.some(t => t.done) && (
                    <button onClick={() => setDoneDetailPopup(true)} className="w-full rounded-lg py-1.5 text-center text-[10px] text-text-muted hover:text-text hover:bg-surface">
                      완료 항목 전체 보기 →
                    </button>
                  )}
                </div>
              );
            })())}

            {/* ── 가이드 탭 ── */}
            {panelTab === 'guide' && (
              <div className="space-y-2">
                {primaryGuide ? (
                  <div onClick={() => { setGuidePopup({ title: primaryGuide.title, desc: primaryGuide.description, steps: primaryGuide.steps.map(s => s.content), sections: GUIDE_SECTIONS[primaryGuide.id] || primaryGuide.sections }); setGuideTab(0); }}
                    className="cursor-pointer rounded-lg border border-border bg-white px-3 py-2.5 transition-colors hover:bg-surface">
                    <div className="text-xs font-semibold text-text">{primaryGuide.title}</div>
                    <div className="mt-0.5 text-[10px] text-text-muted line-clamp-2">{primaryGuide.description}</div>
                    <div className="mt-1.5 flex items-center gap-1 text-[9px] text-point font-medium">
                      <BookOpen size={9} /> {primaryGuide.steps.length}단계 가이드 보기
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-text-muted py-2">이 메뉴의 가이드가 없습니다</div>
                )}
                {relatedGuides.length > 0 && relatedGuides.map(g => (
                  <div key={g.id} onClick={() => { setGuidePopup({ title: g.title, desc: g.description, steps: g.steps.map(s => s.content), sections: GUIDE_SECTIONS[g.id] || g.sections }); setGuideTab(0); }}
                    className="cursor-pointer rounded-lg border border-border/50 px-3 py-2 transition-colors hover:bg-surface">
                    <div className="text-[11px] font-medium text-text">{g.title}</div>
                    <div className="mt-0.5 text-[9px] text-text-muted line-clamp-1">{g.description}</div>
                  </div>
                ))}
                <button onClick={() => setGuideLibOpen(true)} className="w-full rounded-lg py-1.5 text-center text-[10px] text-text-muted hover:text-text hover:bg-surface">
                  전체 가이드 라이브러리 →
                </button>
              </div>
            )}

            {/* ── 블로그 탭 ── */}
            {panelTab === 'blog' && (
              <div className="space-y-1.5">
                {matchedBlogs.length > 0 ? matchedBlogs.map(post => (
                  <Link key={post.id} href={`/blog/${post.slug}`} target="_blank"
                    className="block cursor-pointer rounded-lg border border-border px-3 py-2 transition-colors hover:bg-surface">
                    <div className="mb-0.5 flex items-center gap-1.5">
                      <span className="rounded bg-surface px-1.5 py-0.5 text-[9px] font-semibold text-text-sub">{post.category}</span>
                    </div>
                    <div className="text-xs font-medium text-text">{post.title}</div>
                  </Link>
                )) : (
                  <div className="text-xs text-text-muted py-2">관련 추천 글이 없습니다</div>
                )}
              </div>
            )}

            {/* ── 사전 탭 ── */}
            {panelTab === 'glossary' && (() => {
              const keywords = MENU_KEYWORDS[pathname] || MENU_KEYWORDS['/dashboard'] || [];
              const matched = GLOSSARY.filter(term => {
                const text = `${term.en} ${term.ko} ${term.category} ${term.definition}`.toLowerCase();
                return keywords.some(kw => text.includes(kw.toLowerCase()));
              }).slice(0, 8);
              const items = matched.length > 0 ? matched : GLOSSARY.slice(0, 5);
              return (
                <div className="space-y-1">
                  {items.map((term, idx) => (
                    <div key={`${term.en}-${idx}`} className="rounded-lg border border-border px-3 py-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold text-text">{term.en}</span>
                        <span className="rounded bg-surface px-1 py-0.5 text-[8px] text-text-muted">{term.category}</span>
                      </div>
                      <div className="mt-0.5 text-[10px] text-text-muted line-clamp-2">{term.definition}</div>
                    </div>
                  ))}
                  <button onClick={() => setGlossaryOpen(true)} className="w-full rounded-lg py-1.5 text-center text-[10px] text-text-muted hover:text-text hover:bg-surface">
                    전체 용어 사전 →
                  </button>
                </div>
              );
            })()}
          </div>
          </div>

          {/* ── 팀 채팅 ── */}
          <div className="flex flex-1 flex-col overflow-hidden border-t-2 border-text-muted/15">
            <div className="px-3 pt-3 pb-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-text">팀 채팅</div>
              <div className="text-[9px] text-text-muted">워크스페이스 멤버 전원 참여</div>
            </div>
            <div className="flex-1 overflow-y-auto px-3 pb-1">
              <div className="space-y-2">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex flex-col ${msg.user === 'me' ? 'items-end' : 'items-start'}`}>
                    <div className={`max-w-[90%] rounded-xl px-3 py-2 text-xs ${msg.user === 'me' ? 'bg-text text-white' : 'bg-surface text-text'}`}>
                      {msg.fileName && (
                        <div className="flex items-center gap-1.5 mb-1">
                          <FileText size={10} className={msg.user === 'me' ? 'text-white/70' : 'text-text-muted'} />
                          <span className="text-[10px] font-medium">{msg.fileName}</span>
                          <span className={`text-[9px] ${msg.user === 'me' ? 'text-white/50' : 'text-text-muted'}`}>({((msg.fileSize || 0) / 1024).toFixed(0)}KB)</span>
                        </div>
                      )}
                      {msg.text}
                    </div>
                    <span className="mt-0.5 text-[9px] text-text-muted">{msg.time}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="border-t border-border p-3">
              {/* 첨부 파일 미리보기 */}
              {attachedFile && (
                <div className="mb-2 flex items-center gap-2 rounded-lg bg-surface px-3 py-1.5">
                  <FileText size={12} className="shrink-0 text-text-muted" />
                  <span className="flex-1 text-[10px] text-text-sub truncate">{attachedFile.name}</span>
                  <span className="text-[9px] text-text-muted">{(attachedFile.size / 1024).toFixed(0)}KB</span>
                  <button onClick={() => setAttachedFile(null)} className="text-text-muted hover:text-danger"><X size={10} /></button>
                </div>
              )}
              <div className="flex items-end gap-2">
                <textarea value={message} onChange={e => { setMessage(e.target.value); e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 90) + 'px'; }}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); e.currentTarget.style.height = 'auto'; } }}
                  placeholder="메시지 입력..."
                  rows={1}
                  className="flex-1 resize-none rounded-lg border border-border bg-surface px-3 py-1.5 text-xs placeholder:text-text-muted focus:border-text focus:outline-none"
                  style={{ maxHeight: '90px' }} />
                <input type="file" ref={fileInputRef} className="hidden" onChange={e => { if (e.target.files?.[0]) setAttachedFile(e.target.files[0]); e.target.value = ''; }} />
                <button onClick={() => fileInputRef.current?.click()} title="파일 첨부" className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-text-muted hover:bg-surface hover:text-text">
                  <Paperclip size={12} />
                </button>
                <button onClick={handleSend} className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-text text-white hover:bg-accent-sub">
                  <Send size={12} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── 하단 바: 사전 + 가이드 아이콘 ── */}
        <div className="shrink-0 border-t border-border px-4 py-2.5 flex items-center gap-1">
          <button onClick={() => setGlossaryOpen(true)} title="마케팅 용어 사전"
            className="flex h-7 w-7 items-center justify-center rounded-md text-text-muted hover:text-text hover:bg-surface transition-colors">
            <BookA size={15} />
          </button>
          <button onClick={() => setGuideLibOpen(true)} title="사용자 가이드"
            className="flex h-7 w-7 items-center justify-center rounded-md text-text-muted hover:text-text hover:bg-surface transition-colors">
            <BookOpen size={15} />
          </button>
          <div className="flex-1" />
          <button onClick={downloadChatArchive} title="채팅 백업 다운로드"
            className="flex h-7 w-7 items-center justify-center rounded-md text-text-muted hover:text-text hover:bg-surface transition-colors">
            <Download size={15} />
          </button>
        </div>
      </div>

      {/* ══════ To Do 추가 모달 ══════ */}
      {showTodoAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={() => setShowTodoAdd(false)}>
          <div className="w-80 rounded-2xl border border-border bg-white p-5 shadow-xl" onClick={e => e.stopPropagation()}>
            <h3 className="mb-4 text-sm font-bold text-text">업무 추가</h3>
            <div className="mb-3">
              <label className="mb-1 block text-xs text-text-muted">업무 내용</label>
              <input type="text" value={newTodoText} onChange={e => setNewTodoText(e.target.value)}
                placeholder="업무 내용을 입력하세요"
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text placeholder:text-text-muted focus:border-text focus:outline-none"
                autoFocus
                onKeyDown={e => e.key === 'Enter' && addTodo()}
              />
            </div>
            <div className="mb-4 grid grid-cols-2 gap-2">
              <div>
                <label className="mb-1 block text-xs text-text-muted">시작일</label>
                <input type="date" value={newTodoStart} onChange={e => setNewTodoStart(e.target.value)}
                  className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:border-text focus:outline-none" />
              </div>
              <div>
                <label className="mb-1 block text-xs text-text-muted">종료일</label>
                <input type="date" value={newTodoDue} onChange={e => setNewTodoDue(e.target.value)}
                  className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:border-text focus:outline-none" />
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowTodoAdd(false)} className="flex-1 rounded-lg border border-border px-4 py-2 text-sm text-text-sub hover:bg-surface">취소</button>
              <button onClick={addTodo} className="flex-1 rounded-lg bg-text px-4 py-2 text-sm font-semibold text-white hover:bg-accent-sub">추가</button>
            </div>
          </div>
        </div>
      )}

      {/* ══════ 완료 항목 전체 팝업 ══════ */}
      {doneDetailPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setDoneDetailPopup(false)}>
          <div className="flex flex-col bg-white shadow-2xl rounded-2xl border border-border" style={{ width: '560px', maxHeight: '80vh' }} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <div>
                <h2 className="text-base font-bold text-text">완료된 업무</h2>
                <p className="text-xs text-text-muted">{todos.filter(t => t.done).length}개 완료</p>
              </div>
              <button onClick={() => setDoneDetailPopup(false)} className="text-text-muted hover:text-text"><X size={16} /></button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {todos.filter(t => t.done).length === 0 ? (
                <p className="text-sm text-text-muted text-center py-8">완료된 업무가 없습니다</p>
              ) : (
                <div className="space-y-2">
                  {todos.filter(t => t.done).map(todo => (
                    <div key={todo.id} className="rounded-xl border border-border p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Check size={14} className="text-success shrink-0" />
                        <span className="text-sm font-medium text-text-muted line-through">{todo.text}</span>
                      </div>
                      <div className="flex flex-wrap gap-3 text-[11px] text-text-muted pl-6">
                        {todo.createdBy && <span>작성: {todo.createdBy.split('@')[0]}</span>}
                        {todo.completedBy && <span>완료: {todo.completedBy.split('@')[0]}</span>}
                        {todo.startDate && <span>시작: {todo.startDate}</span>}
                        {todo.dueDate && <span>마감: {todo.dueDate}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ══════ 블로그 팝업 ══════ */}
      {blogPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={() => setBlogPopup(null)}>
          <div className="w-[480px] max-h-[70vh] overflow-y-auto rounded-2xl border border-border bg-white p-6 shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="mb-3 flex items-center justify-between">
              <span className="rounded bg-surface px-2 py-0.5 text-xs font-semibold text-text-sub">{blogPopup.tag}</span>
              <button onClick={() => setBlogPopup(null)} className="text-text-muted hover:text-text"><X size={16} /></button>
            </div>
            <h2 className="mb-4 text-lg font-bold text-text">{blogPopup.title}</h2>
            <p className="text-sm leading-relaxed text-text-sub">{blogPopup.body || '블로그 콘텐츠가 곧 추가됩니다.'}</p>
          </div>
        </div>
      )}

      {/* ══════ 가이드 팝업 (매뉴얼 뷰어) ══════ */}
      {guidePopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setGuidePopup(null)}>
          <div className="flex flex-col bg-white shadow-2xl rounded-2xl border border-border" style={{ width: '820px', height: '80vh' }} onClick={e => e.stopPropagation()}>

            {/* 헤더 (고정) */}
            <div className="shrink-0 px-10 pt-8 pb-0">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-medium text-text-muted">SmarComm. 사용자 가이드</span>
                <button onClick={() => setGuidePopup(null)} className="flex h-8 w-8 items-center justify-center rounded-lg text-text-muted hover:bg-surface hover:text-text transition-colors"><X size={18} /></button>
              </div>
              <h2 className="text-2xl font-bold text-text tracking-tight">{guidePopup.title}</h2>
              <p className="mt-2 text-base text-text-sub leading-relaxed">{guidePopup.desc}</p>

              {/* 섹션 탭 (화살표 네비게이션) */}
              {guidePopup.sections && guidePopup.sections.length > 0 ? (
                <div className="mt-6 border-b border-border -mx-10 px-10">
                  <div className="flex items-center gap-1">
                    <button onClick={() => { setGuideTab(Math.max(0, guideTab - 1)); }}
                      disabled={guideTab === 0}
                      className="shrink-0 flex h-8 w-8 items-center justify-center rounded-lg text-text-muted hover:bg-surface hover:text-text disabled:opacity-20 transition-colors">
                      <ChevronRight size={16} className="rotate-180" />
                    </button>
                    <div className="flex-1 overflow-x-auto scrollbar-hide cursor-grab active:cursor-grabbing"
                      onMouseDown={(e) => {
                        const el = e.currentTarget;
                        const startX = e.pageX - el.scrollLeft;
                        const onMove = (ev: MouseEvent) => { el.scrollLeft = startX - ev.pageX; };
                        const onUp = () => { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); };
                        document.addEventListener('mousemove', onMove);
                        document.addEventListener('mouseup', onUp);
                      }}>
                      <div className="flex gap-0.5">
                        {guidePopup.sections.map((sec, i) => (
                          <button key={sec.id} onClick={() => setGuideTab(i)}
                            className={`whitespace-nowrap px-3 py-2.5 text-[13px] font-medium transition-colors border-b-2 ${guideTab === i ? 'text-text border-text' : 'text-text-muted border-transparent hover:text-text-sub'}`}>
                            {sec.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <button onClick={() => setGuideTab(Math.min((guidePopup.sections?.length || 1) - 1, guideTab + 1))} disabled={guideTab >= (guidePopup.sections?.length || 1) - 1}
                      className="shrink-0 flex h-8 w-8 items-center justify-center rounded-lg text-text-muted hover:bg-surface hover:text-text disabled:opacity-20 transition-colors">
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              ) : <div className="mt-6 border-b border-border -mx-10" />}
            </div>

            {/* 본문 (스크롤) */}
            <div className="flex-1 overflow-y-auto px-10 py-8">
              {guidePopup.sections && guidePopup.sections.length > 0 ? (
                <div className="space-y-8">
                  {guidePopup.sections[guideTab]?.items.map((item, i) => {
                    // MD 아티팩트 정리
                    const cleanText = (t: string) => t.replace(/\*\*/g, '').replace(/\|[-]+\|[-]+\|[-]*\|?/g, '').replace(/^\|[-\s|]+\|$/gm, '').trim();
                    const content = cleanText(item.content || '');
                    const title = item.title ? cleanText(item.title) : '';

                    // — 구분자 테이블 감지
                    const lines = content.split('\n').filter(l => l.trim());
                    const tableLines = lines.filter(l => l.includes(' — '));
                    const hasTable = tableLines.length >= 2;

                    return (
                      <div key={i} className="pb-8 border-b border-border/30 last:border-0 last:pb-0">
                        {title && (
                          <h3 className="text-lg font-bold text-text mb-4">{title}</h3>
                        )}
                        {hasTable ? (
                          <div className="rounded-xl border border-border overflow-hidden">
                            <table className="w-full">
                              <tbody>
                                {lines.filter(l => l.trim() && !l.match(/^\|?[-\s|]+\|?$/)).map((row, ri) => {
                                  const cells = row.split(' — ').map(c => c.trim());
                                  if (cells.length < 2) return (
                                    <tr key={ri}><td colSpan={10} className="px-5 py-3 text-sm text-text-sub">{cells[0]}</td></tr>
                                  );
                                  return (
                                    <tr key={ri} className="border-b border-border/30 last:border-0 even:bg-surface/30">
                                      <td className="px-5 py-3.5 text-sm font-semibold text-text align-top" style={{ width: '140px' }}>{cells[0]}</td>
                                      <td className="px-5 py-3.5 text-sm text-text-sub leading-relaxed">{cells.slice(1).join(' — ')}</td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {lines.map((line, li) => {
                              const clean = line.replace(/\*\*/g, '');
                              if (clean.startsWith('- ☑') || clean.startsWith('☑')) {
                                return <div key={li} className="flex items-start gap-3 py-1.5"><span className="text-success text-lg mt-0.5">✓</span><span className="text-base text-text-sub leading-relaxed">{clean.replace(/^-?\s*☑\s*/, '')}</span></div>;
                              }
                              if (clean.startsWith('- ')) {
                                return <div key={li} className="flex items-start gap-3 py-1"><span className="text-text-muted mt-1.5 text-xs">●</span><span className="text-base text-text-sub leading-relaxed">{clean.replace(/^- /, '')}</span></div>;
                              }
                              if (clean.startsWith('→')) {
                                return <div key={li} className="mt-4 mb-2 text-base font-semibold text-text">{clean}</div>;
                              }
                              if (clean.startsWith('⏱')) {
                                return <div key={li} className="mt-4 rounded-xl bg-surface px-5 py-3 text-sm text-text-muted">{clean}</div>;
                              }
                              if (clean.startsWith('💡')) {
                                return <div key={li} className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-5 py-3 text-sm text-text-sub">{clean}</div>;
                              }
                              if (clean.startsWith('⚠')) {
                                return <div key={li} className="mt-4 rounded-xl border border-red-200 bg-red-50 px-5 py-3 text-sm text-text-sub">{clean}</div>;
                              }
                              if (clean.match(/^\|[-\s|]+\|?$/)) return null; // 테이블 구분선 제거
                              if (clean.trim() === '') return <div key={li} className="h-3" />;
                              return <p key={li} className="text-base text-text-sub leading-[1.9] py-0.5">{clean}</p>;
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                // 기본 steps 구조
                guidePopup.steps && guidePopup.steps.length > 0 && (
                  <div className="space-y-8">
                    {guidePopup.steps.map((step, i) => (
                      <div key={i} className="pb-8 border-b border-border/50 last:border-0 last:pb-0">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-text text-sm font-bold text-white">{i + 1}</div>
                          <span className="text-lg font-bold text-text">Step {i + 1}</span>
                        </div>
                        <div className="text-base text-text-sub leading-[1.9] pl-11">{step}</div>
                      </div>
                    ))}
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      )}

      {/* ══════ 용어 사전 팝업 (가이드와 동일한 큰 창) ══════ */}
      {glossaryOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setGlossaryOpen(false)}>
          <div className="flex flex-col bg-white shadow-2xl rounded-2xl border border-border" style={{ width: '820px', height: '80vh' }} onClick={e => e.stopPropagation()}>

            {/* 헤더 (고정) */}
            <div className="shrink-0 px-10 pt-8 pb-0">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-medium text-text-muted">SmarComm. 마케팅 용어 사전</span>
                <button onClick={() => setGlossaryOpen(false)} className="flex h-8 w-8 items-center justify-center rounded-lg text-text-muted hover:bg-surface hover:text-text transition-colors"><X size={18} /></button>
              </div>
              <h2 className="text-2xl font-bold text-text tracking-tight">마케팅 용어 사전</h2>
              <p className="mt-2 text-base text-text-sub leading-relaxed">500+ 마케팅 용어를 한눈에 검색하고 학습하세요</p>

              {/* 검색 */}
              <div className="mt-5 relative">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
                <input type="text" value={glossarySearch} onChange={e => setGlossarySearch(e.target.value)}
                  placeholder="용어 검색 (영문, 한국어, 약어)"
                  className="w-full rounded-xl border border-border bg-surface py-3 pl-11 pr-4 text-sm placeholder:text-text-muted focus:border-text focus:outline-none" />
              </div>

              {/* 카테고리 탭 (드래그 스크롤) */}
              <div className="mt-4 border-b border-border -mx-10 px-10">
                <div className="flex items-center gap-1">
                  <div className="flex-1 overflow-x-auto scrollbar-hide cursor-grab active:cursor-grabbing"
                    onMouseDown={(e) => {
                      const el = e.currentTarget;
                      const startX = e.pageX - el.scrollLeft;
                      const onMove = (ev: MouseEvent) => { el.scrollLeft = startX - ev.pageX; };
                      const onUp = () => { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); };
                      document.addEventListener('mousemove', onMove);
                      document.addEventListener('mouseup', onUp);
                    }}>
                    <div className="flex gap-0.5">
                      {CATEGORIES.map(cat => (
                        <button key={cat} onClick={() => setGlossaryCategory(cat)}
                          className={`whitespace-nowrap px-3 py-2.5 text-[13px] font-medium transition-colors border-b-2 ${glossaryCategory === cat ? 'text-text border-text' : 'text-text-muted border-transparent hover:text-text-sub'}`}>
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 용어 목록 (스크롤) */}
            <div className="flex-1 overflow-y-auto px-10 py-6">
              <div className="mb-3 text-xs text-text-muted">{filteredTerms.length}개 용어</div>
              <div className="space-y-1">
                {filteredTerms.slice(0, 200).map((term, i) => (
                  <div key={i} className="border-b border-border/30 last:border-0">
                    <div
                      onClick={() => setExpandedTerm(expandedTerm === term.en ? null : term.en)}
                      className="flex cursor-pointer items-center justify-between py-3 px-2 transition-colors hover:bg-surface/50 rounded-lg"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-sm font-semibold text-text">{term.en}</span>
                        {term.abbr && <span className="text-xs text-text-muted bg-surface px-1.5 py-0.5 rounded">({term.abbr})</span>}
                        <span className="text-xs text-text-muted">{term.ko}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] text-text-muted bg-surface px-2 py-0.5 rounded-full">{term.category}</span>
                        <ChevronRight size={14} className={`text-text-muted transition-transform ${expandedTerm === term.en ? 'rotate-90' : ''}`} />
                      </div>
                    </div>
                    {expandedTerm === term.en && (
                      <div className="mb-3 ml-2 rounded-xl bg-surface px-5 py-4">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-base font-bold text-text">{term.en}</span>
                          {term.abbr && <span className="text-sm text-text-muted">({term.abbr})</span>}
                        </div>
                        <div className="text-sm font-medium text-text-sub mb-2">{term.ko}</div>
                        <div className="text-sm leading-[1.8] text-text-sub">{term.definition}</div>
                      </div>
                    )}
                  </div>
                ))}
                {filteredTerms.length > 200 && (
                  <div className="py-4 text-center text-sm text-text-muted">상위 200개 표시 중 — 검색어를 입력하면 더 정확한 결과를 볼 수 있습니다</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════ 가이드 라이브러리 팝업 (큰 창) ══════ */}
      {guideLibOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => { setGuideLibOpen(false); setGuideLibDetail(null); }}>
          <div className="flex flex-col bg-white shadow-2xl rounded-2xl border border-border" style={{ width: '820px', height: '80vh' }} onClick={e => e.stopPropagation()}>

            {/* 헤더 */}
            <div className="shrink-0 px-10 pt-8 pb-0">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-medium text-text-muted">SmarComm. 사용자 가이드 라이브러리</span>
                <button onClick={() => { setGuideLibOpen(false); setGuideLibDetail(null); }} className="flex h-8 w-8 items-center justify-center rounded-lg text-text-muted hover:bg-surface hover:text-text transition-colors"><X size={18} /></button>
              </div>

              {guideLibDetail ? (
                <>
                  <button onClick={() => setGuideLibDetail(null)} className="mb-3 text-xs text-text-muted hover:text-text flex items-center gap-1">
                    <ChevronRight size={12} className="rotate-180" /> 목록으로
                  </button>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1">{guideLibDetail.category}</div>
                  <h2 className="text-2xl font-bold text-text tracking-tight">{guideLibDetail.title}</h2>
                  <p className="mt-2 text-base text-text-sub leading-relaxed">{guideLibDetail.description}</p>
                </>
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-text tracking-tight">사용자 가이드</h2>
                  <p className="mt-2 text-base text-text-sub leading-relaxed">{GUIDES.length}개의 가이드로 SmarComm을 200% 활용하세요</p>
                </>
              )}

              {/* 카테고리 탭 (목록 모드) */}
              {!guideLibDetail && (
                <div className="mt-4 border-b border-border -mx-10 px-10">
                  <div className="flex-1 overflow-x-auto scrollbar-hide cursor-grab active:cursor-grabbing"
                    onMouseDown={(e) => {
                      const el = e.currentTarget;
                      const startX = e.pageX - el.scrollLeft;
                      const onMove = (ev: MouseEvent) => { el.scrollLeft = startX - ev.pageX; };
                      const onUp = () => { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); };
                      document.addEventListener('mousemove', onMove);
                      document.addEventListener('mouseup', onUp);
                    }}>
                    <div className="flex gap-0.5">
                      {['전체', ...Array.from(new Set(GUIDES.map(g => g.category)))].map(cat => (
                        <button key={cat} onClick={() => setGlossaryCategory(cat === '전체' ? '' : cat)}
                          className={`whitespace-nowrap px-3 py-2.5 text-[13px] font-medium transition-colors border-b-2 ${(cat === '전체' && !glossaryCategory) || glossaryCategory === cat ? 'text-text border-text' : 'text-text-muted border-transparent hover:text-text-sub'}`}>
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              {guideLibDetail && <div className="mt-6 border-b border-border -mx-10" />}
            </div>

            {/* 본문 */}
            <div className="flex-1 overflow-y-auto px-10 py-6">
              {!guideLibDetail ? (
                <div className="space-y-6">
                  {Array.from(new Set(GUIDES.map(g => g.category)))
                    .filter(cat => !glossaryCategory || cat === glossaryCategory)
                    .map(cat => (
                    <div key={cat}>
                      <div className="mb-3 text-xs font-bold uppercase tracking-wider text-text-muted">{cat}</div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {GUIDES.filter(g => g.category === cat).map(guide => (
                          <div key={guide.id} onClick={() => { setGuideLibDetail(guide); setGuideTab(0); }}
                            className="cursor-pointer rounded-xl border border-border p-4 transition-all hover:bg-surface hover:border-text/20">
                            <div className="text-sm font-semibold text-text mb-1">{guide.title}</div>
                            <div className="text-xs text-text-muted leading-relaxed">{guide.description}</div>
                            <div className="mt-2 text-[10px] text-text-muted">{guide.steps.length}단계</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-6">
                  {guideLibDetail.steps.map((step, i) => (
                    <div key={i} className="pb-6 border-b border-border/50 last:border-0 last:pb-0">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-text text-sm font-bold text-white">{i + 1}</div>
                        <span className="text-lg font-bold text-text">{step.title}</span>
                      </div>
                      <div className="text-base text-text-sub leading-[1.9] pl-11">{step.content}</div>
                      {step.tip && (
                        <div className="mt-3 ml-11 rounded-xl border border-amber-200 bg-amber-50 px-5 py-3 text-sm text-text-sub">
                          💡 {step.tip}
                        </div>
                      )}
                    </div>
                  ))}
                  {guideLibDetail.relatedLinks.length > 0 && (
                    <div className="pt-4 border-t border-border">
                      <div className="text-xs font-bold text-text-muted mb-3">관련 페이지</div>
                      <div className="flex flex-wrap gap-2">
                        {guideLibDetail.relatedLinks.map((link, i) => (
                          <a key={i} href={link.href} className="rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium text-text-sub hover:text-text hover:border-text/30 transition-colors">{link.label}</a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
