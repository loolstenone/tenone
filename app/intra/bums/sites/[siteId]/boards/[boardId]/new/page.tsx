"use client";

import { use, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
type PostStatus = "draft" | "published" | "scheduled" | "private";
type EmploymentType = "정규" | "계약" | "인턴" | "프리랜서";
type BumsBoardPost = any;
import {
    ArrowLeft,
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


export default function PostEditorPage({ params }: { params: Promise<{ siteId: string; boardId: string }> }) {
    const { siteId, boardId } = use(params);
    const router = useRouter();
    const searchParams = useSearchParams();
    const postId = searchParams.get("postId");
    const board: any = null;
    const site: any = null;
    const existingPost: any = null;
    const addBoardPost = (_post: BumsBoardPost) => {};
    const updateBoardPost = (_id: string, _post: BumsBoardPost) => {};
    const isEditMode = !!existingPost;

    const [title, setTitle] = useState("");
    const [summary, setSummary] = useState("");
    const [body, setBody] = useState("");

    // 수정 모드: 기존 글 데이터 로드
    useEffect(() => {
        if (existingPost) {
            setTitle(existingPost.title);
            setSummary(existingPost.summary || "");
            setBody(existingPost.body);
            setStatus(existingPost.status);
            setCategoryId(existingPost.categoryId || "");
            setTagInput(existingPost.tags?.join(", ") || "");
            setIsPinned(existingPost.isPinned);
            setIsSecret(existingPost.isSecret);
            setIsRecommended(existingPost.isRecommended);
            setImage(existingPost.image || "");
            setScheduledAt(existingPost.scheduledAt || "");
            setOgTitle(existingPost.ogTitle || "");
            setOgDescription(existingPost.ogDescription || "");
            setOgImage(existingPost.ogImage || "");
            if (existingPost.position) setPosition(existingPost.position);
            if (existingPost.employmentType) setEmploymentType(existingPost.employmentType);
            if (existingPost.deadline) setDeadline(existingPost.deadline);
            if (existingPost.applyUrl) setApplyUrl(existingPost.applyUrl);
            if (existingPost.eventDate) setEventDate(existingPost.eventDate);
            if (existingPost.eventEndDate) setEventEndDate(existingPost.eventEndDate);
            if (existingPost.eventLocation) setEventLocation(existingPost.eventLocation);
            if (existingPost.capacity) setCapacity(existingPost.capacity);
            if (existingPost.fee) setFee(existingPost.fee);
            if (existingPost.videoUrl) setVideoUrl(existingPost.videoUrl);
            if (existingPost.videoDuration) setVideoDuration(existingPost.videoDuration);
        }
    }, [existingPost]);
    const [status, setStatus] = useState<PostStatus>("draft");
    const [categoryId, setCategoryId] = useState("");
    const [tagInput, setTagInput] = useState("");
    const [isPinned, setIsPinned] = useState(false);
    const [isSecret, setIsSecret] = useState(false);
    const [isRecommended, setIsRecommended] = useState(false);
    const [scheduledAt, setScheduledAt] = useState("");
    const [image, setImage] = useState("");

    // SEO fields
    const [ogTitle, setOgTitle] = useState("");
    const [ogDescription, setOgDescription] = useState("");
    const [ogImage, setOgImage] = useState("");

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

    const buildPostData = (postStatus: PostStatus): BumsBoardPost => {
        const now = new Date().toISOString().split("T")[0];
        const tags = tagInput.split(",").map(t => t.trim()).filter(Boolean);
        return {
            id: isEditMode ? existingPost!.id : `bp-${Date.now()}`,
            boardId,
            siteId,
            title: title.trim(),
            summary: summary.trim(),
            body,
            status: postStatus,
            categoryId: categoryId || undefined,
            isPinned,
            isRecommended,
            isSecret,
            authorId: isEditMode ? existingPost!.authorId : "staff-ceo",
            authorName: isEditMode ? existingPost!.authorName : "텐원",
            image: image || undefined,
            attachments: isEditMode ? existingPost!.attachments : [],
            tags,
            publishedAt: postStatus === "published" ? now : (isEditMode ? existingPost!.publishedAt : undefined),
            scheduledAt: postStatus === "scheduled" ? scheduledAt : undefined,
            viewCount: isEditMode ? existingPost!.viewCount : 0,
            commentCount: isEditMode ? existingPost!.commentCount : 0,
            ogTitle: ogTitle || undefined,
            ogDescription: ogDescription || undefined,
            ogImage: ogImage || undefined,
            ...(board.boardType === "recruit" && { position, employmentType, deadline, applyUrl }),
            ...(board.boardType === "event" && {
                eventDate, eventEndDate, eventLocation,
                capacity: typeof capacity === "number" ? capacity : undefined,
                fee: typeof fee === "number" ? fee : undefined,
                registrationStatus: "모집중" as const,
            }),
            ...(board.boardType === "video" && { videoUrl, videoDuration }),
            createdAt: isEditMode ? existingPost!.createdAt : now,
            updatedAt: now,
        };
    };

    const handlePublish = () => {
        if (!title.trim()) return;
        const post = buildPostData(status === "scheduled" ? "scheduled" : "published");
        if (isEditMode) {
            updateBoardPost(existingPost!.id, post);
        } else {
            addBoardPost(post);
        }
        router.push(`/intra/bums/sites/${siteId}/boards/${boardId}`);
    };

    const handleDraft = () => {
        if (!title.trim()) return;
        const post = buildPostData("draft");
        if (isEditMode) {
            updateBoardPost(existingPost!.id, post);
        } else {
            addBoardPost(post);
        }
        router.push(`/intra/bums/sites/${siteId}/boards/${boardId}`);
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
                <button onClick={() => router.push(`/intra/bums/sites/${siteId}/boards/${boardId}`)}
                    className="flex items-center gap-1 text-xs text-neutral-400 hover:text-neutral-900 mb-4 transition-colors">
                    <ArrowLeft className="h-3.5 w-3.5" /> {board.name}
                </button>
                <h2 className="text-2xl font-bold">{isEditMode ? "글 수정" : "글쓰기"}</h2>
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

                    {/* Rich Editor */}
                    <textarea value={body} onChange={e => setBody(e.target.value)} placeholder="내용을 작성하세요..."
                        rows={12} className={inputClass + " resize-y"} />

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
                        <div className="rounded-xl border border-neutral-100 bg-white shadow-sm p-5 space-y-4">
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

                    {/* 태그 + 대표이미지 — 에디터 바로 아래 */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="rounded-xl border border-neutral-100 bg-white shadow-sm p-5">
                            <h4 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">태그</h4>
                            <input value={tagInput} onChange={e => setTagInput(e.target.value)}
                                placeholder="쉼표로 구분 (예: AI, 마케팅, 브랜딩)"
                                className={inputClass} />
                            {tagInput && (
                                <div className="flex flex-wrap gap-1.5 mt-2">
                                    {tagInput.split(',').map(t => t.trim()).filter(Boolean).map(tag => (
                                        <span key={tag} className="text-xs px-2.5 py-1 bg-neutral-100 text-neutral-600 rounded-full">#{tag}</span>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="rounded-xl border border-neutral-100 bg-white shadow-sm p-5">
                            <h4 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">대표 이미지</h4>
                            <input value={image} onChange={e => setImage(e.target.value)} placeholder="이미지 URL" className={inputClass} />
                        </div>
                    </div>
                </div>

                {/* Side Panel — 발행 설정 + 옵션 + SEO */}
                <div className="space-y-4">
                    {/* Status */}
                    <div className="rounded-xl border border-neutral-100 bg-white shadow-sm p-5 space-y-3">
                        <h4 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">발행 설정</h4>
                        <div>
                            <label className={labelClass}>상태</label>
                            <select value={status} onChange={e => setStatus(e.target.value as PostStatus)}
                                className={inputClass + " rounded-lg"}>
                                {statusOptions.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                            </select>
                        </div>
                        {status === "scheduled" && (
                            <div>
                                <label className={labelClass}>예약 일시</label>
                                <input type="datetime-local" value={scheduledAt}
                                    onChange={e => setScheduledAt(e.target.value)}
                                    className={inputClass + " rounded-lg"} />
                            </div>
                        )}
                    </div>

                    {/* Category */}
                    {board.categories.length > 0 && (
                        <div className="rounded-xl border border-neutral-100 bg-white shadow-sm p-5 space-y-3">
                            <h4 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">카테고리</h4>
                            <select value={categoryId} onChange={e => setCategoryId(e.target.value)}
                                className={inputClass + " rounded-lg"}>
                                <option value="">선택 안함</option>
                                {board.categories.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Toggles */}
                    <div className="rounded-xl border border-neutral-100 bg-white shadow-sm p-5 space-y-3">
                        <h4 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">옵션</h4>
                        <Toggle checked={isPinned} onChange={setIsPinned} label="고정글" icon={Pin} />
                        <Toggle checked={isSecret} onChange={setIsSecret} label="비밀글" icon={Lock} />
                        <Toggle checked={isRecommended} onChange={setIsRecommended} label="추천" icon={Star} />
                    </div>

                    {/* SEO — 접기 가능 */}
                    <details className="rounded-xl border border-neutral-100 bg-white shadow-sm">
                        <summary className="p-5 text-xs font-semibold text-neutral-500 uppercase tracking-wider cursor-pointer hover:text-neutral-700">SEO / OG</summary>
                        <div className="px-5 pb-5 space-y-3">
                            <div>
                                <label className={labelClass}>OG Title</label>
                                <input value={ogTitle} onChange={e => setOgTitle(e.target.value)}
                                    placeholder={title || "비우면 제목 사용"} className={inputClass + " rounded-lg"} />
                            </div>
                            <div>
                                <label className={labelClass}>OG Description</label>
                                <textarea value={ogDescription} onChange={e => setOgDescription(e.target.value)}
                                    placeholder={summary || "비우면 요약 사용"}
                                    rows={2} className={inputClass + " rounded-lg resize-y"} />
                            </div>
                            <div>
                                <label className={labelClass}>OG Image URL</label>
                                <input value={ogImage} onChange={e => setOgImage(e.target.value)}
                                    placeholder="비우면 대표 이미지 사용" className={inputClass + " rounded-lg"} />
                            </div>
                        </div>
                    </details>

                    {/* Action buttons */}
                    <div className="space-y-2">
                        <button onClick={handlePublish}
                            className="w-full bg-neutral-900 text-white py-3 text-sm font-medium rounded-lg hover:bg-neutral-800 transition-all shadow-sm">
                            {isEditMode ? "수정 완료" : "발행"}
                        </button>
                        <button onClick={handleDraft}
                            className="w-full border border-neutral-200 py-3 text-sm rounded-lg hover:bg-neutral-50 transition-all">
                            임시저장
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
