"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Share2, Plus, X, TrendingUp, Users } from "lucide-react";

interface SocialAccount {
    id: string;
    platform: string;
    handle: string;
    display_name?: string;
    followers: number;
    status: string;
    notes?: string;
}

interface SocialContent {
    id: string;
    title: string;
    type: string;
    status: string;
    scheduled_at?: string;
    engagement: number;
    reach: number;
    assignee?: string;
    account_id?: string;
}

const PLATFORMS = ['Instagram', 'YouTube', 'TikTok', 'Twitter', 'LinkedIn', 'Blog'];
const CONTENT_TYPES = ['Post', 'Story', 'Reel', 'Short', 'Thread'];
const CONTENT_STATUSES = ['Idea', 'Draft', 'Scheduled', 'Published', 'Archived'];

const platformColor: Record<string, string> = {
    Instagram: 'bg-pink-50 text-pink-700',
    YouTube: 'bg-red-50 text-red-700',
    TikTok: 'bg-neutral-900 text-white',
    Twitter: 'bg-sky-50 text-sky-700',
    LinkedIn: 'bg-blue-50 text-blue-700',
    Blog: 'bg-green-50 text-green-700',
};

const statusColor: Record<string, string> = {
    Idea: 'bg-neutral-100 text-neutral-500',
    Draft: 'bg-yellow-50 text-yellow-700',
    Scheduled: 'bg-blue-50 text-blue-700',
    Published: 'bg-green-50 text-green-700',
    Archived: 'bg-neutral-100 text-neutral-400',
};

export default function SocialPage() {
    const [accounts, setAccounts] = useState<SocialAccount[]>([]);
    const [contents, setContents] = useState<SocialContent[]>([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState<'accounts' | 'calendar'>('accounts');
    const [showAddAccount, setShowAddAccount] = useState(false);
    const [showAddContent, setShowAddContent] = useState(false);
    const [accountForm, setAccountForm] = useState({ platform: 'Instagram', handle: '', display_name: '', followers: '' });
    const [contentForm, setContentForm] = useState({ title: '', type: 'Post', assignee: '', scheduled_at: '' });
    const supabase = createClient();

    useEffect(() => { fetchAll(); }, []);

    async function fetchAll() {
        setLoading(true);
        const [accs, conts] = await Promise.all([
            supabase.from('mkt_social_accounts').select('*').order('followers', { ascending: false }),
            supabase.from('mkt_social_content').select('*').order('created_at', { ascending: false }).limit(50),
        ]);
        setAccounts(accs.data || []);
        setContents(conts.data || []);
        setLoading(false);
    }

    async function handleAddAccount(e: React.FormEvent) {
        e.preventDefault();
        await supabase.from('mkt_social_accounts').insert({
            platform: accountForm.platform,
            handle: accountForm.handle,
            display_name: accountForm.display_name || null,
            followers: Number(accountForm.followers) || 0,
            status: 'Active',
        });
        setAccountForm({ platform: 'Instagram', handle: '', display_name: '', followers: '' });
        setShowAddAccount(false);
        fetchAll();
    }

    async function handleAddContent(e: React.FormEvent) {
        e.preventDefault();
        await supabase.from('mkt_social_content').insert({
            title: contentForm.title,
            type: contentForm.type,
            status: 'Idea',
            assignee: contentForm.assignee || null,
            scheduled_at: contentForm.scheduled_at || null,
        });
        setContentForm({ title: '', type: 'Post', assignee: '', scheduled_at: '' });
        setShowAddContent(false);
        fetchAll();
    }

    async function updateContentStatus(id: string, status: string) {
        await supabase.from('mkt_social_content').update({ status }).eq('id', id);
        setContents(prev => prev.map(c => c.id === id ? { ...c, status } : c));
    }

    const totalFollowers = accounts.reduce((s, a) => s + a.followers, 0);
    const publishedCount = contents.filter(c => c.status === 'Published').length;

    return (
        <div className="space-y-6">
            <div className="flex items-start justify-between">
                <div>
                    <h2 className="text-xl font-semibold">Social Media</h2>
                    <p className="mt-1 text-sm text-neutral-500">소셜 계정 및 콘텐츠 캘린더</p>
                </div>
                <button onClick={() => tab === 'accounts' ? setShowAddAccount(true) : setShowAddContent(true)}
                    className="flex items-center gap-1.5 px-3 py-2 bg-neutral-900 text-white text-xs hover:bg-neutral-700 transition-colors">
                    <Plus className="h-3.5 w-3.5" /> 추가
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                    { label: '계정 수', value: accounts.length },
                    { label: '총 팔로워', value: `${(totalFollowers / 1000).toFixed(1)}K` },
                    { label: '발행 콘텐츠', value: publishedCount },
                    { label: '예정', value: contents.filter(c => c.status === 'Scheduled').length },
                ].map(s => (
                    <div key={s.label} className="border border-neutral-200 bg-white p-4 text-center">
                        <p className="text-xl font-bold">{s.value}</p>
                        <p className="text-xs text-neutral-500 mt-0.5">{s.label}</p>
                    </div>
                ))}
            </div>

            {/* Tabs */}
            <div className="flex border-b border-neutral-200">
                {(['accounts', 'calendar'] as const).map(t => (
                    <button key={t} onClick={() => setTab(t)}
                        className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${tab === t ? 'border-neutral-900 text-neutral-900' : 'border-transparent text-neutral-400 hover:text-neutral-600'}`}>
                        {t === 'accounts' ? '소셜 계정' : '콘텐츠 캘린더'}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="flex justify-center py-12"><div className="h-6 w-6 border-2 border-neutral-200 border-t-neutral-900 rounded-full animate-spin" /></div>
            ) : tab === 'accounts' ? (
                accounts.length === 0 ? (
                    <div className="text-center py-16 text-neutral-400">
                        <Share2 className="h-10 w-10 mx-auto mb-3 opacity-30" />
                        <p className="text-sm">등록된 소셜 계정이 없습니다</p>
                    </div>
                ) : (
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {accounts.map(acc => (
                            <div key={acc.id} className="border border-neutral-200 bg-white p-4 hover:border-neutral-400 transition-colors">
                                <div className="flex items-center justify-between mb-3">
                                    <span className={`text-xs px-2 py-0.5 font-medium ${platformColor[acc.platform] || 'bg-neutral-100 text-neutral-500'}`}>{acc.platform}</span>
                                    <span className={`text-xs ${acc.status === 'Active' ? 'text-green-600' : 'text-neutral-400'}`}>{acc.status}</span>
                                </div>
                                <p className="text-sm font-semibold">{acc.display_name || acc.handle}</p>
                                <p className="text-xs text-neutral-400">@{acc.handle}</p>
                                <div className="flex items-center gap-1 mt-3 text-xs text-neutral-500">
                                    <Users className="h-3 w-3" />
                                    <span>{(acc.followers / 1000).toFixed(1)}K 팔로워</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )
            ) : (
                <div className="space-y-2">
                    {contents.length === 0 ? (
                        <div className="text-center py-16 text-neutral-400">
                            <TrendingUp className="h-10 w-10 mx-auto mb-3 opacity-30" />
                            <p className="text-sm">등록된 콘텐츠가 없습니다</p>
                        </div>
                    ) : contents.map(cont => (
                        <div key={cont.id} className="flex items-center justify-between border border-neutral-200 bg-white px-4 py-3 hover:border-neutral-400 transition-colors">
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{cont.title}</p>
                                <div className="flex items-center gap-2 mt-0.5 text-xs text-neutral-400">
                                    <span>{cont.type}</span>
                                    {cont.scheduled_at && <><span>·</span><span>{cont.scheduled_at.split('T')[0]}</span></>}
                                    {cont.assignee && <><span>·</span><span>{cont.assignee}</span></>}
                                </div>
                            </div>
                            <select value={cont.status} onChange={e => updateContentStatus(cont.id, e.target.value)}
                                className={`text-xs px-2 py-0.5 border-0 ml-3 ${statusColor[cont.status] || 'bg-neutral-100'} focus:outline-none cursor-pointer`}>
                                {CONTENT_STATUSES.map(s => <option key={s}>{s}</option>)}
                            </select>
                        </div>
                    ))}
                </div>
            )}

            {/* Add Account Modal */}
            {showAddAccount && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
                    <div className="bg-white w-full max-w-sm">
                        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200">
                            <h3 className="font-semibold">소셜 계정 추가</h3>
                            <button onClick={() => setShowAddAccount(false)}><X className="h-4 w-4" /></button>
                        </div>
                        <form onSubmit={handleAddAccount} className="p-5 space-y-3">
                            <div>
                                <label className="text-xs text-neutral-500 mb-1 block">플랫폼</label>
                                <select value={accountForm.platform} onChange={e => setAccountForm(p => ({ ...p, platform: e.target.value }))}
                                    className="w-full border border-neutral-200 px-3 py-2 text-sm bg-white focus:outline-none">
                                    {PLATFORMS.map(pl => <option key={pl}>{pl}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs text-neutral-500 mb-1 block">핸들 *</label>
                                <input required value={accountForm.handle} onChange={e => setAccountForm(p => ({ ...p, handle: e.target.value }))}
                                    placeholder="tenone_official"
                                    className="w-full border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:border-neutral-900" />
                            </div>
                            <div>
                                <label className="text-xs text-neutral-500 mb-1 block">표시 이름</label>
                                <input value={accountForm.display_name} onChange={e => setAccountForm(p => ({ ...p, display_name: e.target.value }))}
                                    className="w-full border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:border-neutral-900" />
                            </div>
                            <div>
                                <label className="text-xs text-neutral-500 mb-1 block">팔로워</label>
                                <input type="number" value={accountForm.followers} onChange={e => setAccountForm(p => ({ ...p, followers: e.target.value }))}
                                    className="w-full border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:border-neutral-900" />
                            </div>
                            <div className="flex gap-2 pt-2">
                                <button type="button" onClick={() => setShowAddAccount(false)}
                                    className="flex-1 border border-neutral-200 py-2 text-sm hover:bg-neutral-50">취소</button>
                                <button type="submit" className="flex-1 bg-neutral-900 text-white py-2 text-sm hover:bg-neutral-700">추가</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Add Content Modal */}
            {showAddContent && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
                    <div className="bg-white w-full max-w-sm">
                        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200">
                            <h3 className="font-semibold">콘텐츠 추가</h3>
                            <button onClick={() => setShowAddContent(false)}><X className="h-4 w-4" /></button>
                        </div>
                        <form onSubmit={handleAddContent} className="p-5 space-y-3">
                            <div>
                                <label className="text-xs text-neutral-500 mb-1 block">제목 *</label>
                                <input required value={contentForm.title} onChange={e => setContentForm(p => ({ ...p, title: e.target.value }))}
                                    className="w-full border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:border-neutral-900" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs text-neutral-500 mb-1 block">유형</label>
                                    <select value={contentForm.type} onChange={e => setContentForm(p => ({ ...p, type: e.target.value }))}
                                        className="w-full border border-neutral-200 px-3 py-2 text-sm bg-white focus:outline-none">
                                        {CONTENT_TYPES.map(t => <option key={t}>{t}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs text-neutral-500 mb-1 block">예정일</label>
                                    <input type="date" value={contentForm.scheduled_at} onChange={e => setContentForm(p => ({ ...p, scheduled_at: e.target.value }))}
                                        className="w-full border border-neutral-200 px-3 py-2 text-sm focus:outline-none" />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs text-neutral-500 mb-1 block">담당자</label>
                                <input value={contentForm.assignee} onChange={e => setContentForm(p => ({ ...p, assignee: e.target.value }))}
                                    className="w-full border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:border-neutral-900" />
                            </div>
                            <div className="flex gap-2 pt-2">
                                <button type="button" onClick={() => setShowAddContent(false)}
                                    className="flex-1 border border-neutral-200 py-2 text-sm hover:bg-neutral-50">취소</button>
                                <button type="submit" className="flex-1 bg-neutral-900 text-white py-2 text-sm hover:bg-neutral-700">추가</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
