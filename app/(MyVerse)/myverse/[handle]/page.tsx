// myverse.kr/{handle} — 공개 핸들 페이지
// (pretty URL `/@handle`은 middleware가 이쪽으로 rewrite)
//
// visibility='public' 콘텐츠만 렌더. 5섹션:
//   1. 헤더 (이름·아바타·가입일·소속)
//   2. 프로페셔널 (학력·경력·자격증 등 resume 공개 섹션)
//   3. 포트폴리오 (공개 프로젝트)
//   4. 다이어리 하이라이트 (공개 모먼트 그리드)
//   5. 외부 링크 (소속·SNS)

import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import { AtSign, Calendar, ExternalLink } from "lucide-react";
import { getPublicPageData } from "@/lib/myverse/handle/public-page";
import { DOMAINS } from "@/lib/myverse/domains";
import type { DomainKey } from "@/lib/myverse/domains";

export const dynamic = "force-dynamic";   // 공개 페이지는 매 요청 갱신 (visibility 토글 즉시 반영)
export const revalidate = 0;

export async function generateMetadata({ params }: { params: Promise<{ handle: string }> }): Promise<Metadata> {
    const { handle } = await params;
    const data = await getPublicPageData(handle);
    if (!data) return { title: "찾을 수 없는 핸들" };
    const name = data.profile.name ?? `@${handle}`;
    const description = `${name}의 마이버스 — 공개한 콘텐츠만 보입니다`;
    const og = data.profile.avatar_url ?? data.moments[0]?.media_url;
    return {
        title: `@${handle} · Myverse`,
        description,
        openGraph: {
            title: `${name} · @${handle}`,
            description,
            siteName: "Myverse",
            type: "profile",
            ...(og && { images: [og] }),
        },
        twitter: { card: og ? "summary_large_image" : "summary" },
    };
}

export default async function PublicHandlePage({ params }: { params: Promise<{ handle: string }> }) {
    const { handle } = await params;
    const data = await getPublicPageData(handle);
    if (!data) notFound();

    const { profile, resume_sections, projects, moments } = data;

    return (
        <div className="min-h-screen bg-neutral-50">
            <main className="max-w-2xl mx-auto px-4 py-8">
                {/* 1. 프로필 헤더 */}
                <header className="bg-white rounded-2xl p-6 mb-6 shadow-sm">
                    <div className="flex items-start gap-4">
                        {profile.avatar_url ? (
                            <Image
                                src={profile.avatar_url}
                                alt={profile.name ?? handle}
                                width={72}
                                height={72}
                                className="rounded-full object-cover shrink-0"
                            />
                        ) : (
                            <div className="h-18 w-18 rounded-full bg-gradient-to-br from-[#6366F1] to-[#A855F7] flex items-center justify-center text-white text-2xl font-bold shrink-0">
                                {(profile.name ?? handle).charAt(0).toUpperCase()}
                            </div>
                        )}
                        <div className="flex-1 min-w-0">
                            <h1 className="text-xl font-semibold text-neutral-900 truncate">
                                {profile.name ?? `@${profile.handle}`}
                            </h1>
                            <div className="flex items-center gap-1 text-xs text-neutral-500 mt-0.5">
                                <AtSign className="h-3 w-3" />
                                <span className="font-mono">{profile.handle}</span>
                                <span className="mx-1">·</span>
                                <Calendar className="h-3 w-3" />
                                <span>{new Date(profile.joined_at).getFullYear()}년부터</span>
                            </div>
                            {profile.affiliations.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
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
                    </div>
                </header>

                {/* 2. 프로페셔널 (이력서 공개 섹션) */}
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

                {/* 3. 포트폴리오 */}
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

                {/* 4. 다이어리 하이라이트 */}
                {moments.length > 0 && (
                    <Section title="다이어리" subtitle={`최근 ${moments.length}건의 한 장면`}>
                        <div className="grid grid-cols-3 gap-1.5">
                            {moments.map(m => (
                                <a
                                    key={m.id}
                                    href={`/myverse/${profile.handle}/m/${m.id}`}
                                    className="block aspect-square bg-neutral-100 overflow-hidden rounded-md relative group"
                                >
                                    {m.media_type === "image" ? (
                                        <img src={m.media_url} alt={m.caption ?? ""} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                                    ) : (
                                        <video src={m.media_url} className="w-full h-full object-cover" />
                                    )}
                                    {m.domain && (
                                        <span
                                            className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full"
                                            style={{ backgroundColor: DOMAINS[m.domain as DomainKey]?.color_hex }}
                                        />
                                    )}
                                </a>
                            ))}
                        </div>
                    </Section>
                )}

                {/* 5. 빈 상태 */}
                {resume_sections.length === 0 && projects.length === 0 && moments.length === 0 && (
                    <div className="bg-white rounded-2xl p-8 text-center">
                        <p className="text-sm text-neutral-500">
                            아직 공개된 콘텐츠가 없습니다.
                        </p>
                        <p className="text-xs text-neutral-400 mt-1">
                            마이버스에서 보고 싶은 항목을 "전체 공개"로 토글하면 여기에 표시됩니다.
                        </p>
                    </div>
                )}

                {/* 푸터 */}
                <footer className="mt-8 text-center">
                    <a
                        href="/myverse"
                        className="inline-flex items-center gap-1 text-xs text-neutral-400 hover:text-[#6366F1]"
                    >
                        Powered by Myverse <ExternalLink className="h-3 w-3" />
                    </a>
                </footer>
            </main>
        </div>
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
    // 이력서 row의 일반 필드 추정 — title·org·period·description·level
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
