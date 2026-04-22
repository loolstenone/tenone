"use client";

import { useState, useEffect } from "react";
import { FileText, Search, ExternalLink, Star } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

interface ResumeRow {
  id: string;
  member_id: string;
  title: string;
  content: { text?: string };
  is_primary: boolean;
  created_at: string;
  updated_at: string;
  member_name: string | null;
  member_email: string | null;
}

export default function ResumeUsersPage() {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<ResumeRow[]>([]);
  const [search, setSearch] = useState('');
  const supabase = createClient();

  useEffect(() => {
    supabase
      .from('resumes')
      .select(`
        id, member_id, title, content, is_primary, created_at, updated_at,
        members!inner(name, email)
      `)
      .order('updated_at', { ascending: false })
      .then(({ data }: { data: any[] | null }) => {
        setRows((data || []).map((r: any) => ({
          ...r,
          member_name: r.members?.name ?? null,
          member_email: r.members?.email ?? null,
        })));
        setLoading(false);
      });
  }, []);

  const filtered = rows.filter(r =>
    !search ||
    r.member_name?.includes(search) ||
    r.member_email?.includes(search) ||
    r.title?.includes(search)
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-bold">이력서 이용자</h1>
          <p className="text-sm text-neutral-400 mt-0.5">
            hero.ne.kr에서 이력서를 등록한 회원 — {rows.length}건
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-300" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="이름, 이메일, 제목 검색..."
              className="pl-9 pr-4 py-2 text-sm border border-neutral-200 rounded-lg w-56 focus:outline-none focus:border-neutral-400"
            />
          </div>
          <Link
            href="/hero/resume"
            target="_blank"
            className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-neutral-600"
          >
            <ExternalLink className="h-3.5 w-3.5" /> 서비스 페이지
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-6 w-6 border-2 border-neutral-200 border-t-neutral-600 rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="border border-neutral-200 rounded-lg p-12 text-center">
          <FileText className="h-10 w-10 text-neutral-200 mx-auto mb-3" />
          <p className="text-sm text-neutral-400">
            {search ? "검색 결과가 없습니다" : "아직 이력서를 등록한 회원이 없습니다"}
          </p>
        </div>
      ) : (
        <div className="border border-neutral-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-neutral-50 text-left">
                <th className="px-4 py-3 font-semibold text-neutral-500">이름</th>
                <th className="px-4 py-3 font-semibold text-neutral-500">이메일</th>
                <th className="px-4 py-3 font-semibold text-neutral-500">이력서 제목</th>
                <th className="px-4 py-3 font-semibold text-neutral-500">기본</th>
                <th className="px-4 py-3 font-semibold text-neutral-500">마지막 수정</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => (
                <tr key={r.id} className="border-t border-neutral-100 hover:bg-neutral-50">
                  <td className="px-4 py-3 font-medium">{r.member_name ?? "—"}</td>
                  <td className="px-4 py-3 text-neutral-500 text-xs">{r.member_email ?? "—"}</td>
                  <td className="px-4 py-3 max-w-xs truncate">{r.title}</td>
                  <td className="px-4 py-3">
                    {r.is_primary && <Star className="h-3.5 w-3.5 text-amber-400" />}
                  </td>
                  <td className="px-4 py-3 text-xs text-neutral-400">
                    {new Date(r.updated_at || r.created_at).toLocaleDateString("ko-KR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
