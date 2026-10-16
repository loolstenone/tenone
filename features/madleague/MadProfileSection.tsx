/**
 * MAD League 공개 프로필 섹션 — DB madleague_profile_section()이 돌려준 값만 그린다
 * (활동 역할: 동아리·연도·직책 / 인증서: 종류·결과·회차·팀·발급일·코드 / 매드리거 소개는 포트폴리오 공개 동의 시)
 */
import Link from "next/link";

interface MadRole { role: string; position: string | null; year: string | null; club: { name: string; slug: string } | null; active: boolean }
interface MadCert { type: string; result: string | null; title: string | null; team: string | null; issued_at: string; code: string }
export interface MadSection {
    roles?: MadRole[];
    certificates?: MadCert[];
    madleaguer?: { bio: string | null; skill_tags: string[] | null } | null;
}

const ROLE_LABEL: Record<string, string> = { 현역: "매드리거", 임원: "운영진", OB: "OB", 멘토: "멘토" };
const CERT_LABEL: Record<string, string> = { participation: "참가 확인서", award: "수상 확인서" };

function fmtDate(d: string) {
    const [y, m, day] = d.slice(0, 10).split("-");
    return `${y}.${m}.${day}`;
}

export function MadProfileSection({ section, basePath }: { section: MadSection | null | undefined; basePath: string }) {
    const roles = section?.roles ?? [];
    const certs = section?.certificates ?? [];
    const mad = section?.madleaguer;

    if (roles.length === 0 && certs.length === 0 && !mad?.bio && !(mad?.skill_tags?.length)) {
        return <p className="text-neutral-400">아직 공개된 MAD League 활동이 없습니다.</p>;
    }

    return (
        <div className="space-y-16">
            {roles.length > 0 && (
                <ul className="space-y-5">
                    {roles.map((r, i) => (
                        <li key={i} className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                            <span className="text-xl font-semibold">
                                {r.position ?? ROLE_LABEL[r.role] ?? r.role}
                            </span>
                            {r.club && (
                                <Link href={`${basePath}/clubs/${r.club.slug}`} className="text-lg underline underline-offset-4 decoration-neutral-600 hover:decoration-white">
                                    {r.club.name}
                                </Link>
                            )}
                            {r.year && <span className="text-neutral-400">{r.year}</span>}
                            <span className={`text-xs px-2 py-0.5 rounded-full border ${r.active ? "border-[#EC1D25] text-[#EC1D25]" : "border-neutral-700 text-neutral-500"}`}>
                                {r.active ? "활동 중" : "지난 활동"}
                            </span>
                        </li>
                    ))}
                </ul>
            )}

            {(mad?.bio || (mad?.skill_tags?.length ?? 0) > 0) && (
                <div>
                    {mad?.bio && <p className="text-lg leading-relaxed whitespace-pre-line">{mad.bio}</p>}
                    {(mad?.skill_tags?.length ?? 0) > 0 && (
                        <ul className="mt-6 flex flex-wrap gap-2">
                            {mad!.skill_tags!.map(t => (
                                <li key={t} className="text-sm px-3 py-1 rounded-full border border-neutral-700 text-neutral-300">{t}</li>
                            ))}
                        </ul>
                    )}
                </div>
            )}

            {certs.length > 0 && (
                <div>
                    <h3 className="text-sm font-semibold text-neutral-400 mb-6">인증서</h3>
                    <ul className="divide-y divide-neutral-800 border-y border-neutral-800">
                        {certs.map(c => (
                            <li key={c.code} className="py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                <div className="min-w-0">
                                    <p className="text-lg font-semibold">
                                        {c.title ?? "MAD League"}
                                        {c.result && c.result !== "참가" && <span className="ml-2 text-[#EC1D25]">{c.result}</span>}
                                    </p>
                                    <p className="text-sm text-neutral-400 mt-1">
                                        {CERT_LABEL[c.type] ?? "인증서"}{c.team ? ` · ${c.team}` : ""} · {fmtDate(c.issued_at)}
                                    </p>
                                </div>
                                <Link href={`${basePath}/certificate/verify/${encodeURIComponent(c.code)}`}
                                    className="text-sm text-neutral-400 hover:text-white underline underline-offset-4 shrink-0">
                                    진위 확인
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
