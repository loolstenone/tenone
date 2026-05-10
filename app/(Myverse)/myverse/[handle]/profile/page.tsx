// /myverse/[handle]/profile — 프로페셔널·포트폴리오 중심 뷰
// 공개 흔적(moments)와 분리 — 이력·프로젝트만 깔끔하게.

import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import { AtSign, Calendar } from "lucide-react";
import { getPublicPageData } from "@/lib/myverse/handle/public-page";
import { ShareButton } from "@/features/myverse/handle/ShareButton";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata({ params }: { params: Promise<{ handle: string }> }): Promise<Metadata> {
    const { handle } = await params;
    const data = await getPublicPageData(handle);
    if (!data) return { title: "찾을 수 없는 핸들" };
    const name = data.profile.name ?? `@${handle}`;
    return {
        title: `${name} 프로필 · @${handle} · Myverse`,
        description: `${name}의 이력·포트폴리오`,
    };
}

export default async function HandleProfilePage({ params }: { params: Promise<{ handle: string }> }) {
    const { handle } = await params;
    const data = await getPublicPageData(handle);
    if (!data) notFound();

    const { profile, resume_sections, projects } = data;

    return (
        <main className="max-w-2xl mx-auto px-4 py-8">
            {/* 프로필 hero */}
            <header className="bg-white rounded-2xl mb-6 shadow-sm overflow-hidden">
                <div className="h-24 bg-gradient-to-br from-[#6366F1] via-[#818CF8] to-[#A855F7]" />
                <div className="px-6 pb-6 -mt-12">
                    <div className="flex items-end justify-between gap-3 mb-4">
                        {profile.avatar_url ? (
                            <Image
                                src={profile.avatar_url}
                                alt={profile.name ?? handle}
                                width={88}
                                height={88}
                                className="rounded-full object-cover shrink-0 border-4 border-white shadow-md"
                            />
                        ) : (
                            <div className="h-22 w-22 rounded-full bg-gradient-to-br from-[#6366F1] to-[#A855F7] flex items-center justify-center text-white text-3xl font-bold shrink-0 border-4 border-white shadow-md">
                                {(profile.name ?? handle).charAt(0).toUpperCase()}
                            </div>
                        )}
                        <div className="mb-1">
                            <ShareButton url={`/@${profile.handle}/profile`} name={profile.name ?? `@${profile.handle}`} />
                        </div>
                    </div>
                    <h1
                        className="text-2xl font-bold text-neutral-900 leading-tight"
                        style={{ fontFamily: "'Hanken Grotesk', sans-serif" }}
                    >
                        {profile.name ?? `@${profile.handle}`}
                    </h1>
                    <div className="flex items-center gap-1 text-xs text-neutral-500 mt-1">
                        <AtSign className="h-3 w-3" />
                        <span className="font-mono">{profile.handle}</span>
                        <span className="mx-1">·</span>
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(profile.joined_at).getFullYear()}년부터</span>
                    </div>
                    {profile.affiliations.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-3">
                            {profile.affiliations.map(a => (
                                <span
                                    key={a}
                                    className="px-2 py-0.5 text-[10px] rounded-full bg-neutral-100 text-neutral-600"
                                >
                                    {a}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </header>

            {/* 프로페셔널 */}
            {resume_sections.length > 0 && (
                <Section title="프로페셔널">
                    {resume_sections.map(s => (
                        <div key={s.type} className="mb-3 last:mb-0">
                            <h3 className="text-[10px] uppercase tracking-widest text-neutral-400 mb-1.5">{s.label}</h3>
                            <ul className="space-y-1.5">
                                {s.items.map((item, i) => (
                                    <li key={i} className="text-sm text-neutral-800">
                                        <ResumeItemRow item={item} />
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </Section>
            )}

            {/* 포트폴리오 */}
            {projects.length > 0 && (
                <Section title="포트폴리오" subtitle={`${projects.length}건의 공개 프로젝트`}>
                    <div className="grid grid-cols-2 gap-2">
                        {projects.map(p => (
                            <article key={p.id} className="bg-white rounded-lg overflow-hidden border border-neutral-200">
                                {p.cover_url ? (
                                    <div className="aspect-video bg-neutral-100">
                                        <img src={p.cover_url} alt="" className="w-full h-full object-cover" />
                                    </div>
                                ) : (
                                    <div className="aspect-video bg-gradient-to-br from-[#6366F1]/10 to-[#A855F7]/10" />
                                )}
                                <div className="p-3">
                                    <h4 className="text-sm font-medium text-neutral-900 truncate">{p.title}</h4>
                                    {p.description && (
                                        <p className="text-xs text-neutral-500 mt-0.5 line-clamp-2">{p.description}</p>
                                    )}
                                </div>
                            </article>
                        ))}
                    </div>
                </Section>
            )}

            {resume_sections.length === 0 && projects.length === 0 && (
                <div className="bg-white rounded-2xl p-8 text-center">
                    <p className="text-sm text-neutral-500">아직 공개된 이력·포트폴리오가 없습니다.</p>
                </div>
            )}
        </main>
    );
}

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
    return (
        <section className="bg-white rounded-2xl p-5 mb-6 shadow-sm">
            <div className="flex items-baseline justify-between mb-3">
                <h2 className="text-sm font-semibold text-neutral-900">{title}</h2>
                {subtitle && <span className="text-[10px] text-neutral-400">{subtitle}</span>}
            </div>
            {children}
        </section>
    );
}

function ResumeItemRow({ item }: { item: Record<string, unknown> }) {
    const title = (item.title ?? item.name ?? item.org ?? "") as string;
    const org = (item.org ?? item.company ?? item.school ?? "") as string;
    const period = (item.period ?? `${item.start ?? ""} – ${item.end ?? ""}`) as string;
    const description = (item.description ?? item.summary ?? "") as string;
    const level = (item.level ?? "") as string;

    return (
        <div>
            <div className="flex items-baseline justify-between gap-2">
                <span className="font-medium">{title || "(미정)"}</span>
                {level && <span className="text-[10px] text-neutral-400">{level}</span>}
            </div>
            <div className="text-xs text-neutral-500">
                {org && <span>{org}</span>}
                {org && period && <span> · </span>}
                {period && <span>{period}</span>}
            </div>
            {description && <p className="text-xs text-neutral-600 mt-0.5 leading-relaxed">{description}</p>}
        </div>
    );
}
