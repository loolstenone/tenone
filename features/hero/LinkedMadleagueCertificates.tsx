"use client";

import { useEffect, useState } from "react";
import { Award } from "lucide-react";
import { CrossSiteLink } from "@/components/CrossSiteLink";
import { ServiceLinkConsent } from "@/components/ServiceLinkConsent";

const SCOPE = "madleague.certificates>hero.profile";

type Cert = { code: string; type: string; result: string | null; issued_at: string; label: string | null; title: string | null; round_title: string | null; year: string | null };

/**
 * HeRo 마이페이지 — MADLeague 활동 경력 (서비스 간 연계 첫 실제 연결, 2026-10-09)
 * 연계 동의 전: 동의 카드 · 동의 후: MADLeague 인증서 목록 (API가 동의를 다시 확인한다)
 */
export function LinkedMadleagueCertificates() {
    const [state, setState] = useState<{ linked: boolean; certificates: Cert[] } | null>(null);

    useEffect(() => {
        fetch("/api/hero/linked/madleague-certificates").then(r => r.ok ? r.json() : null).then(setState).catch(() => setState(null));
    }, []);

    if (!state) return null;

    return (
        <div className="mb-8">
            <h2 className="text-sm font-bold text-neutral-300 tracking-wider mb-3 flex items-center gap-2">
                <span>MADLeague 활동 경력</span>
                <span className="h-px flex-1 bg-neutral-800" />
            </h2>
            {!state.linked ? (
                <ServiceLinkConsent scope={SCOPE} accentColor="#E53935" />
            ) : state.certificates.length === 0 ? (
                <div className="border border-neutral-800 rounded-xl p-5 text-sm text-neutral-400">
                    연결됐지만 아직 MADLeague에서 발급한 인증서가 없습니다.{" "}
                    <CrossSiteLink href="/madleague/member/certificate" className="underline text-neutral-200">MADLeague 인증서 발급</CrossSiteLink>
                </div>
            ) : (
                <ul className="space-y-2">
                    {state.certificates.map(c => (
                        <li key={c.code} className="flex items-center gap-3 border border-neutral-800 rounded-xl px-4 py-3">
                            <Award className="h-5 w-5 text-neutral-400 shrink-0" />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-neutral-100 truncate">{c.round_title ?? c.title ?? c.label ?? "MADLeague 인증서"}</p>
                                <p className="text-xs text-neutral-500">{[c.label, c.result, c.year && `${c.year}년`].filter(Boolean).join(" · ")}</p>
                            </div>
                            <span className="text-xs font-mono text-neutral-500">{c.code}</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
