"use client";

import { use, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useCms } from "@/lib/cms-context";
import type { CmsBoardPost, PostStatus, EmploymentType } from "@/types/cms";
import {
    ArrowLeft, Bold, Italic, Underline, Heading1, Heading2, Heading3,
    Link2, ImagePlus, Video, Code, Quote, Table, Minus,
    Pin, Lock, Star, Calendar,
} from "lucide-react";
import clsx from "clsx";

const inputClass = "w-full border border-neutral-200 px-4 py-2.5 text-sm focus:border-neutral-900 focus:outline-none bg-white";
const labelClass = "text-xs font-medium text-neutral-500 uppercase tracking-wider block mb-1.5";

const statusOptions: { value: PostStatus; label: string }[] = [
    { value: "draft", label: "임시저장" },
    { value: "published", label: "발행" },
    { value: "scheduled", label: "예약 발행" },
    { value: "private", label: "비공개" },
];

const employmentTypes: EmploymentType[] = ['정규', '계약', '인턴', '프리랜서'];

function ToolbarBtn({ icon: Icon, label, onClick }: { icon: React.ComponentType<{ className?: string }>; label: string; onClick: () => void }) {
    return (
        <button type="button" onClick={onClick} title={label}
            className="p-1.5 rounded hover:bg-neutral-200 transition-colors">
            <Icon className="h-4 w-4" />
        </button>
    );
}

export default function PostEditorPage({ params }: { params: Promise<{ siteId: string; boardId: string }> }) {
    const { siteId, boardId } = use(params);
    const router = useRouter();
    const { getBoardById, getSiteById, addBoardPost } = useCms();

    const board = getBoardById(boardId);
    const site = getSiteById(siteId);
    const bodyRef = useRef<HTMLTextAreaElement>(null);

    const [title, setTitle] = useState("");
    const [summary, setSummary] = useState("");
    const [body, setBody] = useState("");
    const [status, setStatus] = useState<PostStatus>("draft");
    const [categoryId, setCategoryId] = useState("");
    const [tagInput, setTagInput] = useState("");
    const [isPinned, setIsPinned] = useState(false);
    const [isSecret, setIsSecret] = useState(false);
    const [isRecommended, setIsRecommended] = useState(false);
    const [scheduledAt, setScheduledAt] = useState("");
    const [image, setImage] = useState("");

    // Recruit fields
    const [position, setPosition] = useState("");
    const [employmentType, setEmploymentType] = useState<EmploymentType>("정규");
    const [deadline, setDeadline] = useState("");
    const [applyUrl, setApplyUrl] = useState("");

    // Event fields
    const [eventDate, setEventDate] = useState("");
    const [eventEndDate, setEventEndDate] = useState("");
    const [eventLocation, setEventLocation] = useState("");
    const [capacity, setCapacity] = useState<number | "">("");
    const [fee, setFee] = useState<number | "">("");

    // Video fields
    const [videoUrl, setVideoUrl] = useState("");
    const [videoDuration, setVideoDuration] = useState("");

    if (!board || !site) {
        return (
            <div className="flex items-center justify-center py-20 text-neutral-400">
                게시판을 찾을 수 없습니다
            </div>
        );
    }

    const insertAtCursor = (text: string) => {
        const el = bodyRef.current;
        if (!el) return;
        const start = el.selectionStart;
        const end = el.selectionEnd;
        const newBody = body.slice(0, start) + text + body.slice(end);
        setBody(newBody);
        setTimeout(() => {
            el.focus();
            el.selectionStart = el.selectionEnd = start + text.length;
        }, 0);
    };

    const wrapSelection = (before: string, after: string) => {
        const el = bodyRef.current;
        if (!el) return;
        const start = el.selectionStart;
        const end = el.selectionEnd;
        const selected = body.slice(start, end);
        const newBody = body.slice(0, start) + before + selected + after + body.slice(end);
        setBody(newBody);
        setTimeout(() => {
            el.focus();
            el.selectionStart = start + before.length;
            el.selectionEnd = start + before.length + selected.length;
        }, 0);
    };

    const handlePublish = () => {
        if (!title.trim()) return;
        const now = new Date().toISOString().split("T")[0];
        const tags = tagInput.split(",").map(t => t.trim()).filter(Boolean);
        const post: CmsBoardPost = {
            id: `bp-${Date.now()}`,
            boardId,
            siteId,
            title: title.trim(),
            summary: summary.trim(),
            body,
            status: "published",
            categoryId: categoryId || undefined,
            isPinned,
            isRecommended,
            isSecret,
            authorId: "staff-ceo",
            authorName: "텐원",
            image: image || undefined,
            attachments: [],
            tags,
            publishedAt: now,
            scheduledAt: status === "scheduled" ? scheduledAt : undefined,
            viewCount: 0,
            commentCount: 0,
            // Type-specific fields
            ...(board.boardType === "recruit" && { position, employmentType, deadline, applyUrl }),
            ...(board.boardType === "event" && {
                eventDate, eventEndDate, eventLocation,
                capacity: typeof capacity === "number" ? capacity : undefined,
                fee: typeof fee === "number" ? fee : undefined,
                registrationStatus: "모집중" as const,
            }),
            ...(board.boardType === "video" && { videoUrl, videoDuration }),
            createdAt: now,
            updatedAt: now,
        };
        addBoardPost(post);
        router.push(`/intra/cms/sites/${siteId}/boards/${boardId}`);
    };

    const handleDraft = () => {
        if (!title.trim()) return;
        const now = new Date().toISOString().split("T")[0];
        const tags = tagInput.split(",").map(t => t.trim()).filter(Boolean);
        const post: CmsBoardPost = {
            id: `bp-${Date.now()}`,
            boardId,
            siteId,
            title: title.trim(),
            summary: summary.trim(),
            body,
            status: "draft",
            categoryId: categoryId || undefined,
            isPinned,
            isRecommended,
            isSecret,
            authorId: "staff-ceo",
            authorName: "텐원",
            image: image || undefined,
            attachments: [],
            tags,
            viewCount: 0,
            commentCount: 0,
            createdAt: now,
            updatedAt: now,
        };
        addBoardPost(post);
        router.push(`/intra/cms/sites/${siteId}/boards/${boardId}`);
    };

    const Toggle = ({ checked, onChange, label, icon: Icon }: { checked: boolean; onChange: (v: boolean) => void; label: string; icon: React.ComponentType<{ className?: string }> }) => (
        <label className="flex items-center gap-2 cursor-pointer">
            <button type="button" onClick={() => onChange(!checked)}
                className={clsx(
                    "relative w-8 h-4.5 rounded-full transition-colors",
                    checked ? "bg-neutral-900" : "bg-neutral-200"
                )}>
                <span className={clsx(
                    "absolute top-0.5 left-0.5 h-3.5 w-3.5 rounded-full bg-white transition-transform",
                    checked && "translate-x-3.5"
                )} />
            </button>
            <Icon className={clsx("h-3.5 w-3.5", checked ? "text-neutral-900" : "text-neutral-400")} />
            <span className="text-xs text-neutral-600">{label}</span>
        </label>
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <button onClick={() => router.push(`/intra/cms/sites/${siteId}/boards/${boardId}`)}
                    className="flex items-center gap-1 text-xs text-neutral-400 hover:text-neutral-900 mb-4 transition-colors">
                    <ArrowLeft className="h-3.5 w-3.5" /> {board.name}
                </button>
                <h2 className="text-2xl font-bold">글쓰기</h2>
                <p className="mt-1 text-sm text-neutral-500">{site.name} &middot; {board.name}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
                {/* Main Editor */}
                <div className="space-y-4">
                    <input value={title} onChange={e => setTitle(e.target.value)}
                        placeholder="제목을 입력하세요"
                        className="w-full border border-neutral-200 px-5 py-3 text-lg font-semibold focus:border-neutral-900 focus:outline-none bg-white" />

                    <input value={summary} onChange={e => setSummary(e.target.value)}
                        placeholder="요약 (선택)"
                        className={inputClass} />

                    {/* Toolbar */}
                    <div className="flex items-center gap-0.5 border border-neutral-200 bg-white px-2 py-1 flex-wrap">
                        <ToolbarBtn icon={Bold} label="굵게" onClick={() => wrapSelection("**", "**")} />
                        <ToolbarBtn icon={Italic} label="기울임" onClick={() => wrapSelection("*", "*")} />
                        <ToolbarBtn icon={Underline} label="밑줄" onClick={() => wrapSelection("<u>", "</u>")} />
                        <span className="w-px h-5 bg-neutral-200 mx-1" />
                        <ToolbarBtn icon={Heading1} label="제목1" onClick={() => insertAtCursor("\n# ")} />
                        <ToolbarBtn icon={Heading2} label="제목2" onClick={() => insertAtCursor("\n## ")} />
                        <ToolbarBtn icon={Heading3} label="제목3" onClick={() => insertAtCursor("\n### ")} />
                        <span className="w-px h-5 bg-neutral-200 mx-1" />
                        <ToolbarBtn icon={Link2} label="링크" onClick={() => insertAtCursor("[텍스트](url)")} />
                        <ToolbarBtn icon={ImagePlus} label="이미지" onClick={() => insertAtCursor("![설명](image-url)")} />
                        <ToolbarBtn icon={Video} label="영상" onClick={() => insertAtCursor("[영상](video-url)")} />
                        <span className="w-px h-5 bg-neutral-200 mx-1" />
                        <ToolbarBtn icon={Code} label="코드" onClick={() => wrapSelection("`", "`")} />
                        <ToolbarBtn icon={Quote} label="인용" onClick={() => insertAtCursor("\n> ")} />
                        <ToolbarBtn icon={Table} label="표" onClick={() => insertAtCursor("\n| 열1 | 열2 |\n|---|---|\n| 내용 | 내용 |\n")} />
                        <ToolbarBtn icon={Minus} label="구분선" onClick={() => insertAtCursor("\n---\n")} />
                    </div>

                    {/* Body */}
                    <textarea ref={bodyRef} value={body} onChange={e => setBody(e.target.value)}
                        placeholder="내용을 작성하세요 (Markdown 지원)"
                        rows={20}
                        className="w-full border border-neutral-200 px-5 py-4 text-sm focus:border-neutral-900 focus:outline-none bg-white resize-y font-mono" />

                    {/* Board type specific fields */}
                    {board.boardType === "recruit" && (
                        <div className="border border-neutral-200 bg-white p-5 space-y-4">
                            <h3 className="text-sm font-semibold">채용 정보</h3>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <label className={labelClass}>포지션</label>
                                    <input value={position} onChange={e => setPosition(e.target.value)}
                                        placeholder="예: 마케팅 매니저" className={inputClass} />
                                </div>
                                <div>
                                    <label className={labelClass}>고용 형태</label>
                                    <select value={employmentType}
                                        onChange={e => setEmploymentType(e.target.value as EmploymentType)}
                                        className={inputClass}>
                                        {employmentTypes.map(et => <option key={et} value={et}>{et}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className={labelClass}>마감일</label>
                                    <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)}
                                        className={inputClass} />
                                </div>
                                <div>
                                    <label className={labelClass}>지원 URL</label>
                                    <input value={applyUrl} onChange={e => setApplyUrl(e.target.value)}
                                        placeholder="https://" className={inputClass} />
                                </div>
                            </div>
                        </div>
                    )}

                    {board.boardType === "event" && (
                        <div className="border border-neutral-200 bg-white p-5 space-y-4">
                            <h3 className="text-sm font-semibold">이벤트 정보</h3>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <label className={labelClass}>시작일시</label>
                                    <input type="datetime-local" value={eventDate} onChange={e => setEventDate(e.target.value)}
                                        className={inputClass} />
                                </div>
                                <div>
                                    <label className={labelClass}>종료일시</label>
                                    <input type="datetime-local" value={eventEndDate} onChange={e => setEventEndDate(e.target.value)}
                                        className={inputClass} />
                                </div>
                                <div>
                                    <label className={labelClass}>장소</label>
                                    <input value={eventLocation} onChange={e => setEventLocation(e.target.value)}
                                        placeholder="이벤트 장소" className={inputClass} />
                                </div>
                                <div>
                                    <label className={labelClass}>모집 인원</label>
                                    <input type="number" value={capacity} onChange={e => setCapacity(e.target.value ? parseInt(e.target.value) : "")}
                                        placeholder="0 = 무제한" className={inputClass} />
                                </div>
                                <div>
                                    <label className={labelClass}>참가비 (원)</label>
                                    <input type="number" value={fee} onChange={e => setFee(e.target.value ? parseInt(e.target.value) : "")}
                                        placeholder="0 = 무료" className={inputClass} />
                                </div>
                            </div>
                        </div>
                    )}

                    {board.boardType === "video" && (
                        <div className="border border-neutral-200 bg-white p-5 space-y-4">
                            <h3 className="text-sm font-semibold">영상 정보</h3>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <label className={labelClass}>영상 URL</label>
                                    <input value={videoUrl} onChange={e => setVideoUrl(e.target.value)}
                                        placeholder="YouTube / Vimeo URL" className={inputClass} />
                                </div>
                                <div>
                                    <label className={labelClass}>재생 시간</label>
                                    <input value={videoDuration} onChange={e => setVideoDuration(e.target.value)}
                                        placeholder="예: 3:45" className={inputClass} />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Side Panel */}
                <div className="space-y-4">
                    {/* Status */}
                    <div className="border border-neutral-200 bg-white p-4 space-y-3">
                        <h4 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">발행 설정</h4>
                        <div>
                            <label className={labelClass}>상태</label>
                            <select value={status} onChange={e => setStatus(e.target.value as PostStatus)}
                                className={inputClass}>
                                {statusOptions.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                            </select>
                        </div>
                        {status === "scheduled" && (
                            <div>
                                <label className={labelClass}>예약 일시</label>
                                <input type="datetime-local" value={scheduledAt}
                                    onChange={e => setScheduledAt(e.target.value)}
                                    className={inputClass} />
                            </div>
                        )}
                    </div>

                    {/* Category */}
                    {board.categories.length > 0 && (
                        <div className="border border-neutral-200 bg-white p-4 space-y-3">
                            <h4 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">카테고리</h4>
                            <select value={categoryId} onChange={e => setCategoryId(e.target.value)}
                                className={inputClass}>
                                <option value="">선택 안함</option>
                                {board.categories.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Tags */}
                    <div className="border border-neutral-200 bg-white p-4 space-y-3">
                        <h4 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">태그</h4>
                        <input value={tagInput} onChange={e => setTagInput(e.target.value)}
                            placeholder="쉼표로 구분 (예: AI, 마케팅)"
                            className={inputClass} />
                    </div>

                    {/* Featured Image */}
                    <div className="border border-neutral-200 bg-white p-4 space-y-3">
                        <h4 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">대표 이미지</h4>
                        <input value={image} onChange={e => setImage(e.target.value)}
                            placeholder="이미지 URL"
                            className={inputClass} />
                    </div>

                    {/* Toggles */}
                    <div className="border border-neutral-200 bg-white p-4 space-y-3">
                        <h4 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">옵션</h4>
                        <Toggle checked={isPinned} onChange={setIsPinned} label="고정글" icon={Pin} />
                        <Toggle checked={isSecret} onChange={setIsSecret} label="비밀글" icon={Lock} />
                        <Toggle checked={isRecommended} onChange={setIsRecommended} label="추천" icon={Star} />
                    </div>

                    {/* Action buttons */}
                    <div className="space-y-2">
                        <button onClick={handlePublish}
                            className="w-full bg-neutral-900 text-white py-2.5 text-sm font-medium hover:bg-neutral-800 transition-colors">
                            발행
                        </button>
                        <button onClick={handleDraft}
                            className="w-full border border-neutral-200 py-2.5 text-sm hover:bg-neutral-50 transition-colors">
                            임시저장
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
