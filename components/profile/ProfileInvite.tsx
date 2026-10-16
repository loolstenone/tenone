"use client";

/**
 * 프로필을 볼 수 없을 때 보여 주는 화면 — 없는 핸들 · 비공개 · 만료된 공유 링크
 *
 * 막힌 화면에서 끝나지 않게 "내 프로필 만들기"로 이어 준다.
 * 없는 핸들이면 그 핸들을 가져갈 수 있는지 확인해 바로 권한다 (/profile?handle=… 로 편집 화면에 채워짐).
 */
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, Lock, Link2Off, UserRound } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { loginHref } from "@/lib/login-href";
import { HANDLE_RE } from "@/lib/profile/public-profile";
import type { BrandProfileConfig } from "@/lib/profile/brand-profiles";

type Variant = "notfound" | "private" | "expired";

/** 주소에서 핸들 꺼내기 — /@abc · /profile/abc · /madleague/@abc · /madleague/u/abc */
function handleFromPath(pathname: string | null) {
    const last = pathname?.split("/").filter(Boolean).pop() ?? "";
    const h = decodeURIComponent(last).replace(/^@/, "").toLowerCase();
    return HANDLE_RE.test(h) && h !== "profile" ? h : "";
}

const COPY: Record<Variant, { icon: typeof Lock; title: string; body: (h: string) => string }> = {
    notfound: {
        icon: UserRound,
        title: "찾을 수 없는 프로필입니다",
        body: h => h ? `@${h} 주소를 쓰는 사람이 없거나, 주소가 바뀌었습니다.` : "주소가 잘못되었거나, 주인이 핸들을 바꿨습니다.",
    },
    private: {
        icon: Lock,
        title: "비공개 프로필입니다",
        body: h => `@${h}님은 프로필을 공개하지 않았습니다.`,
    },
    expired: {
        icon: Link2Off,
        title: "공유 링크를 열 수 없습니다",
        body: () => "기한이 지났거나 보낸 분이 링크를 회수했습니다. 새 링크를 요청해 보세요.",
    },
};

/**
 * brand: 브랜드 공개 프로필(예: madleague.net/@핸들)에서 쓸 때 — 문구·버튼 색·이동할 화면이 그 브랜드 기준
 * (브랜드에서 시작한 사람을 tenone.biz로 보내지 않는다 — §1.2.1)
 */
export function ProfileInvite({ variant, handle: handleProp, brand }: { variant: Variant; handle?: string; brand?: BrandProfileConfig }) {
    const pathname = usePathname();
    const { isAuthenticated, user } = useAuth();
    const handle = handleProp ?? handleFromPath(pathname);
    const [available, setAvailable] = useState(false);

    // 없는 핸들이면 가져갈 수 있는지 (예약어·90일 잠금·사용 중이면 false)
    useEffect(() => {
        if (variant !== "notfound" || !handle) return;
        fetch(`/api/myverse/handle?check=${encodeURIComponent(handle)}`)
            .then(r => r.json())
            .then((j: { available?: boolean }) => setAvailable(j.available === true))
            .catch(() => {});
    }, [variant, handle]);

    const { icon: Icon, title, body } = COPY[variant];
    const claim = available && handle;
    const myPath = brand?.myPath ?? "/profile";
    const profileTarget = claim ? `${myPath}?handle=${handle}` : myPath;
    const btnCls = "inline-flex items-center justify-center text-sm font-medium px-6 py-3 rounded-xl hover:opacity-90 transition-opacity";
    const btnProps = brand
        ? { className: btnCls, style: { backgroundColor: brand.accent, color: "#fff" } }
        : { className: `${btnCls} tn-btn-primary` };
    const sub = brand ? (brand.dark ? "text-neutral-400" : "text-neutral-500") : "tn-text-sub";
    const border = brand ? (brand.dark ? "border-neutral-800" : "border-neutral-200") : "tn-border";
    const pitch = brand
        ? `${brand.name} 프로필 하나로 활동 기록과 인증서를 보여 줄 수 있습니다.`
        : "tenone.biz/@핸들 하나로 내 활동과 소개를 보여 줄 수 있습니다.";
    const hasOwnHandle = !!user?.handle && !/^u_[a-z0-9]{8,10}$/.test(user.handle);

    return (
        <div className="max-w-xl mx-auto px-4 py-24 sm:py-32 text-center">
            <div className="flex justify-center mb-6">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center ${brand ? (brand.dark ? "bg-neutral-900" : "bg-neutral-100") : "tn-bg-alt"}`}>
                    <Icon className="h-7 w-7 text-neutral-400" />
                </div>
            </div>
            <h1 className={`text-2xl font-bold ${brand ? "" : "tn-text"}`}>{title}</h1>
            <p className={`text-sm mt-3 ${sub}`}>{body(handle)}</p>

            <div className={`mt-14 rounded-2xl border px-6 py-10 ${border}`}>
                {claim ? (
                    <>
                        <p className={`text-lg font-semibold ${brand ? "" : "tn-text"}`}>@{handle}, 아직 주인이 없습니다</p>
                        <p className={`text-sm mt-2 ${sub}`}>이 주소를 내 프로필로 가져가세요.</p>
                    </>
                ) : (
                    <>
                        <p className={`text-lg font-semibold ${brand ? "" : "tn-text"}`}>당신만의 프로필을 만들어 보세요</p>
                        <p className={`text-sm mt-2 ${sub}`}>
                            {pitch}
                            <br className="hidden sm:inline" /> 공개할 항목은 직접 고르고, 연락처는 공개되지 않습니다.
                        </p>
                    </>
                )}
                <div className="mt-7">
                    {isAuthenticated ? (
                        <Link href={profileTarget} {...btnProps}>
                            {claim ? `@${handle}로 내 프로필 만들기` : hasOwnHandle ? "내 프로필 보기" : "내 프로필 만들기"}
                        </Link>
                    ) : (
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                            <Link href={loginHref(profileTarget, "signup")} {...btnProps}>
                                {claim ? `가입하고 @${handle} 가져가기` : "가입하고 프로필 만들기"}
                            </Link>
                            <Link href={loginHref(profileTarget)} className={`text-sm underline underline-offset-4 ${sub}`}>
                                이미 계정이 있어요
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            <Link href={brand ? brand.prefix : "/"} className={`inline-flex items-center gap-1 mt-10 text-sm transition-colors ${sub}`}>
                <ArrowLeft className="h-4 w-4" /> {brand ? `${brand.name} 둘러보기` : "Ten:One™ Universe 둘러보기"}
            </Link>
        </div>
    );
}
