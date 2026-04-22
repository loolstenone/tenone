"use client";

import { useState, useEffect } from "react";
import { TrendingUp, Search, ExternalLink } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

interface CareerUser {
    id: string;
    member_id: string;
    title: string;
    is_primary: boolean;
    created_at: string;
    updated_at: string;
    members: { name: string; email: string } | null;
}

export default function CareerUsersPage() {
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState<CareerUser[]>([]);
    const [search, setSearch] = useState('');

    useEffect(() => {
        const sb = createClient();
        sb.from('resumes')
            .select('id, member_id, title, is_primary, created_at, updated_at, members!inner(name, email)')
            .order('updated_at', { ascending: false })
            .limit(200)
            .then(({ data }: { data: CareerUser[] | null }) => {
                setUsers(data ?? []);
                setLoading(false);
            });
    }, []);

    const filtered = users.filter(u =>
        !search ||
        u.members?.name?.includes(search) ||
        u.members?.email?.includes(search) ||
        u.title?.includes(search)
    );

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-lg font-bold">커리어 이용자</h1>
                    <p className="text-sm text-neutral-400 mt-0.5">이력서를 등록한 HeRo 커리어 코칭 이용자</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-300" />
                        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="이름, 이메일, 이력서 제목..."
                            className="pl-9 pr-4 py-2 text-sm border border-neutral-200 rounded-lg w-56 focus:outline-none focus:border-neutral-400" />
                    </div>
                    <Link href="/hero/coaching" target="_blank" className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-neutral-600">
                        <ExternalLink className="h-3.5 w-3.5" /> 서비스 페이지
                    </Link>
                </div>
            </div>

            {/* 통계 */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="border border-neutral-200 rounded-lg p-4">
                    <p className="text-xs text-neutral-400 mb-1">총 이력서</p>
                    <p className="text-2xl font-bold">{users.length}</p>
                </div>
                <div className="border border-neutral-200 rounded-lg p-4">
                    <p className="text-xs text-neutral-400 mb-1">대표 이력서</p>
                    <p className="text-2xl font-bold">{users.filter(u => u.is_primary).length}</p>
                </div>
                <div className="border border-neutral-200 rounded-lg p-4">
                    <p className="text-xs text-neutral-400 mb-1">이번 달 등록</p>
                    <p className="text-2xl font-bold">
                        {users.filter(u => {
                            const d = new Date(u.created_at);
                            const now = new Date();
                            return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
                        }).length}
                    </p>
                </div>
            </div>

            {loading ? (
                <div className="border border-neutral-200 rounded-lg p-12 text-center text-sm text-neutral-400">불러오는 중...</div>
            ) : filtered.length === 0 ? (
                <div className="border border-neutral-200 rounded-lg p-12 text-center">
                    <TrendingUp className="h-10 w-10 text-neutral-200 mx-auto mb-3" />
                    <p className="text-sm text-neutral-400">{search ? "검색 결과가 없습니다" : "아직 이력서 등록 이용자가 없습니다"}</p>
                </div>
            ) : (
                <div className="border border-neutral-200 rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-neutral-50 text-left">
                                <th className="px-4 py-3 font-semibold text-neutral-500">이름</th>
                                <th className="px-4 py-3 font-semibold text-neutral-500">이메일</th>
                                <th className="px-4 py-3 font-semibold text-neutral-500">이력서 제목</th>
                                <th className="px-4 py-3 font-semibold text-neutral-500">대표</th>
                                <th className="px-4 py-3 font-semibold text-neutral-500">최근 수정</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((u) => (
                                <tr key={u.id} className="border-t border-neutral-100 hover:bg-neutral-50">
                                    <td className="px-4 py-3 font-medium">{u.members?.name ?? '-'}</td>
                                    <td className="px-4 py-3 text-neutral-500">{u.members?.email ?? '-'}</td>
                                    <td className="px-4 py-3 text-neutral-600">{u.title || '(제목 없음)'}</td>
                                    <td className="px-4 py-3">
                                        {u.is_primary && <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-600 rounded">대표</span>}
                                    </td>
                                    <td className="px-4 py-3 text-xs text-neutral-400">
                                        {new Date(u.updated_at).toLocaleDateString('ko-KR')}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="px-4 py-2 bg-neutral-50 border-t border-neutral-100 text-xs text-neutral-400">
                        총 {filtered.length}건
                    </div>
                </div>
            )}
        </div>
    );
}
