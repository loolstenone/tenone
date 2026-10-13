"use client";

/**
 * 인재 — 받은 제안 (2026-10-13)
 * 제안 받기 설정 상태 → 받은 제안 목록. 제안은 기업이 보내고 운영자 검토 후 도착한다
 */
import { useEffect, useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import { ArrowRight, Building2, Settings2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { LoginRequired } from "@/components/LoginRequired";
import { PageHero } from "@/features/hero/PageHero";
import { OFFER_TYPES, RECIPIENT_STATUS_LABEL, labelOf, type OfferSettings } from "@/lib/hero/offers";

const HERO_RED = "#E53935";

interface InboxItem {
    id: string;
    status: string;
    created_at: string;
    hero_offers: {
        id: string; offer_type: string; title: string; respond_by: string | null; status: string;
        hero_companies: { company_name: string; industry: string | null; size_category: string | null } | null;
    } | null;
}

export default function HeroOffersPage() {
    const { isLoading, isAuthenticated } = useAuth();
    const [settings, setSettings] = useState<OfferSettings | null>(null);
    const [items, setItems] = useState<InboxItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isAuthenticated) return;
        Promise.all([
            fetch("/api/hero/offers/settings").then(r => r.json()),
            fetch("/api/hero/offers/inbox").then(r => r.json()),
        ]).then(([s, inbox]) => {
            setSettings(s.settings ?? null);
            setItems(inbox.items ?? []);
        }).catch(() => undefined).finally(() => setLoading(false));
    }, [isAuthenticated]);

    if (isLoading) return <div className="min-h-screen flex items-center justify-center"><span className="text-sm text-mute">불러오는 중</span></div>;
    if (!isAuthenticated) return <div className="min-h-screen bg-neutral-50"><LoginRequired accentColor={HERO_RED} /></div>;

    const open = settings?.is_open === true;

    return (
        <div className="bg-white min-h-screen">
            <PageHero
                label="받은 제안"
                title={<>기업이 먼저<br />면접을 제안합니다</>}
                desc="제안 받기를 켜 두면, 내 희망 직무·조건에 맞는 기업의 면접·인터뷰 제안이 이곳으로 옵니다. 응할지는 내가 정하고, 응할 때만 그 기업에 이력서가 전달됩니다."
                cta={open ? undefined : { label: "제안 받기 켜기", href: "/hero/offers/settings" }}
                secondary={open ? { label: "제안 받기 설정", href: "/hero/offers/settings" } : undefined}
            />

            <div className="mx-auto max-w-5xl px-6 lg:px-8 py-12 space-y-10">
                {loading ? (
                    <div className="py-16 flex justify-center"><span className="text-sm text-mute">불러오는 중</span></div>
                ) : (
                    <>
                        <Link href="/hero/offers/settings"
                            className="flex items-center justify-between p-5 border border-neutral-200 rounded-xs transition-">
                            <div className="flex items-center gap-3">
                                <Settings2 className="h-5 w-5 text-neutral-400" />
                                <div>
                                    <p className="font-bold">제안 받기 {open ? "켜짐" : "꺼짐"}</p>
                                    <p className="text-xs text-neutral-500">
                                        {open && settings
                                            ? `${settings.job_functions.join(" · ")} · ${settings.career_level}`
                                            : "켜면 조건에 맞는 기업이 나에게 면접을 제안할 수 있습니다"}
                                    </p>
                                </div>
                            </div>
                            <ArrowRight className="h-4 w-4 text-neutral-400" />
                        </Link>

                        <section>
                            <h2 className="text-xl font-bold tracking-tight mb-4">받은 제안</h2>
                            {items.length === 0 ? (
                                <p className="text-sm text-neutral-500 py-10 text-center border border-dashed border-neutral-200 rounded-xs">
                                    아직 받은 제안이 없습니다.
                                </p>
                            ) : (
                                <ul className="space-y-3">
                                    {items.map(it => {
                                        const o = it.hero_offers;
                                        const isNew = it.status === "sent";
                                        return (
                                            <li key={it.id}>
                                                <Link href={`/hero/offers/${it.id}`}
                                                    className="flex items-center justify-between gap-4 p-5 border border-neutral-200 rounded-xs transition-">
                                                    <div className="flex items-start gap-3 min-w-0">
                                                        <Building2 className="h-5 w-5 text-neutral-400 shrink-0 mt-0.5" />
                                                        <div className="min-w-0">
                                                            <p className="text-xs text-neutral-500">
                                                                {o?.hero_companies?.company_name} · {labelOf(OFFER_TYPES, o?.offer_type)}
                                                                {o?.respond_by && ` · ${o.respond_by}까지`}
                                                            </p>
                                                            <p className="font-bold truncate">{o?.title}</p>
                                                        </div>
                                                    </div>
                                                    <span className={clsx("text-xs px-2.5 py-1 rounded-none shrink-0",
                                                        isNew ? "bg-red-50 text-[#E53935] font-bold" : "bg-neutral-100 text-neutral-600")}>
                                                        {RECIPIENT_STATUS_LABEL[it.status] ?? it.status}
                                                    </span>
                                                </Link>
                                            </li>
                                        );
                                    })}
                                </ul>
                            )}
                        </section>
                    </>
                )}
            </div>
        </div>
    );
}
