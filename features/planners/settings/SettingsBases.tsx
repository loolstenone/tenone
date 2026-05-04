"use client";

// 활동 거점 — 사무실·집·체육관 등 자주 머무는 위치 등록
// 시간 트래커·캘린더에서 자동 라벨링/자동완성에 활용

import { useState } from "react";
import { Plus, Trash2, MapPin, Home, Briefcase, BookOpen, Dumbbell, Coffee, Building2, Star, Crosshair, Loader2 } from "lucide-react";
import type { ActivityBase } from "@/lib/myverse/types";

const TYPE_META: Record<ActivityBase["type"], { label: string; icon: React.ElementType }> = {
    home:   { label: "집",        icon: Home },
    office: { label: "사무실",    icon: Briefcase },
    study:  { label: "학습",      icon: BookOpen },
    gym:    { label: "운동",      icon: Dumbbell },
    cafe:   { label: "카페",      icon: Coffee },
    other:  { label: "기타",      icon: Building2 },
};

interface Props {
    initialBases: ActivityBase[];
    save: (patch: Record<string, unknown>) => Promise<void>;
    showToast: (text: string, ok?: boolean) => void;
}

export function SettingsBases({ initialBases, save, showToast }: Props) {
    const [bases, setBases] = useState<ActivityBase[]>(initialBases);
    const [pickingId, setPickingId] = useState<string | null>(null);

    function commit(next: ActivityBase[]) {
        setBases(next);
        void save({ activity_bases: next });
    }

    /** 주소 → Nominatim 지오코딩 → lat/lng 채움 */
    async function geocodeAddress(id: string, address: string) {
        if (!address.trim()) return;
        try {
            const res = await fetch(
                `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1&accept-language=ko`
            );
            if (!res.ok) return;
            const arr = await res.json();
            if (Array.isArray(arr) && arr[0]?.lat && arr[0]?.lon) {
                const lat = parseFloat(arr[0].lat);
                const lng = parseFloat(arr[0].lon);
                const next = bases.map(b => b.id === id ? { ...b, lat, lng } : b);
                commit(next);
                showToast("좌표 등록됨");
            } else {
                showToast("주소를 찾지 못했습니다", false);
            }
        } catch {
            showToast("지오코딩 실패", false);
        }
    }

    /** 현재 위치를 거점 좌표로 등록 + 역지오코딩으로 주소 자동 입력 */
    async function pickCurrentLocation(id: string) {
        if (!navigator.geolocation) {
            showToast("이 브라우저는 위치 정보를 지원하지 않습니다", false);
            return;
        }
        setPickingId(id);
        try {
            const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
                navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 8000 })
            );
            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;
            // 역지오코딩으로 주소 자동 채움 (현재 주소 비어 있을 때만)
            let nextAddress: string | undefined;
            try {
                const res = await fetch(
                    `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=ko`
                );
                if (res.ok) {
                    const d = await res.json();
                    nextAddress = d.display_name;
                }
            } catch { /* silent */ }
            const next = bases.map(b => b.id === id ? {
                ...b,
                lat, lng,
                address: b.address || nextAddress,
            } : b);
            commit(next);
            showToast("현재 위치 등록됨");
        } catch (e) {
            const err = e as GeolocationPositionError | Error;
            if ("code" in err && err.code === 1) {
                showToast("위치 권한이 거부되었습니다", false);
            } else {
                showToast("위치 조회 실패", false);
            }
        } finally {
            setPickingId(null);
        }
    }

    function add(type: ActivityBase["type"]) {
        const next: ActivityBase[] = [
            ...bases,
            {
                id: `base_${Date.now()}`,
                name: TYPE_META[type].label,
                type,
                isPrimary: bases.length === 0,
            },
        ];
        commit(next);
    }

    function update(id: string, patch: Partial<ActivityBase>) {
        setBases(prev => prev.map(b => b.id === id ? { ...b, ...patch } : b));
    }

    function commitField() { commit(bases); }

    function remove(id: string) {
        const removed = bases.find(b => b.id === id);
        let next = bases.filter(b => b.id !== id);
        // primary 삭제 시 첫 항목을 primary로
        if (removed?.isPrimary && next.length > 0) {
            next = next.map((b, i) => i === 0 ? { ...b, isPrimary: true } : b);
        }
        commit(next);
    }

    function setPrimary(id: string) {
        commit(bases.map(b => ({ ...b, isPrimary: b.id === id })));
    }

    return (
        <section id="sec-bases" className="bg-white border border-neutral-200 rounded-xl p-6">
            <div className="flex items-baseline gap-2 mb-1">
                <MapPin className="h-4 w-4 text-[#0F766E]" />
                <h2 className="text-sm font-semibold text-neutral-900">활동 거점</h2>
            </div>
            <p className="text-xs text-neutral-500 mb-4">
                자주 머무는 장소를 등록해두면 시간 트래커·일정에서 자동 라벨링됩니다.
            </p>

            {/* 빠른 추가 */}
            <div className="flex flex-wrap gap-1.5 mb-4">
                {(Object.keys(TYPE_META) as Array<ActivityBase["type"]>).map(t => {
                    const Icon = TYPE_META[t].icon;
                    return (
                        <button
                            key={t}
                            onClick={() => add(t)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-neutral-600 hover:text-[#0F766E] border border-neutral-200 hover:border-[#0F766E] rounded-full transition-colors"
                        >
                            <Icon className="h-3.5 w-3.5" />
                            <Plus className="h-3 w-3 -ml-0.5" />
                            {TYPE_META[t].label}
                        </button>
                    );
                })}
            </div>

            {/* 거점 목록 */}
            {bases.length === 0 ? (
                <p className="text-xs text-neutral-400 py-4 text-center bg-neutral-50 rounded">
                    아직 거점이 없습니다. 위 버튼으로 추가하세요.
                </p>
            ) : (
                <div className="space-y-2">
                    {bases.map(base => {
                        const Icon = TYPE_META[base.type].icon;
                        return (
                            <div key={base.id} className="group flex items-start gap-2 bg-neutral-50 rounded-lg px-3 py-2.5">
                                <Icon className="h-4 w-4 text-[#0F766E] shrink-0 mt-1" />
                                <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2">
                                    <input
                                        type="text"
                                        value={base.name}
                                        onChange={e => update(base.id, { name: e.target.value })}
                                        onBlur={commitField}
                                        placeholder="거점 이름 (예: 본사, 우리집)"
                                        className="text-sm font-medium text-neutral-900 bg-transparent focus:outline-none border-b border-neutral-200 pb-1 placeholder:text-neutral-300"
                                    />
                                    <select
                                        value={base.type}
                                        onChange={e => update(base.id, { type: e.target.value as ActivityBase["type"] })}
                                        onBlur={commitField}
                                        className="text-xs bg-white border border-neutral-200 rounded px-2 py-1 text-neutral-700 focus:outline-none"
                                    >
                                        {(Object.keys(TYPE_META) as Array<ActivityBase["type"]>).map(t => (
                                            <option key={t} value={t}>{TYPE_META[t].label}</option>
                                        ))}
                                    </select>
                                    <div className="flex flex-col gap-0.5">
                                        <input
                                            type="text"
                                            value={base.address ?? ""}
                                            onChange={e => update(base.id, { address: e.target.value })}
                                            onBlur={() => {
                                                commitField();
                                                if (base.address && base.lat == null) {
                                                    void geocodeAddress(base.id, base.address);
                                                }
                                            }}
                                            placeholder="주소 (선택)"
                                            className="text-xs text-neutral-700 bg-transparent focus:outline-none border-b border-neutral-200 pb-1 placeholder:text-neutral-300"
                                        />
                                        {base.lat != null && base.lng != null && (
                                            <span className="text-[10px] text-neutral-400 tabular-nums">
                                                {base.lat.toFixed(5)}, {base.lng.toFixed(5)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <button
                                    onClick={() => pickCurrentLocation(base.id)}
                                    disabled={pickingId === base.id}
                                    title="현재 위치로 좌표 등록"
                                    className="shrink-0 mt-1 text-neutral-400 hover:text-[#0F766E] disabled:opacity-50"
                                >
                                    {pickingId === base.id
                                        ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                        : <Crosshair className="h-3.5 w-3.5" />}
                                </button>
                                <button
                                    onClick={() => setPrimary(base.id)}
                                    title={base.isPrimary ? "기본 거점" : "기본 거점으로 지정"}
                                    className={`shrink-0 mt-1 ${base.isPrimary ? "text-amber-500" : "text-neutral-300 hover:text-amber-500"}`}
                                >
                                    <Star className={`h-4 w-4 ${base.isPrimary ? "fill-current" : ""}`} />
                                </button>
                                <button
                                    onClick={() => remove(base.id)}
                                    className="shrink-0 mt-1 opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-red-500 transition-opacity"
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}
        </section>
    );
}
