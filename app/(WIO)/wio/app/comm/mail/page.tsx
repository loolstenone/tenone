'use client';

import { useState } from 'react';
import { Mail, Send, Star, Inbox, Plus, Search, Paperclip, X, Check } from 'lucide-react';
import { useWIO } from '../../layout';

type Tab = 'inbox' | 'sent' | 'starred';
type MailItem = {
  id: string;
  from: string;
  fromEmail: string;
  to: string;
  toEmail: string;
  subject: string;
  preview: string;
  body: string;
  date: string;
  read: boolean;
  starred: boolean;
  hasAttachment: boolean;
};

const MOCK_MAILS: MailItem[] = [
  { id: 'm1', from: '김대표', fromEmail: 'ceo@tenone.biz', to: '전체', toEmail: 'all@tenone.biz', subject: '2026년 1분기 전략 회의 안내', preview: '다음 주 월요일 오전 10시에 전략 회의를 진행합니다...', body: '다음 주 월요일 오전 10시에 전략 회의를 진행합니다. 각 팀별 1분기 성과와 2분기 계획을 준비해 주세요.', date: '2026-03-29', read: false, starred: true, hasAttachment: false },
  { id: 'm2', from: '이마케팅', fromEmail: 'marketing@tenone.biz', to: '나', toEmail: 'me@tenone.biz', subject: 'SmarComm 캠페인 보고서', preview: '3월 캠페인 결과를 공유드립니다...', body: '3월 캠페인 결과를 공유드립니다. CTR 12.3%, 전환율 4.5%로 목표 대비 120% 달성했습니다.', date: '2026-03-28', read: true, starred: false, hasAttachment: true },
  { id: 'm3', from: '박개발', fromEmail: 'dev@tenone.biz', to: '나', toEmail: 'me@tenone.biz', subject: 'WIO v2.1 릴리즈 노트', preview: '새 버전 배포 완료했습니다...', body: '새 버전 배포 완료했습니다. 주요 변경사항: 대시보드 성능 개선, 알림 시스템 리팩터링, 모바일 반응형 수정.', date: '2026-03-28', read: false, starred: false, hasAttachment: true },
  { id: 'm4', from: '최인사', fromEmail: 'hr@tenone.biz', to: '전체', toEmail: 'all@tenone.biz', subject: '4월 신규 입사자 온보딩 일정', preview: '4월 1일 신규 입사자 3명의 온보딩을 진행합니다...', body: '4월 1일 신규 입사자 3명의 온보딩을 진행합니다. 멘토 배정을 확인해 주세요.', date: '2026-03-27', read: true, starred: false, hasAttachment: false },
  { id: 'm5', from: '정디자인', fromEmail: 'design@tenone.biz', to: '나', toEmail: 'me@tenone.biz', subject: 'LUKI 브랜드 가이드 v3 검토 요청', preview: 'AI 아이돌 LUKI의 브랜드 가이드 업데이트...', body: 'AI 아이돌 LUKI의 브랜드 가이드 업데이트본을 검토해 주세요. 컬러 팔레트와 타이포그래피가 변경되었습니다.', date: '2026-03-27', read: true, starred: true, hasAttachment: true },
  { id: 'm6', from: '나', fromEmail: 'me@tenone.biz', to: '김대표', toEmail: 'ceo@tenone.biz', subject: 'Re: 1분기 전략 회의 안내', preview: '확인했습니다. 자료 준비하겠습니다...', body: '확인했습니다. 자료 준비하겠습니다. 회의실은 대회의실로 예약해 두었습니다.', date: '2026-03-27', read: true, starred: false, hasAttachment: false },
  { id: 'm7', from: '한재무', fromEmail: 'finance@tenone.biz', to: '나', toEmail: 'me@tenone.biz', subject: '3월 비용 정산 마감 안내', preview: '3월 비용 정산 마감일은 4월 3일입니다...', body: '3월 비용 정산 마감일은 4월 3일입니다. 미처리 건이 있으시면 빨리 제출해 주세요.', date: '2026-03-26', read: true, starred: false, hasAttachment: false },
  { id: 'm8', from: '윤기획', fromEmail: 'plan@tenone.biz', to: '나', toEmail: 'me@tenone.biz', subject: 'MAD League 대학 연합 프로젝트 기획서', preview: '대학 연합 프로젝트 기획서 초안을 공유합니다...', body: '대학 연합 프로젝트 기획서 초안을 공유합니다. 피드백 부탁드립니다.', date: '2026-03-26', read: false, starred: false, hasAttachment: true },
  { id: 'm9', from: '나', fromEmail: 'me@tenone.biz', to: '정디자인', toEmail: 'design@tenone.biz', subject: 'Re: LUKI 브랜드 가이드 v3 검토 요청', preview: '검토 완료했습니다. 몇 가지 수정 의견...', body: '검토 완료했습니다. 몇 가지 수정 의견 전달드립니다.', date: '2026-03-25', read: true, starred: false, hasAttachment: false },
  { id: 'm10', from: '시스템', fromEmail: 'system@wio.app', to: '나', toEmail: 'me@tenone.biz', subject: '[WIO] 보안 알림: 새 기기에서 로그인', preview: '새로운 기기에서 로그인이 감지되었습니다...', body: '새로운 기기에서 로그인이 감지되었습니다. 본인이 아닌 경우 즉시 비밀번호를 변경해 주세요.', date: '2026-03-25', read: true, starred: false, hasAttachment: false },
];

export default function MailPage() {
  const { tenant } = useWIO();
  const [tab, setTab] = useState<Tab>('inbox');
  const [mails, setMails] = useState(MOCK_MAILS);
  const [selected, setSelected] = useState<string | null>(null);
  const [showCompose, setShowCompose] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [composeTo, setComposeTo] = useState('');
  const [composeSubject, setComposeSubject] = useState('');
  const [composeBody, setComposeBody] = useState('');

  if (!tenant) return null;
  const isDemo = tenant.id === 'demo';

  const filtered = mails.filter(m => {
    if (tab === 'inbox') return m.toEmail === 'me@tenone.biz' || m.toEmail === 'all@tenone.biz';
    if (tab === 'sent') return m.fromEmail === 'me@tenone.biz';
    if (tab === 'starred') return m.starred;
    return true;
  }).filter(m => !searchQuery || m.subject.toLowerCase().includes(searchQuery.toLowerCase()) || m.from.toLowerCase().includes(searchQuery.toLowerCase()));

  const selectedMail = mails.find(m => m.id === selected);

  const toggleStar = (id: string) => {
    setMails(prev => prev.map(m => m.id === id ? { ...m, starred: !m.starred } : m));
  };

  const markRead = (id: string) => {
    setMails(prev => prev.map(m => m.id === id ? { ...m, read: true } : m));
  };

  const handleSend = () => {
    if (!composeTo || !composeSubject) return;
    const newMail: MailItem = {
      id: `m${Date.now()}`, from: '나', fromEmail: 'me@tenone.biz', to: composeTo, toEmail: `${composeTo}@tenone.biz`,
      subject: composeSubject, preview: composeBody.slice(0, 40) + '...', body: composeBody,
      date: new Date().toISOString().split('T')[0], read: true, starred: false, hasAttachment: false,
    };
    setMails(prev => [newMail, ...prev]);
    setComposeTo(''); setComposeSubject(''); setComposeBody(''); setShowCompose(false);
  };

  const TABS = [
    { id: 'inbox' as Tab, label: '받은편지함', icon: Inbox, count: mails.filter(m => (m.toEmail === 'me@tenone.biz' || m.toEmail === 'all@tenone.biz') && !m.read).length },
    { id: 'sent' as Tab, label: '보낸편지함', icon: Send },
    { id: 'starred' as Tab, label: '중요', icon: Star },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">메일</h1>
        <div className="flex items-center gap-2">
          <button onClick={() => { setShowSearch(!showSearch); setSearchQuery(''); }} className="rounded-lg border border-white/5 p-2 text-slate-400 hover:text-white hover:border-white/10 transition-all">
            <Search size={15} />
          </button>
          <button onClick={() => setShowCompose(!showCompose)} className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors">
            <Plus size={15} /> 새 메일
          </button>
        </div>
      </div>

      {isDemo && (
        <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-3 mb-4 text-sm text-amber-300">
          데모 모드입니다. 실제 메일은 전송되지 않습니다.
        </div>
      )}

      {showSearch && (
        <div className="mb-4 flex gap-2">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="메일 검색..." autoFocus
              className="w-full rounded-lg border border-white/5 bg-white/[0.03] pl-9 pr-3 py-2 text-sm focus:border-indigo-500 focus:outline-none" />
          </div>
          <button onClick={() => { setShowSearch(false); setSearchQuery(''); }} className="text-slate-500 hover:text-white"><X size={16} /></button>
        </div>
      )}

      <div className="flex gap-1.5 mb-4">
        {TABS.map(t => (
          <button key={t.id} onClick={() => { setTab(t.id); setSelected(null); }}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm transition-colors ${tab === t.id ? 'bg-indigo-600/10 text-indigo-400 font-semibold' : 'text-slate-400 hover:bg-white/5'}`}>
            <t.icon size={14} /> {t.label}
            {'count' in t && (t as any).count > 0 && (
              <span className="ml-1 text-[10px] bg-indigo-600 text-white rounded-full px-1.5 py-0.5">{(t as any).count}</span>
            )}
          </button>
        ))}
      </div>

      {showCompose && (
        <div className="mb-4 rounded-xl border border-white/5 bg-white/[0.02] p-4 space-y-3">
          <input value={composeTo} onChange={e => setComposeTo(e.target.value)} placeholder="받는 사람"
            className="w-full rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none" />
          <input value={composeSubject} onChange={e => setComposeSubject(e.target.value)} placeholder="제목"
            className="w-full rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none" />
          <textarea value={composeBody} onChange={e => setComposeBody(e.target.value)} rows={6} placeholder="내용을 입력하세요..."
            className="w-full rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2.5 text-sm resize-none focus:border-indigo-500 focus:outline-none" />
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowCompose(false)} className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors">취소</button>
            <button onClick={handleSend} disabled={!composeTo || !composeSubject}
              className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-40 transition-colors">
              <Send size={14} /> 보내기
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className={`${selected ? 'lg:col-span-2' : 'lg:col-span-5'} space-y-1`}>
          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <Mail size={32} className="mx-auto mb-3 text-slate-700" />
              <p className="text-sm text-slate-400">메일이 없습니다</p>
            </div>
          ) : filtered.map(m => (
            <button key={m.id} onClick={() => { setSelected(m.id); markRead(m.id); }}
              className={`w-full text-left flex items-center gap-3 rounded-lg border px-4 py-3 transition-colors ${selected === m.id ? 'border-indigo-500/30 bg-indigo-500/5' : 'border-white/5 bg-white/[0.02] hover:bg-white/[0.04]'} ${!m.read ? 'border-l-2 border-l-indigo-500' : ''}`}>
              <button onClick={e => { e.stopPropagation(); toggleStar(m.id); }} className={`shrink-0 ${m.starred ? 'text-amber-400' : 'text-slate-600 hover:text-amber-400'}`}>
                <Star size={14} fill={m.starred ? 'currentColor' : 'none'} />
              </button>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`text-sm truncate ${!m.read ? 'font-semibold' : ''}`}>{tab === 'sent' ? m.to : m.from}</span>
                  {m.hasAttachment && <Paperclip size={11} className="text-slate-500 shrink-0" />}
                </div>
                <div className={`text-sm truncate ${!m.read ? 'text-white' : 'text-slate-400'}`}>{m.subject}</div>
                <div className="text-xs text-slate-600 truncate mt-0.5">{m.preview}</div>
              </div>
              <span className="text-[10px] text-slate-600 shrink-0">{m.date.slice(5)}</span>
            </button>
          ))}
        </div>

        {selected && selectedMail && (
          <div className="lg:col-span-3 rounded-xl border border-white/5 bg-white/[0.02] p-5">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-base font-semibold">{selectedMail.subject}</h2>
                <div className="text-xs text-slate-500 mt-1">
                  {selectedMail.from} &lt;{selectedMail.fromEmail}&gt; &rarr; {selectedMail.to}
                </div>
                <div className="text-xs text-slate-600 mt-0.5">{selectedMail.date}</div>
              </div>
              <button onClick={() => setSelected(null)} className="text-slate-500 hover:text-white"><X size={16} /></button>
            </div>
            <div className="border-t border-white/5 pt-4 text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
              {selectedMail.body}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
