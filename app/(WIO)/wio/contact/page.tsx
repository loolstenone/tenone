'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Send, Check, Building2, Users, Briefcase, GraduationCap } from 'lucide-react';
import { WIOMarketingHeader } from '@/components/WIOMarketingHeader';

const interests = [
    { id: 'solution', label: '솔루션 구축', icon: Building2 },
    { id: 'consulting', label: '컨설팅', icon: Briefcase },
    { id: 'team', label: '팀 운영', icon: Users },
    { id: 'education', label: '교육/워크숍', icon: GraduationCap },
];

const companyScales = ['1~10명', '11~50명', '51~200명', '200명 이상'];

export default function ContactPage() {
    const [form, setForm] = useState({ name: '', email: '', company: '', scale: '', interest: '', message: '' });
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    const update = (key: string, value: string) => setForm(prev => ({ ...prev, [key]: value }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name || !form.email || !form.message) return;
        setLoading(true);
        // TODO: Supabase or email API 연결
        await new Promise(r => setTimeout(r, 1200));
        setLoading(false);
        setSubmitted(true);
    };

    return (
        <>
            <WIOMarketingHeader />

            <main className="min-h-screen bg-[#0F0F23] text-white pt-24 pb-20 px-6">
                <div className="mx-auto max-w-2xl">
                    <Link href="/wio" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-300 transition mb-8">
                        <ArrowLeft className="w-4 h-4" /> WIO
                    </Link>

                    {!submitted ? (
                        <>
                            <h1 className="text-3xl font-bold mb-2">상담 신청</h1>
                            <p className="text-slate-400 mb-10">WIO 도입이나 컨설팅에 대해 궁금한 점을 남겨주세요. 영업일 기준 1일 내 답변드립니다.</p>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* 관심 분야 */}
                                <div>
                                    <label className="block text-sm text-slate-400 mb-3">관심 분야</label>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                        {interests.map(i => (
                                            <button key={i.id} type="button" onClick={() => update('interest', i.id)}
                                                className={`p-3 rounded-lg border text-center transition-all text-sm ${
                                                    form.interest === i.id
                                                        ? 'border-indigo-500 bg-indigo-500/10 text-indigo-300'
                                                        : 'border-white/10 text-slate-400 hover:border-white/20'
                                                }`}>
                                                <i.icon className="w-4 h-4 mx-auto mb-1" />
                                                {i.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* 이름 + 이메일 */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm text-slate-400 mb-1.5">이름 *</label>
                                        <input type="text" value={form.name} onChange={e => update('name', e.target.value)} required
                                            className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition" placeholder="홍길동" />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-slate-400 mb-1.5">이메일 *</label>
                                        <input type="email" value={form.email} onChange={e => update('email', e.target.value)} required
                                            className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition" placeholder="email@company.com" />
                                    </div>
                                </div>

                                {/* 회사 + 규모 */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm text-slate-400 mb-1.5">회사/조직</label>
                                        <input type="text" value={form.company} onChange={e => update('company', e.target.value)}
                                            className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition" placeholder="회사명" />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-slate-400 mb-1.5">조직 규모</label>
                                        <select value={form.scale} onChange={e => update('scale', e.target.value)}
                                            className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500 transition appearance-none">
                                            <option value="" className="bg-[#0F0F23]">선택</option>
                                            {companyScales.map(s => <option key={s} value={s} className="bg-[#0F0F23]">{s}</option>)}
                                        </select>
                                    </div>
                                </div>

                                {/* 메시지 */}
                                <div>
                                    <label className="block text-sm text-slate-400 mb-1.5">문의 내용 *</label>
                                    <textarea value={form.message} onChange={e => update('message', e.target.value)} required rows={5}
                                        className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition resize-none"
                                        placeholder="도입 목적, 현재 상황, 궁금한 점 등을 자유롭게 적어주세요." />
                                </div>

                                <button type="submit" disabled={loading}
                                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg transition flex items-center justify-center gap-2 disabled:opacity-50">
                                    {loading ? '전송 중...' : <><Send className="w-4 h-4" /> 상담 신청</>}
                                </button>
                            </form>
                        </>
                    ) : (
                        <div className="text-center py-20">
                            <div className="w-16 h-16 rounded-full bg-indigo-500/20 flex items-center justify-center mx-auto mb-6">
                                <Check className="w-8 h-8 text-indigo-400" />
                            </div>
                            <h2 className="text-2xl font-bold mb-3">신청이 완료되었습니다</h2>
                            <p className="text-slate-400 mb-8">영업일 기준 1일 내 입력하신 이메일로 연락드리겠습니다.</p>
                            <Link href="/wio" className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition text-sm">
                                WIO 홈으로
                            </Link>
                        </div>
                    )}
                </div>
            </main>
        </>
    );
}
