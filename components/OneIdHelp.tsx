"use client";

import { useEffect, useRef, useState } from "react";
import { HelpCircle, X, ExternalLink } from "lucide-react";
import { getAllSiteConfigs, type SiteConfigRow } from "@/lib/supabase/site-configs";
import { CANONICAL_HOSTS, isTenoneFamily } from "@/lib/domain-registry";

/**
 * Ten:One™ Universe One ID 안내 — (?) 버튼을 누르면 작은 안내창.
 * 유니버스를 강조하지 않고(헌법 원칙 7) 궁금할 때만 알 수 있게. LoginModal · BrandJoinGate에서 사용.
 * 주요 서비스 = ums_sites.is_open (내부 사이트 제외). 링크는 공식 주소가 있는 서비스만 (스테이징 주소로 보내지 않음)
 */
const INTERNAL_SITES = new Set(["tenone", "wiki", "dokdae"]);

function universeHref(): string {
    if (typeof window === "undefined") return "https://www.tenone.biz/universe";
    const host = window.location.hostname;
    // tenone 계열·로컬은 같은 사이트 경로, 독립 도메인은 공식 주소 (상대 경로는 브랜드 prefix로 rewrite돼 404)
    return host === "localhost" || isTenoneFamily(host) ? "/universe" : "https://www.tenone.biz/universe";
}

export function OneIdHelp({ size = 14 }: { size?: number }) {
    const [open, setOpen] = useState(false);
    const [services, setServices] = useState<SiteConfigRow[] | null>(null);
    const ref = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        if (!open || services) return;
        getAllSiteConfigs()
            .then(rows => setServices(rows.filter(r => r.is_open && !INTERNAL_SITES.has(r.site_id))))
            .catch(() => setServices([]));
    }, [open, services]);

    useEffect(() => {
        if (!open) return;
        const close = (e: MouseEvent | TouchEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        const esc = (e: KeyboardEvent) => { if (e.key === "Escape") { e.stopPropagation(); setOpen(false); } };
        document.addEventListener("mousedown", close);
        document.addEventListener("touchstart", close);
        document.addEventListener("keydown", esc, true);
        return () => {
            document.removeEventListener("mousedown", close);
            document.removeEventListener("touchstart", close);
            document.removeEventListener("keydown", esc, true);
        };
    }, [open]);

    return (
        <span ref={ref} className="relative inline-flex align-middle">
            <button
                type="button"
                onClick={() => setOpen(o => !o)}
                aria-label="One ID 안내"
                aria-expanded={open}
                className="inline-flex items-center justify-center rounded-full text-neutral-400 hover:text-neutral-700 transition-colors"
            >
                <HelpCircle style={{ width: size, height: size }} />
            </button>

            {open && (
                <span
                    role="dialog"
                    className="absolute left-1/2 top-full z-10 mt-2 w-64 -translate-x-1/2 rounded-xl border border-neutral-200 bg-white p-4 text-left shadow-lg"
                >
                    <button type="button" onClick={() => setOpen(false)} aria-label="닫기"
                        className="absolute right-2 top-2 p-1 text-neutral-400 hover:text-neutral-700">
                        <X className="h-3.5 w-3.5" />
                    </button>
                    <span className="block text-xs font-bold text-neutral-900">Ten:One™ Universe One ID</span>
                    <span className="mt-1.5 block text-xs leading-relaxed text-neutral-600">
                        Ten:One™ Universe의 모든 서비스를 하나의 아이디로 이용할 수 있습니다. 한 번 만든 One ID로 다른 서비스에도 따로 가입하지 않고 로그인하세요.
                    </span>

                    <span className="mt-3 block text-[11px] font-semibold text-neutral-500">주요 서비스</span>
                    <span className="mt-1 flex flex-wrap gap-1.5">
                        {services === null && <span className="text-[11px] text-neutral-400">불러오는 중…</span>}
                        {services?.map(s => {
                            const canonical = CANONICAL_HOSTS[s.site_id];
                            const cls = "rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] text-neutral-700";
                            return canonical
                                ? <a key={s.site_id} href={`https://${canonical.host}`} target="_blank" rel="noreferrer" className={`${cls} hover:bg-neutral-200`}>{s.name}</a>
                                : <span key={s.site_id} className={cls}>{s.name}</span>;
                        })}
                    </span>

                    <a href={universeHref()} target="_blank" rel="noreferrer"
                        className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-neutral-900 hover:underline">
                        Ten:One™ Universe 알아보기 <ExternalLink className="h-3 w-3" />
                    </a>
                </span>
            )}
        </span>
    );
}
