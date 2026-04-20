"use client";

import { useState, KeyboardEvent } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth-context";
import type { MontzCreator, MontzCreatorType, MontzAvailability, MontzSpecialty, MontzGender } from "@/lib/supabase/montz";

const SPECIALTY_OPTIONS: MontzSpecialty[] = ["전신", "부분", "피팅", "나레이터"];

function calcAgeGroup(birthYear: number, birthMonth: number): string {
    const now = new Date();
    let age = now.getFullYear() - birthYear;
    if (now.getMonth() + 1 < birthMonth) age--;
    if (age < 13) return "어린이";
    if (age < 20) return "10대";
    if (age < 40) return "20~30대";
    if (age < 60) return "40~50대";
    return "60대+";
}

interface Props {
    onCreated: (creator: MontzCreator) => void;
    onClose: () => void;
}

export function MontzOnboarding({ onCreated, onClose }: Props) {
    const { user } = useAuth();
    const handle = user?.handle ?? user?.email?.split("@")[0] ?? "";

    const [birthYear, setBirthYear] = useState("");
    const [birthMonth, setBirthMonth] = useState("");
    const [gender, setGender] = useState<MontzGender>("female");
    const [type, setType] = useState<MontzCreatorType>("model");
    const [availability, setAvailability] = useState<MontzAvailability>("active");
    const [specialties, setSpecialties] = useState<MontzSpecialty[]>([]);
    const [bio, setBio] = useState(user?.bio ?? "");
    const [description, setDescription] = useState("");
    const [tagInput, setTagInput] = useState("");
    const [tags, setTags] = useState<string[]>([]);
    const [career, setCareer] = useState("");
    const [height, setHeight] = useState("");
    const [weight, setWeight] = useState("");
    const [showWeight, setShowWeight] = useState(false);
    const [bust, setBust] = useState("");
    const [waist, setWaist] = useState("");
    const [hip, setHip] = useState("");
    const [shoeSize, setShoeSize] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    function toggleSpecialty(s: MontzSpecialty) {
        setSpecialties((prev) =>
            prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
        );
    }

    function handleTagChange(raw: string) {
        if (!raw.includes(",")) { setTagInput(raw); return; }
        const parts = raw.split(",");
        const completed = parts.slice(0, -1).map((p) => p.trim().replace(/^#/, "")).filter(Boolean);
        setTags((prev) => {
            const next = [...prev];
            completed.forEach((t) => { if (!next.includes(t)) next.push(t); });
            return next;
        });
        setTagInput(parts[parts.length - 1]);
    }

    function handleTagKeyDown(e: KeyboardEvent<HTMLInputElement>) {
        if (e.key === "Backspace" && !tagInput && tags.length) {
            setTags((prev) => prev.slice(0, -1));
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!user?.id) return;
        setSubmitting(true);
        setError("");
        const supabase = createClient();
        const { data, error: err } = await supabase
            .from("montz_creators")
            .insert({
                user_id: user.id,
                handle,
                display_name: user.name,
                avatar_url: user.avatarUrl ?? null,
                gender,
                type,
                availability_status: availability,
                specialties,
                birth_year: birthYear ? Number(birthYear) : null,
                birth_month: birthMonth ? Number(birthMonth) : null,
                age_group: (birthYear && birthMonth) ? calcAgeGroup(Number(birthYear), Number(birthMonth)) : null,
                bio: bio.trim() || null,
                description: description.trim() || null,
                tags,
                career: career.trim() || null,
                height: height ? Number(height) : null,
                weight: weight ? Number(weight) : null,
                show_weight: showWeight,
                bust: bust ? Number(bust) : null,
                waist: waist ? Number(waist) : null,
                hip: hip ? Number(hip) : null,
                shoe_size: shoeSize ? Number(shoeSize) : null,
            })
            .select()
            .single();

        if (err || !data) {
            setError("저장 중 오류가 발생했습니다. 다시 시도해주세요.");
            setSubmitting(false);
            return;
        }
        onCreated(data as MontzCreator);
    }

    return (
        <div className="fixed inset-0 z-[200] flex items-end justify-center">
            <div className="absolute inset-0 bg-black/50" onClick={onClose} />
            <div className="relative w-full sm:max-w-md bg-white rounded-t-2xl sm:rounded-none max-h-[92vh] overflow-y-auto">
            {/* 헤더 */}
            <div className="px-5 pt-5 pb-4 border-b border-neutral-200 flex items-center justify-between sticky top-0 bg-white z-10">
                <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-neutral-200 overflow-hidden shrink-0">
                    {user?.avatarUrl ? (
                        <Image src={user.avatarUrl} alt="" width={40} height={40} className="object-cover w-full h-full" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-[14px] font-black text-neutral-400">
                            {user?.name?.charAt(0)}
                        </div>
                    )}
                </div>
                    <div>
                        <p className="text-[15px] font-black text-neutral-900 leading-none">{user?.name}</p>
                        <p className="text-[11px] font-mono text-neutral-400 mt-0.5">@{handle}</p>
                    </div>
                </div>
                <button onClick={onClose} className="p-1.5 text-neutral-400 hover:text-neutral-900">
                    <X className="h-5 w-5" />
                </button>
            </div>

            <form onSubmit={handleSubmit} className="px-5 py-5 space-y-5">

                {/* 출생 연월 */}
                <div>
                    <label className="block text-[13px] font-bold text-neutral-900 mb-2">출생 연월 <span className="text-red-500">*</span></label>
                    <div className="flex gap-2 items-center">
                        <div className="relative flex-1">
                            <input type="number" value={birthYear} onChange={(e) => setBirthYear(e.target.value)}
                                placeholder="1995" min="1940" max={new Date().getFullYear()}
                                className="w-full border border-neutral-300 px-3 py-2.5 text-[14px] focus:outline-none focus:border-neutral-900 pr-9 placeholder:text-neutral-500" />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] text-neutral-400">년</span>
                        </div>
                        <div className="relative w-24">
                            <input type="number" value={birthMonth} onChange={(e) => setBirthMonth(e.target.value)}
                                placeholder="8" min="1" max="12"
                                className="w-full border border-neutral-300 px-3 py-2.5 text-[14px] focus:outline-none focus:border-neutral-900 pr-7 placeholder:text-neutral-500" />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] text-neutral-400">월</span>
                        </div>
                        {birthYear && birthMonth && (
                            <span className="text-[12px] font-bold text-neutral-500 shrink-0">
                                → {calcAgeGroup(Number(birthYear), Number(birthMonth))}
                            </span>
                        )}
                    </div>
                </div>

                {/* 성별 */}
                <div>
                    <label className="block text-[13px] font-bold text-neutral-900 mb-2">성별 <span className="text-red-500">*</span></label>
                    <div className="flex gap-2">
                        {([{ v: "female", label: "여자" }, { v: "male", label: "남자" }] as const).map(({ v, label }) => (
                            <button key={v} type="button" onClick={() => setGender(v)}
                                className={`flex-1 py-2.5 text-[13px] font-bold border transition-colors ${gender === v ? "border-neutral-900 bg-neutral-900 text-white" : "border-neutral-300 text-neutral-600 hover:border-neutral-700"}`}>
                                {label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 직종 */}
                <div>
                    <label className="block text-[13px] font-bold text-neutral-900 mb-2">직종 <span className="text-red-500">*</span></label>
                    <div className="flex gap-2">
                        {([{ v: "model", label: "모델" }, { v: "actor", label: "배우" }, { v: "both", label: "모델·배우" }] as const).map(({ v, label }) => (
                            <button key={v} type="button" onClick={() => setType(v)}
                                className={`flex-1 py-2.5 text-[13px] font-bold border transition-colors ${type === v ? "border-neutral-900 bg-neutral-900 text-white" : "border-neutral-300 text-neutral-600 hover:border-neutral-700"}`}>
                                {label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 활동 상태 */}
                <div>
                    <label className="block text-[13px] font-bold text-neutral-900 mb-2">활동 상태 <span className="text-red-500">*</span></label>
                    <div className="flex gap-2">
                        {([{ v: "active", label: "활동중" }, { v: "selective", label: "조건부" }, { v: "inactive", label: "휴식" }] as const).map(({ v, label }) => (
                            <button key={v} type="button" onClick={() => setAvailability(v)}
                                className={`flex-1 py-2.5 text-[13px] font-bold border transition-colors ${availability === v ? "border-neutral-900 bg-neutral-900 text-white" : "border-neutral-300 text-neutral-600 hover:border-neutral-700"}`}>
                                {label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 전문 분야 */}
                <div>
                    <label className="block text-[13px] font-bold text-neutral-900 mb-2">전문 분야</label>
                    <div className="flex flex-wrap gap-2">
                        {SPECIALTY_OPTIONS.map((s) => (
                            <button key={s} type="button" onClick={() => toggleSpecialty(s)}
                                className={`text-[12px] font-bold px-3 py-1.5 border transition-colors ${specialties.includes(s) ? "border-neutral-900 bg-neutral-900 text-white" : "border-neutral-300 text-neutral-500 hover:border-neutral-700"}`}>
                                {s}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 한줄 소개 */}
                <div>
                    <label className="block text-[13px] font-bold text-neutral-900 mb-2">한줄 소개</label>
                    <input
                        type="text"
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="패션 모델 / 런웨이·화보 전문. 서울 기반."
                        maxLength={80}
                        className="w-full border border-neutral-300 px-3 py-2.5 text-[14px] focus:outline-none focus:border-neutral-900 placeholder:text-neutral-500"
                    />
                </div>

                {/* 자기소개 */}
                <div>
                    <label className="block text-[13px] font-bold text-neutral-900 mb-2">자기소개</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="본인의 경력, 스타일, 강점 등을 자유롭게 소개해주세요."
                        rows={4}
                        className="w-full border border-neutral-300 px-3 py-2.5 text-[13px] leading-relaxed focus:outline-none focus:border-neutral-900 resize-none placeholder:text-neutral-500"
                    />
                </div>

                {/* 태그 */}
                <div>
                    <label className="block text-[13px] font-bold text-neutral-900 mb-2">태그</label>
                    <div className={`flex flex-wrap gap-1.5 border border-neutral-300 px-3 py-2 focus-within:border-neutral-900 min-h-[44px] ${tags.length ? "pb-2" : ""}`}>
                        {tags.map((t) => (
                            <span key={t} className="inline-flex items-center gap-1 text-[12px] font-semibold bg-neutral-100 px-2 py-0.5">
                                #{t}
                                <button type="button" onClick={() => setTags((prev) => prev.filter((x) => x !== t))}>
                                    <X className="h-3 w-3 text-neutral-400 hover:text-neutral-900" />
                                </button>
                            </span>
                        ))}
                        <input
                            type="text"
                            value={tagInput}
                            onChange={(e) => handleTagChange(e.target.value)}
                            onKeyDown={handleTagKeyDown}
                            placeholder={tags.length === 0 ? "쉼표(,)로 구분" : ""}
                            className="flex-1 min-w-[120px] text-[13px] outline-none bg-transparent placeholder:text-neutral-500"
                        />
                    </div>
                </div>

                {/* 활동 이력 */}
                <div>
                    <label className="block text-[13px] font-bold text-neutral-900 mb-2">활동 이력</label>
                    <textarea
                        value={career}
                        onChange={(e) => setCareer(e.target.value)}
                        placeholder={"2024  ABC 브랜드 봄 시즌 화보\n2023  XYZ 드라마 단역 출연\n2022  서울 패션위크 런웨이"}
                        rows={5}
                        className="w-full border border-neutral-300 px-3 py-2.5 text-[13px] leading-relaxed focus:outline-none focus:border-neutral-900 resize-none placeholder:text-neutral-500"
                    />
                </div>

                {/* 신체 사이즈 */}
                <div>
                    <label className="block text-[13px] font-bold text-neutral-900 mb-2">신체 사이즈</label>
                    <div className="grid grid-cols-2 gap-2">
                        {[
                            { val: height, set: setHeight, placeholder: "키", unit: "cm" },
                            { val: weight, set: setWeight, placeholder: "몸무게", unit: "kg" },
                            { val: bust, set: setBust, placeholder: "바스트", unit: "cm" },
                            { val: waist, set: setWaist, placeholder: "웨스트", unit: "cm" },
                            { val: hip, set: setHip, placeholder: "힙", unit: "cm" },
                            { val: shoeSize, set: setShoeSize, placeholder: "신발", unit: "mm" },
                        ].map(({ val, set, placeholder, unit }) => (
                            <div key={placeholder} className="relative">
                                <input type="number" value={val} onChange={(e) => set(e.target.value)}
                                    placeholder={placeholder}
                                    className="w-full border border-neutral-300 px-3 py-2.5 text-[14px] focus:outline-none focus:border-neutral-900 pr-9 placeholder:text-neutral-500" />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] text-neutral-400">{unit}</span>
                            </div>
                        ))}
                    </div>
                    {weight && (
                        <label className="flex items-center gap-2 mt-2 cursor-pointer">
                            <input type="checkbox" checked={showWeight} onChange={(e) => setShowWeight(e.target.checked)} className="accent-neutral-900" />
                            <span className="text-[12px] text-neutral-500">몸무게 공개</span>
                        </label>
                    )}
                </div>

                {error && <p className="text-[12px] text-red-500">{error}</p>}

                <button type="submit" disabled={submitting}
                    className="w-full py-3 text-[14px] font-black bg-neutral-900 text-white hover:bg-neutral-700 transition-colors disabled:opacity-40">
                    {submitting ? "저장 중…" : "저장"}
                </button>

                <div className="h-4" />
            </form>
            </div>
        </div>
    );
}
