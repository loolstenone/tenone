/**
 * 브랜드 공개 프로필 화면 (서버 렌더) — 예: www.madleague.net/@핸들
 *
 * 받은 값(get_brand_profile)만 그린다. 무엇을 공개할지는 DB가 정한다.
 * 유니버스 프로필 링크는 여기 없다 — 본인 화면(브랜드 마이페이지)에만 (헌법 원칙 7)
 */
import type { ReactNode } from "react";
import Image from "next/image";
import type { BrandProfileConfig } from "@/lib/profile/brand-profiles";
import { CAPABILITY_LABEL, type BrandProfileRow } from "@/lib/profile/public-profile";

export function BrandPublicProfile({ row, cfg, section, footer }: {
    row: BrandProfileRow;
    cfg: BrandProfileConfig;
    /** 브랜드 섹션 렌더 결과 (브랜드마다 모양이 다르다) */
    section: ReactNode;
    footer?: ReactNode;
}) {
    const muted = cfg.dark ? "text-neutral-400" : "text-neutral-500";
    const line = cfg.dark ? "border-neutral-800" : "border-neutral-200";
    const universe = row.universe ?? [];

    return (
        <article className="max-w-3xl mx-auto px-6 pt-32 pb-40">
            {/* 사람 */}
            <header className="flex flex-col sm:flex-row sm:items-center gap-8">
                {row.avatar_url ? (
                    <Image src={row.avatar_url} alt="" width={120} height={120} className="w-28 h-28 sm:w-32 sm:h-32 rounded-full object-cover" />
                ) : (
                    <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full flex items-center justify-center text-4xl font-bold text-white"
                        style={{ backgroundColor: cfg.accent }}>
                        {(row.name ?? "?").charAt(0)}
                    </div>
                )}
                <div className="min-w-0">
                    <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">{row.name}</h1>
                    <p className={`mt-3 text-lg ${muted}`}>@{row.handle}{row.company ? ` · ${row.company}` : ""}</p>
                </div>
            </header>
            {row.bio && <p className="mt-12 text-lg leading-relaxed whitespace-pre-line">{row.bio}</p>}

            {/* 브랜드 활동 */}
            <section className={`mt-24 pt-12 border-t ${line}`}>
                <h2 className="text-sm font-semibold tracking-wider" style={{ color: cfg.accent }}>{cfg.sectionTitle}</h2>
                <div className="mt-8">{section}</div>
            </section>

            {/* 본인이 고른 다른 브랜드 활동 */}
            {universe.length > 0 && (
                <section className={`mt-24 pt-12 border-t ${line}`}>
                    <h2 className={`text-sm font-semibold tracking-wider ${muted}`}>함께하는 활동</h2>
                    <ul className="mt-8 space-y-8">
                        {universe.map(b => (
                            <li key={b.brand_id}>
                                <p className="text-lg font-semibold">{b.brand_name}</p>
                                <p className={`mt-2 ${muted}`}>
                                    {b.items.map((it, i) => (
                                        <span key={i}>
                                            {i > 0 && " · "}
                                            {CAPABILITY_LABEL[it.capability] ?? it.capability} {it.role}
                                            {it.year ? ` ${it.year}` : ""}
                                            {!it.active && " (지난 활동)"}
                                        </span>
                                    ))}
                                </p>
                            </li>
                        ))}
                    </ul>
                </section>
            )}

            {footer && <div className="mt-24">{footer}</div>}
        </article>
    );
}
