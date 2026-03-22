"use client";

import { useState } from "react";
import { Plus, Send, Eye, Edit2, Trash2, Users, Mail, Calendar, BarChart3, User, Globe, Search } from "lucide-react";
import clsx from "clsx";

interface Newsletter {
    id: string;
    title: string;
    status: '작성중' | '예약' | '발송완료';
    scheduledDate?: string;
    sentDate?: string;
    recipients: number;
    openRate?: number;
    clickRate?: number;
}

type SubscriberType = 'member' | 'guest';

interface Subscriber {
    id: string;
    email: string;
    name?: string;
    type: SubscriberType;
    subscribedAt: string;
    status: 'active' | 'unsubscribed';
    source?: string; // 가입경로
}

const mockNewsletters: Newsletter[] = [
    { id: 'nl1', title: 'MADLeague 인사이트 투어링 — 영양군에서 만난 기획의 본질', status: '발송완료', sentDate: '2026-03-15', recipients: 342, openRate: 48.2, clickRate: 12.5 },
    { id: 'nl2', title: 'LUKI 2nd Single 비하인드 — AI 아이돌은 어떻게 만들어지는가', status: '발송완료', sentDate: '2026-03-01', recipients: 328, openRate: 52.1, clickRate: 15.3 },
    { id: 'nl3', title: 'Badak 3월 밋업 리캡 — 퍼포먼스 마케팅의 미래', status: '예약', scheduledDate: '2026-03-29', recipients: 355 },
    { id: 'nl4', title: '리제로스 시즌2 개막 안내', status: '작성중', recipients: 0 },
];

const mockSubscribers: Subscriber[] = [
    // 회원 구독자
    { id: 's1', email: 'cheonil.jeon@gmail.com', name: '전천일', type: 'member', subscribedAt: '2025-03-15', status: 'active', source: '회원가입' },
    { id: 's2', email: 'hong@univ.ac.kr', name: '홍길동', type: 'member', subscribedAt: '2026-01-10', status: 'active', source: '회원가입' },
    { id: 's3', email: 'kim@company.com', name: '김마케', type: 'member', subscribedAt: '2026-02-05', status: 'active', source: '프로필 신청' },
    { id: 's4', email: 'lee@design.kr', name: '이디자', type: 'member', subscribedAt: '2026-02-20', status: 'unsubscribed', source: '회원가입' },
    { id: 's5', email: 'park@agency.co.kr', name: '박광고', type: 'member', subscribedAt: '2026-03-01', status: 'active', source: '프로필 신청' },
    // 비회원 구독자
    { id: 'g1', email: 'guest.marketer@gmail.com', name: '최마케터', type: 'guest', subscribedAt: '2026-03-05', status: 'active', source: '뉴스레터 페이지' },
    { id: 'g2', email: 'freelancer.lee@naver.com', name: '', type: 'guest', subscribedAt: '2026-03-08', status: 'active', source: '뉴스레터 페이지' },
    { id: 'g3', email: 'student.yoon@univ.ac.kr', name: '윤학생', type: 'guest', subscribedAt: '2026-03-10', status: 'active', source: '뉴스레터 페이지' },
    { id: 'g4', email: 'ceo@startup.io', name: '장대표', type: 'guest', subscribedAt: '2026-03-12', status: 'active', source: '뉴스레터 페이지' },
    { id: 'g5', email: 'designer.choi@gmail.com', name: '최디자인', type: 'guest', subscribedAt: '2026-02-28', status: 'unsubscribed', source: '뉴스레터 페이지' },
    { id: 'g6', email: 'media@news.co.kr', name: '', type: 'guest', subscribedAt: '2026-03-15', status: 'active', source: '뉴스레터 페이지' },
];

const statusStyle: Record<string, string> = {
    '작성중': 'bg-neutral-100 text-neutral-500',
    '예약': 'bg-blue-50 text-blue-600',
    '발송완료': 'bg-green-50 text-green-600',
};

type TypeFilter = '전체' | 'member' | 'guest';

export default function NewsletterCmsPage() {
    const [tab, setTab] = useState<'issues' | 'subscribers'>('issues');
    const [newsletters] = useState(mockNewsletters);
    const [subscribers] = useState(mockSubscribers);
    const [typeFilter, setTypeFilter] = useState<TypeFilter>('전체');
    const [searchQuery, setSearchQuery] = useState('');

    const activeSubscribers = subscribers.filter(s => s.status === 'active');
    const memberCount = activeSubscribers.filter(s => s.type === 'member').length;
    const guestCount = activeSubscribers.filter(s => s.type === 'guest').length;
    const totalSent = newsletters.filter(n => n.status === '발송완료').length;
    const avgOpenRate = newsletters.filter(n => n.openRate).reduce((sum, n) => sum + (n.openRate || 0), 0) / (totalSent || 1);

    const filteredSubscribers = subscribers.filter(s => {
        if (typeFilter !== '전체' && s.type !== typeFilter) return false;
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            return s.email.toLowerCase().includes(q) || (s.name || '').toLowerCase().includes(q);
        }
        return true;
    });

    return (
        <div className="max-w-5xl">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-xl font-bold">뉴스레터 관리</h1>
                    <p className="text-xs text-neutral-400 mt-0.5">뉴스레터 작성 · 발송 · 구독자 관리</p>
                </div>
                <button className="flex items-center gap-1.5 px-4 py-2 text-sm bg-neutral-900 text-white rounded hover:bg-neutral-800">
                    <Plus className="h-4 w-4" /> 새 뉴스레터
                </button>
            </div>

            {/* 요약 카드 */}
            <div className="grid grid-cols-5 gap-3 mb-5">
                <div className="border border-neutral-200 bg-white p-3.5">
                    <div className="flex items-center gap-1.5 mb-1"><Users className="h-3.5 w-3.5 text-neutral-400" /><span className="text-xs text-neutral-400">전체 구독자</span></div>
                    <p className="text-xl font-bold">{activeSubscribers.length}<span className="text-xs font-normal text-neutral-400 ml-1">명</span></p>
                </div>
                <div className="border border-neutral-200 bg-white p-3.5">
                    <div className="flex items-center gap-1.5 mb-1"><User className="h-3.5 w-3.5 text-blue-400" /><span className="text-xs text-neutral-400">회원</span></div>
                    <p className="text-xl font-bold text-blue-600">{memberCount}<span className="text-xs font-normal text-neutral-400 ml-1">명</span></p>
                </div>
                <div className="border border-neutral-200 bg-white p-3.5">
                    <div className="flex items-center gap-1.5 mb-1"><Globe className="h-3.5 w-3.5 text-amber-400" /><span className="text-xs text-neutral-400">비회원</span></div>
                    <p className="text-xl font-bold text-amber-600">{guestCount}<span className="text-xs font-normal text-neutral-400 ml-1">명</span></p>
                </div>
                <div className="border border-neutral-200 bg-white p-3.5">
                    <div className="flex items-center gap-1.5 mb-1"><Eye className="h-3.5 w-3.5 text-neutral-400" /><span className="text-xs text-neutral-400">평균 오픈율</span></div>
                    <p className="text-xl font-bold">{avgOpenRate.toFixed(1)}<span className="text-xs font-normal text-neutral-400 ml-1">%</span></p>
                </div>
                <div className="border border-neutral-200 bg-white p-3.5">
                    <div className="flex items-center gap-1.5 mb-1"><Mail className="h-3.5 w-3.5 text-neutral-400" /><span className="text-xs text-neutral-400">발송 완료</span></div>
                    <p className="text-xl font-bold">{totalSent}<span className="text-xs font-normal text-neutral-400 ml-1">건</span></p>
                </div>
            </div>

            {/* 탭 */}
            <div className="flex border-b border-neutral-200 mb-5">
                {[
                    { key: 'issues' as const, label: '뉴스레터', count: newsletters.length },
                    { key: 'subscribers' as const, label: '구독자', count: activeSubscribers.length },
                ].map(t => (
                    <button key={t.key} onClick={() => setTab(t.key)}
                        className={clsx("px-4 py-2.5 text-xs font-medium border-b-2 transition-colors",
                            tab === t.key ? "border-neutral-900 text-neutral-900" : "border-transparent text-neutral-400")}>
                        {t.label} <span className="ml-1 text-[11px] text-neutral-400">({t.count})</span>
                    </button>
                ))}
            </div>

            {/* 뉴스레터 목록 */}
            {tab === 'issues' && (
                <div className="space-y-2">
                    {newsletters.map(nl => (
                        <div key={nl.id} className="border border-neutral-200 bg-white p-4 hover:border-neutral-300 transition-colors">
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${statusStyle[nl.status]}`}>{nl.status}</span>
                                        <h3 className="text-xs font-medium truncate">{nl.title}</h3>
                                    </div>
                                    <div className="flex items-center gap-4 text-[11px] text-neutral-400">
                                        {nl.sentDate && <span className="flex items-center gap-1"><Calendar className="h-2.5 w-2.5" /> 발송: {nl.sentDate}</span>}
                                        {nl.scheduledDate && <span className="flex items-center gap-1"><Calendar className="h-2.5 w-2.5" /> 예약: {nl.scheduledDate}</span>}
                                        {nl.recipients > 0 && <span>{nl.recipients}명 수신</span>}
                                        {nl.openRate && <span>오픈 {nl.openRate}%</span>}
                                        {nl.clickRate && <span>클릭 {nl.clickRate}%</span>}
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                    {nl.status === '작성중' && <button className="p-1.5 hover:bg-neutral-100 rounded"><Edit2 className="h-3 w-3 text-neutral-400" /></button>}
                                    {nl.status === '작성중' && <button className="p-1.5 hover:bg-neutral-100 rounded"><Send className="h-3 w-3 text-neutral-400" /></button>}
                                    {nl.status === '발송완료' && <button className="p-1.5 hover:bg-neutral-100 rounded"><Eye className="h-3 w-3 text-neutral-400" /></button>}
                                    <button className="p-1.5 hover:bg-red-50 rounded"><Trash2 className="h-3 w-3 text-neutral-300 hover:text-red-500" /></button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* 구독자 목록 */}
            {tab === 'subscribers' && (
                <div>
                    {/* 필터 */}
                    <div className="flex items-center gap-3 mb-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-300" />
                            <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                                placeholder="이메일 또는 이름 검색..."
                                className="w-full pl-9 pr-4 py-2 text-sm border border-neutral-200 rounded focus:outline-none focus:border-neutral-400" />
                        </div>
                        <div className="flex gap-1">
                            {([['전체', '전체'], ['member', '회원'], ['guest', '비회원']] as [TypeFilter, string][]).map(([key, label]) => (
                                <button key={key} onClick={() => setTypeFilter(key)}
                                    className={clsx("px-3 py-1.5 text-xs rounded transition-colors",
                                        typeFilter === key ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200")}>
                                    {label}
                                    <span className="ml-1 text-[10px]">
                                        ({key === '전체' ? subscribers.length : subscribers.filter(s => s.type === key).length})
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="border border-neutral-200 bg-white overflow-hidden">
                        <table className="w-full text-xs">
                            <thead>
                                <tr className="border-b border-neutral-100 text-neutral-400">
                                    <th className="text-left p-3 font-medium">이메일</th>
                                    <th className="text-left p-3 font-medium">이름</th>
                                    <th className="text-center p-3 font-medium">유형</th>
                                    <th className="text-left p-3 font-medium">가입경로</th>
                                    <th className="text-left p-3 font-medium">구독일</th>
                                    <th className="text-center p-3 font-medium">상태</th>
                                    <th className="text-center p-3 font-medium w-10"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredSubscribers.map(sub => (
                                    <tr key={sub.id} className="border-b border-neutral-50 last:border-0 hover:bg-neutral-50 transition-colors">
                                        <td className="p-3 font-mono text-neutral-700">{sub.email}</td>
                                        <td className="p-3 text-neutral-600">{sub.name || <span className="text-neutral-300">—</span>}</td>
                                        <td className="p-3 text-center">
                                            <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium ${
                                                sub.type === 'member' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'
                                            }`}>
                                                {sub.type === 'member' ? <><User className="h-2.5 w-2.5" /> 회원</> : <><Globe className="h-2.5 w-2.5" /> 비회원</>}
                                            </span>
                                        </td>
                                        <td className="p-3 text-neutral-400">{sub.source || '—'}</td>
                                        <td className="p-3 text-neutral-400">{sub.subscribedAt}</td>
                                        <td className="p-3 text-center">
                                            <span className={`text-[10px] px-1.5 py-0.5 rounded ${sub.status === 'active' ? 'bg-green-50 text-green-600' : 'bg-neutral-100 text-neutral-400'}`}>
                                                {sub.status === 'active' ? '구독중' : '해지'}
                                            </span>
                                        </td>
                                        <td className="p-3 text-center">
                                            <button className="p-1 hover:bg-red-50 rounded"><Trash2 className="h-3 w-3 text-neutral-300" /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filteredSubscribers.length === 0 && (
                            <div className="p-6 text-center text-xs text-neutral-400">검색 결과가 없습니다.</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
