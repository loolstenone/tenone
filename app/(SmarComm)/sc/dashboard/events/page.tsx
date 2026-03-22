'use client';

import { useState } from 'react';
import { Plus, Activity, Clock, Search, ToggleLeft, ToggleRight } from 'lucide-react';

interface TrackedEvent {
  key: string;
  name: string;
  alias: string;
  category: string;
  count: number;
  lastTriggered: string;
  auto: boolean;
  enabled: boolean;
  createdAt: string;
}

const MOCK_EVENTS: TrackedEvent[] = [
  { key: '$page_view', name: '페이지 조회', alias: '', category: '자동 수집', count: 45200, lastTriggered: '방금', auto: true, enabled: true, createdAt: '2026.03.01' },
  { key: '$session_start', name: '세션 시작', alias: '', category: '자동 수집', count: 12800, lastTriggered: '방금', auto: true, enabled: true, createdAt: '2026.03.01' },
  { key: '$engagement', name: '참여', alias: '', category: '자동 수집', count: 38500, lastTriggered: '1분 전', auto: true, enabled: true, createdAt: '2026.03.01' },
  { key: 'scan_start', name: '진단 시작', alias: '사이트 진단 시작', category: '진단', count: 4960, lastTriggered: '2분 전', auto: false, enabled: true, createdAt: '2026.03.01' },
  { key: 'scan_complete', name: '진단 완료', alias: '사이트 진단 완료', category: '진단', count: 4830, lastTriggered: '3분 전', auto: false, enabled: true, createdAt: '2026.03.01' },
  { key: 'report_view', name: '리포트 조회', alias: 'SmarComm Index 리포트', category: '진단', count: 4200, lastTriggered: '5분 전', auto: false, enabled: true, createdAt: '2026.03.03' },
  { key: 'signup', name: '회원가입', alias: '', category: '인증', count: 1488, lastTriggered: '12분 전', auto: false, enabled: true, createdAt: '2026.03.01' },
  { key: 'login', name: '로그인', alias: '', category: '인증', count: 3200, lastTriggered: '1분 전', auto: false, enabled: true, createdAt: '2026.03.01' },
  { key: 'creative_generate', name: '소재 생성', alias: 'AI 소재 생성', category: '소재', count: 820, lastTriggered: '30분 전', auto: false, enabled: true, createdAt: '2026.03.05' },
  { key: 'campaign_create', name: '캠페인 생성', alias: '', category: '캠페인', count: 156, lastTriggered: '2시간 전', auto: false, enabled: true, createdAt: '2026.03.08' },
  { key: 'meeting_book', name: '미팅 예약', alias: '전문가 미팅', category: '전환', count: 340, lastTriggered: '1시간 전', auto: false, enabled: true, createdAt: '2026.03.03' },
  { key: 'plan_upgrade', name: '유료 전환', alias: '플랜 업그레이드', category: '전환', count: 149, lastTriggered: '3시간 전', auto: false, enabled: true, createdAt: '2026.03.05' },
  { key: 'report_download', name: '리포트 다운로드', alias: '', category: '진단', count: 1250, lastTriggered: '15분 전', auto: false, enabled: true, createdAt: '2026.03.03' },
  { key: 'share_click', name: '공유 클릭', alias: '', category: '바이럴', count: 680, lastTriggered: '8분 전', auto: false, enabled: true, createdAt: '2026.03.05' },
  { key: 'compare_scan', name: '경쟁사 비교', alias: '', category: '진단', count: 156, lastTriggered: '20분 전', auto: false, enabled: true, createdAt: '2026.03.18' },
];

type Tab = 'list' | 'collection' | 'attributes';

export default function EventsPage() {
  const [tab, setTab] = useState<Tab>('list');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('전체');

  const categories = ['전체', '자동 수집', '진단', '인증', '소재', '캠페인', '전환', '바이럴'];
  const filtered = MOCK_EVENTS.filter(e => {
    const matchSearch = !search || e.key.includes(search) || e.name.includes(search) || e.alias.includes(search);
    const matchCat = filter === '전체' || e.category === filter;
    return matchSearch && matchCat;
  });

  return (
    <div className="max-w-5xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-text">이벤트 관리</h1>
          <p className="mt-1 text-xs text-text-muted">직접 생성한 이벤트와 자동 수집 이벤트를 관리할 수 있습니다</p>
        </div>
        <button className="flex items-center gap-1.5 rounded-xl bg-text px-4 py-2.5 text-sm font-semibold text-white hover:bg-accent-sub">
          <Plus size={15} /> 이벤트 생성하기
        </button>
      </div>

      {/* 가이드 카드 */}
      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        {[
          { title: '이벤트 네이밍은 어떻게?', desc: '이벤트 택소노미 방법 A-Z를 알려드립니다' },
          { title: '어떤 이벤트로 데이터를?', desc: '데이터 분석을 위한 이벤트 설계 Tip' },
          { title: '이벤트 정의부터 활용까지', desc: '사용자 행동 데이터 수집 및 설계 방법' },
        ].map((card, i) => (
          <div key={i} className="rounded-xl border border-border bg-white p-4 cursor-pointer hover:bg-surface">
            <div className="text-sm font-semibold text-text">{card.title}</div>
            <p className="mt-0.5 text-xs text-text-muted">{card.desc}</p>
            <span className="mt-2 inline-block text-xs font-medium text-point">자세히 보기</span>
          </div>
        ))}
      </div>

      {/* 탭 */}
      <div className="mb-4 flex items-center justify-between border-b border-border">
        <div className="flex">
          {[
            { id: 'list' as Tab, label: '목록' },
            { id: 'collection' as Tab, label: '수집 현황' },
            { id: 'attributes' as Tab, label: '속성 관리' },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} className={`border-b-2 px-4 py-2.5 text-sm font-medium ${tab === t.id ? 'border-text text-text' : 'border-transparent text-text-muted hover:text-text-sub'}`}>
              {t.label}
            </button>
          ))}
        </div>
        <span className="text-xs text-text-muted">총 {filtered.length}개</span>
      </div>

      {/* 검색 + 필터 */}
      <div className="mb-4 flex items-center gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="이벤트 검색"
            className="w-full rounded-xl border border-border bg-white py-2 pl-9 pr-4 text-sm placeholder:text-text-muted focus:border-text focus:outline-none" />
        </div>
        <div className="flex gap-1 overflow-x-auto scrollbar-hide">
          {categories.map(cat => (
            <button key={cat} onClick={() => setFilter(cat)} className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium ${filter === cat ? 'bg-text text-white' : 'bg-surface text-text-sub hover:text-text'}`}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* 이벤트 테이블 */}
      <div className="rounded-2xl border border-border bg-white">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-border text-xs text-text-muted">
            <th className="px-5 py-3 text-left font-medium">이벤트 키</th>
            <th className="px-5 py-3 text-left font-medium">별칭</th>
            <th className="px-5 py-3 text-left font-medium">카테고리</th>
            <th className="px-5 py-3 text-right font-medium">발생 횟수</th>
            <th className="px-5 py-3 text-right font-medium">생성일</th>
            <th className="px-5 py-3 text-center font-medium">상태</th>
          </tr></thead>
          <tbody>
            {/* 자동 수집 그룹 */}
            {filtered.some(e => e.auto) && (
              <tr><td colSpan={6} className="bg-surface px-5 py-2 text-xs text-text-muted">
                자동 수집 이벤트 — 페이지 조회, 참여 등 자동으로 측정됩니다
              </td></tr>
            )}
            {filtered.filter(e => e.auto).map(event => (
              <tr key={event.key} className="border-b border-border hover:bg-surface cursor-pointer">
                <td className="px-5 py-3"><span className="font-mono text-point">{event.key}</span><div className="text-xs text-text-muted">{event.name}</div></td>
                <td className="px-5 py-3 text-text-muted">{event.alias || '-'}</td>
                <td className="px-5 py-3"><span className="rounded-full bg-surface px-2 py-0.5 text-xs text-text-sub">{event.category}</span></td>
                <td className="px-5 py-3 text-right font-medium text-text">{event.count.toLocaleString()}</td>
                <td className="px-5 py-3 text-right text-text-muted">{event.createdAt}</td>
                <td className="px-5 py-3 text-center"><span className="text-success text-xs">● 켜짐</span></td>
              </tr>
            ))}
            {/* 커스텀 이벤트 */}
            {filtered.filter(e => !e.auto).map(event => (
              <tr key={event.key} className="border-b border-border last:border-0 hover:bg-surface cursor-pointer">
                <td className="px-5 py-3"><span className="font-mono text-point">{event.key}</span><div className="text-xs text-text-muted">{event.name}</div></td>
                <td className="px-5 py-3 text-text-muted">{event.alias || '-'}</td>
                <td className="px-5 py-3"><span className="rounded-full bg-surface px-2 py-0.5 text-xs text-text-sub">{event.category}</span></td>
                <td className="px-5 py-3 text-right font-medium text-text">{event.count.toLocaleString()}</td>
                <td className="px-5 py-3 text-right text-text-muted">{event.createdAt}</td>
                <td className="px-5 py-3 text-center"><span className="text-success text-xs">● 켜짐</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
