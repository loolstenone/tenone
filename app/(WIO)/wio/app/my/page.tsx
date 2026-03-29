'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ClipboardList, FileCheck, Calendar, Target, Bell, ListTodo, Plus,
  CheckCircle2, Clock, Sparkles, ArrowRight, User, Smile, Meh, Frown, Heart, Zap,
} from 'lucide-react';
import Link from 'next/link';
import { useWIO } from '../layout';
import { createClient } from '@/lib/supabase/client';

/* ── MY 탭 네비게이션 ── */
const MY_TABS = [
  { label: '대시보드', href: '/wio/app/my' },
  { label: '인사기록', href: '/wio/app/my/hr' },
  { label: '내 평가', href: '/wio/app/my/evaluation' },
  { label: '내 업무', href: '/wio/app/my/work' },
  { label: '기안/결재', href: '/wio/app/my/approval' },
];

/* ── 기분 이모지 ── */
const MOODS = [
  { icon: Smile, label: '좋아요', color: 'text-emerald-400' },
  { icon: Meh, label: '보통', color: 'text-amber-400' },
  { icon: Frown, label: '힘들어요', color: 'text-red-400' },
  { icon: Heart, label: '감사해요', color: 'text-pink-400' },
  { icon: Zap, label: '열정적!', color: 'text-violet-400' },
];

/* ── Mock data ── */
const DEMO_SCHEDULES = [
  { id: 's1', title: '팀 스탠드업 미팅', time: '09:00', endTime: '09:30', color: 'bg-indigo-500' },
  { id: 's2', title: '고객사 화상회의', time: '11:00', endTime: '12:00', color: 'bg-emerald-500' },
  { id: 's3', title: '디자인 리뷰', time: '14:00', endTime: '15:00', color: 'bg-amber-500' },
  { id: 's4', title: '주간 업무 보고', time: '16:00', endTime: '16:30', color: 'bg-violet-500' },
];

const DEMO_TODOS = [
  { id: 't1', title: '프로젝트 주간 리포트 작성', done: true },
  { id: 't2', title: '디자인 시스템 컴포넌트 리뷰', done: true },
  { id: 't3', title: '고객사 미팅 준비 자료 정리', done: true },
  { id: 't4', title: '신규 채용 면접 피드백 제출', done: false },
  { id: 't5', title: 'Q2 OKR 초안 작성', done: false },
];

const DEMO_APPROVALS = [
  { id: 'a1', title: '출장비 청구서 - 부산 출장', requester: '박지민', date: '2026-03-27', type: '지출' },
  { id: 'a2', title: '연차 휴가 신청 (4/7~4/8)', requester: '김하늘', date: '2026-03-28', type: '휴가' },
  { id: 'a3', title: 'AWS 서버 증설 비용', requester: '이영수', date: '2026-03-29', type: '지출' },
];

const DEMO_NOTIFICATIONS = [
  { id: 'n1', icon: 'bell', content: 'SNS 마케팅 캠페인 마감이 5일 남았습니다', time: '1시간 전', read: false },
  { id: 'n2', icon: 'message', content: '김민수님이 브랜드 리뉴얼 게시글에 댓글을 남겼습니다', time: '2시간 전', read: false },
  { id: 'n3', icon: 'check', content: '출장비 청구서가 승인되었습니다', time: '어제', read: true },
  { id: 'n4', icon: 'user', content: '최수진님이 프로젝트에 참여했습니다', time: '어제', read: true },
  { id: 'n5', icon: 'star', content: 'GPR 중간점검 기간이 시작되었습니다', time: '2일 전', read: true },
];

export default function MyHomePage() {
  const { member, isDemo } = useWIO();
  const [loading, setLoading] = useState(true);
  const [mood, setMood] = useState<number | null>(null);
  const [todos, setTodos] = useState<typeof DEMO_TODOS>([]);
  const [newTodo, setNewTodo] = useState('');
  const [schedules, setSchedules] = useState<typeof DEMO_SCHEDULES>([]);
  const [approvals, setApprovals] = useState<typeof DEMO_APPROVALS>([]);
  const [notifications, setNotifications] = useState<typeof DEMO_NOTIFICATIONS>([]);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 6) return '늦은 밤이에요';
    if (h < 12) return '좋은 아침이에요';
    if (h < 18) return '오늘도 힘내세요';
    return '수고 많았어요';
  }, []);

  const today = new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' });

  // Supabase에서 MY 대시보드 데이터 로드
  const loadData = useCallback(async () => {
    if (isDemo) {
      setTodos(DEMO_TODOS);
      setSchedules(DEMO_SCHEDULES);
      setApprovals(DEMO_APPROVALS);
      setNotifications(DEMO_NOTIFICATIONS);
      setLoading(false);
      return;
    }
    try {
      const sb = createClient();
      const memberId = member?.id;
      const tenantId = member?.tenantId;
      if (!tenantId) { setLoading(false); return; }

      // 병렬로 4개 테이블 조회
      const [todosRes, eventsRes, approvalsRes, notifsRes] = await Promise.all([
        sb.from('wio_todos').select('*').eq('member_id', memberId).order('created_at', { ascending: false }).limit(10),
        sb.from('wio_events').select('*').eq('tenant_id', tenantId).gte('start_at', new Date().toISOString().split('T')[0]).order('start_at').limit(10),
        sb.from('wio_approvals').select('*').eq('tenant_id', tenantId).eq('status', 'pending').order('created_at', { ascending: false }).limit(5),
        sb.from('wio_notifications').select('*').eq('member_id', memberId).order('created_at', { ascending: false }).limit(10),
      ]);

      // 할일 매핑
      if (todosRes.data && todosRes.data.length > 0) {
        setTodos(todosRes.data.map((r: any) => ({ id: r.id, title: r.title, done: r.is_done })));
      } else {
        setTodos(DEMO_TODOS);
      }

      // 오늘 일정 매핑
      if (eventsRes.data && eventsRes.data.length > 0) {
        const colors = ['bg-indigo-500', 'bg-emerald-500', 'bg-amber-500', 'bg-violet-500', 'bg-blue-500'];
        setSchedules(eventsRes.data.map((r: any, i: number) => ({
          id: r.id,
          title: r.title,
          time: r.start_at ? new Date(r.start_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false }) : '',
          endTime: r.end_at ? new Date(r.end_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false }) : '',
          color: colors[i % colors.length],
        })));
      } else {
        setSchedules(DEMO_SCHEDULES);
      }

      // 결재 대기 매핑
      if (approvalsRes.data && approvalsRes.data.length > 0) {
        setApprovals(approvalsRes.data.map((r: any) => ({
          id: r.id,
          title: r.title,
          requester: r.requester_id || '',
          date: r.created_at?.split('T')[0] || '',
          type: r.type === 'expense' ? '지출' : r.type === 'hr' ? '휴가' : '일반',
        })));
      } else {
        setApprovals(DEMO_APPROVALS);
      }

      // 알림 매핑
      if (notifsRes.data && notifsRes.data.length > 0) {
        setNotifications(notifsRes.data.map((r: any) => ({
          id: r.id,
          icon: r.type || 'bell',
          content: r.title || '',
          time: r.created_at ? new Date(r.created_at).toLocaleDateString('ko-KR') : '',
          read: r.is_read,
        })));
      } else {
        setNotifications(DEMO_NOTIFICATIONS);
      }
    } catch {
      // DB 실패 시 Mock 폴백
      setTodos(DEMO_TODOS);
      setSchedules(DEMO_SCHEDULES);
      setApprovals(DEMO_APPROVALS);
      setNotifications(DEMO_NOTIFICATIONS);
    } finally {
      setLoading(false);
    }
  }, [isDemo, member]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleToggleTodo = (id: string) => {
    setTodos(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  const handleAddTodo = () => {
    if (!newTodo.trim()) return;
    setTodos(prev => [{ id: `t-${Date.now()}`, title: newTodo.trim(), done: false }, ...prev]);
    setNewTodo('');
  };

  const handleMarkRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleAiSummary = () => {
    setAiLoading(true);
    setTimeout(() => {
      setAiResponse('이번 주 진행 중인 업무 5건 중 3건이 예정대로 진행 중입니다. "SNS 마케팅 캠페인"은 마감이 5일 남았으니 우선순위를 높이는 것을 권장합니다. 결재 대기 건이 3건 있으며, GPR 진척률은 68%로 목표 대비 양호합니다.');
      setAiLoading(false);
    }, 1500);
  };

  const pendingTodos = todos.filter(t => !t.done).length;
  const unreadNotifs = notifications.filter(n => !n.read).length;

  /* Stats */
  const stats = [
    { icon: ClipboardList, label: '진행 중 업무', value: 5, color: 'text-indigo-400', href: '/wio/app/my/work' },
    { icon: FileCheck, label: '결재 대기', value: 3, color: 'text-amber-400', href: '/wio/app/my/approval' },
    { icon: Calendar, label: '오늘 일정', value: schedules.length, color: 'text-emerald-400', href: '#schedule' },
    { icon: Target, label: 'GPR 진척률', value: '68%', color: 'text-violet-400', href: '/wio/app/my/evaluation' },
  ];

  if (loading) {
    return (
      <div>
        <div className="mb-4 animate-pulse">
          <div className="h-6 w-48 bg-white/5 rounded mb-2" />
          <div className="h-4 w-32 bg-white/5 rounded" />
        </div>
        <div className="grid gap-3 grid-cols-2 lg:grid-cols-4 mb-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="rounded-xl border border-white/5 bg-white/[0.02] p-4 animate-pulse">
              <div className="h-3 w-16 bg-white/5 rounded mb-3" />
              <div className="h-7 w-12 bg-white/5 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* MY 탭 네비게이션 */}
      <div className="flex gap-1 mb-6 overflow-x-auto pb-1">
        {MY_TABS.map(tab => (
          <Link key={tab.href} href={tab.href}
            className={`shrink-0 rounded-lg px-3 py-1.5 text-xs transition-colors ${
              tab.href === '/wio/app/my'
                ? 'bg-indigo-600/10 text-indigo-400 font-semibold'
                : 'text-slate-400 hover:bg-white/5'
            }`}>
            {tab.label}
          </Link>
        ))}
      </div>

      {/* 인사 + 기분 */}
      <div className="mb-6">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-xl font-bold">{greeting}, {member?.displayName || '김민지'}님</h1>
            <p className="text-sm text-slate-500 mt-1">{today}</p>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-500 mr-1">오늘 기분:</span>
            {MOODS.map((m, i) => (
              <button key={i} onClick={() => setMood(i)}
                className={`p-1.5 rounded-lg transition-all ${mood === i ? `${m.color} bg-white/10 scale-110` : 'text-slate-600 hover:text-slate-400'}`}>
                <m.icon size={16} />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4 mb-6">
        {stats.map((s, i) => (
          <Link key={i} href={s.href}
            className="rounded-xl border border-white/5 bg-white/[0.02] p-4 hover:border-white/10 hover:bg-white/[0.04] transition-all group">
            <div className="flex items-center gap-2 mb-2">
              <s.icon size={16} className={s.color} />
              <span className="text-xs text-slate-500">{s.label}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">{s.value}</span>
              <ArrowRight size={14} className="text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </Link>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* 오늘 일정 */}
        <div id="schedule" className="rounded-xl border border-white/5 bg-white/[0.02]">
          <div className="flex items-center justify-between px-5 py-3 border-b border-white/5">
            <div className="flex items-center gap-2">
              <Calendar size={15} className="text-emerald-400" />
              <span className="text-sm font-semibold">오늘 일정</span>
            </div>
            <span className="text-xs text-slate-500">{schedules.length}건</span>
          </div>
          <div className="p-3 space-y-1.5">
            {schedules.map(s => (
              <div key={s.id} className="flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-white/[0.03] transition-colors">
                <div className={`w-1 h-8 rounded-full ${s.color} shrink-0`} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{s.title}</div>
                  <div className="text-xs text-slate-500">{s.time} - {s.endTime}</div>
                </div>
              </div>
            ))}
            {schedules.length === 0 && (
              <div className="py-6 text-center text-sm text-slate-500">오늘 일정이 없어요</div>
            )}
          </div>
        </div>

        {/* 할 일 */}
        <div className="rounded-xl border border-white/5 bg-white/[0.02]">
          <div className="flex items-center justify-between px-5 py-3 border-b border-white/5">
            <div className="flex items-center gap-2">
              <ListTodo size={15} className="text-indigo-400" />
              <span className="text-sm font-semibold">할 일</span>
            </div>
            {pendingTodos > 0 && <span className="text-xs text-slate-500">{pendingTodos}개 남음</span>}
          </div>
          <div className="p-3">
            <div className="flex gap-2 mb-3">
              <input value={newTodo} onChange={e => setNewTodo(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddTodo()}
                placeholder="할일 추가..."
                className="flex-1 rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none" />
              <button onClick={handleAddTodo} disabled={!newTodo.trim()}
                className="rounded-lg bg-indigo-600 px-3 py-2 text-sm disabled:opacity-40 hover:bg-indigo-500 transition-colors">
                <Plus size={14} />
              </button>
            </div>
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {todos.map(t => (
                <button key={t.id} onClick={() => handleToggleTodo(t.id)}
                  className={`flex items-center gap-2 w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-white/5 transition-colors ${t.done ? 'text-slate-600 line-through' : 'text-slate-300'}`}>
                  <div className={`h-4 w-4 rounded border shrink-0 flex items-center justify-center ${t.done ? 'bg-emerald-600 border-emerald-600' : 'border-slate-600'}`}>
                    {t.done && <CheckCircle2 size={10} className="text-white" />}
                  </div>
                  <span className="truncate">{t.title}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 결재 대기 */}
        <div className="rounded-xl border border-white/5 bg-white/[0.02]">
          <div className="flex items-center justify-between px-5 py-3 border-b border-white/5">
            <div className="flex items-center gap-2">
              <FileCheck size={15} className="text-amber-400" />
              <span className="text-sm font-semibold">결재 대기</span>
            </div>
            <Link href="/wio/app/my/approval" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">전체 보기</Link>
          </div>
          <div className="divide-y divide-white/5">
            {approvals.map(a => (
              <div key={a.id} className="px-5 py-3 hover:bg-white/[0.02] transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium truncate">{a.title}</span>
                  <span className="text-[10px] text-slate-500 px-1.5 py-0.5 bg-white/5 rounded shrink-0 ml-2">{a.type}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <User size={11} />
                  <span>{a.requester}</span>
                  <span className="text-slate-600">|</span>
                  <span>{a.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 알림 */}
        <div className="rounded-xl border border-white/5 bg-white/[0.02]">
          <div className="flex items-center justify-between px-5 py-3 border-b border-white/5">
            <div className="flex items-center gap-2">
              <Bell size={15} className="text-amber-400" />
              <span className="text-sm font-semibold">알림</span>
            </div>
            {unreadNotifs > 0 && <span className="text-[10px] font-bold bg-red-600 text-white px-1.5 py-0.5 rounded-full">{unreadNotifs}</span>}
          </div>
          <div className="p-3 space-y-1 max-h-56 overflow-y-auto">
            {notifications.map(n => (
              <div key={n.id} onClick={() => !n.read && handleMarkRead(n.id)}
                className={`rounded-lg px-3 py-2.5 text-sm cursor-pointer hover:bg-white/5 transition-colors ${n.read ? 'text-slate-600' : 'text-slate-300 bg-white/[0.02]'}`}>
                <div className="text-xs">{n.content}</div>
                <div className="text-[10px] text-slate-600 mt-1">{n.time}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI 비서 위젯 */}
      <div className="mt-4 rounded-xl border border-indigo-500/10 bg-indigo-500/[0.03] p-5">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={15} className="text-indigo-400" />
          <span className="text-sm font-semibold">AI 비서</span>
        </div>
        {aiResponse ? (
          <div className="text-sm text-slate-300 leading-relaxed mb-3">{aiResponse}</div>
        ) : (
          <p className="text-xs text-slate-500 mb-3">업무 현황을 AI가 요약해드립니다.</p>
        )}
        <button onClick={handleAiSummary} disabled={aiLoading}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium hover:bg-indigo-500 disabled:opacity-50 transition-colors flex items-center gap-2">
          <Sparkles size={13} />
          {aiLoading ? '분석 중...' : '이번 주 내 업무 요약해줘'}
        </button>
      </div>
    </div>
  );
}
