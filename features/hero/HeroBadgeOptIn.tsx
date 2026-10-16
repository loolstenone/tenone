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
import { Shield, Loader2, Check, X, ArrowRight } from "lucide-react";
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
                .select("type_code, type_name_ko, type_nickname")
                .eq("id", hitARes.data.hit_a_result_id)
                .maybeSingle();

            if (result?.type_code) {
                // hit_hero_types(64종)에 정확히 매칭되는 row가 있으면 그것을,
                // 없으면 hit_a_results의 필드로 폴백 (DISC 2-letter 형식 대응)
                const { data: type } = await sb
                    .from("hit_hero_types")
                    .select("type_code, character_name, character_label")
                    .eq("type_code", result.type_code)
                    .maybeSingle();
                if (type) {
                    setHeroType(type as HeroTypeInfo);
                } else {
                    setHeroType({
                        type_code: result.type_code,
                        character_name: (result.type_nickname as string) || (result.type_name_ko as string) || result.type_code,
                        character_label: (result.type_name_ko as string) || "",
                    });
                }
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

    // 프로필 화면의 다른 카드와 같은 테마 토큰 (라이트·다크 자동) — 그라데이션·색 배경 없음
    const card = "rounded-2xl border tn-border tn-surface";

    if (loading) {
        return (
            <div className={`flex items-center gap-2 text-xs tn-text-sub py-3 px-4 ${card}`}>
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> 영웅 유형 확인 중...
            </div>
        );
    }

    // HIT A 미완료 — 검사 유도
    if (!heroType) {
        return (
            <Link href="/hero/hit/a" className={`flex items-center gap-3 p-4 transition-opacity hover:opacity-80 ${card}`}>
                <Shield className="h-5 w-5 tn-text-sub shrink-0" />
                <div className="flex-1">
                    <p className="text-sm font-semibold tn-text">유니버스 배지</p>
                    <p className="text-xs tn-text-sub mt-0.5">
                        HeRo HIT 검사로 당신의 영웅 유형을 발견하면 배지로 프로필에 표시됩니다
                    </p>
                </div>
                <ArrowRight className="h-4 w-4 tn-text-sub" />
            </Link>
        );
    }

    // HIT A 완료 — 토글 노출
    return (
        <div className={`p-5 ${card}`}>
            <div className="flex items-start gap-3 mb-4">
                <Shield className="h-5 w-5 tn-text-sub shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold tn-text">유니버스 배지</p>
                    <p className="text-xs tn-text-sub mt-0.5">
                        당신의 영웅 유형: <span className="font-mono font-semibold tn-text">{heroType.type_code}</span>
                        {" · "}{heroType.character_name}
                    </p>
                    {heroType.character_label && <p className="text-[11px] tn-text-sub mt-0.5">{heroType.character_label}</p>}
                </div>
            </div>

            <div className="flex items-center justify-between gap-3 pt-4 border-t tn-border">
                <div className="min-w-0">
                    <p className="text-xs font-semibold tn-text">전 Universe 브랜드에 배지 표시</p>
                    <p className="text-[11px] tn-text-sub mt-0.5">
                        {isPublic
                            ? "공개 중 - Badak · MADLeague · Jakka 등 브랜드 프로필 카드에 배지가 보입니다. 언제든 끌 수 있습니다."
                            : "켜면 Badak · MADLeague · Jakka 등 브랜드 프로필 카드에 배지가 보입니다."}
                    </p>
                </div>
                <button onClick={toggle} disabled={saving} role="switch" aria-checked={isPublic}
                    className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${isPublic ? "bg-rose-500" : "bg-neutral-400/50"} disabled:opacity-60`}
                    aria-label="유니버스 배지 표시">
                    <span className={`absolute top-0.5 h-5 w-5 bg-white rounded-full shadow transition-transform flex items-center justify-center ${
                        isPublic ? "translate-x-5" : "translate-x-0.5"
                    }`}>
                        {saving ? <Loader2 className="h-3 w-3 animate-spin text-neutral-500" /> : isPublic ? <Check className="h-3 w-3 text-rose-500" /> : <X className="h-3 w-3 text-neutral-400" />}
                    </span>
                </button>
            </div>
        </div>
    );
}
