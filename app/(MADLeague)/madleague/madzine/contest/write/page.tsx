"use client";

/**
 * 공모전/프로젝트 소식 올리기 — 외부 기관·사람이 등록 (2026-10-16 사용자 결정: 운영진 확인 후 게시)
 * Ten:One ID 로그인 필요 (MADLeague 첫 이용 동의는 루트 BrandJoinGate) → /api/board/posts → 검토 게시판이라 'pending'
 * 화면에는 개인 이름 대신 입력한 주최·주관이 보인다 (extra_fields.organizer)
 * 채용·구인 공고는 받지 않는다 (직업소개사업 미신고 — 직업안정법)
 */
import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { LoginRequired } from "@/components/LoginRequired";
import { MZ_KICKER, MZ_RULE, MZ_SERIF } from "@/features/madleague/MadzineUI";
import { CONTEST_CATEGORY_OPTIONS } from "@/features/madleague/contest-categories";

const inputCls = "w-full bg-black border border-neutral-800 px-[14px] py-[10px] text-white outline-none transition focus:border-[#EC1D25] [color-scheme:dark]";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
/** 일반 텍스트 → 문단 HTML (줄바꿈 유지) */
const toHtml = (text: string) => text.trim().split(/\n{2,}/).map(p => `<p>${esc(p).replace(/\n/g, "<br>")}</p>`).join("");

export default function ContestWritePage() {
    const { isAuthenticated, isLoading } = useAuth();
    const [category, setCategory] = useState<string>(CONTEST_CATEGORY_OPTIONS[0]);
    const [title, setTitle] = useState("");
    const [organizer, setOrganizer] = useState("");
    const [deadline, setDeadline] = useState("");
    const [link, setLink] = useState("");
    const [body, setBody] = useState("");
    const [image, setImage] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [agree, setAgree] = useState(false);
    const [error, setError] = useState("");
    const [state, setState] = useState<"idle" | "sending" | "done">("idle");

    if (isLoading) return <div className="min-h-screen bg-black" />;
    if (!isAuthenticated) return <div className="min-h-screen bg-black"><LoginRequired accentColor="#EC1D25" /></div>;

    async function upload(file: File) {
        setUploading(true); setError("");
        const fd = new FormData();
        fd.append("file", file);
        fd.append("site", "madleague");
        const res = await fetch("/api/board/upload", { method: "POST", body: fd });
        const json = await res.json().catch(() => ({}));
        setUploading(false);
        if (!res.ok || !json.url) { setError(json.error ?? "이미지를 올리지 못했습니다."); return; }
        setImage(json.url);
    }

    async function submit(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        if (!title.trim() || !organizer.trim() || !body.trim()) { setError("제목·주최·내용을 입력해 주세요."); return; }
        if (link && !/^https?:\/\//.test(link.trim())) { setError("링크는 http:// 또는 https://로 시작해야 합니다."); return; }
        if (!agree) { setError("등록 안내를 확인해 주세요."); return; }
        setState("sending");
        const content = (image ? `<p><img src="${esc(image)}" alt=""></p>` : "") + toHtml(body);
        const res = await fetch("/api/board/posts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                site: "madleague", board: "contest", title: title.trim(), content, category,
                representImage: image ?? undefined,
                extraFields: { organizer: organizer.trim(), deadline, link: link.trim() },
            }),
        });
        if (!res.ok) {
            const j = await res.json().catch(() => ({}));
            setError(j.error ?? "등록하지 못했습니다. 잠시 후 다시 시도해 주세요.");
            setState("idle");
            return;
        }
        setState("done");
    }

    if (state === "done") {
        return (
            <div className="min-h-screen bg-black text-white">
                <div className="mx-auto max-w-xl px-6 py-40 text-center">
                    <h1 className={`text-3xl font-bold ${MZ_SERIF}`}>접수되었습니다</h1>
                    <p className="mt-4 text-neutral-400">운영진이 확인한 뒤 공모전/프로젝트 게시판에 올립니다.</p>
                    <Link href="/madleague/madzine/contest" className="mt-10 inline-block text-sm underline underline-offset-4 text-neutral-300 hover:text-white">목록으로</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white">
            <div className={`border-b ${MZ_RULE}`}>
                <div className={`mx-auto max-w-7xl px-6 py-4 ${MZ_KICKER} text-neutral-500`}>
                    <Link href="/madleague/madzine/contest" className="hover:text-white transition">공모전/프로젝트</Link>
                </div>
            </div>
            <form onSubmit={submit} className="mx-auto max-w-2xl px-6 pt-16 pb-32 space-y-8">
                <div>
                    <h1 className={`text-3xl sm:text-4xl font-bold ${MZ_SERIF}`}>소식 올리기</h1>
                    <p className="mt-4 text-neutral-400 leading-relaxed">
                        마케팅·광고 공모전, 대학생 대외활동·프로젝트 모집 소식을 올려 주세요. 운영진이 확인한 뒤 게시합니다.
                    </p>
                </div>

                <fieldset className="space-y-2">
                    <legend className="text-sm text-neutral-300 mb-2">분류</legend>
                    <div className="flex gap-6">
                        {CONTEST_CATEGORY_OPTIONS.map(c => (
                            <label key={c} className="flex items-center gap-2 text-sm">
                                <input type="radio" name="category" value={c} checked={category === c} onChange={() => setCategory(c)} /> {c}
                            </label>
                        ))}
                    </div>
                </fieldset>

                <label className="block space-y-2">
                    <span className="text-sm text-neutral-300">제목</span>
                    <input value={title} onChange={e => setTitle(e.target.value.slice(0, 120))} className={inputCls} placeholder="예: 2026 ○○ 대학생 광고 공모전 참가자 모집" />
                </label>
                <label className="block space-y-2">
                    <span className="text-sm text-neutral-300">주최·주관</span>
                    <input value={organizer} onChange={e => setOrganizer(e.target.value.slice(0, 60))} className={inputCls} placeholder="게시판에 작성자로 표시됩니다" />
                </label>
                <div className="grid gap-6 sm:grid-cols-2">
                    <label className="block space-y-2">
                        <span className="text-sm text-neutral-300">접수 마감 (선택)</span>
                        <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} className={inputCls} />
                    </label>
                    <label className="block space-y-2">
                        <span className="text-sm text-neutral-300">자세히 보기 링크 (선택)</span>
                        <input value={link} onChange={e => setLink(e.target.value.slice(0, 300))} className={inputCls} placeholder="https://" />
                    </label>
                </div>
                <div className="space-y-2">
                    <span className="block text-sm text-neutral-300">포스터 이미지 (선택)</span>
                    {image ? (
                        <div className="flex items-end gap-4">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={image} alt="" className="w-32 border border-neutral-800" />
                            <button type="button" onClick={() => setImage(null)} className="text-sm text-neutral-400 underline">빼기</button>
                        </div>
                    ) : (
                        <input type="file" accept="image/*" disabled={uploading}
                            onChange={e => { const f = e.target.files?.[0]; if (f) upload(f); }}
                            className="block text-sm text-neutral-400 file:mr-4 file:border file:border-neutral-700 file:bg-black file:px-4 file:py-2 file:text-white" />
                    )}
                    {uploading && <p className="text-xs text-neutral-500">올리는 중…</p>}
                </div>
                <label className="block space-y-2">
                    <span className="text-sm text-neutral-300">내용</span>
                    <textarea value={body} onChange={e => setBody(e.target.value.slice(0, 5000))} rows={12} className={inputCls}
                        placeholder={"모집 대상·기간·시상·참가 방법 등을 적어 주세요."} />
                </label>

                <label className="flex items-start gap-3 text-sm text-neutral-400 leading-relaxed">
                    <input type="checkbox" checked={agree} onChange={e => setAgree(e.target.checked)} className="mt-1" />
                    <span>
                        공모전·대외활동·프로젝트 소식만 올립니다. 채용·구인 공고, 광고성 상품 홍보, 개인 연락처는 게시되지 않습니다.
                        게시판에는 입력한 주최·주관이 작성자로 표시되고, 계정 이름은 보이지 않습니다.
                    </span>
                </label>

                {error && <p role="alert" className="text-sm text-[#EC1D25]">{error}</p>}
                <button type="submit" disabled={state === "sending" || uploading}
                    className="bg-[#EC1D25] hover:bg-[#d01820] px-8 py-4 font-bold text-white disabled:opacity-50">
                    {state === "sending" ? "보내는 중…" : "등록 요청"}
                </button>
            </form>
        </div>
    );
}
