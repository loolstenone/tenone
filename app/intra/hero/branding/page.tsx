"use client";

import { useState, useEffect } from "react";
import { Palette, Search, ExternalLink } from "lucide-react";
import Link from "next/link";

export default function BrandingUsersPage() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => { setLoading(false); }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-bold">브랜딩 이용자</h1>
          <p className="text-sm text-neutral-400 mt-0.5">hero.ne.kr에서 퍼스널 브랜딩 서비스를 이용 중인 사람들</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-300" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="이름, 이메일 검색..."
              className="pl-9 pr-4 py-2 text-sm border border-neutral-200 rounded-lg w-48 focus:outline-none focus:border-neutral-400" />
          </div>
          <Link href="/hero/coaching" target="_blank" className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-neutral-600">
            <ExternalLink className="h-3.5 w-3.5" /> 서비스 페이지
          </Link>
        </div>
      </div>

      {users.length === 0 ? (
        <div className="border border-neutral-200 rounded-lg p-12 text-center">
          <Palette className="h-10 w-10 text-neutral-200 mx-auto mb-3" />
          <p className="text-sm text-neutral-400">아직 브랜딩 서비스 이용자가 없습니다</p>
          <p className="text-xs text-neutral-300 mt-1">hero.ne.kr에서 퍼스널 브랜딩 서비스가 시작되면 이용자가 표시됩니다</p>
        </div>
      ) : (
        <div className="border border-neutral-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-neutral-50 text-left">
                <th className="px-4 py-3 font-semibold text-neutral-500">이름</th>
                <th className="px-4 py-3 font-semibold text-neutral-500">이메일</th>
                <th className="px-4 py-3 font-semibold text-neutral-500">브랜드 프로필</th>
                <th className="px-4 py-3 font-semibold text-neutral-500">상태</th>
                <th className="px-4 py-3 font-semibold text-neutral-500">최근 활동</th>
              </tr>
            </thead>
            <tbody>
              {users.filter(u => !search || u.name?.includes(search)).map((u: any) => (
                <tr key={u.id} className="border-t border-neutral-100 hover:bg-neutral-50">
                  <td className="px-4 py-3 font-medium">{u.name}</td>
                  <td className="px-4 py-3 text-neutral-500">{u.email}</td>
                  <td className="px-4 py-3 text-neutral-500">{u.brandProfile}</td>
                  <td className="px-4 py-3"><span className="text-xs px-2 py-0.5 bg-green-50 text-green-600 rounded">{u.status}</span></td>
                  <td className="px-4 py-3 text-xs text-neutral-400">{u.lastActivity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
