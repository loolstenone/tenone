"use client";

/**
 * 계정 메뉴 — 유틸리티바의 아바타를 누르면 열린다 (CLAUDE.md §1.9.2, 2026-10-14 표준)
 *
 * 정의: "나에 관한 곳으로 가는 목록". 아바타 하나가 두 층을 대표한다
 *   ① 이 사이트의 나   — 마이페이지 (브랜드 활동·특화 정보, MyProfileCard)
 *   ② Ten:One 계정     — 계정 관리(/profile: 공통 프로필·보안·동의·탈퇴) · 공개 프로필(/@handle)
 *   그리고 이용 중인 다른 서비스(member_brand_joins) · 인트라(직원만)
 *
 * - 바(데스크톱)에서는 드롭다운, 모바일에서는 아래에서 올라오는 시트
 * - 로그아웃은 바에 텍스트로 그대로 둔다 (사용자 결정). 모바일은 바에 자리가 없으므로 시트 맨 아래에 둔다
 * - 아바타 클릭이 곧 이동·로그아웃이 되지 않게 한다 (메뉴만 연다)
 */

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronRight, X } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { CrossSiteLink } from "@/components/CrossSiteLink";
import { AccountAvatar } from "@/components/AccountControls";
import { servicesForJoins, type BrandService } from "@/lib/brand-services";

const PLACEMENT = {
    "down-right": "right-0 top-full mt-2",
    "down-left": "left-0 top-full mt-2",
    "up-left": "left-0 bottom-full mb-2",
} as const;

function intraHref(): string {
    if (typeof window === "undefined") return "/intra";
    const h = window.location.hostname;
    return h === "localhost" || h === "127.0.0.1" ? "/intra" : "https://intra.tenone.biz";
}

export function AccountMenu({ profilePath, siteId, mode = "dropdown", placement = "down-right" }: {
    /** 이 사이트의 마이페이지 */
    profilePath?: string;
    siteId?: string;
    /** dropdown = 데스크톱 바 · sheet = 모바일 (로그아웃 포함) */
    mode?: "dropdown" | "sheet";
    /** 드롭다운 위치 — 헤더 우상단은 down-right, 좌측 사이드바(Jakka·MoNTZ)는 up-left */
    placement?: "down-right" | "down-left" | "up-left";
}) {
    const { user, canAccessIntra, logout } = useAuth();
    const [open, setOpen] = useState(false);
    const [services, setServices] = useState<BrandService[] | null>(null);
    const ref = useRef<HTMLDivElement>(null);

    // 처음 열 때 한 번만 이용 중인 서비스 조회
    useEffect(() => {
        if (!open || services) return;
        let cancelled = false;
        fetch("/api/brand-join/mine", { cache: "no-store" })
            .then(r => (r.ok ? r.json() : { brands: [] }))
            .then((d: { brands?: string[] }) => { if (!cancelled) setServices(servicesForJoins(d.brands ?? [], siteId)); })
            .catch(() => { if (!cancelled) setServices([]); });
        return () => { cancelled = true; };
    }, [open, services, siteId]);

    // 바깥 클릭·Esc로 닫기
    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
        const onClick = (e: MouseEvent) => {
            if (mode === "dropdown" && ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        window.addEventListener("keydown", onKey);
        window.addEventListener("mousedown", onClick);
        return () => { window.removeEventListener("keydown", onKey); window.removeEventListener("mousedown", onClick); };
    }, [open, mode]);

    const close = () => setOpen(false);
    const row = "flex items-center justify-between gap-2 px-4 py-2.5 text-sm text-neutral-800 hover:bg-neutral-50 transition-colors";
    const section = "border-t border-neutral-100 py-1";

    const body = (
        <>
            <div className="flex items-center gap-3 px-4 py-3">
                <span className="text-neutral-700"><AccountAvatar /></span>
                <div className="min-w-0">
                    <div className="truncate text-sm font-medium text-neutral-900">{user?.name || "회원"}</div>
                    {user?.email && <div className="truncate text-xs text-neutral-500">{user.email}</div>}
                </div>
            </div>

            <div className={section}>
                {profilePath && <Link href={profilePath} onClick={close} className={row}>마이페이지</Link>}
                {user?.handle && <CrossSiteLink href={`/profile/${user.handle}`} onClick={close} className={row}>내 공개 프로필</CrossSiteLink>}
                <Link href="/profile" onClick={close} className={row}>Ten:One 계정 관리</Link>
            </div>

            {services && services.length > 0 && (
                <div className={section}>
                    <div className="px-4 pt-2 pb-1 text-[11px] text-neutral-500">이용 중인 다른 서비스</div>
                    {services.map(s => (
                        <CrossSiteLink key={s.siteId} href={s.path} onClick={close} className={row}>
                            <span>{s.label}</span>
                            <ChevronRight className="h-3.5 w-3.5 text-neutral-300" />
                        </CrossSiteLink>
                    ))}
                </div>
            )}

            {canAccessIntra && (
                <div className={section}>
                    <a href={intraHref()} onClick={close} className={row}>인트라</a>
                </div>
            )}

            {mode === "sheet" && (
                <div className={section}>
                    <button onClick={() => { close(); void logout(); }} className={`${row} w-full text-left text-neutral-500`}>로그아웃</button>
                </div>
            )}
        </>
    );

    return (
        <div ref={ref} className="relative">
            <button
                type="button"
                onClick={() => setOpen(o => !o)}
                className="flex items-center opacity-90 hover:opacity-100 transition-opacity"
                aria-haspopup="menu"
                aria-expanded={open}
                aria-label="계정 메뉴"
            >
                <AccountAvatar />
            </button>

            {open && mode === "dropdown" && (
                <div role="menu" className={`absolute z-[60] w-64 ${PLACEMENT[placement]} overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-xl`}>
                    {body}
                </div>
            )}

            {open && mode === "sheet" && (
                <>
                    <div className="fixed inset-0 z-[9998] bg-black/50" onClick={close} aria-hidden="true" />
                    <div role="menu" className="fixed inset-x-0 bottom-0 z-[9999] max-h-[80vh] overflow-y-auto rounded-t-2xl bg-white pb-[env(safe-area-inset-bottom)] shadow-2xl">
                        <div className="flex justify-end px-3 pt-3">
                            <button onClick={close} className="p-1.5 text-neutral-400 hover:text-neutral-900" aria-label="닫기"><X className="h-5 w-5" /></button>
                        </div>
                        {body}
                    </div>
                </>
            )}
        </div>
    );
}
