"use client";

import { useState, useEffect } from "react";
import { Palette, Search, ExternalLink } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

interface HeroMember {
    user_id: string;
    role: string;
    context: string;
    is_active: boolean;
    created_at: string;
    members: { name: string; email: string; avatar_url: string | null } | null;
}

export default function BrandingUsersPage() {
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState<HeroMember[]>([]);
    const [search, setSearch] = useState('');

    useEffect(() => {
        const sb = createClient();
        sb.from('member_roles')
            .select('user_id, role, context, is_active, created_at, members!inner(name, email, avatar_url)')
            .eq('context', 'brand:hero')
            .eq('is_active', true)
            .order('created_at', { ascending: false })
            .limit(200)
            .then(({ data }: { data: HeroMember[] | null }) => {
                setUsers(data ?? []);
                setLoading(false);
            });
    }, []);

    const filtered = users.filter(u =>
        !search ||
        u.members?.name?.includes(search) ||
        u.members?.email?.includes(search)
    );

    const roleLabel: Record<string, string> = {
        member: '기본 회원',
        purchaser: '검사 구매자',
        subscriber: '구독 상담자',
        coach: '상담사',
    };

    const roleBadgeColor: Record<string, string> = {
        member: 'bg-neutral-100 text-neutral-600',
        purchaser: 'bg-blue-50 text-blue-600',
        subscriber: 'bg-purple-50 text-purple-600',
        coach: 'bg-red-50 text-red-600',
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-lg font-bold">HeRo 회원</h1>
                    <p className="text-sm text-neutral-400 mt-0.5">hero.ne.kr 등록 회원 및 권한 현황</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-300" />
                        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="이름, 이메일 검색..."
                            className="pl-9 pr-4 py-2 text-sm border border-neutral-200 rounded-lg w-48 focus:outline-none focus:border-neutral-400" />
                    </div>
                    <Link href="/hero/my" target="_blank" className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-neutral-600">
                        <ExternalLink className="h-3.5 w-3.5" /> 서비스 페이지
                    </Link>
                </div>
            </div>

            {/* 통계 */}
            <div className="grid grid-cols-4 gap-4 mb-6">
                {(['member', 'purchaser', 'subscriber', 'coach'] as const).map(r => (
                    <div key={r} className="border border-neutral-200 rounded-lg p-4">
                        <p className="text-xs text-neutral-400 mb-1">{roleLabel[r]}</p>
                        <p className="text-2xl font-bold">{users.filter(u => u.role === r).length}</p>
                    </div>
                ))}
            </div>

            {loading ? (
                <div className="border border-neutral-200 rounded-lg p-12 text-center text-sm text-neutral-400">불러오는 중...</div>
            ) : filtered.length === 0 ? (
                <div className="border border-neutral-200 rounded-lg p-12 text-center">
                    <Palette className="h-10 w-10 text-neutral-200 mx-auto mb-3" />
                    <p className="text-sm text-neutral-400">{search ? "검색 결과가 없습니다" : "아직 HeRo 등록 회원이 없습니다"}</p>
                </div>
            ) : (
                <div className="border border-neutral-200 rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-neutral-50 text-left">
                                <th className="px-4 py-3 font-semibold text-neutral-500">이름</th>
                                <th className="px-4 py-3 font-semibold text-neutral-500">이메일</th>
                                <th className="px-4 py-3 font-semibold text-neutral-500">권한</th>
                                <th className="px-4 py-3 font-semibold text-neutral-500">가입일</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((u) => (
                                <tr key={`${u.user_id}-${u.role}`} className="border-t border-neutral-100 hover:bg-neutral-50">
                                    <td className="px-4 py-3 font-medium">{u.members?.name ?? '-'}</td>
                                    <td className="px-4 py-3 text-neutral-500">{u.members?.email ?? '-'}</td>
                                    <td className="px-4 py-3">
                                        <span className={`text-xs px-2 py-0.5 rounded ${roleBadgeColor[u.role] ?? 'bg-neutral-100 text-neutral-600'}`}>
                                            {roleLabel[u.role] ?? u.role}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-xs text-neutral-400">
                                        {new Date(u.created_at).toLocaleDateString('ko-KR')}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="px-4 py-2 bg-neutral-50 border-t border-neutral-100 text-xs text-neutral-400">
                        총 {filtered.length}명
                    </div>
                </div>
            )}
        </div>
    );
}
