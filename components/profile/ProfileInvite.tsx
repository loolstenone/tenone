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

type Variant = "notfound" | "private" | "expired";

/** 주소에서 핸들 꺼내기 — /@abc · /profile/abc · /profile/@abc */
function handleFromPath(pathname: string | null) {
    const m = pathname?.match(/^\/(?:profile\/)?(?:@|%40)?([^/?#]+)$/i);
    const h = m?.[1]?.toLowerCase() ?? "";
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

export function ProfileInvite({ variant, handle: handleProp }: { variant: Variant; handle?: string }) {
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
    const profileTarget = claim ? `/profile?handle=${handle}` : "/profile";
    const hasOwnHandle = !!user?.handle && !/^u_[a-z0-9]{8,10}$/.test(user.handle);

    return (
        <div className="max-w-xl mx-auto px-4 py-24 sm:py-32 text-center">
            <div className="flex justify-center mb-6">
                <div className="w-16 h-16 rounded-full tn-bg-alt flex items-center justify-center">
                    <Icon className="h-7 w-7 text-neutral-400" />
                </div>
            </div>
            <h1 className="text-2xl font-bold tn-text">{title}</h1>
            <p className="text-sm tn-text-sub mt-3">{body(handle)}</p>

            <div className="mt-14 rounded-2xl border tn-border px-6 py-10">
                {claim ? (
                    <>
                        <p className="text-lg font-semibold tn-text">@{handle}, 아직 주인이 없습니다</p>
                        <p className="text-sm tn-text-sub mt-2">이 주소를 내 프로필로 가져가세요.</p>
                    </>
                ) : (
                    <>
                        <p className="text-lg font-semibold tn-text">당신만의 프로필을 만들어 보세요</p>
                        <p className="text-sm tn-text-sub mt-2">
                            tenone.biz/@핸들 하나로 내 활동과 소개를 보여 줄 수 있습니다.
                            <br className="hidden sm:inline" /> 공개할 항목은 직접 고르고, 연락처는 공개되지 않습니다.
                        </p>
                    </>
                )}
                <div className="mt-7">
                    {isAuthenticated ? (
                        <Link href={profileTarget}
                            className="inline-flex items-center justify-center text-sm font-medium px-6 py-3 rounded-xl tn-btn-primary hover:opacity-90 transition-opacity">
                            {claim ? `@${handle}로 내 프로필 만들기` : hasOwnHandle ? "내 프로필 보기" : "내 프로필 만들기"}
                        </Link>
                    ) : (
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                            <Link href={loginHref(profileTarget, "signup")}
                                className="inline-flex items-center justify-center text-sm font-medium px-6 py-3 rounded-xl tn-btn-primary hover:opacity-90 transition-opacity">
                                {claim ? `가입하고 @${handle} 가져가기` : "가입하고 프로필 만들기"}
                            </Link>
                            <Link href={loginHref(profileTarget)} className="text-sm tn-text-sub hover:tn-text underline underline-offset-4">
                                이미 계정이 있어요
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            <Link href="/" className="inline-flex items-center gap-1 mt-10 text-sm tn-text-sub hover:tn-text transition-colors">
                <ArrowLeft className="h-4 w-4" /> Ten:One™ Universe 둘러보기
            </Link>
        </div>
    );
}
