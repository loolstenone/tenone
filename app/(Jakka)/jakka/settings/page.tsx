"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, X, Loader2, Check } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { currentLoginHref } from "@/lib/login-href";
import {
    getMyCreatorProfile, updateCreatorProfile, isHandleAvailable,
    type JakkaCreator, type EducationItem, type CareerItem,
} from "@/lib/supabase/jakka";

const STATUS_OPTIONS = ["재학 중", "졸업", "재직 중", "프리랜서", "취업 준비 중", "구직 중", "휴학 중", "활동 중단"];
const FIELD_OPTIONS = [
    "그래픽 디자인", "브랜딩/편집", "UI/UX", "영상/모션", "일러스트",
    "AI 아트", "캐릭터 디자인", "제품/패키지", "포토그래피", "타이포그래피",
    "파인아트", "공예", "글/소설", "카피/광고", "기타",
];
const YEAR_LEVEL_OPTIONS = [
    "고1", "고2", "고3", "대학교 1학년", "대학교 2학년", "대학교 3학년", "대학교 4학년",
    "석사 1년차", "석사 2년차", "박사과정", "졸업", "경력 1~3년", "경력 3~5년", "경력 5~10년", "경력 10년↑",
];
const DEGREE_OPTIONS = ["고등학교 졸업", "전문학사", "학사", "석사", "박사", "수료", "재학중", "중퇴"];

function SectionLabel({ children }: { children: React.ReactNode }) {
    return (
        <p className="text-[10px] font-mono text-neutral-500 tracking-[0.2em] uppercase mb-3">{children}</p>
    );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div>
            <p className="text-[11px] font-mono text-neutral-500 tracking-widest uppercase mb-1.5">{label}</p>
            {children}
        </div>
    );
}

const inputCls = "w-full border border-neutral-300 px-3 py-2.5 text-[14px] text-neutral-900 placeholder:text-neutral-500 focus:outline-none focus:border-neutral-900 transition-colors bg-white";
const selectCls = `${inputCls} appearance-none`;

export default function JakkaSettingsPage() {
    const router = useRouter();
    const { user, isAuthenticated, isLoading: authLoading } = useAuth();

    const [creator, setCreator] = useState<JakkaCreator | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // 기본 정보
    const [displayName, setDisplayName] = useState("");
    const [handle, setHandle] = useState("");
    const [handleAvailable, setHandleAvailable] = useState<boolean | null>(null);
    const [checkingHandle, setCheckingHandle] = useState(false);
    const [status, setStatus] = useState("");
    const [field, setField] = useState("");
    const [yearLevel, setYearLevel] = useState("");
    const [school, setSchool] = useState("");
    const [statement, setStatement] = useState("");
    const [bio, setBio] = useState("");
    const [tagInput, setTagInput] = useState("");

    // 학력
    const [education, setEducation] = useState<EducationItem[]>([]);

    // 경력
    const [career, setCareer] = useState<CareerItem[]>([]);

    // 링크
    const [links, setLinks] = useState<{ label: string; url: string }[]>([]);

    useEffect(() => {
        if (authLoading) return;
        if (!isAuthenticated || !user) { router.push(currentLoginHref()); return; }
        load();
    }, [authLoading, isAuthenticated, user]);

    async function load() {
        if (!user) return;
        const c = await getMyCreatorProfile(user.authId ?? user.id);
        if (!c) { router.push("/jakka/profile"); return; }
        setCreator(c);
        setDisplayName(c.display_name);
        setHandle(c.handle);
        setStatus(c.status ?? "");
        setField(c.field ?? "");
        setYearLevel(c.year_level ?? "");
        setSchool(c.school ?? "");
        setStatement(c.statement ?? "");
        setBio(c.bio ?? "");
        setTagInput(c.tags.join(", "));
        setEducation(c.education ?? []);
        setCareer(c.career ?? []);
        setLinks(c.links ?? []);
        setLoading(false);
    }

    async function checkHandle(h: string) {
        if (!user || h === creator?.handle) { setHandleAvailable(null); return; }
        setCheckingHandle(true);
        const ok = await isHandleAvailable(h, user.authId ?? user.id);
        setHandleAvailable(ok);
        setCheckingHandle(false);
    }

    async function handleSave() {
        if (!user || !creator || saving) return;
        if (handleAvailable === false) { setError("이미 사용 중인 핸들입니다."); return; }
        setSaving(true);
        setError(null);

        const tags = tagInput.split(",").map((t) => t.trim().replace(/^#/, "")).filter(Boolean).slice(0, 10);

        const updated = await updateCreatorProfile(user.authId ?? user.id, {
            display_name: displayName.trim(),
            handle: handle.startsWith("@") ? handle : `@${handle}`,
            status,
            field: field || null,
            year_level: yearLevel || null,
            school: school.trim() || null,
            statement: statement.trim() || null,
            bio: bio.trim() || null,
            tags,
            education,
            career,
            links,
        });

        setSaving(false);
        if (!updated) { setError("저장에 실패했습니다. 다시 시도해 주세요."); return; }
        setCreator(updated);
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
    }

    // ── 학력 헬퍼
    function addEdu() {
        setEducation((prev) => [...prev, { school: "", major: "", degree: "학사", from_year: "", to_year: null, is_current: false }]);
    }
    function removeEdu(i: number) { setEducation((prev) => prev.filter((_, idx) => idx !== i)); }
    function updateEdu<K extends keyof EducationItem>(i: number, key: K, val: EducationItem[K]) {
        setEducation((prev) => prev.map((e, idx) => idx === i ? { ...e, [key]: val } : e));
    }

    // ── 경력 헬퍼
    function addCareer() {
        setCareer((prev) => [...prev, { company: "", role: "", from_year: "", to_year: null, is_current: false, description: "" }]);
    }
    function removeCareer(i: number) { setCareer((prev) => prev.filter((_, idx) => idx !== i)); }
    function updateCareer<K extends keyof CareerItem>(i: number, key: K, val: CareerItem[K]) {
        setCareer((prev) => prev.map((c, idx) => idx === i ? { ...c, [key]: val } : c));
    }

    // ── 링크 헬퍼
    function addLink() { setLinks((prev) => [...prev, { label: "", url: "" }]); }
    function removeLink(i: number) { setLinks((prev) => prev.filter((_, idx) => idx !== i)); }
    function updateLink(i: number, key: "label" | "url", val: string) {
        setLinks((prev) => prev.map((l, idx) => idx === i ? { ...l, [key]: val } : l));
    }

    if (authLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-neutral-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white pb-16">
            {/* Header */}
            <div className="sticky top-0 z-20 bg-white border-b border-neutral-100 px-4 h-[52px] flex items-center justify-between">
                <Link href="/jakka/profile" className="flex items-center gap-1.5 text-[13px] text-neutral-600 hover:text-neutral-900 transition-colors">
                    <ArrowLeft className="h-4 w-4" />
                    프로필
                </Link>
                <span className="text-[14px] font-semibold">프로필 설정</span>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-1.5 text-[13px] font-semibold text-neutral-900 disabled:opacity-40 hover:opacity-70 transition-opacity"
                >
                    {saving ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : saved ? (
                        <><Check className="h-4 w-4 text-green-600" /><span className="text-green-600">저장됨</span></>
                    ) : "저장"}
                </button>
            </div>

            {error && (
                <div className="mx-4 mt-4 px-4 py-3 bg-red-50 border border-red-200 text-[13px] text-red-600">
                    {error}
                </div>
            )}

            <div className="max-w-[600px] mx-auto px-4 pt-6 space-y-8">

                {/* ── 기본 정보 ── */}
                <section>
                    <SectionLabel>기본 정보</SectionLabel>
                    <div className="space-y-4">
                        <Field label="이름">
                            <input
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                maxLength={30}
                                placeholder="표시될 이름"
                                className={inputCls}
                            />
                        </Field>

                        <Field label="핸들">
                            <input
                                value={handle}
                                onChange={(e) => {
                                    const v = e.target.value.startsWith("@") ? e.target.value : `@${e.target.value}`;
                                    setHandle(v);
                                    setHandleAvailable(null);
                                }}
                                onBlur={() => checkHandle(handle)}
                                className={inputCls}
                            />
                            {checkingHandle && <p className="text-[11px] text-neutral-500 mt-1">확인 중...</p>}
                            {handleAvailable === true && <p className="text-[11px] text-green-600 mt-1">사용 가능합니다.</p>}
                            {handleAvailable === false && <p className="text-[11px] text-red-500 mt-1">이미 사용 중인 핸들입니다.</p>}
                        </Field>

                        <Field label="상태">
                            <select value={status} onChange={(e) => setStatus(e.target.value)} className={selectCls}>
                                <option value="">선택</option>
                                {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </Field>

                        <Field label="한 줄 소개">
                            <input
                                value={statement}
                                onChange={(e) => setStatement(e.target.value)}
                                placeholder="나를 한 문장으로 표현한다면"
                                maxLength={80}
                                className={inputCls}
                            />
                            <p className="text-[11px] text-neutral-600 mt-1 text-right">{statement.length}/80</p>
                        </Field>

                        <Field label="소개">
                            <textarea
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                placeholder="더 자세한 자기소개"
                                rows={3}
                                maxLength={300}
                                className={`${inputCls} resize-none leading-relaxed`}
                            />
                            <p className="text-[11px] text-neutral-600 mt-1 text-right">{bio.length}/300</p>
                        </Field>
                    </div>
                </section>

                {/* ── 분야 & 기술 ── */}
                <section>
                    <SectionLabel>분야 & 기술</SectionLabel>
                    <div className="space-y-4">
                        <Field label="분야">
                            <select value={field} onChange={(e) => setField(e.target.value)} className={selectCls}>
                                <option value="">선택</option>
                                {FIELD_OPTIONS.map((f) => <option key={f} value={f}>{f}</option>)}
                            </select>
                        </Field>

                        <Field label="연차/학년">
                            <select value={yearLevel} onChange={(e) => setYearLevel(e.target.value)} className={selectCls}>
                                <option value="">선택</option>
                                {YEAR_LEVEL_OPTIONS.map((y) => <option key={y} value={y}>{y}</option>)}
                            </select>
                        </Field>

                        <Field label="소속 학교/회사">
                            <input
                                value={school}
                                onChange={(e) => setSchool(e.target.value)}
                                placeholder="홍익대학교, 카카오 등"
                                maxLength={50}
                                className={inputCls}
                            />
                        </Field>

                        <Field label="태그 (최대 10개)">
                            <input
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                placeholder="일러스트, 캐릭터, 귀여움"
                                className={inputCls}
                            />
                            <p className="text-[11px] text-neutral-600 mt-1">쉼표(,)로 구분</p>
                            {tagInput.length > 0 && (
                                <div className="flex gap-1.5 flex-wrap mt-2">
                                    {tagInput.split(",").map((t) => t.trim().replace(/^#/, "")).filter(Boolean).slice(0, 10).map((t) => (
                                        <span key={t} className="text-[11px] text-neutral-600 bg-neutral-100 px-2 py-0.5">#{t}</span>
                                    ))}
                                </div>
                            )}
                        </Field>
                    </div>
                </section>

                {/* ── 학력 ── */}
                <section>
                    <div className="flex items-center justify-between mb-3">
                        <SectionLabel>학력</SectionLabel>
                        <button
                            onClick={addEdu}
                            className="flex items-center gap-1 text-[12px] text-neutral-700 hover:text-neutral-900 transition-colors"
                        >
                            <Plus className="h-3.5 w-3.5" />
                            추가
                        </button>
                    </div>

                    {education.length === 0 && (
                        <p className="text-[13px] text-neutral-600 text-center py-4 border border-dashed border-neutral-300">
                            학력을 추가해 주세요
                        </p>
                    )}

                    <div className="space-y-4">
                        {education.map((edu, i) => (
                            <div key={i} className="border border-neutral-300 p-4 relative">
                                <button
                                    onClick={() => removeEdu(i)}
                                    className="absolute top-3 right-3 text-neutral-600 hover:text-neutral-700 transition-colors"
                                >
                                    <X className="h-4 w-4" />
                                </button>

                                <div className="grid grid-cols-2 gap-3 pr-6">
                                    <div className="col-span-2">
                                        <p className="text-[10px] font-mono text-neutral-500 mb-1">학교명</p>
                                        <input
                                            value={edu.school}
                                            onChange={(e) => updateEdu(i, "school", e.target.value)}
                                            placeholder="홍익대학교"
                                            className={inputCls}
                                        />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-mono text-neutral-500 mb-1">전공</p>
                                        <input
                                            value={edu.major}
                                            onChange={(e) => updateEdu(i, "major", e.target.value)}
                                            placeholder="시각디자인학과"
                                            className={inputCls}
                                        />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-mono text-neutral-500 mb-1">학위</p>
                                        <select
                                            value={edu.degree}
                                            onChange={(e) => updateEdu(i, "degree", e.target.value)}
                                            className={selectCls}
                                        >
                                            {DEGREE_OPTIONS.map((d) => <option key={d} value={d}>{d}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-mono text-neutral-500 mb-1">입학년도</p>
                                        <input
                                            value={edu.from_year}
                                            onChange={(e) => updateEdu(i, "from_year", e.target.value)}
                                            placeholder="2020"
                                            maxLength={4}
                                            className={inputCls}
                                        />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-mono text-neutral-500 mb-1">졸업년도</p>
                                        <input
                                            value={edu.to_year ?? ""}
                                            onChange={(e) => updateEdu(i, "to_year", e.target.value || null)}
                                            placeholder={edu.is_current ? "재학중" : "2024"}
                                            disabled={edu.is_current}
                                            maxLength={4}
                                            className={`${inputCls} disabled:bg-neutral-50 disabled:text-neutral-600`}
                                        />
                                    </div>
                                </div>

                                <label className="flex items-center gap-2 mt-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={edu.is_current}
                                        onChange={(e) => {
                                            updateEdu(i, "is_current", e.target.checked);
                                            if (e.target.checked) updateEdu(i, "to_year", null);
                                        }}
                                        className="w-4 h-4 accent-neutral-900"
                                    />
                                    <span className="text-[12px] text-neutral-700">현재 재학중</span>
                                </label>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ── 경력 ── */}
                <section>
                    <div className="flex items-center justify-between mb-3">
                        <SectionLabel>경력</SectionLabel>
                        <button
                            onClick={addCareer}
                            className="flex items-center gap-1 text-[12px] text-neutral-700 hover:text-neutral-900 transition-colors"
                        >
                            <Plus className="h-3.5 w-3.5" />
                            추가
                        </button>
                    </div>

                    {career.length === 0 && (
                        <p className="text-[13px] text-neutral-600 text-center py-4 border border-dashed border-neutral-300">
                            경력을 추가해 주세요
                        </p>
                    )}

                    <div className="space-y-4">
                        {career.map((c, i) => (
                            <div key={i} className="border border-neutral-300 p-4 relative">
                                <button
                                    onClick={() => removeCareer(i)}
                                    className="absolute top-3 right-3 text-neutral-600 hover:text-neutral-700 transition-colors"
                                >
                                    <X className="h-4 w-4" />
                                </button>

                                <div className="grid grid-cols-2 gap-3 pr-6">
                                    <div>
                                        <p className="text-[10px] font-mono text-neutral-500 mb-1">회사/기관</p>
                                        <input
                                            value={c.company}
                                            onChange={(e) => updateCareer(i, "company", e.target.value)}
                                            placeholder="카카오"
                                            className={inputCls}
                                        />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-mono text-neutral-500 mb-1">직무/역할</p>
                                        <input
                                            value={c.role}
                                            onChange={(e) => updateCareer(i, "role", e.target.value)}
                                            placeholder="UX 디자이너"
                                            className={inputCls}
                                        />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-mono text-neutral-500 mb-1">시작년도</p>
                                        <input
                                            value={c.from_year}
                                            onChange={(e) => updateCareer(i, "from_year", e.target.value)}
                                            placeholder="2021"
                                            maxLength={4}
                                            className={inputCls}
                                        />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-mono text-neutral-500 mb-1">종료년도</p>
                                        <input
                                            value={c.to_year ?? ""}
                                            onChange={(e) => updateCareer(i, "to_year", e.target.value || null)}
                                            placeholder={c.is_current ? "재직중" : "2024"}
                                            disabled={c.is_current}
                                            maxLength={4}
                                            className={`${inputCls} disabled:bg-neutral-50 disabled:text-neutral-600`}
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <p className="text-[10px] font-mono text-neutral-500 mb-1">업무 설명 (선택)</p>
                                        <textarea
                                            value={c.description ?? ""}
                                            onChange={(e) => updateCareer(i, "description", e.target.value)}
                                            placeholder="어떤 일을 했는지 간략하게"
                                            rows={2}
                                            maxLength={200}
                                            className={`${inputCls} resize-none leading-relaxed`}
                                        />
                                    </div>
                                </div>

                                <label className="flex items-center gap-2 mt-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={c.is_current}
                                        onChange={(e) => {
                                            updateCareer(i, "is_current", e.target.checked);
                                            if (e.target.checked) updateCareer(i, "to_year", null);
                                        }}
                                        className="w-4 h-4 accent-neutral-900"
                                    />
                                    <span className="text-[12px] text-neutral-700">현재 재직/활동중</span>
                                </label>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ── 링크 ── */}
                <section>
                    <div className="flex items-center justify-between mb-3">
                        <SectionLabel>링크</SectionLabel>
                        <button
                            onClick={addLink}
                            className="flex items-center gap-1 text-[12px] text-neutral-700 hover:text-neutral-900 transition-colors"
                        >
                            <Plus className="h-3.5 w-3.5" />
                            추가
                        </button>
                    </div>

                    {links.length === 0 && (
                        <p className="text-[13px] text-neutral-600 text-center py-4 border border-dashed border-neutral-300">
                            포트폴리오, SNS, 사이트 링크를 추가해 주세요
                        </p>
                    )}

                    <div className="space-y-3">
                        {links.map((link, i) => (
                            <div key={i} className="flex gap-2 items-start">
                                <input
                                    value={link.label}
                                    onChange={(e) => updateLink(i, "label", e.target.value)}
                                    placeholder="Instagram"
                                    maxLength={20}
                                    className={`${inputCls} w-[100px] shrink-0`}
                                />
                                <input
                                    value={link.url}
                                    onChange={(e) => updateLink(i, "url", e.target.value)}
                                    placeholder="https://"
                                    className={`${inputCls} flex-1 min-w-0`}
                                />
                                <button
                                    onClick={() => removeLink(i)}
                                    className="mt-2.5 text-neutral-600 hover:text-neutral-700 transition-colors shrink-0"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ── 저장 버튼 ── */}
                <button
                    onClick={handleSave}
                    disabled={saving || handleAvailable === false}
                    className={`w-full py-3.5 text-[14px] font-semibold transition-colors flex items-center justify-center gap-2 ${
                        !saving && handleAvailable !== false
                            ? "bg-neutral-900 text-white hover:opacity-80"
                            : "bg-neutral-100 text-neutral-500 cursor-not-allowed"
                    }`}
                >
                    {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                    {saved ? "저장됐습니다" : "저장하기"}
                </button>

            </div>
        </div>
    );
}
