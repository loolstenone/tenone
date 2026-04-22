"use client";

/**
 * Universe Badge Opt-in 컴포넌트
 *
 * HIT 완료자가 자신의 "HeRo 영웅 유형" 배지를 전 브랜드 프로필에 노출할지 선택.
 * - members.privacy_settings.hero_badge_public (boolean)
 * - 기본값: false (opt-in 원칙)
 * - HIT A 미완료자에게는 검사 유도 카드
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { Shield, Loader2, Check, X, Sparkles, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Props {
    memberId: string;
}

interface HeroTypeInfo {
    type_code: string;
    character_name: string;
    character_label: string;
}

export default function HeroBadgeOptIn({ memberId }: Props) {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [heroType, setHeroType] = useState<HeroTypeInfo | null>(null);
    const [isPublic, setIsPublic] = useState(false);

    useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [memberId]);

    async function load() {
        setLoading(true);
        const sb = createClient();

        const [hitARes, memberRes] = await Promise.all([
            sb.from("hero_profiles").select("hit_a_result_id").eq("member_id", memberId).maybeSingle(),
            sb.from("members").select("privacy_settings").eq("id", memberId).maybeSingle(),
        ]);

        setIsPublic((memberRes.data?.privacy_settings as Record<string, unknown> | null)?.hero_badge_public === true);

        if (hitARes.data?.hit_a_result_id) {
            const { data: result } = await sb
                .from("hit_a_results")
                .select("type_code")
                .eq("id", hitARes.data.hit_a_result_id)
                .maybeSingle();

            if (result?.type_code) {
                const { data: type } = await sb
                    .from("hit_hero_types")
                    .select("type_code, character_name, character_label")
                    .eq("type_code", result.type_code)
                    .maybeSingle();
                if (type) setHeroType(type as HeroTypeInfo);
            }
        }

        setLoading(false);
    }

    async function toggle() {
        setSaving(true);
        const sb = createClient();
        const next = !isPublic;

        // privacy_settings 기존 값 유지 + hero_badge_public 업데이트
        const { data: cur } = await sb.from("members").select("privacy_settings").eq("id", memberId).maybeSingle();
        const base = (cur?.privacy_settings as Record<string, unknown> | null) ?? {};
        const nextSettings = { ...base, hero_badge_public: next };

        const { error } = await sb.from("members").update({ privacy_settings: nextSettings }).eq("id", memberId);

        if (error) {
            alert(`저장 실패: ${error.message}`);
            setSaving(false);
            return;
        }
        setIsPublic(next);
        setSaving(false);
    }

    if (loading) {
        return (
            <div className="flex items-center gap-2 text-xs text-neutral-400 py-3 px-4 border border-neutral-200 rounded-lg">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> 영웅 유형 확인 중...
            </div>
        );
    }

    // HIT A 미완료 — 검사 유도
    if (!heroType) {
        return (
            <Link href="/hero/hit/a"
                className="flex items-center gap-3 p-4 border border-dashed border-neutral-300 hover:border-rose-400 rounded-lg transition-colors bg-white">
                <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center">
                    <Shield className="h-5 w-5 text-neutral-400" />
                </div>
                <div className="flex-1">
                    <p className="text-sm font-semibold text-neutral-700">Universe Identity Badge</p>
                    <p className="text-xs text-neutral-500 mt-0.5">
                        HeRo HIT 검사로 당신의 영웅 유형을 발견하면 배지로 프로필에 표시됩니다
                    </p>
                </div>
                <ArrowRight className="h-4 w-4 text-neutral-400" />
            </Link>
        );
    }

    // HIT A 완료 — 토글 노출
    return (
        <div className="p-4 border border-neutral-200 rounded-lg bg-gradient-to-br from-white to-rose-50/30">
            <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-rose-100 to-amber-50 flex items-center justify-center shrink-0">
                    <Sparkles className="h-5 w-5 text-rose-500" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-neutral-800">Universe Identity Badge</p>
                    <p className="text-xs text-neutral-500 mt-0.5">
                        당신의 영웅 유형: <span className="font-mono text-rose-600">{heroType.type_code}</span>
                        {" · "}{heroType.character_name}
                    </p>
                    <p className="text-[11px] text-neutral-400 mt-0.5">{heroType.character_label}</p>
                </div>
            </div>

            <div className="flex items-center justify-between gap-3 pt-3 border-t border-neutral-100">
                <div className="min-w-0">
                    <p className="text-xs font-semibold text-neutral-700">전 Universe 브랜드에 배지 표시</p>
                    <p className="text-[11px] text-neutral-400 mt-0.5">
                        Badak · MADLeague · Jakka 등 모든 브랜드 프로필 카드에 배지로 노출됩니다
                    </p>
                </div>
                <button onClick={toggle} disabled={saving}
                    className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${isPublic ? "bg-rose-500" : "bg-neutral-300"} disabled:opacity-60`}
                    aria-label="badge toggle">
                    <span className={`absolute top-0.5 h-5 w-5 bg-white rounded-full shadow transition-transform flex items-center justify-center ${
                        isPublic ? "translate-x-5" : "translate-x-0.5"
                    }`}>
                        {saving ? <Loader2 className="h-3 w-3 animate-spin text-neutral-500" /> : isPublic ? <Check className="h-3 w-3 text-rose-500" /> : <X className="h-3 w-3 text-neutral-400" />}
                    </span>
                </button>
            </div>

            {isPublic && (
                <div className="mt-3 p-2 bg-rose-50 border border-rose-100 rounded text-[10px] text-rose-700">
                    ✓ 배지가 공개 중입니다. 언제든 끌 수 있습니다.
                </div>
            )}
        </div>
    );
}
