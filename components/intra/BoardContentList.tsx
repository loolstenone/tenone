"use client";

/**
 * 브랜드 게시판 콘텐츠 목록 (인트라 공통)
 * 한 게시판의 전 상태 글 목록 + 새 글·수정·삭제. 작성·수정은 editPath의 BoardPostEditor
 */
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ExternalLink, Pencil, Plus, Search, Trash2, Pin } from "lucide-react";
import clsx from "clsx";
import { PageHeader, PrimaryButton } from "@/components/intra/IntraUI";
import { normalizePost, type IntraPostRow } from "@/lib/intra-board";

const STATUS_BADGE: Record<string, string> = {
    draft: "bg-neutral-100 text-neutral-500",
    published: "bg-emerald-50 text-emerald-700",
    hidden: "bg-amber-50 text-amber-600",
};
const STATUS_LABEL: Record<string, string> = { draft: "임시", published: "발행", hidden: "숨김" };

interface Props {
    site: string;
    board: string;
    title: string;
    description?: string;
    editPath: string;      // 작성·수정 화면 경로 (?id= 붙여 수정)
    publicPath?: string;   // 사이트에서 보기
}

export function BoardContentList({ site, board, title, description, editPath, publicPath }: Props) {
    const router = useRouter();
    const [posts, setPosts] = useState<IntraPostRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("전체");

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/board/posts?site=${site}&board=${board}&status=all&limit=500`);
            if (!res.ok) throw new Error();
            const d = await res.json();
            setPosts(((d.posts ?? []) as Record<string, unknown>[]).map(normalizePost).filter(p => p.status !== "deleted"));
            setError("");
        } catch {
            setError("글 목록을 불러오지 못했습니다.");
        }
        setLoading(false);
    }, [site, board]);

    useEffect(() => { load(); }, [load]);

    const handleDelete = async (id: string) => {
        if (!confirm("삭제하시겠습니까? 사이트에서 바로 내려갑니다.")) return;
        const res = await fetch(`/api/board/posts/${id}`, { method: "DELETE" });
        if (!res.ok) { alert("삭제에 실패했습니다."); return; }
        setPosts(prev => prev.filter(p => p.id !== id));
    };

    const term = search.trim().toLowerCase();
    const filtered = posts
        .filter(p => statusFilter === "전체" || p.status === statusFilter)
        .filter(p => !term || p.title.toLowerCase().includes(term))
        .sort((a, b) => Number(b.is_pinned) - Number(a.is_pinned) || b.created_at.localeCompare(a.created_at));

    return (
        <div className="space-y-6">
            <PageHeader title={title} description={description}>
                {publicPath && (
                    <Link href={publicPath} target="_blank"
                        className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-neutral-700">
                        <ExternalLink className="h-3.5 w-3.5" /> 사이트에서 보기
                    </Link>
                )}
                <PrimaryButton onClick={() => router.push(editPath)}>
                    <Plus className="h-3.5 w-3.5" /> 새 글 작성
                </PrimaryButton>
            </PageHeader>

            <div className="flex items-center gap-3 flex-wrap">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="제목 검색..."
                        className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border border-neutral-200 focus:border-neutral-400 focus:outline-none bg-white" />
                </div>
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                    className="rounded-lg border border-neutral-200 px-3.5 py-2.5 text-sm bg-white">
                    <option value="전체">전체 상태</option>
                    <option value="published">발행</option>
                    <option value="draft">임시</option>
                    <option value="hidden">숨김</option>
                </select>
                <span className="text-xs text-neutral-400 ml-auto">{filtered.length}건</span>
            </div>

            {error && <div className="rounded-lg bg-red-50 text-red-600 text-sm px-4 py-3">{error}</div>}

            {loading ? (
                <div className="flex justify-center py-20"><div className="h-6 w-6 border-2 border-neutral-300 border-t-neutral-800 rounded-full animate-spin" /></div>
            ) : (
                <div className="bg-white border border-neutral-100 rounded-xl overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-neutral-100 text-left bg-neutral-50/60">
                                <th className="px-5 py-3.5 text-xs font-medium text-neutral-500">이미지</th>
                                <th className="px-5 py-3.5 text-xs font-medium text-neutral-500">제목</th>
                                <th className="px-5 py-3.5 text-xs font-medium text-neutral-500">카테고리</th>
                                <th className="px-5 py-3.5 text-xs font-medium text-neutral-500">상태</th>
                                <th className="px-5 py-3.5 text-xs font-medium text-neutral-500">날짜</th>
                                <th className="px-5 py-3.5 text-xs font-medium text-neutral-500 text-right">조회</th>
                                <th className="px-5 py-3.5 text-xs font-medium text-neutral-500 text-right">관리</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100">
                            {filtered.map(p => (
                                <tr key={p.id} className="hover:bg-neutral-50/50">
                                    <td className="px-5 py-2.5">
                                        <div className="h-10 w-14 rounded bg-neutral-100 overflow-hidden">
                                            {p.represent_image && <img src={p.represent_image} alt="" className="h-full w-full object-cover" />}
                                        </div>
                                    </td>
                                    <td className="px-5 py-2.5">
                                        <div className="flex items-center gap-1.5">
                                            {p.is_pinned && <Pin className="h-3 w-3 text-amber-500 shrink-0" />}
                                            <span className="font-medium truncate max-w-[320px]">{p.title}</span>
                                        </div>
                                    </td>
                                    <td className="px-5 py-2.5 text-xs text-neutral-500">{p.category || "—"}</td>
                                    <td className="px-5 py-2.5">
                                        <span className={clsx("text-[10px] px-2.5 py-1 rounded-full font-medium", STATUS_BADGE[p.status])}>
                                            {STATUS_LABEL[p.status] ?? p.status}
                                        </span>
                                    </td>
                                    <td className="px-5 py-2.5 text-xs text-neutral-400">{p.created_at.substring(0, 10)}</td>
                                    <td className="px-5 py-2.5 text-right text-neutral-400">{p.view_count.toLocaleString()}</td>
                                    <td className="px-5 py-2.5 text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <button onClick={() => router.push(`${editPath}?id=${p.id}`)} title="수정"
                                                className="p-1.5 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg">
                                                <Pencil className="h-3.5 w-3.5" />
                                            </button>
                                            <button onClick={() => handleDelete(p.id)} title="삭제"
                                                className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filtered.length === 0 && <div className="px-6 py-16 text-center text-neutral-400 text-sm">글이 없습니다.</div>}
                </div>
            )}
        </div>
    );
}
