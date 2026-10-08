"use client";

import { useCallback, useState } from "react";
import { ExternalLink } from "lucide-react";
import { HelpPopover } from "@/components/HelpPopover";
import { getAllSiteConfigs, type SiteConfigRow } from "@/lib/supabase/site-configs";
import { CANONICAL_HOSTS, isTenoneFamily } from "@/lib/domain-registry";

/**
 * One ID 안내 — 유니버스를 강조하지 않고(헌법 원칙 7) 궁금할 때만 알 수 있게. LoginModal · BrandJoinGate에서 사용.
 * 주요 서비스 = site_configs.is_open (내부 사이트 제외). 링크는 공식 주소가 있는 서비스만 (스테이징 주소로 보내지 않음)
 */
const INTERNAL_SITES = new Set(["tenone", "wiki", "dokdae"]);

function universeHref(): string {
    if (typeof window === "undefined") return "https://www.tenone.biz/universe";
    const host = window.location.hostname;
    // tenone 계열·로컬은 같은 사이트 경로, 독립 도메인은 공식 주소 (상대 경로는 브랜드 prefix로 rewrite돼 404)
    return host === "localhost" || isTenoneFamily(host) ? "/universe" : "https://www.tenone.biz/universe";
}

export function OneIdHelp({ size = 14 }: { size?: number }) {
    const [services, setServices] = useState<SiteConfigRow[] | null>(null);

    const load = useCallback(() => {
        if (services) return;
        getAllSiteConfigs()
            .then(rows => setServices(rows.filter(r => r.is_open && !INTERNAL_SITES.has(r.site_id))))
            .catch(() => setServices([]));
    }, [services]);

    return (
        <HelpPopover title="One ID" label="One ID 안내" size={size} onOpen={load}>
            Ten:One™ Universe의 모든 서비스를 하나의 아이디로 이용할 수 있습니다. 한 번 만든 One ID로 다른 서비스에도 따로 가입하지 않고 로그인하세요.

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
        </HelpPopover>
    );
}

/** 핸들 ID 안내 — 로그인 모달의 핸들 탭 옆 */
export function HandleIdHelp({ size = 14 }: { size?: number }) {
    return (
        <HelpPopover title="핸들 ID" label="핸들 ID 안내" size={size} align="end">
            One ID에 붙이는 나만의 아이디예요 (예: <b className="font-semibold text-neutral-800">@tenone</b>).
            이메일 대신 핸들과 비밀번호로 로그인할 수 있고, 공개 프로필 주소로도 쓰입니다.
            <span className="mt-2 block text-[11px] text-neutral-500">
                핸들은 로그인 후 내 프로필에서 정할 수 있어요. 아직 만들지 않았다면 이메일로 로그인하세요.
            </span>
        </HelpPopover>
    );
}
