'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  MessageCircle, Send, ThumbsUp, Lightbulb, HandHelping, Heart,
  Tag, Search, Bell, BarChart3, ChevronDown
} from 'lucide-react';
import { useWIO } from '../../layout';
import { createClient } from '@/lib/supabase/client';

type FeedbackType = 'praise' | 'constructive' | 'request' | 'thanks';
type CoreValue = 'innovation' | 'collaboration' | 'growth' | 'responsibility' | 'customer';

const FEEDBACK_TYPES: { id: FeedbackType; label: string; icon: typeof ThumbsUp; color: string }[] = [
  { id: 'praise', label: '칭찬', icon: ThumbsUp, color: 'text-emerald-400 bg-emerald-500/10' },
  { id: 'constructive', label: '건설적', icon: Lightbulb, color: 'text-amber-400 bg-amber-500/10' },
  { id: 'request', label: '요청', icon: HandHelping, color: 'text-blue-400 bg-blue-500/10' },
  { id: 'thanks', label: '감사', icon: Heart, color: 'text-pink-400 bg-pink-500/10' },
];

const CORE_VALUES: { id: CoreValue; label: string }[] = [
  { id: 'innovation', label: '혁신' },
  { id: 'collaboration', label: '협업' },
  { id: 'growth', label: '성장' },
  { id: 'responsibility', label: '책임' },
  { id: 'customer', label: '고객중심' },
];

const VALUE_COLORS: Record<CoreValue, string> = {
  innovation: 'text-violet-400 bg-violet-500/10',
  collaboration: 'text-blue-400 bg-blue-500/10',
  growth: 'text-emerald-400 bg-emerald-500/10',
  responsibility: 'text-amber-400 bg-amber-500/10',
  customer: 'text-pink-400 bg-pink-500/10',
};

const MOCK_TEAM_MEMBERS = [
  { id: '1', name: '김민수' }, { id: '2', name: '이지은' }, { id: '3', name: '박서준' },
  { id: '4', name: '최유나' }, { id: '5', name: '정해인' },
];

const MOCK_RECEIVED = [
  { id: '1', from: '이지은', type: 'praise' as FeedbackType, value: 'collaboration' as CoreValue, content: '지난 프로젝트에서 적극적으로 협업해주셔서 감사합니다. 덕분에 일정을 맞출 수 있었어요.', date: '2026-03-27' },
  { id: '2', from: '박서준', type: 'thanks' as FeedbackType, value: 'growth' as CoreValue, content: '코드리뷰에서 상세한 피드백 감사합니다. 많이 배우고 있어요.', date: '2026-03-25' },
  { id: '3', from: '팀장 이영수', type: 'praise' as FeedbackType, value: 'responsibility' as CoreValue, content: 'MVP 출시를 끝까지 책임지고 완수해주셨습니다. 수고하셨어요.', date: '2026-03-22' },
  { id: '4', from: '최유나', type: 'constructive' as FeedbackType, value: 'collaboration' as CoreValue, content: '회의 시 다른 팀원들에게도 발언 기회를 더 주시면 좋을 것 같아요.', date: '2026-03-20' },
  { id: '5', from: '정해인', type: 'thanks' as FeedbackType, value: 'growth' as CoreValue, content: '기술 세미나 준비해주셔서 감사합니다. 정말 유익했어요.', date: '2026-03-18' },
  { id: '6', from: '이지은', type: 'request' as FeedbackType, value: 'customer' as CoreValue, content: '고객 미팅 결과를 팀 위키에 정리해주시면 전체 공유에 도움이 될 것 같습니다.', date: '2026-03-15' },
  { id: '7', from: '박서준', type: 'praise' as FeedbackType, value: 'innovation' as CoreValue, content: '새로운 자동화 도구 도입 아이디어가 정말 좋았습니다.', date: '2026-03-12' },
  { id: '8', from: '팀장 이영수', type: 'constructive' as FeedbackType, value: 'responsibility' as CoreValue, content: '일정 공유를 좀 더 자주 해주시면 팀 운영에 도움이 됩니다.', date: '2026-03-10' },
];

const MOCK_SENT = [
  { id: 's1', to: '이지은', type: 'praise' as FeedbackType, value: 'collaboration' as CoreValue, content: '디자인 시안 빠르게 준비해주셔서 감사합니다.', date: '2026-03-26' },
  { id: 's2', to: '박서준', type: 'thanks' as FeedbackType, value: 'growth' as CoreValue, content: 'QA 자동화 스크립트 공유 감사합니다.', date: '2026-03-20' },
  { id: 's3', to: '최유나', type: 'constructive' as FeedbackType, value: 'customer' as CoreValue, content: '고객 응대 시 좀 더 상세한 안내가 있으면 좋겠습니다.', date: '2026-03-15' },
];

// Value distribution for chart
const MOCK_VALUE_DIST: Record<CoreValue, number> = {
  innovation: 2,
  collaboration: 3,
  growth: 2,
  responsibility: 2,
  customer: 1,
};

export default function FeedbackPage() {
  const { tenant, member } = useWIO();
  const isDemo = !tenant || tenant.id === 'demo';
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'received' | 'sent'>('received');
  const [received, setReceived] = useState<typeof MOCK_RECEIVED>([]);
  const [sent, setSent] = useState<typeof MOCK_SENT>([]);
  const [valueDist, setValueDist] = useState<typeof MOCK_VALUE_DIST | null>(null);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [formTarget, setFormTarget] = useState('');
  const [formType, setFormType] = useState<FeedbackType>('praise');
  const [formValue, setFormValue] = useState<CoreValue>('collaboration');
  const [formContent, setFormContent] = useState('');

  // Nudge
  const [sentThisWeek, setSentThisWeek] = useState(0);

  // Supabase에서 피드백 데이터 로드
  const loadFeedback = useCallback(async () => {
    if (isDemo) {
      setReceived(MOCK_RECEIVED);
      setSent(MOCK_SENT);
      setValueDist(MOCK_VALUE_DIST);
      setSentThisWeek(1);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const sb = createClient();
      const { data, error } = await sb
        .from('feedback')
        .select('*')
        .eq('tenant_id', tenant!.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      if (data && data.length > 0) {
        // 받은/보낸 피드백 분리
        const myId = member?.id;
        const rcv = data.filter((r: any) => r.to_member_id === myId).map((r: any) => ({
          id: r.id, from: r.from_name || '', type: r.type || 'praise',
          value: r.core_value || 'collaboration', content: r.content || '',
          date: r.created_at ? r.created_at.split('T')[0] : '',
        }));
        const snt = data.filter((r: any) => r.from_member_id === myId).map((r: any) => ({
          id: r.id, to: r.to_name || '', type: r.type || 'praise',
          value: r.core_value || 'collaboration', content: r.content || '',
          date: r.created_at ? r.created_at.split('T')[0] : '',
        }));
        setReceived(rcv.length > 0 ? rcv : MOCK_RECEIVED);
        setSent(snt.length > 0 ? snt : MOCK_SENT);
        // 가치 분포 집계
        const dist: Record<string, number> = {};
        data.forEach((r: any) => { dist[r.core_value || 'collaboration'] = (dist[r.core_value || 'collaboration'] || 0) + 1; });
        setValueDist(Object.keys(dist).length > 0 ? dist as typeof MOCK_VALUE_DIST : MOCK_VALUE_DIST);
        setSentThisWeek(snt.filter((s: any) => {
          const d = new Date(s.date);
          const now = new Date();
          return d >= new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
        }).length);
      } else {
        setReceived(MOCK_RECEIVED);
        setSent(MOCK_SENT);
        setValueDist(MOCK_VALUE_DIST);
        setSentThisWeek(1);
      }
    } catch {
      setReceived(MOCK_RECEIVED);
      setSent(MOCK_SENT);
      setValueDist(MOCK_VALUE_DIST);
      setSentThisWeek(1);
    } finally {
      setLoading(false);
    }
  }, [isDemo, tenant, member]);

  useEffect(() => {
    if (!tenant) return;
    loadFeedback();
  }, [tenant, loadFeedback]);

  const handleSubmitFeedback = () => {
    if (!formTarget || !formContent.trim()) return;
    const targetMember = MOCK_TEAM_MEMBERS.find(m => m.id === formTarget);
    const newFb = {
      id: `s-${Date.now()}`, to: targetMember?.name || '', type: formType, value: formValue,
      content: formContent.trim(), date: new Date().toISOString().split('T')[0],
    };
    setSent(prev => [newFb, ...prev]);
    setSentThisWeek(prev => prev + 1);
    setFormTarget(''); setFormContent(''); setShowForm(false);
  };

  const maxDist = valueDist ? Math.max(...Object.values(valueDist), 1) : 1;

  if (loading) {
    return (
      <div>
        <h1 className="text-xl font-bold mb-6">상시 피드백</h1>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="rounded-xl border border-white/5 bg-white/[0.02] p-4 animate-pulse">
              <div className="h-4 w-2/3 bg-white/5 rounded mb-2" />
              <div className="h-3 w-1/3 bg-white/5 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold">상시 피드백</h1>
          <p className="text-xs text-slate-500 mt-0.5">HR-FBK</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors">
          <Send size={15} /> 피드백 작성
        </button>
      </div>

      {/* Nudge */}
      {sentThisWeek < 2 && (
        <div className="mb-4 rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 flex items-center gap-3">
          <Bell size={16} className="text-amber-400 shrink-0" />
          <p className="text-sm text-amber-300">이번 주 아직 피드백을 {sentThisWeek === 0 ? '남기지 않았어요' : `${sentThisWeek}건만 남겼어요`}. 동료에게 한마디 남겨보세요!</p>
        </div>
      )}

      <div className="space-y-6">
        {/* Feedback Form */}
        {showForm && (
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4 space-y-3">
            <h3 className="text-sm font-semibold">피드백 작성</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <select value={formTarget} onChange={e => setFormTarget(e.target.value)}
                className="rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2.5 text-sm text-slate-300 focus:outline-none">
                <option value="">대상 선택</option>
                {MOCK_TEAM_MEMBERS.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
              <select value={formType} onChange={e => setFormType(e.target.value as FeedbackType)}
                className="rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2.5 text-sm text-slate-300 focus:outline-none">
                {FEEDBACK_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
              </select>
              <select value={formValue} onChange={e => setFormValue(e.target.value as CoreValue)}
                className="rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2.5 text-sm text-slate-300 focus:outline-none">
                {CORE_VALUES.map(v => <option key={v.id} value={v.id}>{v.label}</option>)}
              </select>
            </div>
            <textarea value={formContent} onChange={e => setFormContent(e.target.value)}
              placeholder="피드백 내용을 작성하세요" rows={3}
              className="w-full rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2.5 text-sm resize-none focus:border-indigo-500 focus:outline-none" />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors">취소</button>
              <button onClick={handleSubmitFeedback} disabled={!formTarget || !formContent.trim()}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold disabled:opacity-40 hover:bg-indigo-500 transition-colors">보내기</button>
            </div>
          </div>
        )}

        {/* Value Distribution */}
        {valueDist && (
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
            <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <BarChart3 size={15} className="text-violet-400" /> 핵심가치별 피드백 분포
            </h2>
            <div className="space-y-2">
              {CORE_VALUES.map(cv => {
                const count = valueDist[cv.id] || 0;
                const vc = VALUE_COLORS[cv.id];
                return (
                  <div key={cv.id} className="flex items-center gap-3">
                    <span className={`text-xs font-semibold w-14 px-1.5 py-0.5 rounded text-center ${vc}`}>{cv.label}</span>
                    <div className="flex-1 h-5 rounded bg-white/5 overflow-hidden">
                      <div className={`h-full rounded transition-all ${vc.split(' ')[1]}`} style={{ width: `${(count / maxDist) * 100}%`, minWidth: count > 0 ? '8px' : '0' }} />
                    </div>
                    <span className="text-xs text-slate-400 w-6 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tabs */}
        <div>
          <div className="flex gap-1.5 mb-4">
            <button onClick={() => setTab('received')}
              className={`rounded-lg px-3 py-1.5 text-xs transition-colors ${tab === 'received' ? 'bg-indigo-600/10 text-indigo-400 font-semibold' : 'text-slate-400 hover:bg-white/5'}`}>
              받은 피드백 ({received.length})
            </button>
            <button onClick={() => setTab('sent')}
              className={`rounded-lg px-3 py-1.5 text-xs transition-colors ${tab === 'sent' ? 'bg-indigo-600/10 text-indigo-400 font-semibold' : 'text-slate-400 hover:bg-white/5'}`}>
              보낸 피드백 ({sent.length})
            </button>
          </div>

          {/* Feedback List */}
          {tab === 'received' ? (
            <div className="space-y-2">
              {received.length === 0 ? (
                <div className="text-center py-12">
                  <MessageCircle size={32} className="mx-auto mb-3 text-slate-700" />
                  <p className="text-sm text-slate-400">아직 받은 피드백이 없어요</p>
                </div>
              ) : received.map(fb => {
                const typeInfo = FEEDBACK_TYPES.find(t => t.id === fb.type)!;
                const Icon = typeInfo.icon;
                const valueInfo = CORE_VALUES.find(v => v.id === fb.value)!;
                const vc = VALUE_COLORS[fb.value];
                return (
                  <div key={fb.id} className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600/20 text-xs font-bold text-indigo-400">
                        {fb.from.charAt(0)}
                      </div>
                      <span className="text-sm font-medium">{fb.from}</span>
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${typeInfo.color}`}>{typeInfo.label}</span>
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${vc}`}>{valueInfo.label}</span>
                      <span className="text-[10px] text-slate-600 ml-auto">{fb.date}</span>
                    </div>
                    <p className="text-sm text-slate-300 pl-9">{fb.content}</p>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-2">
              {sent.length === 0 ? (
                <div className="text-center py-12">
                  <Send size={32} className="mx-auto mb-3 text-slate-700" />
                  <p className="text-sm text-slate-400">아직 보낸 피드백이 없어요</p>
                </div>
              ) : sent.map(fb => {
                const typeInfo = FEEDBACK_TYPES.find(t => t.id === fb.type)!;
                const valueInfo = CORE_VALUES.find(v => v.id === fb.value)!;
                const vc = VALUE_COLORS[fb.value];
                return (
                  <div key={fb.id} className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm text-slate-400">To</span>
                      <span className="text-sm font-medium">{fb.to}</span>
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${typeInfo.color}`}>{typeInfo.label}</span>
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${vc}`}>{valueInfo.label}</span>
                      <span className="text-[10px] text-slate-600 ml-auto">{fb.date}</span>
                    </div>
                    <p className="text-sm text-slate-300">{fb.content}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
